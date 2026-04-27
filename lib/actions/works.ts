'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { captureError } from '@/lib/logger'

const publishWorkSchema = z.object({
  title: z.string().min(1, 'Введите название').max(100, 'Максимум 100 символов').trim(),
  description: z.string().max(500, 'Максимум 500 символов').nullable().optional(),
  type: z.enum(['animation', 'drawing', 'comic']),
  category: z.enum(['oldschool', 'sandbox']),
  frames_data: z.record(z.unknown()),
})

export type PublishWorkResult = { success: true; id: string } | { error: string }

export async function publishWork(data: unknown): Promise<PublishWorkResult> {
  const parsed = publishWorkSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: work, error } = await supabase
      .from('works')
      .insert({
        user_id: user.id,
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        type: parsed.data.type,
        category: parsed.data.category,
        frames_data: parsed.data.frames_data,
        content_url: '',
        is_published: true,
      })
      .select('id')
      .single()

    if (error) return { error: 'Ошибка публикации' }
    return { success: true, id: work.id }
  } catch (err) {
    captureError(err, { action: 'publishWork' })
    return { error: 'Ошибка публикации' }
  }
}
