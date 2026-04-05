'use client'

import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react'
import {
  type EditorState,
  type Tool,
  type Frame,
  type Layer,
  type Stroke,
  createInitialState,
  createEmptyFrame,
  createEmptyLayer,
} from './types'

type EditorAction =
  | { type: 'SET_TOOL'; tool: Tool }
  | { type: 'SET_COLOR'; color: string }
  | { type: 'SET_BRUSH_SIZE'; size: number }
  | { type: 'SET_OPACITY'; opacity: number }
  | { type: 'SET_FRAME'; index: number }
  | { type: 'SET_LAYER'; index: number }
  | { type: 'ADD_FRAME' }
  | { type: 'DUPLICATE_FRAME' }
  | { type: 'DELETE_FRAME' }
  | { type: 'ADD_LAYER' }
  | { type: 'DELETE_LAYER' }
  | { type: 'TOGGLE_LAYER_VISIBILITY'; layerIndex: number }
  | { type: 'ADD_STROKE'; stroke: Stroke }
  | { type: 'CLEAR_LAYER' }
  | { type: 'CLEAR_FRAME' }
  | { type: 'TOGGLE_ONION_SKIN' }
  | { type: 'SET_FPS'; fps: number }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SAVE_HISTORY' }
  | { type: 'LOAD_STATE'; state: Partial<EditorState> }

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SET_TOOL':
      return { ...state, tool: action.tool }

    case 'SET_COLOR':
      return { ...state, color: action.color }

    case 'SET_BRUSH_SIZE':
      return { ...state, brushSize: action.size }

    case 'SET_OPACITY':
      return { ...state, opacity: action.opacity }

    case 'SET_FRAME':
      return { ...state, currentFrameIndex: action.index, currentLayerIndex: 0 }

    case 'SET_LAYER':
      return { ...state, currentLayerIndex: action.index }

    case 'ADD_FRAME': {
      const newFrames = [...state.frames, createEmptyFrame()]
      return {
        ...state,
        frames: newFrames,
        currentFrameIndex: newFrames.length - 1,
        currentLayerIndex: 0,
      }
    }

    case 'DUPLICATE_FRAME': {
      const currentFrame = state.frames[state.currentFrameIndex]
      const duplicatedFrame: Frame = {
        ...currentFrame,
        id: crypto.randomUUID(),
        layers: currentFrame.layers.map(layer => ({
          ...layer,
          id: crypto.randomUUID(),
          strokes: [...layer.strokes],
        })),
      }
      const newFrames = [
        ...state.frames.slice(0, state.currentFrameIndex + 1),
        duplicatedFrame,
        ...state.frames.slice(state.currentFrameIndex + 1),
      ]
      return {
        ...state,
        frames: newFrames,
        currentFrameIndex: state.currentFrameIndex + 1,
      }
    }

    case 'DELETE_FRAME': {
      if (state.frames.length <= 1) return state
      const newFrames = state.frames.filter((_, i) => i !== state.currentFrameIndex)
      return {
        ...state,
        frames: newFrames,
        currentFrameIndex: Math.min(state.currentFrameIndex, newFrames.length - 1),
      }
    }

    case 'ADD_LAYER': {
      const newFrames = state.frames.map((frame, i) => {
        if (i === state.currentFrameIndex) {
          return {
            ...frame,
            layers: [...frame.layers, createEmptyLayer(`Layer ${frame.layers.length + 1}`)],
          }
        }
        return frame
      })
      return {
        ...state,
        frames: newFrames,
        currentLayerIndex: state.frames[state.currentFrameIndex].layers.length,
      }
    }

    case 'DELETE_LAYER': {
      const currentFrame = state.frames[state.currentFrameIndex]
      if (currentFrame.layers.length <= 1) return state
      
      const newFrames = state.frames.map((frame, i) => {
        if (i === state.currentFrameIndex) {
          return {
            ...frame,
            layers: frame.layers.filter((_, j) => j !== state.currentLayerIndex),
          }
        }
        return frame
      })
      return {
        ...state,
        frames: newFrames,
        currentLayerIndex: Math.min(state.currentLayerIndex, currentFrame.layers.length - 2),
      }
    }

    case 'TOGGLE_LAYER_VISIBILITY': {
      const newFrames = state.frames.map((frame, i) => {
        if (i === state.currentFrameIndex) {
          return {
            ...frame,
            layers: frame.layers.map((layer, j) => {
              if (j === action.layerIndex) {
                return { ...layer, visible: !layer.visible }
              }
              return layer
            }),
          }
        }
        return frame
      })
      return { ...state, frames: newFrames }
    }

    case 'ADD_STROKE': {
      const newFrames = state.frames.map((frame, i) => {
        if (i === state.currentFrameIndex) {
          return {
            ...frame,
            layers: frame.layers.map((layer, j) => {
              if (j === state.currentLayerIndex) {
                return {
                  ...layer,
                  strokes: [...layer.strokes, action.stroke],
                }
              }
              return layer
            }),
          }
        }
        return frame
      })
      return { ...state, frames: newFrames }
    }

    case 'CLEAR_LAYER': {
      const newFrames = state.frames.map((frame, i) => {
        if (i === state.currentFrameIndex) {
          return {
            ...frame,
            layers: frame.layers.map((layer, j) => {
              if (j === state.currentLayerIndex) {
                return { ...layer, strokes: [] }
              }
              return layer
            }),
          }
        }
        return frame
      })
      return { ...state, frames: newFrames }
    }

    case 'CLEAR_FRAME': {
      const newFrames = state.frames.map((frame, i) => {
        if (i === state.currentFrameIndex) {
          return {
            ...frame,
            layers: frame.layers.map(layer => ({ ...layer, strokes: [] })),
          }
        }
        return frame
      })
      return { ...state, frames: newFrames }
    }

    case 'TOGGLE_ONION_SKIN':
      return { ...state, onionSkinEnabled: !state.onionSkinEnabled }

    case 'SET_FPS':
      return { ...state, fps: action.fps }

    case 'SAVE_HISTORY': {
      const historyEntry = {
        frames: JSON.parse(JSON.stringify(state.frames)),
        currentFrameIndex: state.currentFrameIndex,
        currentLayerIndex: state.currentLayerIndex,
      }
      const newHistory = state.history.slice(0, state.historyIndex + 1)
      newHistory.push(historyEntry)
      // Keep max 50 history entries
      if (newHistory.length > 50) newHistory.shift()
      return {
        ...state,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      }
    }

    case 'UNDO': {
      if (state.historyIndex <= 0) return state
      const prevEntry = state.history[state.historyIndex - 1]
      return {
        ...state,
        frames: JSON.parse(JSON.stringify(prevEntry.frames)),
        currentFrameIndex: prevEntry.currentFrameIndex,
        currentLayerIndex: prevEntry.currentLayerIndex,
        historyIndex: state.historyIndex - 1,
      }
    }

    case 'REDO': {
      if (state.historyIndex >= state.history.length - 1) return state
      const nextEntry = state.history[state.historyIndex + 1]
      return {
        ...state,
        frames: JSON.parse(JSON.stringify(nextEntry.frames)),
        currentFrameIndex: nextEntry.currentFrameIndex,
        currentLayerIndex: nextEntry.currentLayerIndex,
        historyIndex: state.historyIndex + 1,
      }
    }

    case 'LOAD_STATE':
      return { ...state, ...action.state }

    default:
      return state
  }
}

interface EditorContextType {
  state: EditorState
  dispatch: Dispatch<EditorAction>
}

const EditorContext = createContext<EditorContextType | null>(null)

export function EditorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(editorReducer, createInitialState())

  return (
    <EditorContext.Provider value={{ state, dispatch }}>
      {children}
    </EditorContext.Provider>
  )
}

export function useEditor() {
  const context = useContext(EditorContext)
  if (!context) {
    throw new Error('useEditor must be used within EditorProvider')
  }
  return context
}
