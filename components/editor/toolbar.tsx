'use client'

import { useEditor } from '@/lib/editor/context'
import { useTranslation } from '@/lib/i18n/context'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { Toggle } from '@/components/ui/toggle'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Paintbrush,
  Eraser,
  PaintBucket,
  Minus,
  Square,
  Circle,
  Pipette,
  Undo2,
  Redo2,
  Trash2,
  Layers,
} from 'lucide-react'
import type { Tool } from '@/lib/editor/types'
import { DEFAULT_COLORS, BRUSH_SIZES } from '@/lib/editor/types'
import { cn } from '@/lib/utils'

const tools: { id: Tool; icon: typeof Paintbrush; label: string }[] = [
  { id: 'brush', icon: Paintbrush, label: 'brush' },
  { id: 'eraser', icon: Eraser, label: 'eraser' },
  { id: 'fill', icon: PaintBucket, label: 'fill' },
  { id: 'line', icon: Minus, label: 'line' },
  { id: 'rectangle', icon: Square, label: 'rectangle' },
  { id: 'ellipse', icon: Circle, label: 'ellipse' },
  { id: 'eyedropper', icon: Pipette, label: 'eyedropper' },
]

export function Toolbar() {
  const { state, dispatch } = useEditor()
  const { t } = useTranslation()

  const toolLabels: Record<string, string> = {
    brush: t.editor.tools.brush,
    eraser: t.editor.tools.eraser,
    fill: t.editor.tools.fill,
    line: t.editor.tools.line,
    rectangle: t.editor.tools.rectangle,
    ellipse: t.editor.tools.ellipse,
    eyedropper: t.editor.tools.eyedropper,
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-2 p-2 bg-card border border-border rounded-lg">
        {/* Tools */}
        <div className="flex flex-col gap-1">
          {tools.map((tool) => (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <Toggle
                  pressed={state.tool === tool.id}
                  onPressedChange={() => dispatch({ type: 'SET_TOOL', tool: tool.id })}
                  size="sm"
                  className="w-10 h-10"
                >
                  <tool.icon className="h-5 w-5" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent side="right">
                {toolLabels[tool.label]}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        <Separator />

        {/* Color picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-10 h-10 p-1"
            >
              <div
                className="w-full h-full rounded border border-border"
                style={{ backgroundColor: state.color }}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent side="right" className="w-auto p-3">
            <div className="grid grid-cols-4 gap-2">
              {DEFAULT_COLORS.map((color) => (
                <button
                  key={color}
                  className={cn(
                    'w-8 h-8 rounded border-2 transition-transform hover:scale-110',
                    state.color === color ? 'border-primary' : 'border-transparent'
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => dispatch({ type: 'SET_COLOR', color })}
                />
              ))}
            </div>
            <div className="mt-3">
              <input
                type="color"
                value={state.color}
                onChange={(e) => dispatch({ type: 'SET_COLOR', color: e.target.value })}
                className="w-full h-8 cursor-pointer"
              />
            </div>
          </PopoverContent>
        </Popover>

        <Separator />

        {/* Brush size */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="w-10 h-10 text-xs">
              {state.brushSize}
            </Button>
          </PopoverTrigger>
          <PopoverContent side="right" className="w-48">
            <p className="text-sm font-medium mb-2">{t.editor.brushSize}</p>
            <Slider
              value={[state.brushSize]}
              onValueChange={([size]) => dispatch({ type: 'SET_BRUSH_SIZE', size })}
              min={1}
              max={64}
              step={1}
            />
            <div className="flex flex-wrap gap-1 mt-2">
              {BRUSH_SIZES.map((size) => (
                <Button
                  key={size}
                  variant={state.brushSize === size ? 'default' : 'outline'}
                  size="sm"
                  className="w-8 h-8 text-xs"
                  onClick={() => dispatch({ type: 'SET_BRUSH_SIZE', size })}
                >
                  {size}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Opacity */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="w-10 h-10 text-xs">
              {Math.round(state.opacity * 100)}%
            </Button>
          </PopoverTrigger>
          <PopoverContent side="right" className="w-48">
            <p className="text-sm font-medium mb-2">{t.editor.opacity}</p>
            <Slider
              value={[state.opacity * 100]}
              onValueChange={([value]) => dispatch({ type: 'SET_OPACITY', opacity: value / 100 })}
              min={10}
              max={100}
              step={5}
            />
          </PopoverContent>
        </Popover>

        <Separator />

        {/* Undo/Redo */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-10 h-10"
              onClick={() => dispatch({ type: 'UNDO' })}
              disabled={state.historyIndex <= 0}
            >
              <Undo2 className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">{t.editor.undo}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-10 h-10"
              onClick={() => dispatch({ type: 'REDO' })}
              disabled={state.historyIndex >= state.history.length - 1}
            >
              <Redo2 className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">{t.editor.redo}</TooltipContent>
        </Tooltip>

        <Separator />

        {/* Clear */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-10 h-10 text-destructive hover:text-destructive"
              onClick={() => {
                dispatch({ type: 'SAVE_HISTORY' })
                dispatch({ type: 'CLEAR_LAYER' })
              }}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">{t.editor.clear}</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
