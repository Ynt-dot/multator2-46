'use client'

import { useState, useRef, useEffect } from 'react'
import { useEditor } from '@/lib/editor/context'
import { useTranslation } from '@/lib/i18n/context'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Toggle } from '@/components/ui/toggle'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
  Plus,
  Copy,
  Trash2,
  Play,
  Pause,
  Layers as LayersIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function Timeline() {
  const { state, dispatch } = useEditor()
  const { t, locale } = useTranslation()
  const [isPlaying, setIsPlaying] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isPlaying) {
      const frameDelay = 1000 / state.fps
      intervalRef.current = setInterval(() => {
        dispatch({
          type: 'SET_FRAME',
          index: (state.currentFrameIndex + 1) % state.frames.length,
        })
      }, frameDelay)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, state.fps, state.frames.length, dispatch, state.currentFrameIndex])

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const goToPrevFrame = () => {
    if (state.currentFrameIndex > 0) {
      dispatch({ type: 'SET_FRAME', index: state.currentFrameIndex - 1 })
    }
  }

  const goToNextFrame = () => {
    if (state.currentFrameIndex < state.frames.length - 1) {
      dispatch({ type: 'SET_FRAME', index: state.currentFrameIndex + 1 })
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg p-3">
      {/* Playback controls */}
      <div className="flex items-center gap-2 mb-3">
        <Button variant="outline" size="icon" onClick={goToPrevFrame} disabled={isPlaying}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="default" size="icon" onClick={togglePlay}>
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button variant="outline" size="icon" onClick={goToNextFrame} disabled={isPlaying}>
          <ChevronRight className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2 ml-4">
          <span className="text-sm text-muted-foreground">{t.editor.fps}:</span>
          <Slider
            value={[state.fps]}
            onValueChange={([fps]) => dispatch({ type: 'SET_FPS', fps })}
            min={1}
            max={30}
            step={1}
            className="w-24"
          />
          <span className="text-sm font-medium w-6">{state.fps}</span>
        </div>

        <Toggle
          pressed={state.onionSkinEnabled}
          onPressedChange={() => dispatch({ type: 'TOGGLE_ONION_SKIN' })}
          size="sm"
          className="ml-4"
        >
          <LayersIcon className="h-4 w-4 mr-1" />
          {t.editor.onionSkin}
        </Toggle>
      </div>

      {/* Frame thumbnails */}
      <div className="flex items-center gap-2">
        <ScrollArea className="flex-1">
          <div className="flex gap-2 pb-2">
            {state.frames.map((frame, index) => (
              <button
                key={frame.id}
                onClick={() => dispatch({ type: 'SET_FRAME', index })}
                className={cn(
                  'relative flex-shrink-0 w-16 h-12 rounded border-2 overflow-hidden transition-all',
                  index === state.currentFrameIndex
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-border hover:border-muted-foreground'
                )}
              >
                <div className="absolute inset-0 bg-white" />
                <span className="absolute bottom-0 right-0 text-[10px] bg-background/80 px-1">
                  {index + 1}
                </span>
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Frame actions */}
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => dispatch({ type: 'ADD_FRAME' })}
            title={t.editor.addFrame}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => dispatch({ type: 'DUPLICATE_FRAME' })}
            title={t.editor.duplicateFrame}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => dispatch({ type: 'DELETE_FRAME' })}
            disabled={state.frames.length <= 1}
            title={t.editor.deleteFrame}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Frame counter */}
      <div className="mt-2 text-sm text-muted-foreground text-center">
        {t.editor.frames}: {state.currentFrameIndex + 1} / {state.frames.length}
      </div>
    </div>
  )
}
