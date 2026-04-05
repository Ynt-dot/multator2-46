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
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { Camera, Save } from 'lucide-react'

export default function SettingsPage() {
  const { t, locale } = useTranslation()
  const { user, profile, refreshProfile } = useAuth()
  const router = useRouter()

  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    if (profile) {
      setDisplayName(profile.display_name || '')
      setBio(profile.bio || '')
      setAvatarUrl(profile.avatar_url || '')
    }
  }, [user, profile, router])

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: displayName || null,
        bio: bio || null,
        avatar_url: avatarUrl || null,
      })
      .eq('id', user.id)

    if (error) {
      toast.error(locale === 'ru' ? 'Ошибка сохранения' : 'Error saving')
    } else {
      toast.success(locale === 'ru' ? 'Профиль обновлен' : 'Profile updated')
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">{t.nav.settings}</h1>

          <Card>
            <CardHeader>
              <CardTitle>{t.profile.editProfile}</CardTitle>
              <CardDescription>
                {locale === 'ru'
                  ? 'Обновите информацию о своем профиле'
                  : 'Update your profile information'}
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
                      <AvatarFallback>
                        {profile.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Input
                        placeholder={locale === 'ru' ? 'URL аватара' : 'Avatar URL'}
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {locale === 'ru'
                          ? 'Введите URL изображения для аватара'
                          : 'Enter an image URL for your avatar'}
                      </p>
                    </div>
                  </div>
                </Field>

                {/* Username (read-only) */}
                <Field>
                  <FieldLabel>{t.auth.username}</FieldLabel>
                  <Input value={profile.username} disabled />
                  <p className="text-xs text-muted-foreground mt-1">
                    {locale === 'ru'
                      ? 'Имя пользователя нельзя изменить'
                      : 'Username cannot be changed'}
                  </p>
                </Field>

                {/* Display name */}
                <Field>
                  <FieldLabel>{locale === 'ru' ? 'Отображаемое имя' : 'Display name'}</FieldLabel>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={locale === 'ru' ? 'Ваше имя' : 'Your name'}
                    maxLength={50}
                  />
                </Field>

                {/* Bio */}
                <Field>
                  <FieldLabel>{t.profile.bio}</FieldLabel>
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder={locale === 'ru' ? 'Расскажите о себе...' : 'Tell about yourself...'}
                    maxLength={500}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {bio.length}/500
                  </p>
                </Field>

                <Separator />

                <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
                  {saving ? <Spinner className="mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  {t.common.save}
                </Button>
              </FieldGroup>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
