'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { DrawingCanvas } from '@/components/editor/drawing-canvas'
import { Toolbar } from '@/components/editor/toolbar'
import { Timeline } from '@/components/editor/timeline'
import { EditorProvider, useEditor } from '@/lib/editor/context'
import { useTranslation } from '@/lib/i18n/context'
import { useAuth } from '@/lib/auth/context'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { Save, Download, Upload } from 'lucide-react'
import type { WorkType, WorkCategory } from '@/lib/types'

function EditorContent() {
  const router = useRouter()
  const { t, locale } = useTranslation()
  const { user, profile } = useAuth()
  const { state } = useEditor()

  const [showPublishDialog, setShowPublishDialog] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [workType, setWorkType] = useState<WorkType>('animation')
  const [category, setCategory] = useState<WorkCategory>('sandbox')
  const [publishing, setPublishing] = useState(false)

  const canvasWidth = 800
  const canvasHeight = 600

  const handlePublish = async () => {
    if (!user || !title.trim()) {
      toast.error(locale === 'ru' ? 'Введите название' : 'Enter a title')
      return
    }

    setPublishing(true)

    try {
      const supabase = createClient()

      // Save frames data
      const framesData = {
        frames: state.frames,
        fps: state.fps,
        width: canvasWidth,
        height: canvasHeight,
      }

      // Create work
      const { data, error } = await supabase
        .from('works')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          type: workType,
          category,
          frames_data: framesData,
          content_url: '',
          is_published: true,
        })
        .select()
        .single()

      if (error) throw error

      toast.success(locale === 'ru' ? 'Работа опубликована!' : 'Work published!')
      router.push(`/work/${data.id}`)
    } catch {
      toast.error(locale === 'ru' ? 'Ошибка публикации' : 'Publishing error')
    } finally {
      setPublishing(false)
      setShowPublishDialog(false)
    }
  }

  const handleExportPNG = () => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `${title || 'drawing'}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">{t.editor.newWork}</h1>
          <p className="text-muted-foreground mb-4">
            {locale === 'ru' ? 'Войдите, чтобы создавать и сохранять работы' : 'Log in to create and save works'}
          </p>
          <Button onClick={() => router.push('/auth/login')}>{t.nav.login}</Button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-4 flex flex-col gap-4">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">{t.editor.newWork}</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportPNG}>
              <Download className="h-4 w-4 mr-2" />
              {t.editor.exportPng}
            </Button>
            <Button size="sm" onClick={() => setShowPublishDialog(true)}>
              <Upload className="h-4 w-4 mr-2" />
              {t.common.publish}
            </Button>
          </div>
        </div>

        {/* Editor area */}
        <div className="flex-1 flex gap-4">
          {/* Toolbar */}
          <Toolbar />

          {/* Canvas */}
          <div className="flex-1 flex items-center justify-center bg-muted/30 rounded-lg p-4">
            <DrawingCanvas width={canvasWidth} height={canvasHeight} />
          </div>
        </div>

        {/* Timeline */}
        <Timeline />
      </main>

      {/* Publish dialog */}
      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.common.publish}</DialogTitle>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel>{t.works.title}</FieldLabel>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={locale === 'ru' ? 'Название работы' : 'Work title'}
                maxLength={100}
              />
            </Field>
            <Field>
              <FieldLabel>{t.works.description}</FieldLabel>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={locale === 'ru' ? 'Описание (необязательно)' : 'Description (optional)'}
                maxLength={500}
                rows={3}
              />
            </Field>
            <Field>
              <FieldLabel>{t.works.type}</FieldLabel>
              <Select value={workType} onValueChange={(v) => setWorkType(v as WorkType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="animation">{t.works.animation}</SelectItem>
                  <SelectItem value="drawing">{t.works.drawing}</SelectItem>
                  <SelectItem value="comic">{t.works.comic}</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>{t.works.category}</FieldLabel>
              <Select value={category} onValueChange={(v) => setCategory(v as WorkCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sandbox">{t.works.sandbox}</SelectItem>
                  <SelectItem value="oldschool">{t.works.oldschool}</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPublishDialog(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={handlePublish} disabled={publishing || !title.trim()}>
              {publishing && <Spinner className="mr-2" />}
              {t.common.publish}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function EditorPage() {
  return (
    <EditorProvider>
      <EditorContent />
    </EditorProvider>
  )
}
