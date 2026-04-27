'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { captureError } from '@/lib/logger'

const feedbackSchema = z.object({
  category: z.enum(['bug', 'suggestion', 'praise', 'other']),
  rating: z.number().int().min(1).max(5).nullable(),
  message: z.string().min(10, 'Минимум 10 символов').max(2000, 'Максимум 2000 символов').trim(),
})

export type FeedbackActionResult = { success: true } | { error: string }

export async function submitFeedback(data: unknown): Promise<FeedbackActionResult> {
  const parsed = feedbackSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase.from('feedback').insert({
      user_id: user.id,
      category: parsed.data.category,
      rating: parsed.data.rating,
      message: parsed.data.message,
    })

    if (error) return { error: 'Ошибка отправки' }
    return { success: true }
  } catch (err) {
    captureError(err, { action: 'submitFeedback' })
    return { error: 'Ошибка отправки' }
  }
}
