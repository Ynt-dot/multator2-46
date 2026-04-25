'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { useTranslation } from '@/lib/i18n/context'
import { useAuth } from '@/lib/auth/context'
import { submitFeedback } from '@/lib/actions/feedback'
import { fetchFeedbackHistory } from '@/lib/fetchers'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { Send, MessageSquare } from 'lucide-react'
import type { Feedback, FeedbackCategory } from '@/lib/types'

const CATEGORY_LABELS: Record<FeedbackCategory, { ru: string; en: string }> = {
  bug:        { ru: 'Ошибка',        en: 'Bug' },
  suggestion: { ru: 'Предложение',   en: 'Suggestion' },
  praise:     { ru: 'Благодарность', en: 'Praise' },
  other:      { ru: 'Другое',        en: 'Other' },
}

const STATUS_LABELS: Record<string, { ru: string; en: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  new:      { ru: 'Новое',       en: 'New',      variant: 'default' },
  reviewed: { ru: 'Просмотрено', en: 'Reviewed', variant: 'secondary' },
  closed:   { ru: 'Закрыто',     en: 'Closed',   variant: 'outline' },
}

const STAR_LABELS: Record<number, { ru: string; en: string }> = {
  1: { ru: 'Очень плохо', en: 'Very bad' },
  2: { ru: 'Плохо',       en: 'Bad' },
  3: { ru: 'Нормально',   en: 'Okay' },
  4: { ru: 'Хорошо',      en: 'Good' },
  5: { ru: 'Отлично',     en: 'Excellent' },
}

export default function FeedbackPage() {
  const { t, locale } = useTranslation()
  const { user, profile } = useAuth()
  const router = useRouter()

  const [category, setCategory] = useState<FeedbackCategory>('suggestion')
  const [rating, setRating] = useState<number | null>(null)
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { data: history = [], isLoading: loadingHistory, mutate } = useSWR(
    user ? 'feedback-history' : null,
    fetchFeedbackHistory,
  )

  if (!user) router.push('/auth/login')

  const handleSubmit = async () => {
    if (!user) return

    setSubmitting(true)
    const result = await submitFeedback({ category, rating, message })

    if ('error' in result) {
      toast.error(result.error)
    } else {
      toast.success(locale === 'ru' ? 'Спасибо за обратную связь!' : 'Thank you for your feedback!')
      setMessage('')
      setRating(null)
      setCategory('suggestion')
      mutate()
    }

    setSubmitting(false)
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 flex items-center justify-center">
          <Spinner className="h-8 w-8" />
        </main>
      </div>
    )
  }

  const displayRating = hoverRating ?? rating

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold">
            {locale === 'ru' ? 'Обратная связь' : 'Feedback'}
          </h1>

          {/* Feedback form */}
          <Card>
            <CardHeader>
              <CardTitle>
                {locale === 'ru' ? 'Отправить сообщение' : 'Send a message'}
              </CardTitle>
              <CardDescription>
                {locale === 'ru'
                  ? 'Сообщите об ошибке, предложите улучшение или оставьте благодарность'
                  : 'Report a bug, suggest an improvement, or leave a compliment'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                {/* Category */}
                <Field>
                  <FieldLabel>
                    {locale === 'ru' ? 'Тип сообщения' : 'Message type'}
                  </FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(CATEGORY_LABELS) as FeedbackCategory[]).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={[
                          'px-3 py-1.5 text-sm rounded-md border transition-colors',
                          category === cat
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground',
                        ].join(' ')}
                      >
                        {CATEGORY_LABELS[cat][locale]}
                      </button>
                    ))}
                  </div>
                </Field>

                {/* Rating */}
                <Field>
                  <FieldLabel>
                    {locale === 'ru' ? 'Оценка (необязательно)' : 'Rating (optional)'}
                  </FieldLabel>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(rating === star ? null : star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="text-2xl leading-none transition-transform hover:scale-110 focus:outline-none"
                        title={STAR_LABELS[star][locale]}
                      >
                        {displayRating !== null && star <= displayRating ? '★' : '☆'}
                      </button>
                    ))}
                    {displayRating !== null && (
                      <span className="ml-2 text-sm text-muted-foreground">
                        {STAR_LABELS[displayRating][locale]}
                      </span>
                    )}
                  </div>
                </Field>

                {/* Message */}
                <Field>
                  <FieldLabel>
                    {locale === 'ru' ? 'Сообщение' : 'Message'}
                  </FieldLabel>
                  <Textarea
                    value={message}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
                    placeholder={
                      locale === 'ru'
                        ? 'Опишите вашу проблему или предложение...'
                        : 'Describe your issue or suggestion...'
                    }
                    maxLength={2000}
                    rows={5}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {message.length}/2000
                    {message.length > 0 && message.length < 10 && (
                      <span className="text-destructive ml-2">
                        {locale === 'ru' ? `(минимум 10 символов)` : `(minimum 10 characters)`}
                      </span>
                    )}
                  </p>
                </Field>

                <Button
                  onClick={handleSubmit}
                  disabled={submitting || message.trim().length < 10}
                  className="w-full sm:w-auto"
                >
                  {submitting ? (
                    <Spinner className="mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  {locale === 'ru' ? 'Отправить' : 'Submit'}
                </Button>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* Submission history */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                {locale === 'ru' ? 'Мои обращения' : 'My submissions'}
              </CardTitle>
              <CardDescription>
                {locale === 'ru'
                  ? 'История ваших обращений видна только вам'
                  : 'Your submission history is only visible to you'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingHistory ? (
                <div className="flex justify-center py-6">
                  <Spinner className="h-6 w-6" />
                </div>
              ) : history.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  {locale === 'ru' ? 'Обращений пока нет' : 'No submissions yet'}
                </p>
              ) : (
                <div className="space-y-4">
                  {history.map((item, index) => {
                    const statusInfo = STATUS_LABELS[item.status]
                    return (
                      <div key={item.id}>
                        {index > 0 && <Separator className="mb-4" />}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {CATEGORY_LABELS[item.category][locale]}
                              </Badge>
                              {item.rating !== null && (
                                <span className="text-sm text-yellow-500">
                                  {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={statusInfo.variant}>
                                {statusInfo[locale]}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(item.created_at).toLocaleDateString(
                                  locale === 'ru' ? 'ru-RU' : 'en-US',
                                  { day: 'numeric', month: 'short', year: 'numeric' }
                                )}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                            {item.message}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
