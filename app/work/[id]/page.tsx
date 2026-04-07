'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/header'
import { AnimationPlayer } from '@/components/animation-player'
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
  Send,
  Medal,
  Coins,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ru, enUS } from 'date-fns/locale'
import type { Work, Comment, Medal as MedalType } from '@/lib/types'
import { getRankInfo, GOLD_COSTS } from '@/lib/types'

export default function WorkPage() {
  const params = useParams()
  const router = useRouter()
  const { t, locale } = useTranslation()
  const { user, profile: currentUserProfile } = useAuth()
  const dateLocale = locale === 'ru' ? ru : enUS

  const [work, setWork] = useState<Work | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [medals, setMedals] = useState<MedalType[]>([])
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [favorited, setFavorited] = useState(false)
  const [userMedal, setUserMedal] = useState<MedalType | null>(null)
  const [likesCount, setLikesCount] = useState(0)
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)

  const workId = params.id as string

  useEffect(() => {
    const fetchWork = async () => {
      const supabase = createClient()

      const { data: workData } = await supabase
        .from('works')
        .select('*, profile:profiles!works_user_id_fkey(*)')
        .eq('id', workId)
        .single()

      if (workData) {
        setWork(workData as Work)
        setLikesCount(workData.likes_count)
        await supabase.rpc('increment_views', { work_id: workId })
      }

      const [commentsRes, medalsRes] = await Promise.all([
        supabase
          .from('comments')
          .select('*, profile:profiles!comments_user_id_fkey(*)')
          .eq('work_id', workId)
          .order('created_at', { ascending: true }),
        supabase
          .from('medals')
          .select('*, giver:profiles!medals_giver_id_fkey(*)')
          .eq('work_id', workId),
      ])

      setComments(commentsRes.data as Comment[] || [])
      setMedals(medalsRes.data as MedalType[] || [])

      if (user) {
        const [likeRes, favRes, medalRes] = await Promise.all([
          supabase.from('likes').select('id').eq('work_id', workId).eq('user_id', user.id).single(),
          supabase.from('favorites').select('id').eq('work_id', workId).eq('user_id', user.id).single(),
          supabase.from('medals').select('*').eq('work_id', workId).eq('giver_id', user.id).single(),
        ])
        setLiked(!!likeRes.data)
        setFavorited(!!favRes.data)
        setUserMedal(medalRes.data as MedalType || null)
      }

      setLoading(false)
    }

    fetchWork()
  }, [workId, user])

  const handleLike = async () => {
    if (!user) { router.push('/auth/login'); return }
    const supabase = createClient()
    if (liked) {
      await supabase.from('likes').delete().eq('work_id', workId).eq('user_id', user.id)
      setLiked(false)
      setLikesCount(prev => prev - 1)
    } else {
      await supabase.from('likes').insert({ work_id: workId, user_id: user.id })
      setLiked(true)
      setLikesCount(prev => prev + 1)
    }
  }

  const handleFavorite = async () => {
    if (!user) { router.push('/auth/login'); return }
    const supabase = createClient()
    if (favorited) {
      await supabase.from('favorites').delete().eq('work_id', workId).eq('user_id', user.id)
      setFavorited(false)
      toast.success(locale === 'ru' ? 'Удалено из избранного' : 'Removed from favorites')
    } else {
      await supabase.from('favorites').insert({ work_id: workId, user_id: user.id })
      setFavorited(true)
      toast.success(locale === 'ru' ? 'Добавлено в избранное' : 'Added to favorites')
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: work?.title, url: window.location.href })
    } else {
      await navigator.clipboard.writeText(window.location.href)
      toast.success(locale === 'ru' ? 'Ссылка скопирована' : 'Link copied')
    }
  }

  const handleGiveMedal = async (medalType: 'bronze' | 'silver' | 'gold') => {
    if (!user || !currentUserProfile) { router.push('/auth/login'); return }

    const cost = GOLD_COSTS[`GIVE_MEDAL_${medalType.toUpperCase()}` as keyof typeof GOLD_COSTS]

    // Check if premium user (1 free medal per day) or has enough gold
    const hasFreeDaily = currentUserProfile.is_premium // simplified check
    if (!hasFreeDaily && currentUserProfile.gold < cost) {
      toast.error(locale === 'ru' ? `Недостаточно золота. Нужно ${cost}✦` : `Not enough gold. Need ${cost}✦`)
      return
    }

    const supabase = createClient()

    if (userMedal) {
      // Remove existing medal first
      await supabase.from('medals').delete().eq('id', userMedal.id)
    }

    const { data, error } = await supabase
      .from('medals')
      .insert({ giver_id: user.id, work_id: workId, medal_type: medalType })
      .select('*, giver:profiles!medals_giver_id_fkey(*)')
      .single()

    if (error) {
      toast.error(locale === 'ru' ? 'Ошибка' : 'Error')
      return
    }

    if (!hasFreeDaily) {
      await supabase.from('gold_transactions').insert({
        user_id: user.id,
        amount: -cost,
        type: 'medal_give',
        description: `Медаль ${medalType} для работы`,
        work_id: workId,
      })
    }

    setUserMedal(data as MedalType)
    if (userMedal) {
      setMedals(prev => prev.filter(m => m.id !== userMedal.id).concat(data as MedalType))
    } else {
      setMedals(prev => [...prev, data as MedalType])
    }

    const medalEmoji = { bronze: '🥉', silver: '🥈', gold: '🥇' }[medalType]
    toast.success(`${medalEmoji} ${locale === 'ru' ? 'Медаль выдана!' : 'Medal given!'}`)
  }

  const handleRemoveMedal = async () => {
    if (!userMedal) return
    const supabase = createClient()
    await supabase.from('medals').delete().eq('id', userMedal.id)
    setMedals(prev => prev.filter(m => m.id !== userMedal.id))
    setUserMedal(null)
    toast.success(locale === 'ru' ? 'Медаль убрана' : 'Medal removed')
  }

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return
    setSubmittingComment(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('comments')
      .insert({ work_id: workId, user_id: user.id, content: newComment.trim() })
      .select('*, profile:profiles!comments_user_id_fkey(*)')
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
            <div className="mt-4 space-y-2">
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
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
          <Button asChild className="mt-4"><Link href="/">{t.nav.home}</Link></Button>
        </main>
      </div>
    )
  }

  const typeLabel = { animation: t.works.animation, drawing: t.works.drawing, comic: t.works.comic }

  // Medal counts
  const medalCounts = {
    gold: medals.filter(m => m.medal_type === 'gold').length,
    silver: medals.filter(m => m.medal_type === 'silver').length,
    bronze: medals.filter(m => m.medal_type === 'bronze').length,
  }

  const framesData = work.frames_data as { frames: unknown[]; fps: number; width: number; height: number } | null

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">

          {/* Work display — real canvas player */}
          <AnimationPlayer
            framesData={framesData as Parameters<typeof AnimationPlayer>[0]['framesData']}
            thumbnailUrl={work.thumbnail_url}
            title={work.title}
            isAnimation={work.type === 'animation'}
          />

          {/* Work info */}
          <div className="mt-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl font-bold">{work.title}</h1>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge variant="secondary">{typeLabel[work.type]}</Badge>
                  <Badge variant="outline">{work.category === 'oldschool' ? t.works.oldschool : t.works.sandbox}</Badge>
                  {work.is_featured && (
                    <Badge className="bg-yellow-500 text-black">★ {locale === 'ru' ? 'Козырное место' : 'Featured'}</Badge>
                  )}
                  {/* Medal display */}
                  {(medalCounts.gold > 0 || medalCounts.silver > 0 || medalCounts.bronze > 0) && (
                    <div className="flex items-center gap-1">
                      {medalCounts.gold > 0 && <span className="text-sm">🥇×{medalCounts.gold}</span>}
                      {medalCounts.silver > 0 && <span className="text-sm">🥈×{medalCounts.silver}</span>}
                      {medalCounts.bronze > 0 && <span className="text-sm">🥉×{medalCounts.bronze}</span>}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant={liked ? 'default' : 'outline'}
                  size="sm"
                  onClick={handleLike}
                  className="gap-1"
                >
                  <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                  {likesCount}
                </Button>
                <Button variant={favorited ? 'default' : 'outline'} size="icon" onClick={handleFavorite}>
                  <Bookmark className={`h-4 w-4 ${favorited ? 'fill-current' : ''}`} />
                </Button>
                <Button variant="outline" size="icon" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {work.description && <p className="mt-4 text-muted-foreground">{work.description}</p>}

            {/* Give medal section */}
            {user && work.user_id !== user.id && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Medal className="h-4 w-4" />
                  {locale === 'ru' ? 'Дать медаль' : 'Give a medal'}
                  {currentUserProfile?.is_premium && (
                    <Badge variant="outline" className="text-xs">{locale === 'ru' ? '1 бесплатная/день' : '1 free/day'}</Badge>
                  )}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {(['bronze', 'silver', 'gold'] as const).map(type => {
                    const emoji = { bronze: '🥉', silver: '🥈', gold: '🥇' }[type]
                    const cost = GOLD_COSTS[`GIVE_MEDAL_${type.toUpperCase()}` as keyof typeof GOLD_COSTS]
                    const isActive = userMedal?.medal_type === type
                    return (
                      <Button
                        key={type}
                        size="sm"
                        variant={isActive ? 'default' : 'outline'}
                        onClick={() => isActive ? handleRemoveMedal() : handleGiveMedal(type)}
                        className="gap-1"
                      >
                        {emoji}
                        {isActive
                          ? (locale === 'ru' ? 'Убрать' : 'Remove')
                          : <span className="flex items-center gap-1">{type}<Coins className="h-3 w-3 text-yellow-500" />{cost}</span>
                        }
                      </Button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Author */}
            {work.profile && (
              <div className="flex items-center gap-3 mt-6 p-4 bg-muted/50 rounded-lg">
                <Link href={`/profile/${work.profile.username}`}>
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={work.profile.avatar_url || undefined} />
                    <AvatarFallback>{work.profile.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Link>
                <div>
                  <Link href={`/profile/${work.profile.username}`} className="font-medium hover:underline">
                    {work.profile.display_name || work.profile.username}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {getRankInfo(work.profile.rank, locale).name}
                    {' · '}
                    {work.profile.user_type === 'animator' ? t.auth.animator : t.auth.archaeologist}
                  </p>
                </div>
                <div className="ml-auto text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(work.created_at), { addSuffix: true, locale: dateLocale })}
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

            {user ? (
              <div className="flex gap-3 mb-6">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={currentUserProfile?.avatar_url || undefined} />
                  <AvatarFallback>{currentUserProfile?.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    value={newComment}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewComment(e.target.value)}
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
                <Button asChild size="sm"><Link href="/auth/login">{t.nav.login}</Link></Button>
              </div>
            )}

            {comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>{t.comments.noComments}</p>
                <p className="text-sm">{t.comments.beFirst}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map(comment => (
                  <div key={comment.id} className="flex gap-3">
                    <Link href={`/profile/${comment.profile?.username}`}>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={comment.profile?.avatar_url || undefined} />
                        <AvatarFallback>{comment.profile?.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Link href={`/profile/${comment.profile?.username}`} className="font-medium hover:underline text-sm">
                          {comment.profile?.display_name || comment.profile?.username}
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: dateLocale })}
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
