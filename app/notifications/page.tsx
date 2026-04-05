'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/header'
import { useTranslation } from '@/lib/i18n/context'
import { useAuth } from '@/lib/auth/context'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Empty, EmptyIcon, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { Bell, Heart, MessageCircle, UserPlus, AtSign, Check } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ru, enUS } from 'date-fns/locale'
import type { Notification } from '@/lib/types'
import { cn } from '@/lib/utils'

export default function NotificationsPage() {
  const router = useRouter()
  const { t, locale } = useTranslation()
  const { user } = useAuth()
  const dateLocale = locale === 'ru' ? ru : enUS

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    const fetchNotifications = async () => {
      const supabase = createClient()
      
      const { data } = await supabase
        .from('notifications')
        .select(`
          *,
          actor:profiles!notifications_actor_id_fkey(*),
          work:works(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      setNotifications(data as Notification[] || [])
      setLoading(false)
    }

    fetchNotifications()
  }, [user, router])

  const markAllAsRead = async () => {
    if (!user) return

    const supabase = createClient()
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-blue-500" />
      case 'follow':
        return <UserPlus className="h-4 w-4 text-green-500" />
      case 'mention':
        return <AtSign className="h-4 w-4 text-purple-500" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getNotificationText = (notification: Notification) => {
    const actorName = notification.actor?.display_name || notification.actor?.username || 'Someone'
    
    switch (notification.type) {
      case 'like':
        return `${actorName} ${t.notifications.liked}`
      case 'comment':
        return `${actorName} ${t.notifications.commented}`
      case 'follow':
        return `${actorName} ${t.notifications.followed}`
      case 'mention':
        return `${actorName} ${t.notifications.mentioned}`
      default:
        return notification.message
    }
  }

  const getNotificationLink = (notification: Notification) => {
    if (notification.work_id) {
      return `/work/${notification.work_id}`
    }
    if (notification.actor?.username) {
      return `/profile/${notification.actor.username}`
    }
    return '#'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="flex items-center gap-3 p-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-24 mt-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    )
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{t.notifications.title}</h1>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <Check className="h-4 w-4 mr-2" />
              {t.notifications.markAllRead}
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <Empty>
            <EmptyIcon>
              <Bell className="h-10 w-10" />
            </EmptyIcon>
            <EmptyTitle>{t.notifications.noNotifications}</EmptyTitle>
            <EmptyDescription>
              {locale === 'ru'
                ? 'Здесь будут появляться уведомления о лайках, комментариях и подписках'
                : 'Notifications about likes, comments, and follows will appear here'}
            </EmptyDescription>
          </Empty>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <Link key={notification.id} href={getNotificationLink(notification)}>
                <Card
                  className={cn(
                    'hover:bg-accent/50 transition-colors',
                    !notification.is_read && 'bg-primary/5 border-primary/20'
                  )}
                >
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={notification.actor?.avatar_url || undefined} />
                        <AvatarFallback>
                          {notification.actor?.username?.slice(0, 2).toUpperCase() || '??'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{getNotificationText(notification)}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                          locale: dateLocale,
                        })}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
