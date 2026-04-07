'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { useTranslation } from '@/lib/i18n/context'
import { useAuth } from '@/lib/auth/context'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { Save, Coins } from 'lucide-react'
import { getRankInfo, RANKS } from '@/lib/types'

export default function SettingsPage() {
  const { t, locale } = useTranslation()
  const { user, profile, refreshProfile } = useAuth()
  const router = useRouter()

  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [newUsername, setNewUsername] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [saving, setSaving] = useState(false)
  const [checkingUsername, setCheckingUsername] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    if (profile) {
      setDisplayName(profile.display_name || '')
      setBio(profile.bio || '')
      setAvatarUrl(profile.avatar_url || '')
      setNewUsername(profile.username)
    }
  }, [user, profile, router])

  const checkUsername = async (value: string) => {
    if (!profile || value === profile.username) {
      setUsernameError('')
      return
    }
    if (value.length < 3) {
      setUsernameError(locale === 'ru' ? 'Минимум 3 символа' : 'Minimum 3 characters')
      return
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      setUsernameError(locale === 'ru' ? 'Только буквы, цифры и _' : 'Only letters, numbers and _')
      return
    }
    setCheckingUsername(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', value)
      .neq('id', profile.id)
      .single()
    setCheckingUsername(false)
    if (data) {
      setUsernameError(locale === 'ru' ? 'Никнейм уже занят' : 'Username already taken')
    } else {
      setUsernameError('')
    }
  }

  const handleSave = async () => {
    if (!user || !profile) return
    if (usernameError) return

    setSaving(true)
    const supabase = createClient()

    const updates: Record<string, string | null> = {
      display_name: displayName || null,
      bio: bio || null,
      avatar_url: avatarUrl || null,
    }

    if (newUsername && newUsername !== profile.username && newUsername.length >= 3) {
      updates.username = newUsername
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)

    if (error) {
      toast.error(locale === 'ru' ? 'Ошибка сохранения' : 'Error saving')
    } else {
      toast.success(locale === 'ru' ? 'Профиль обновлён' : 'Profile updated')
      await refreshProfile()
    }

    setSaving(false)
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

  const rankInfo = getRankInfo(profile.rank, locale)
  const nextRank = RANKS.find(r => r.level === profile.rank + 1)
  const progressToNext = nextRank
    ? Math.min(100, Math.round((profile.total_likes / nextRank.minLikes) * 100))
    : 100

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold">{t.nav.settings}</h1>

          {/* Profile card */}
          <Card>
            <CardHeader>
              <CardTitle>{t.profile.editProfile}</CardTitle>
              <CardDescription>
                {locale === 'ru' ? 'Обновите информацию профиля' : 'Update your profile information'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                {/* Avatar */}
                <Field>
                  <FieldLabel>{locale === 'ru' ? 'Аватар' : 'Avatar'}</FieldLabel>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={avatarUrl || undefined} />
                      <AvatarFallback>{profile.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Input
                        placeholder={locale === 'ru' ? 'URL аватара' : 'Avatar URL'}
                        value={avatarUrl}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAvatarUrl(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {locale === 'ru' ? 'Введите URL изображения' : 'Enter an image URL'}
                      </p>
                    </div>
                  </div>
                </Field>

                {/* Username change */}
                <Field>
                  <FieldLabel>{t.auth.username}</FieldLabel>
                  <Input
                    value={newUsername}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setNewUsername(e.target.value)
                      checkUsername(e.target.value)
                    }}
                    placeholder="username"
                    minLength={3}
                    maxLength={20}
                  />
                  {checkingUsername && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {locale === 'ru' ? 'Проверяем...' : 'Checking...'}
                    </p>
                  )}
                  {usernameError && (
                    <p className="text-xs text-destructive mt-1">{usernameError}</p>
                  )}
                  {!usernameError && newUsername !== profile.username && newUsername.length >= 3 && !checkingUsername && (
                    <p className="text-xs text-green-600 mt-1">
                      {locale === 'ru' ? 'Никнейм свободен' : 'Username available'}
                    </p>
                  )}
                </Field>

                {/* Display name */}
                <Field>
                  <FieldLabel>{locale === 'ru' ? 'Отображаемое имя' : 'Display name'}</FieldLabel>
                  <Input
                    value={displayName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDisplayName(e.target.value)}
                    placeholder={locale === 'ru' ? 'Ваше имя' : 'Your name'}
                    maxLength={50}
                  />
                </Field>

                {/* Bio */}
                <Field>
                  <FieldLabel>{t.profile.bio}</FieldLabel>
                  <Textarea
                    value={bio}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBio(e.target.value)}
                    placeholder={locale === 'ru' ? 'Расскажите о себе...' : 'Tell about yourself...'}
                    maxLength={500}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground mt-1">{bio.length}/500</p>
                </Field>

                <Separator />

                <Button onClick={handleSave} disabled={saving || !!usernameError} className="w-full sm:w-auto">
                  {saving ? <Spinner className="mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  {t.common.save}
                </Button>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* Rank & Stats card */}
          <Card>
            <CardHeader>
              <CardTitle>{locale === 'ru' ? 'Ранг и статистика' : 'Rank & Stats'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{rankInfo.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {locale === 'ru' ? `Ранг ${profile.rank} из 10` : `Rank ${profile.rank} of 10`}
                  </p>
                </div>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {profile.rank}/10
                </Badge>
              </div>

              {nextRank && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">
                      {locale === 'ru' ? `До ранга "${RANKS[profile.rank].name.ru}"` : `To rank "${RANKS[profile.rank].name.en}"`}
                    </span>
                    <span>{profile.total_likes} / {nextRank.minLikes}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${progressToNext}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-xl font-bold">{profile.total_likes}</p>
                  <p className="text-xs text-muted-foreground">{t.works.likes}</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-xl font-bold">{profile.total_works}</p>
                  <p className="text-xs text-muted-foreground">{t.profile.works}</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-xl font-bold">{profile.user_type === 'animator' ? '🎬' : '🏺'}</p>
                  <p className="text-xs text-muted-foreground">
                    {profile.user_type === 'animator' ? t.auth.animator : t.auth.archaeologist}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gold balance card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-yellow-500" />
                {locale === 'ru' ? 'Золото' : 'Gold'}
              </CardTitle>
              <CardDescription>
                {locale === 'ru'
                  ? 'Внутриигровая валюта. 1 золото = 1 рубль'
                  : 'In-game currency. 1 gold = 1 ruble'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div>
                  <p className="text-2xl font-bold text-yellow-600">{profile.gold} ✦</p>
                  <p className="text-sm text-muted-foreground">
                    {locale === 'ru' ? 'Текущий баланс' : 'Current balance'}
                  </p>
                </div>
                <Button variant="outline" className="border-yellow-500/50 text-yellow-600 hover:bg-yellow-500/10">
                  {locale === 'ru' ? 'Пополнить' : 'Top up'}
                </Button>
              </div>
              <div className="mt-3 text-sm text-muted-foreground space-y-1">
                <p>• {locale === 'ru' ? 'Ежедневный бонус за вход: +2 золота' : 'Daily login bonus: +2 gold'}</p>
                <p>• {locale === 'ru' ? 'Топ дня: +25, топ недели: +75, топ месяца: +200' : 'Top of day: +25, week: +75, month: +200'}</p>
                <p>• {locale === 'ru' ? 'Помощь модераторам: золото за вклад' : 'Helping moderators: gold for contribution'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Premium status card */}
          <Card>
            <CardHeader>
              <CardTitle>{locale === 'ru' ? 'Премиум статус' : 'Premium Status'}</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.is_premium ? (
                <div className="space-y-2">
                  <Badge className="bg-yellow-500 text-black">
                    {locale === 'ru' ? '⭐ Премиум активен' : '⭐ Premium active'}
                  </Badge>
                  {profile.premium_until && (
                    <p className="text-sm text-muted-foreground">
                      {locale === 'ru' ? 'До:' : 'Until:'} {new Date(profile.premium_until).toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-US')}
                    </p>
                  )}
                  <div className="text-sm space-y-1 mt-3">
                    <p>✓ {locale === 'ru' ? '1 бесплатная медаль в день' : '1 free medal per day'}</p>
                    <p>✓ {locale === 'ru' ? 'Особый значок профиля' : 'Special profile badge'}</p>
                    <p>✓ {locale === 'ru' ? 'Дополнительные привилегии' : 'Additional privileges'}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {locale === 'ru'
                      ? 'Получите премиум статус, потратив 100+ рублей за раз на покупку золота'
                      : 'Get premium status by spending 100+ rubles at once on gold purchase'}
                  </p>
                  <div className="text-sm space-y-1">
                    <p>• {locale === 'ru' ? '1 бесплатная медаль в день' : '1 free medal per day'}</p>
                    <p>• {locale === 'ru' ? 'Особый значок профиля' : 'Special profile badge'}</p>
                    <p>• {locale === 'ru' ? 'Дополнительные привилегии' : 'Additional privileges'}</p>
                  </div>
                  <Button variant="outline">
                    {locale === 'ru' ? 'Купить золото и получить премиум' : 'Buy gold and get premium'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
