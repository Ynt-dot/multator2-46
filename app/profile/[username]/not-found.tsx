'use client'

import Link from 'next/link'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n/context'
import { UserX } from 'lucide-react'

export default function ProfileNotFound() {
  const { locale, t } = useTranslation()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-24 flex flex-col items-center text-center">
        <UserX className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h1 className="text-2xl font-bold">
          {locale === 'ru' ? 'Пользователь не найден' : 'User not found'}
        </h1>
        <p className="text-muted-foreground mt-2 max-w-sm">
          {locale === 'ru'
            ? 'Такого пользователя не существует или аккаунт был удалён.'
            : 'This user does not exist or their account has been deleted.'}
        </p>
        <Button asChild className="mt-6">
          <Link href="/">{t.nav.home}</Link>
        </Button>
      </main>
    </div>
  )
}
