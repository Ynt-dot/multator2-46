'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { useEditor } from '@/lib/editor/context'
import type { Point, Stroke } from '@/lib/editor/types'

interface DrawingCanvasProps {
  width: number
  height: number
}

export function DrawingCanvas({ width, height }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const { state, dispatch } = useEditor()
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentPoints, setCurrentPoints] = useState<Point[]>([])
  const lastPointRef = useRef<Point | null>(null)

  // Render all strokes
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, width, height)

    const currentFrame = state.frames[state.currentFrameIndex]
    
    // Render onion skin (previous frames)
    if (state.onionSkinEnabled && state.currentFrameIndex > 0) {
      for (let i = Math.max(0, state.currentFrameIndex - state.onionSkinFrames); i < state.currentFrameIndex; i++) {
        const frame = state.frames[i]
        const alpha = 0.2 * (1 - (state.currentFrameIndex - i - 1) / state.onionSkinFrames)
        
        frame.layers.forEach(layer => {
          if (!layer.visible) return
          ctx.globalAlpha = alpha
          layer.strokes.forEach(stroke => {
            drawStroke(ctx, stroke, '#FF0000') // Red for previous frames
          })
        })
      }
      ctx.globalAlpha = 1
    }

    // Render current frame layers
    currentFrame.layers.forEach((layer) => {
      if (!layer.visible) return
      ctx.globalAlpha = layer.opacity
      layer.strokes.forEach((stroke) => {
        drawStroke(ctx, stroke)
      })
    })
    ctx.globalAlpha = 1
  }, [state.frames, state.currentFrameIndex, state.onionSkinEnabled, state.onionSkinFrames, width, height])

  // Draw a single stroke
  const drawStroke = (ctx: CanvasRenderingContext2D, stroke: Stroke, colorOverride?: string) => {
    if (stroke.points.length === 0) return

    ctx.save()
    ctx.globalAlpha = stroke.opacity
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = stroke.size

    if (stroke.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.strokeStyle = '#000000'
    } else {
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = colorOverride || stroke.color
    }

    ctx.beginPath()
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y)

    if (stroke.points.length === 1) {
      ctx.lineTo(stroke.points[0].x + 0.1, stroke.points[0].y + 0.1)
    } else {
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y)
      }
    }

    ctx.stroke()
    ctx.restore()
  }

  // Draw current stroke on overlay
  const renderOverlay = useCallback(() => {
    const overlay = overlayRef.current
    const ctx = overlay?.getContext('2d')
    if (!overlay || !ctx) return

    ctx.clearRect(0, 0, width, height)

    if (currentPoints.length > 0) {
      const stroke: Stroke = {
        id: 'temp',
        tool: state.tool,
        points: currentPoints,
        color: state.color,
        size: state.brushSize,
        opacity: state.opacity,
      }
      drawStroke(ctx, stroke)
    }
  }, [currentPoints, state.tool, state.color, state.brushSize, state.opacity, width, height])

  useEffect(() => {
    renderCanvas()
  }, [renderCanvas])

  useEffect(() => {
    renderOverlay()
  }, [renderOverlay])

  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): Point => {
    const canvas = overlayRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = width / rect.width
    const scaleY = height / rect.height

    if ('touches' in e) {
      const touch = e.touches[0]
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      }
    }

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  const handleStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (state.tool !== 'brush' && state.tool !== 'eraser') return
    
    const currentLayer = state.frames[state.currentFrameIndex].layers[state.currentLayerIndex]
    if (currentLayer.locked) return

    e.preventDefault()
    const point = getCanvasPoint(e)
    setIsDrawing(true)
    setCurrentPoints([point])
    lastPointRef.current = point
    dispatch({ type: 'SAVE_HISTORY' })
  }

  const handleMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    e.preventDefault()

    const point = getCanvasPoint(e)
    
    // Smooth out points by interpolating
    if (lastPointRef.current) {
      const dist = Math.hypot(point.x - lastPointRef.current.x, point.y - lastPointRef.current.y)
      if (dist < 2) return // Skip if too close
    }

    setCurrentPoints(prev => [...prev, point])
    lastPointRef.current = point
  }

  const handleEnd = () => {
    if (!isDrawing) return
    setIsDrawing(false)

    if (currentPoints.length > 0) {
      const stroke: Stroke = {
        id: crypto.randomUUID(),
        tool: state.tool,
        points: currentPoints,
        color: state.color,
        size: state.brushSize,
        opacity: state.opacity,
      }
      dispatch({ type: 'ADD_STROKE', stroke })
    }

    setCurrentPoints([])
    lastPointRef.current = null
  }

  const handleFill = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (state.tool !== 'fill') return
    
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const point = getCanvasPoint(e)
    const x = Math.floor(point.x)
    const y = Math.floor(point.y)

    // Simple flood fill implementation
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data
    
    const targetColor = getPixelColor(data, x, y, width)
    const fillColor = hexToRgba(state.color, state.opacity)

    if (colorsMatch(targetColor, fillColor)) return

    dispatch({ type: 'SAVE_HISTORY' })

    const stack: [number, number][] = [[x, y]]
    const visited = new Set<string>()

    while (stack.length > 0) {
      const [cx, cy] = stack.pop()!
      const key = `${cx},${cy}`

      if (visited.has(key)) continue
      if (cx < 0 || cx >= width || cy < 0 || cy >= height) continue

      const currentColor = getPixelColor(data, cx, cy, width)
      if (!colorsMatch(currentColor, targetColor)) continue

      visited.add(key)
      setPixelColor(data, cx, cy, width, fillColor)

      stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1])
    }

    ctx.putImageData(imageData, 0, 0)
  }

  return (
    <div className="relative" style={{ width: '100%', maxWidth: width, aspectRatio: `${width}/${height}` }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="absolute inset-0 w-full h-full bg-white rounded-lg shadow-inner"
        style={{ imageRendering: 'pixelated' }}
      />
      <canvas
        ref={overlayRef}
        width={width}
        height={height}
        className="absolute inset-0 w-full h-full cursor-crosshair"
        style={{ imageRendering: 'pixelated' }}
        onMouseDown={state.tool === 'fill' ? handleFill : handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      />
    </div>
  )
}

// Helper functions for flood fill
function getPixelColor(data: Uint8ClampedArray, x: number, y: number, width: number): [number, number, number, number] {
  const i = (y * width + x) * 4
  return [data[i], data[i + 1], data[i + 2], data[i + 3]]
}

function setPixelColor(data: Uint8ClampedArray, x: number, y: number, width: number, color: [number, number, number, number]) {
  const i = (y * width + x) * 4
  data[i] = color[0]
  data[i + 1] = color[1]
  data[i + 2] = color[2]
  data[i + 3] = color[3]
}

function hexToRgba(hex: string, opacity: number): [number, number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b, Math.round(opacity * 255)]
}

function colorsMatch(a: [number, number, number, number], b: [number, number, number, number]): boolean {
  return Math.abs(a[0] - b[0]) < 5 &&
         Math.abs(a[1] - b[1]) < 5 &&
         Math.abs(a[2] - b[2]) < 5 &&
         Math.abs(a[3] - b[3]) < 5
}
