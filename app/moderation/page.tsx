'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/header'
import { useTranslation } from '@/lib/i18n/context'
import { useAuth } from '@/lib/auth/context'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { ShieldCheck, Archive, Shovel, ArrowRight } from 'lucide-react'
import type { Work } from '@/lib/types'

export default function ModerationPage() {
  const router = useRouter()
  const { locale } = useTranslation()
  const { user, profile } = useAuth()
  const [works, setWorks] = useState<Work[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return }
    if (profile && !['admin', 'moderator'].includes(profile.role)) {
      router.push('/')
      return
    }
    fetchPendingWorks()
  }, [user, profile])

  const fetchPendingWorks = async () => {
    const supabase = createClient()
    // Show recently published works from archaeologists in sandbox for review
    const { data } = await supabase
      .from('works')
      .select('*, profile:profiles!works_user_id_fkey(*)')
      .eq('is_published', true)
      .eq('category', 'sandbox')
      .order('created_at', { ascending: false })
      .limit(50)
    setWorks(data as Work[] || [])
    setLoading(false)
  }

  const moveToOldschool = async (workId: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('works')
      .update({ category: 'oldschool' })
      .eq('id', workId)

    if (error) {
      toast.error('Ошибка')
      return
    }

    // Give gold to moderator for moderation work
    await supabase.from('gold_transactions').insert({
      user_id: user!.id,
      amount: 3,
      type: 'moderation',
      description: 'Перенос работы в олдскул',
      work_id: workId,
    })

    toast.success(locale === 'ru' ? 'Перенесено в олдскул (+3 золота)' : 'Moved to oldschool (+3 gold)')
    setWorks(prev => prev.filter(w => w.id !== workId))
  }

  const removeWork = async (workId: string) => {
    if (!confirm(locale === 'ru' ? 'Скрыть работу за нарушение правил?' : 'Hide work for rule violation?')) return
    const supabase = createClient()
    await supabase.from('works').update({ is_published: false }).eq('id', workId)

    // Give gold to moderator
    await supabase.from('gold_transactions').insert({
      user_id: user!.id,
      amount: 2,
      type: 'moderation',
      description: 'Удаление нарушения',
      work_id: workId,
    })

    toast.success(locale === 'ru' ? 'Работа скрыта (+2 золота)' : 'Work hidden (+2 gold)')
    setWorks(prev => prev.filter(w => w.id !== workId))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 flex justify-center">
          <Spinner className="h-8 w-8" />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold">
              {locale === 'ru' ? 'Панель модератора' : 'Moderation Panel'}
            </h1>
          </div>

          <Card className="mb-6">
            <CardContent className="p-4 text-sm text-muted-foreground space-y-1">
              <p>• {locale === 'ru' ? 'За перенос в олдскул: +3 золота' : 'Move to oldschool: +3 gold'}</p>
              <p>• {locale === 'ru' ? 'За скрытие нарушения: +2 золота' : 'Hide violation: +2 gold'}</p>
              <p>• {locale === 'ru' ? 'Оценивайте работы справедливо — от этого зависит ваше назначение' : 'Rate fairly — your future moderator status depends on it'}</p>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <CardHeader className="px-0 pb-2">
              <CardTitle className="text-lg">
                {locale === 'ru' ? `Работы из песочницы (${works.length})` : `Sandbox works (${works.length})`}
              </CardTitle>
            </CardHeader>

            {works.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8 text-muted-foreground">
                  {locale === 'ru' ? 'Нет работ для проверки' : 'No works to review'}
                </CardContent>
              </Card>
            ) : works.map(work => (
              <Card key={work.id}>
                <CardContent className="flex items-center gap-3 p-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/work/${work.id}`} className="font-medium hover:underline truncate" target="_blank">
                        {work.title}
                      </Link>
                      <Badge variant="secondary">{work.type}</Badge>
                      <span className="text-sm text-muted-foreground">❤️ {work.likes_count}</span>
                    </div>
                    {work.profile && (
                      <div className="flex items-center gap-2 mt-1">
                        <Link href={`/profile/${work.profile.username}`} className="text-xs text-muted-foreground hover:underline">
                          @{work.profile.username}
                        </Link>
                        <Badge variant="outline" className="text-xs">
                          {work.profile.user_type}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => moveToOldschool(work.id)}
                      title={locale === 'ru' ? 'Перенести в олдскул' : 'Move to oldschool'}>
                      <Archive className="h-3 w-3 mr-1" />
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => removeWork(work.id)}
                      title={locale === 'ru' ? 'Скрыть (нарушение)' : 'Hide (violation)'}>
                      <Shovel className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
