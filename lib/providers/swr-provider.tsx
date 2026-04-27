'use client'

import { SWRConfig } from 'swr'
import type { ReactNode } from 'react'
import { captureError } from '@/lib/logger'

export function SWRProvider({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        dedupingInterval: 30_000,
        errorRetryCount: 3,
        onError(error, key) {
          captureError(error, { swrKey: String(key) })
        },
      }}
    >
      {children}
    </SWRConfig>
  )
}
