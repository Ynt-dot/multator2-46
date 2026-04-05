'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/header'
import { WorkGrid } from '@/components/work-grid'
import { useTranslation } from '@/lib/i18n/context'
import { createClient } from '@/lib/supabase/client'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TrendingUp, Clock, Film, Image, BookOpen } from 'lucide-react'
import type { Work, WorkType } from '@/lib/types'

export default function SandboxPage() {
  const { t, locale } = useTranslation()
  const [works, setWorks] = useState<Work[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'popular' | 'newest'>('newest')
  const [typeFilter, setTypeFilter] = useState<WorkType | 'all'>('all')

  useEffect(() => {
    const fetchWorks = async () => {
      setLoading(true)
      const supabase = createClient()
      
      let query = supabase
        .from('works')
        .select(`
          *,
          profile:profiles!works_user_id_fkey(*)
        `)
        .eq('is_published', true)
        .eq('category', 'sandbox')

      if (typeFilter !== 'all') {
        query = query.eq('type', typeFilter)
      }

      if (sortBy === 'popular') {
        query = query.order('likes_count', { ascending: false })
      } else {
        query = query.order('created_at', { ascending: false })
      }

      query = query.limit(40)

      const { data } = await query
      setWorks(data as Work[] || [])
      setLoading(false)
    }

    fetchWorks()
  }, [sortBy, typeFilter])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t.nav.sandbox}</h1>
          <p className="text-muted-foreground">
            {locale === 'ru'
              ? 'Место для экспериментов и новых идей. Пробуй, ошибайся, учись!'
              : 'A place for experiments and new ideas. Try, fail, learn!'}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as WorkType | 'all')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t.works.type} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <span className="flex items-center gap-2">
                  {t.works.filter.all}
                </span>
              </SelectItem>
              <SelectItem value="animation">
                <span className="flex items-center gap-2">
                  <Film className="h-4 w-4" />
                  {t.works.animation}
                </span>
              </SelectItem>
              <SelectItem value="drawing">
                <span className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  {t.works.drawing}
                </span>
              </SelectItem>
              <SelectItem value="comic">
                <span className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  {t.works.comic}
                </span>
              </SelectItem>
            </SelectContent>
          </Select>

          <Tabs value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
            <TabsList>
              <TabsTrigger value="newest" className="gap-1">
                <Clock className="h-4 w-4" />
                {t.works.filter.newest}
              </TabsTrigger>
              <TabsTrigger value="popular" className="gap-1">
                <TrendingUp className="h-4 w-4" />
                {t.works.filter.popular}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Works grid */}
        <WorkGrid works={works} loading={loading} />
      </main>
    </div>
  )
}
