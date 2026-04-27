'use client'

import Link from 'next/link'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n/context'
import { Home } from 'lucide-react'

export default function NotFound() {
  const { locale, t } = useTranslation()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-24 flex flex-col items-center text-center">
        <p className="text-8xl font-bold text-muted-foreground/20 select-none">404</p>
        <h1 className="text-2xl font-bold mt-4">
          {locale === 'ru' ? 'Страница не найдена' : 'Page not found'}
        </h1>
        <p className="text-muted-foreground mt-2 max-w-sm">
          {locale === 'ru'
            ? 'Страница, которую вы ищете, не существует или была удалена.'
            : 'The page you are looking for does not exist or has been removed.'}
        </p>
        <Button asChild className="mt-6">
          <Link href="/">
            <Home className="h-4 w-4 mr-2" />
            {t.nav.home}
          </Link>
        </Button>
      </main>
    </div>
  )
}
