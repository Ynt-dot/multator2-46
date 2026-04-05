'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/header'
import { useTranslation } from '@/lib/i18n/context'
import { useAuth } from '@/lib/auth/context'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Send,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ru, enUS } from 'date-fns/locale'
import type { Work, Comment, Profile } from '@/lib/types'
import { getRankInfo } from '@/lib/types'

export default function WorkPage() {
  const params = useParams()
  const router = useRouter()
  const { t, locale } = useTranslation()
  const { user, profile: currentUserProfile } = useAuth()
  const dateLocale = locale === 'ru' ? ru : enUS

  const [work, setWork] = useState<Work | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [favorited, setFavorited] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [currentFrame, setCurrentFrame] = useState(0)

  const workId = params.id as string

  useEffect(() => {
    const fetchWork = async () => {
      const supabase = createClient()
      
      const { data: workData } = await supabase
        .from('works')
        .select(`
          *,
          profile:profiles!works_user_id_fkey(*)
        `)
        .eq('id', workId)
        .single()

      if (workData) {
        setWork(workData as Work)
        setLikesCount(workData.likes_count)

        // Increment views
        await supabase.rpc('increment_views', { work_id: workId })
      }

      // Fetch comments
      const { data: commentsData } = await supabase
        .from('comments')
        .select(`
          *,
          profile:profiles!comments_user_id_fkey(*)
        `)
        .eq('work_id', workId)
        .order('created_at', { ascending: true })

      setComments(commentsData as Comment[] || [])

      // Check if user liked/favorited
      if (user) {
        const { data: likeData } = await supabase
          .from('likes')
          .select('id')
          .eq('work_id', workId)
          .eq('user_id', user.id)
          .single()
        setLiked(!!likeData)

        const { data: favData } = await supabase
          .from('favorites')
          .select('id')
          .eq('work_id', workId)
          .eq('user_id', user.id)
          .single()
        setFavorited(!!favData)
      }

      setLoading(false)
    }

    fetchWork()
  }, [workId, user])

  const handleLike = async () => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    const supabase = createClient()

    if (liked) {
      await supabase
        .from('likes')
        .delete()
        .eq('work_id', workId)
        .eq('user_id', user.id)
      setLiked(false)
      setLikesCount(prev => prev - 1)
    } else {
      await supabase
        .from('likes')
        .insert({ work_id: workId, user_id: user.id })
      setLiked(true)
      setLikesCount(prev => prev + 1)
    }
  }

  const handleFavorite = async () => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    const supabase = createClient()

    if (favorited) {
      await supabase
        .from('favorites')
        .delete()
        .eq('work_id', workId)
        .eq('user_id', user.id)
      setFavorited(false)
      toast.success(locale === 'ru' ? 'Удалено из избранного' : 'Removed from favorites')
    } else {
      await supabase
        .from('favorites')
        .insert({ work_id: workId, user_id: user.id })
      setFavorited(true)
      toast.success(locale === 'ru' ? 'Добавлено в избранное' : 'Added to favorites')
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: work?.title,
        url: window.location.href,
      })
    } else {
      await navigator.clipboard.writeText(window.location.href)
      toast.success(locale === 'ru' ? 'Ссылка скопирована' : 'Link copied')
    }
  }

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return

    setSubmittingComment(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from('comments')
      .insert({
        work_id: workId,
        user_id: user.id,
        content: newComment.trim(),
      })
      .select(`
        *,
        profile:profiles!comments_user_id_fkey(*)
      `)
      .single()

    if (!error && data) {
      setComments(prev => [...prev, data as Comment])
      setNewComment('')
    }

    setSubmittingComment(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="aspect-video w-full rounded-lg" />
            <div className="mt-4">
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-1/4 mt-2" />
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!work) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold">{locale === 'ru' ? 'Работа не найдена' : 'Work not found'}</h1>
          <Button asChild className="mt-4">
            <Link href="/">{t.nav.home}</Link>
          </Button>
        </main>
      </div>
    )
  }

  const typeLabel = {
    animation: t.works.animation,
    drawing: t.works.drawing,
    comic: t.works.comic,
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Work display */}
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            {work.thumbnail_url ? (
              <Image
                src={work.thumbnail_url}
                alt={work.title}
                fill
                className="object-contain"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Play className="h-16 w-16 text-muted-foreground/50" />
              </div>
            )}
            
            {/* Animation controls */}
            {work.type === 'animation' && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-full px-4 py-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPlaying(!playing)}
                >
                  {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground ml-2">
                  {currentFrame + 1} / {(work.frames_data as { frames?: unknown[] })?.frames?.length || 1}
                </span>
              </div>
            )}
          </div>

          {/* Work info */}
          <div className="mt-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">{work.title}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">{typeLabel[work.type]}</Badge>
                  <Badge variant="outline">{work.category === 'oldschool' ? t.works.oldschool : t.works.sandbox}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={liked ? 'default' : 'outline'}
                  size="sm"
                  onClick={handleLike}
                  className="gap-1"
                >
                  <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                  {likesCount}
                </Button>
                <Button
                  variant={favorited ? 'default' : 'outline'}
                  size="icon"
                  onClick={handleFavorite}
                >
                  <Bookmark className={`h-4 w-4 ${favorited ? 'fill-current' : ''}`} />
                </Button>
                <Button variant="outline" size="icon" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {work.description && (
              <p className="mt-4 text-muted-foreground">{work.description}</p>
            )}

            {/* Author */}
            {work.profile && (
              <div className="flex items-center gap-3 mt-6 p-4 bg-muted/50 rounded-lg">
                <Link href={`/profile/${work.profile.username}`}>
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={work.profile.avatar_url || undefined} />
                    <AvatarFallback>
                      {work.profile.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div>
                  <Link
                    href={`/profile/${work.profile.username}`}
                    className="font-medium hover:underline"
                  >
                    {work.profile.display_name || work.profile.username}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {getRankInfo(work.profile.rank, locale).name}
                  </p>
                </div>
                <div className="ml-auto text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(work.created_at), {
                    addSuffix: true,
                    locale: dateLocale,
                  })}
                </div>
              </div>
            )}
          </div>

          <Separator className="my-8" />

          {/* Comments */}
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              {t.comments.title} ({comments.length})
            </h2>

            {/* Comment form */}
            {user ? (
              <div className="flex gap-3 mb-6">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={currentUserProfile?.avatar_url || undefined} />
                  <AvatarFallback>
                    {currentUserProfile?.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={t.comments.placeholder}
                    className="min-h-[80px]"
                  />
                  <div className="flex justify-end mt-2">
                    <Button
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim() || submittingComment}
                      size="sm"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {t.comments.send}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-4 bg-muted/50 rounded-lg mb-6">
                <p className="text-muted-foreground mb-2">
                  {locale === 'ru' ? 'Войдите, чтобы оставить комментарий' : 'Log in to leave a comment'}
                </p>
                <Button asChild size="sm">
                  <Link href="/auth/login">{t.nav.login}</Link>
                </Button>
              </div>
            )}

            {/* Comments list */}
            {comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>{t.comments.noComments}</p>
                <p className="text-sm">{t.comments.beFirst}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Link href={`/profile/${comment.profile?.username}`}>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={comment.profile?.avatar_url || undefined} />
                        <AvatarFallback>
                          {comment.profile?.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/profile/${comment.profile?.username}`}
                          className="font-medium hover:underline text-sm"
                        >
                          {comment.profile?.display_name || comment.profile?.username}
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.created_at), {
                            addSuffix: true,
                            locale: dateLocale,
                          })}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
