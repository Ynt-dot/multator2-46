'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { captureError } from '@/lib/logger'

const profileSchema = z.object({
  username: z
    .string()
    .min(3, 'Минимум 3 символа')
    .max(20, 'Максимум 20 символов')
    .regex(/^[a-zA-Z0-9_]+$/, 'Только буквы, цифры и _')
    .optional(),
  display_name: z.string().max(50, 'Максимум 50 символов').nullable().optional(),
  bio: z.string().max(500, 'Максимум 500 символов').nullable().optional(),
  avatar_url: z
    .string()
    .max(500)
    .refine(
      v => !v || /^https?:\/\/.+/.test(v),
      'Должен быть корректный http/https URL',
    )
    .nullable()
    .optional(),
})

export type SettingsActionResult = { success: true } | { error: string }

export async function updateProfile(data: unknown): Promise<SettingsActionResult> {
  const parsed = profileSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const updates: Record<string, string | null> = {}

    if (parsed.data.display_name !== undefined) {
      updates.display_name = parsed.data.display_name || null
    }
    if (parsed.data.bio !== undefined) {
      updates.bio = parsed.data.bio || null
    }
    if (parsed.data.avatar_url !== undefined) {
      updates.avatar_url = parsed.data.avatar_url || null
    }

    if (parsed.data.username) {
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', parsed.data.username)
        .neq('id', user.id)
        .maybeSingle()

      if (existing) return { error: 'Никнейм уже занят' }
      updates.username = parsed.data.username
    }

    if (Object.keys(updates).length === 0) return { success: true }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)

    if (error) return { error: 'Ошибка сохранения' }
    return { success: true }
  } catch (err) {
    captureError(err, { action: 'updateProfile' })
    return { error: 'Ошибка сохранения' }
  }
}
