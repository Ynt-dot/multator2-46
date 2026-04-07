'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Pause, ChevronLeft, ChevronRight, SkipBack } from 'lucide-react'
import type { Frame, Stroke } from '@/lib/editor/types'

interface FramesData {
  frames: Frame[]
  fps: number
  width: number
  height: number
}

interface AnimationPlayerProps {
  framesData: FramesData | null
  thumbnailUrl: string | null
  title: string
  isAnimation: boolean
}

function renderFrameToCanvas(canvas: HTMLCanvasElement, frame: Frame) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  // White background
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (const layer of frame.layers) {
    if (!layer.visible) continue
    ctx.globalAlpha = layer.opacity

    for (const stroke of layer.strokes) {
      renderStroke(ctx, stroke)
    }
  }

  ctx.globalAlpha = 1
}

function renderStroke(ctx: CanvasRenderingContext2D, stroke: Stroke) {
  if (stroke.points.length === 0) return

  ctx.globalAlpha = stroke.opacity
  ctx.strokeStyle = stroke.color
  ctx.fillStyle = stroke.color
  ctx.lineWidth = stroke.size
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  if (stroke.tool === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out'
  } else {
    ctx.globalCompositeOperation = 'source-over'
  }

  if (stroke.tool === 'line') {
    ctx.beginPath()
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y)
    const last = stroke.points[stroke.points.length - 1]
    ctx.lineTo(last.x, last.y)
    ctx.stroke()
  } else if (stroke.tool === 'rectangle') {
    const first = stroke.points[0]
    const last = stroke.points[stroke.points.length - 1]
    ctx.beginPath()
    ctx.rect(first.x, first.y, last.x - first.x, last.y - first.y)
    ctx.stroke()
  } else if (stroke.tool === 'ellipse') {
    const first = stroke.points[0]
    const last = stroke.points[stroke.points.length - 1]
    const cx = (first.x + last.x) / 2
    const cy = (first.y + last.y) / 2
    const rx = Math.abs(last.x - first.x) / 2
    const ry = Math.abs(last.y - first.y) / 2
    ctx.beginPath()
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
    ctx.stroke()
  } else if (stroke.tool === 'fill') {
    ctx.beginPath()
    ctx.arc(stroke.points[0].x, stroke.points[0].y, stroke.size, 0, Math.PI * 2)
    ctx.fill()
  } else {
    // brush / eraser path
    if (stroke.points.length === 1) {
      ctx.beginPath()
      ctx.arc(stroke.points[0].x, stroke.points[0].y, stroke.size / 2, 0, Math.PI * 2)
      ctx.fill()
    } else {
      ctx.beginPath()
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y)
      for (let i = 1; i < stroke.points.length - 1; i++) {
        const mx = (stroke.points[i].x + stroke.points[i + 1].x) / 2
        const my = (stroke.points[i].y + stroke.points[i + 1].y) / 2
        ctx.quadraticCurveTo(stroke.points[i].x, stroke.points[i].y, mx, my)
      }
      const last = stroke.points[stroke.points.length - 1]
      ctx.lineTo(last.x, last.y)
      ctx.stroke()
    }
  }

  ctx.globalCompositeOperation = 'source-over'
}

export function AnimationPlayer({ framesData, thumbnailUrl, title, isAnimation }: AnimationPlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [canvasReady, setCanvasReady] = useState(false)

  const frames = framesData?.frames ?? []
  const fps = framesData?.fps ?? 12
  const width = framesData?.width ?? 800
  const height = framesData?.height ?? 600
  const totalFrames = frames.length

  // Render the current frame whenever it changes
  useEffect(() => {
    if (!canvasRef.current || frames.length === 0) return
    renderFrameToCanvas(canvasRef.current, frames[currentFrame])
    setCanvasReady(true)
  }, [currentFrame, frames])

  // Initial render
  useEffect(() => {
    if (frames.length > 0 && canvasRef.current) {
      renderFrameToCanvas(canvasRef.current, frames[0])
      setCanvasReady(true)
    }
  }, [frames])

  // Animation loop
  const stopAnimation = useCallback(() => {
    if (animTimerRef.current) {
      clearInterval(animTimerRef.current)
      animTimerRef.current = null
    }
  }, [])

  const startAnimation = useCallback(() => {
    stopAnimation()
    animTimerRef.current = setInterval(() => {
      setCurrentFrame(prev => (prev + 1) % totalFrames)
    }, 1000 / fps)
  }, [fps, totalFrames, stopAnimation])

  useEffect(() => {
    if (playing && totalFrames > 1) {
      startAnimation()
    } else {
      stopAnimation()
    }
    return stopAnimation
  }, [playing, startAnimation, stopAnimation, totalFrames])

  // If no frames data, show thumbnail
  if (frames.length === 0) {
    return (
      <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbnailUrl} alt={title} className="w-full h-full object-contain" />
        ) : (
          <div className="text-muted-foreground text-sm">
            {isAnimation ? 'Анимация' : 'Рисунок'}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative w-full">
      {/* Canvas */}
      <div className="bg-muted rounded-lg overflow-hidden flex items-center justify-center p-2">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="max-w-full max-h-[60vh] object-contain rounded"
          style={{ imageRendering: 'pixelated', background: '#fff' }}
        />
      </div>

      {/* Controls (only for animations with multiple frames) */}
      {isAnimation && totalFrames > 1 && (
        <div className="flex items-center justify-center gap-2 mt-3">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => { setPlaying(false); setCurrentFrame(0) }}
          >
            <SkipBack className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentFrame(prev => (prev - 1 + totalFrames) % totalFrames)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            size="icon"
            className="h-9 w-9"
            onClick={() => setPlaying(p => !p)}
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentFrame(prev => (prev + 1) % totalFrames)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground ml-1">
            {currentFrame + 1} / {totalFrames}
          </span>
          <span className="text-xs text-muted-foreground ml-1">
            {fps} fps
          </span>
        </div>
      )}
    </div>
  )
}
