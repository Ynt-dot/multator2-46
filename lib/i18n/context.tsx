'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { translations, type Locale, type TranslationKeys } from './translations'

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: TranslationKeys
}

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('ru')

  useEffect(() => {
    const saved = localStorage.getItem('multator-locale') as Locale | null
    if (saved && (saved === 'ru' || saved === 'en')) {
      setLocaleState(saved)
    } else {
      // Detect browser language
      const browserLang = navigator.language.toLowerCase()
      if (browserLang.startsWith('en')) {
        setLocaleState('en')
      }
    }
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('multator-locale', newLocale)
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t: translations[locale] }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return context
}

export function useTranslation() {
  const { t, locale } = useI18n()
  return { t, locale }
}
