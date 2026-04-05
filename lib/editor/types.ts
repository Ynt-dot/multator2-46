export type Tool = 
  | 'brush'
  | 'eraser'
  | 'fill'
  | 'line'
  | 'rectangle'
  | 'ellipse'
  | 'eyedropper'
  | 'select'
  | 'move'

export interface Point {
  x: number
  y: number
}

export interface Stroke {
  id: string
  tool: Tool
  points: Point[]
  color: string
  size: number
  opacity: number
}

export interface Layer {
  id: string
  name: string
  visible: boolean
  locked: boolean
  opacity: number
  strokes: Stroke[]
}

export interface Frame {
  id: string
  layers: Layer[]
  duration: number // in milliseconds
}

export interface EditorState {
  frames: Frame[]
  currentFrameIndex: number
  currentLayerIndex: number
  tool: Tool
  color: string
  brushSize: number
  opacity: number
  onionSkinEnabled: boolean
  onionSkinFrames: number
  fps: number
  canvasWidth: number
  canvasHeight: number
  history: HistoryEntry[]
  historyIndex: number
}

export interface HistoryEntry {
  frames: Frame[]
  currentFrameIndex: number
  currentLayerIndex: number
}

export const DEFAULT_COLORS = [
  '#000000', // Black
  '#FFFFFF', // White
  '#FF0000', // Red
  '#FF6B00', // Orange
  '#FFFF00', // Yellow
  '#00FF00', // Green
  '#00FFFF', // Cyan
  '#0000FF', // Blue
  '#FF00FF', // Magenta
  '#8B4513', // Brown
  '#808080', // Gray
  '#FFC0CB', // Pink
]

export const BRUSH_SIZES = [1, 2, 4, 8, 12, 16, 24, 32, 48]

export function createEmptyLayer(name: string = 'Layer 1'): Layer {
  return {
    id: crypto.randomUUID(),
    name,
    visible: true,
    locked: false,
    opacity: 1,
    strokes: [],
  }
}

export function createEmptyFrame(): Frame {
  return {
    id: crypto.randomUUID(),
    layers: [createEmptyLayer()],
    duration: 100,
  }
}

export function createInitialState(): EditorState {
  return {
    frames: [createEmptyFrame()],
    currentFrameIndex: 0,
    currentLayerIndex: 0,
    tool: 'brush',
    color: '#000000',
    brushSize: 4,
    opacity: 1,
    onionSkinEnabled: false,
    onionSkinFrames: 2,
    fps: 12,
    canvasWidth: 800,
    canvasHeight: 600,
    history: [],
    historyIndex: -1,
  }
}
