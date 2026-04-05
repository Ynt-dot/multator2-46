'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTranslation } from '@/lib/i18n/context'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Heart, MessageCircle, Eye, Play } from 'lucide-react'
import type { Work } from '@/lib/types'
import { getRankInfo } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { ru, enUS } from 'date-fns/locale'

interface WorkCardProps {
  work: Work
}

export function WorkCard({ work }: WorkCardProps) {
  const { t, locale } = useTranslation()
  const dateLocale = locale === 'ru' ? ru : enUS

  const typeLabel = {
    animation: t.works.animation,
    drawing: t.works.drawing,
    comic: t.works.comic,
  }

  const categoryLabel = {
    oldschool: t.works.oldschool,
    sandbox: t.works.sandbox,
  }

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
      <Link href={`/work/${work.id}`}>
        <div className="relative aspect-video bg-muted overflow-hidden">
          {work.thumbnail_url ? (
            <Image
              src={work.thumbnail_url}
              alt={work.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
              <Play className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
          {work.type === 'animation' && (
            <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full p-1.5">
              <Play className="h-4 w-4 text-primary" />
            </div>
          )}
          <div className="absolute bottom-2 left-2 flex gap-1">
            <Badge variant="secondary" className="text-xs">
              {typeLabel[work.type]}
            </Badge>
          </div>
        </div>
      </Link>
      <CardContent className="p-3">
        <Link href={`/work/${work.id}`}>
          <h3 className="font-medium text-sm line-clamp-1 hover:text-primary transition-colors">
            {work.title}
          </h3>
        </Link>
        <div className="flex items-center justify-between mt-2">
          {work.profile && (
            <Link
              href={`/profile/${work.profile.username}`}
              className="flex items-center gap-2 group/author"
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={work.profile.avatar_url || undefined} />
                <AvatarFallback className="text-xs">
                  {work.profile.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground group-hover/author:text-foreground transition-colors">
                {work.profile.display_name || work.profile.username}
              </span>
            </Link>
          )}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {work.likes_count}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              {work.comments_count}
            </span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {formatDistanceToNow(new Date(work.created_at), {
            addSuffix: true,
            locale: dateLocale,
          })}
        </p>
      </CardContent>
    </Card>
  )
}

export function WorkCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video bg-muted animate-pulse" />
      <CardContent className="p-3">
        <div className="h-4 bg-muted rounded animate-pulse" />
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-muted animate-pulse" />
            <div className="h-3 w-20 bg-muted rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-3 w-8 bg-muted rounded animate-pulse" />
            <div className="h-3 w-8 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
