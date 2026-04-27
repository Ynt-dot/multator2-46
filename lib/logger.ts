import * as Sentry from '@sentry/nextjs'

type Context = Record<string, unknown>

export function captureError(error: unknown, context?: Context): void {
  if (process.env.NODE_ENV !== 'production') {
    console.error('[error]', error, context)
    return
  }
  Sentry.withScope(scope => {
    if (context) scope.setExtras(context)
    Sentry.captureException(error)
  })
}

export function captureMessage(message: string, context?: Context): void {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[warn]', message, context)
    return
  }
  Sentry.withScope(scope => {
    if (context) scope.setExtras(context)
    Sentry.captureMessage(message, 'warning')
  })
}
