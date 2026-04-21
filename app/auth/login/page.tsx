'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/i18n/context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel, FieldError } from '@/components/ui/field'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import {
  getRateLimitStatus,
  recordFailedAttempt,
  resetRateLimit,
  formatLockoutTime,
} from '@/lib/utils/rate-limit'

export default function LoginPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [lockoutRemaining, setLockoutRemaining] = useState(0)

  const rateLimitKey = email ? `login_${email.toLowerCase()}` : 'login'

  useEffect(() => {
    if (!lockoutRemaining) return
    const id = setInterval(() => {
      setLockoutRemaining((prev) => {
        const next = prev - 1000
        if (next <= 0) { clearInterval(id); return 0 }
        return next
      })
    }, 1000)
    return () => clearInterval(id)
  }, [lockoutRemaining])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const status = getRateLimitStatus(rateLimitKey)
    if (status.locked) {
      setLockoutRemaining(status.remainingMs)
      setError(`Слишком много попыток. Повторите через ${formatLockoutTime(status.remainingMs)}.`)
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      const result = recordFailedAttempt(rateLimitKey)
      if (result.locked) {
        setLockoutRemaining(result.remainingMs)
        setError(`Слишком много попыток. Повторите через ${formatLockoutTime(result.remainingMs)}.`)
      } else {
        setError(t.auth.loginError)
      }
      setLoading(false)
      return
    }

    resetRateLimit(rateLimitKey)
    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{t.auth.login}</CardTitle>
          <CardDescription>Multator 2</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <FieldGroup>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Field>
                <FieldLabel htmlFor="email">{t.auth.email}</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">{t.auth.password}</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading || lockoutRemaining > 0}>
              {loading ? <Spinner className="mr-2" /> : null}
              {lockoutRemaining > 0
                ? `Подождите ${formatLockoutTime(lockoutRemaining)}`
                : t.auth.loginButton}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              {t.auth.noAccount}{' '}
              <Link href="/auth/signup" className="text-primary hover:underline">
                {t.auth.signupButton}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
