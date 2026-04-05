'use client'

import Link from 'next/link'
import { useTranslation } from '@/lib/i18n/context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

export default function AuthErrorPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-16 h-16 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">{t.common.error}</CardTitle>
          <CardDescription>
            {t.locale === 'ru'
              ? 'Произошла ошибка при аутентификации'
              : 'An authentication error occurred'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {t.locale === 'ru'
              ? 'Пожалуйста, попробуйте войти снова или обратитесь в поддержку.'
              : 'Please try logging in again or contact support.'}
          </p>
        </CardContent>
        <CardFooter className="justify-center gap-4">
          <Button asChild variant="outline">
            <Link href="/auth/login">{t.auth.loginButton}</Link>
          </Button>
          <Button asChild>
            <Link href="/">{t.nav.home}</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
