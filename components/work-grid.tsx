'use client'

import { WorkCard, WorkCardSkeleton } from '@/components/work-card'
import { Empty, EmptyIcon, EmptyTitle, EmptyDescription, EmptyAction } from '@/components/ui/empty'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n/context'
import { useAuth } from '@/lib/auth/context'
import { ImageOff, Plus } from 'lucide-react'
import Link from 'next/link'
import type { Work } from '@/lib/types'

interface WorkGridProps {
  works: Work[]
  loading?: boolean
  emptyMessage?: string
}

export function WorkGrid({ works, loading, emptyMessage }: WorkGridProps) {
  const { t } = useTranslation()
  const { user } = useAuth()

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <WorkCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (works.length === 0) {
    return (
      <Empty>
        <EmptyIcon>
          <ImageOff className="h-10 w-10" />
        </EmptyIcon>
        <EmptyTitle>{emptyMessage || t.works.noWorks}</EmptyTitle>
        <EmptyDescription>{t.works.createFirst}</EmptyDescription>
        {user && (
          <EmptyAction>
            <Button asChild>
              <Link href="/editor">
                <Plus className="h-4 w-4 mr-2" />
                {t.common.create}
              </Link>
            </Button>
          </EmptyAction>
        )}
      </Empty>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {works.map((work) => (
        <WorkCard key={work.id} work={work} />
      ))}
    </div>
  )
}
