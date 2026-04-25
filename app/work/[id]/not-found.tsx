'use client'

import Link from 'next/link'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n/context'
import { FileX } from 'lucide-react'

export default function WorkNotFound() {
  const { locale, t } = useTranslation()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-24 flex flex-col items-center text-center">
        <FileX className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h1 className="text-2xl font-bold">
          {locale === 'ru' ? 'Работа не найдена' : 'Work not found'}
        </h1>
        <p className="text-muted-foreground mt-2 max-w-sm">
          {locale === 'ru'
            ? 'Эта работа не существует или была удалена автором.'
            : 'This work does not exist or has been deleted by its author.'}
        </p>
        <Button asChild className="mt-6">
          <Link href="/">{t.nav.home}</Link>
        </Button>
      </main>
    </div>
  )
}
