'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { useTranslation } from '@/lib/i18n/context'
import { useAuth } from '@/lib/auth/context'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { Palette, Plus, Calendar, Coins } from 'lucide-react'
import { WorkGrid } from '@/components/work-grid'
import { GOLD_COSTS } from '@/lib/types'
import type { DailyTheme, Work } from '@/lib/types'
import { format } from 'date-fns'
import { ru, enUS } from 'date-fns/locale'

export default function ThemesPage() {
  const router = useRouter()
  const { locale } = useTranslation()
  const { user, profile } = useAuth()
  const dateLocale = locale === 'ru' ? ru : enUS

  const [todayTheme, setTodayTheme] = useState<DailyTheme | null>(null)
  const [themeWorks, setThemeWorks] = useState<Work[]>([])
  const [pastThemes, setPastThemes] = useState<DailyTheme[]>([])
  const [loading, setLoading] = useState(true)
  const [showSuggestDialog, setShowSuggestDialog] = useState(false)
  const [suggestTitle, setSuggestTitle] = useState('')
  const [suggestDesc, setSuggestDesc] = useState('')
  const [suggesting, setSuggesting] = useState(false)

  useEffect(() => {
    fetchThemes()
  }, [])

  const fetchThemes = async () => {
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]

    const [todayRes, pastRes] = await Promise.all([
      supabase.from('daily_themes').select('*').eq('date', today).single(),
      supabase.from('daily_themes').select('*').lt('date', today).order('date', { ascending: false }).limit(10),
    ])

    const theme = todayRes.data as DailyTheme | null
    setTodayTheme(theme)
    setPastThemes(pastRes.data as DailyTheme[] || [])

    if (theme) {
      const { data: works } = await supabase
        .from('works')
        .select('*, profile:profiles!works_user_id_fkey(*)')
        .eq('daily_theme_id', theme.id)
        .eq('is_published', true)
        .order('likes_count', { ascending: false })
      setThemeWorks(works as Work[] || [])
    }

    setLoading(false)
  }

  const handleSuggestTheme = async () => {
    if (!user || !profile) { router.push('/auth/login'); return }
    if (!suggestTitle.trim()) return

    const cost = GOLD_COSTS.SUGGEST_THEME
    if (profile.gold < cost) {
      toast.error(locale === 'ru' ? `Недостаточно золота. Нужно ${cost}✦` : `Not enough gold. Need ${cost}✦`)
      return
    }

    setSuggesting(true)
    const supabase = createClient()

    // Find next available date
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const nextDate = tomorrow.toISOString().split('T')[0]

    const { error: themeError } = await supabase.from('daily_themes').insert({
      title: suggestTitle.trim(),
      description: suggestDesc.trim() || null,
      date: nextDate,
      suggested_by: user.id,
      gold_cost: cost,
    })

    if (themeError) {
      toast.error(locale === 'ru' ? 'Ошибка — эта дата уже занята' : 'Error — this date is taken')
      setSuggesting(false)
      return
    }

    // Deduct gold
    await supabase.from('gold_transactions').insert({
      user_id: user.id,
      amount: -cost,
      type: 'theme_suggest',
      description: `Предложена тема: ${suggestTitle}`,
    })

    toast.success(locale === 'ru' ? `Тема предложена! -${cost}✦` : `Theme suggested! -${cost}✦`)
    setSuggestTitle('')
    setSuggestDesc('')
    setShowSuggestDialog(false)
    setSuggesting(false)
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

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Palette className="h-7 w-7 text-primary" />
              <h1 className="text-2xl font-bold">
                {locale === 'ru' ? 'Тема дня' : 'Theme of the Day'}
              </h1>
            </div>
            {user && (
              <Button onClick={() => setShowSuggestDialog(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                {locale === 'ru' ? 'Предложить тему' : 'Suggest theme'}
                <span className="ml-2 text-yellow-600 flex items-center gap-1">
                  <Coins className="h-3 w-3" />
                  {GOLD_COSTS.SUGGEST_THEME}
                </span>
              </Button>
            )}
          </div>

          {/* Today's theme */}
          {todayTheme ? (
            <Card className="mb-8 border-primary/30 bg-primary/5">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <Badge className="mb-2">{locale === 'ru' ? 'Сегодня' : 'Today'}</Badge>
                    <CardTitle className="text-2xl">{todayTheme.title}</CardTitle>
                    {todayTheme.description && (
                      <p className="text-muted-foreground mt-2">{todayTheme.description}</p>
                    )}
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mb-1 ml-auto" />
                    {format(new Date(todayTheme.date), 'd MMMM', { locale: dateLocale })}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href={`/editor?theme=${todayTheme.id}`}>
                    {locale === 'ru' ? 'Нарисовать на тему' : 'Draw on this theme'}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-8">
              <CardContent className="text-center py-8 text-muted-foreground">
                <Palette className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>{locale === 'ru' ? 'Сегодня нет темы дня' : 'No theme for today'}</p>
                {user && (
                  <Button className="mt-4" onClick={() => setShowSuggestDialog(true)}>
                    {locale === 'ru' ? 'Предложить тему' : 'Suggest a theme'}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Works on today's theme */}
          {todayTheme && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">
                {locale === 'ru' ? 'Работы на тему дня' : 'Works on today\'s theme'}
                <span className="text-muted-foreground font-normal text-base ml-2">({themeWorks.length})</span>
              </h2>
              <WorkGrid
                works={themeWorks}
                emptyMessage={locale === 'ru' ? 'Будь первым, кто нарисует на эту тему!' : 'Be the first to draw on this theme!'}
              />
            </div>
          )}

          {/* Past themes */}
          {pastThemes.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">
                {locale === 'ru' ? 'Прошлые темы' : 'Past themes'}
              </h2>
              <div className="space-y-2">
                {pastThemes.map(theme => (
                  <Card key={theme.id} className="hover:bg-accent/50 transition-colors cursor-pointer">
                    <CardContent className="flex items-center gap-3 p-3">
                      <div className="flex-1">
                        <p className="font-medium">{theme.title}</p>
                        {theme.description && (
                          <p className="text-sm text-muted-foreground truncate">{theme.description}</p>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground shrink-0">
                        {format(new Date(theme.date), 'd MMM', { locale: dateLocale })}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Suggest theme dialog */}
      <Dialog open={showSuggestDialog} onOpenChange={setShowSuggestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {locale === 'ru' ? 'Предложить тему дня' : 'Suggest a theme'}
            </DialogTitle>
          </DialogHeader>
          <FieldGroup>
            <p className="text-sm text-muted-foreground">
              {locale === 'ru'
                ? `Стоимость: ${GOLD_COSTS.SUGGEST_THEME}✦. Тема появится на следующий день.`
                : `Cost: ${GOLD_COSTS.SUGGEST_THEME}✦. Theme will appear the next day.`}
            </p>
            <Field>
              <FieldLabel>{locale === 'ru' ? 'Тема' : 'Theme'}</FieldLabel>
              <Input
                value={suggestTitle}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSuggestTitle(e.target.value)}
                placeholder={locale === 'ru' ? 'Например: белка ест орехи' : 'E.g. squirrel eating nuts'}
                maxLength={100}
              />
            </Field>
            <Field>
              <FieldLabel>{locale === 'ru' ? 'Описание (необязательно)' : 'Description (optional)'}</FieldLabel>
              <Textarea
                value={suggestDesc}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSuggestDesc(e.target.value)}
                rows={2}
                maxLength={300}
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSuggestDialog(false)}>
              {locale === 'ru' ? 'Отмена' : 'Cancel'}
            </Button>
            <Button onClick={handleSuggestTheme} disabled={suggesting || !suggestTitle.trim()}>
              {suggesting && <Spinner className="mr-2" />}
              {locale === 'ru' ? `Предложить (-${GOLD_COSTS.SUGGEST_THEME}✦)` : `Suggest (-${GOLD_COSTS.SUGGEST_THEME}✦)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
