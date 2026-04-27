'use client'

import { useState } from 'react'
import useSWRInfinite from 'swr/infinite'
import { Header } from '@/components/header'
import { WorkGrid } from '@/components/work-grid'
import { useTranslation } from '@/lib/i18n/context'
import { fetchCategoryPage, FEED_PAGE_SIZE } from '@/lib/fetchers'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TrendingUp, Clock, Film, Image, BookOpen } from 'lucide-react'
import type { Work, WorkCategory, WorkType } from '@/lib/types'

export default function OldschoolPage() {
  const { t, locale } = useTranslation()
  const [sortBy, setSortBy] = useState<'popular' | 'newest'>('popular')
  const [typeFilter, setTypeFilter] = useState<WorkType | 'all'>('all')

  const getKey = (page: number, prev: Work[] | null) => {
    if (prev !== null && prev.length < FEED_PAGE_SIZE) return null
    return ['category', 'oldschool' as WorkCategory, sortBy, typeFilter, page] as [string, WorkCategory, string, WorkType | 'all', number]
  }

  const { data, size, setSize, isLoading, isValidating } = useSWRInfinite(
    getKey,
    fetchCategoryPage,
    { revalidateFirstPage: false },
  )

  const works = data?.flat() ?? []
  const isLoadingInitial = isLoading && !data
  const loadingMore = isValidating && !!data && size > 1
  const hasMore = !!data && data[data.length - 1]?.length === FEED_PAGE_SIZE

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t.nav.oldschool}</h1>
          <p className="text-muted-foreground">
            {locale === 'ru'
              ? 'Классические работы в ретро-стиле. Здесь хранятся лучшие традиции анимации.'
              : 'Classic works in retro style. The best animation traditions are preserved here.'}
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
              <TabsTrigger value="popular" className="gap-1">
                <TrendingUp className="h-4 w-4" />
                {t.works.filter.popular}
              </TabsTrigger>
              <TabsTrigger value="newest" className="gap-1">
                <Clock className="h-4 w-4" />
                {t.works.filter.newest}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Works grid */}
        <WorkGrid works={works} loading={isLoadingInitial} />
        {hasMore && !isLoadingInitial && (
          <div className="flex justify-center mt-8">
            <Button variant="outline" onClick={() => setSize(size + 1)} disabled={loadingMore}>
              {loadingMore ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {locale === 'ru' ? 'Загрузка...' : 'Loading...'}
                </span>
              ) : (
                locale === 'ru' ? 'Загрузить ещё' : 'Load more'
              )}
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
