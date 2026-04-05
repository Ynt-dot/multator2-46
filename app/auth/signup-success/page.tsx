'use client'

import Link from 'next/link'
import { useTranslation } from '@/lib/i18n/context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2 } from 'lucide-react'

export default function SignupSuccessPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold">{t.auth.signup}</CardTitle>
          <CardDescription>{t.auth.signupSuccess}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {t.locale === 'ru' 
              ? 'Мы отправили вам письмо с ссылкой для подтверждения. Пожалуйста, проверьте вашу почту.'
              : 'We sent you an email with a confirmation link. Please check your inbox.'}
          </p>
        </CardContent>
        <CardFooter className="justify-center">
          <Button asChild variant="outline">
            <Link href="/auth/login">{t.auth.loginButton}</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
