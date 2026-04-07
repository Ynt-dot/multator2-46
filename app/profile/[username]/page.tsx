'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Header } from '@/components/header'
import { WorkGrid } from '@/components/work-grid'
import { useTranslation } from '@/lib/i18n/context'
import { useAuth } from '@/lib/auth/context'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { UserPlus, UserMinus, Settings, Calendar, Heart, Image as ImageIcon, Trophy } from 'lucide-react'
import { format } from 'date-fns'
import { ru, enUS } from 'date-fns/locale'
import type { Profile, Work, UserAchievement } from '@/lib/types'
import { getRankInfo } from '@/lib/types'
import Link from 'next/link'

export default function ProfilePage() {
  const params = useParams()
  const username = params.username as string
  const { t, locale } = useTranslation()
  const { user, profile: currentUserProfile } = useAuth()
  const dateLocale = locale === 'ru' ? ru : enUS

  const [profile, setProfile] = useState<Profile | null>(null)
  const [works, setWorks] = useState<Work[]>([])
  const [favorites, setFavorites] = useState<Work[]>([])
  const [achievements, setAchievements] = useState<UserAchievement[]>([])
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)

  const isOwnProfile = user && profile && user.id === profile.id

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient()

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (!profileData) {
        setLoading(false)
        return
      }

      setProfile(profileData as Profile)

      // Fetch works
      const { data: worksData } = await supabase
        .from('works')
        .select(`
          *,
          profile:profiles!works_user_id_fkey(*)
        `)
        .eq('user_id', profileData.id)
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      setWorks(worksData as Work[] || [])

      // Fetch favorites
      const { data: favoritesData } = await supabase
        .from('favorites')
        .select(`
          work:works(
            *,
            profile:profiles!works_user_id_fkey(*)
          )
        `)
        .eq('user_id', profileData.id)
        .order('created_at', { ascending: false })

      const favoriteWorks = favoritesData?.map(f => f.work).filter(Boolean) as Work[] || []
      setFavorites(favoriteWorks)

      // Fetch achievements
      const { data: achievementsData } = await supabase
        .from('user_achievements')
        .select('*, achievement:achievement_definitions(*)')
        .eq('user_id', profileData.id)
        .order('earned_at', { ascending: false })
      setAchievements(achievementsData as UserAchievement[] || [])

      // Fetch follower counts
      const { count: followers } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', profileData.id)

      const { count: following } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', profileData.id)

      setFollowersCount(followers || 0)
      setFollowingCount(following || 0)

      // Check if current user is following
      if (user) {
        const { data: followData } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', profileData.id)
          .single()

        setIsFollowing(!!followData)
      }

      setLoading(false)
    }

    fetchProfile()
  }, [username, user])

  const handleFollow = async () => {
    if (!user || !profile) return

    const supabase = createClient()

    if (isFollowing) {
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', profile.id)
      setIsFollowing(false)
      setFollowersCount(prev => prev - 1)
      toast.success(locale === 'ru' ? 'Вы отписались' : 'Unfollowed')
    } else {
      await supabase
        .from('follows')
        .insert({ follower_id: user.id, following_id: profile.id })
      setIsFollowing(true)
      setFollowersCount(prev => prev + 1)
      toast.success(locale === 'ru' ? 'Вы подписались' : 'Followed')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start gap-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32 mt-2" />
                <Skeleton className="h-4 w-full mt-4" />
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold">
            {locale === 'ru' ? 'Пользователь не найден' : 'User not found'}
          </h1>
          <Button asChild className="mt-4">
            <Link href="/">{t.nav.home}</Link>
          </Button>
        </main>
      </div>
    )
  }

  const rankInfo = getRankInfo(profile.rank, locale)
  const roleLabel = profile.user_type === 'animator' ? t.auth.animator : t.auth.archaeologist

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
            <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-2xl">
                {profile.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <h1 className="text-2xl font-bold">
                  {profile.display_name || profile.username}
                </h1>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{roleLabel}</Badge>
                  <Badge variant="outline">{rankInfo.name}</Badge>
                  {profile.is_verified && (
                    <Badge className="bg-primary">{locale === 'ru' ? 'Верифицирован' : 'Verified'}</Badge>
                  )}
                </div>
              </div>

              <p className="text-muted-foreground mt-1">@{profile.username}</p>

              {profile.bio && (
                <p className="mt-3">{profile.bio}</p>
              )}

              <div className="flex items-center justify-center sm:justify-start gap-6 mt-4 text-sm">
                <div className="text-center">
                  <p className="font-bold">{profile.total_works}</p>
                  <p className="text-muted-foreground">{t.profile.works}</p>
                </div>
                <div className="text-center">
                  <p className="font-bold">{followersCount}</p>
                  <p className="text-muted-foreground">{t.profile.followers}</p>
                </div>
                <div className="text-center">
                  <p className="font-bold">{followingCount}</p>
                  <p className="text-muted-foreground">{t.profile.following}</p>
                </div>
                <div className="text-center">
                  <p className="font-bold">{profile.total_likes}</p>
                  <p className="text-muted-foreground">{t.profile.totalLikes}</p>
                </div>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-2 mt-4 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {t.profile.joined} {format(new Date(profile.created_at), 'MMMM yyyy', { locale: dateLocale })}
              </div>
            </div>

            <div className="flex gap-2">
              {isOwnProfile ? (
                <Button asChild variant="outline">
                  <Link href="/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    {t.profile.editProfile}
                  </Link>
                </Button>
              ) : user ? (
                <Button
                  variant={isFollowing ? 'outline' : 'default'}
                  onClick={handleFollow}
                >
                  {isFollowing ? (
                    <>
                      <UserMinus className="h-4 w-4 mr-2" />
                      {t.profile.unfollow}
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      {t.profile.follow}
                    </>
                  )}
                </Button>
              ) : null}
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="works">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="works" className="gap-2">
                <ImageIcon className="h-4 w-4" />
                {t.profile.works} ({works.length})
              </TabsTrigger>
              <TabsTrigger value="favorites" className="gap-2">
                <Heart className="h-4 w-4" />
                {t.profile.favorites} ({favorites.length})
              </TabsTrigger>
              <TabsTrigger value="achievements" className="gap-2">
                <Trophy className="h-4 w-4" />
                {t.profile.achievements} ({achievements.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="works" className="mt-6">
              <WorkGrid
                works={works}
                emptyMessage={locale === 'ru' ? 'Пока нет работ' : 'No works yet'}
              />
            </TabsContent>
            <TabsContent value="favorites" className="mt-6">
              <WorkGrid
                works={favorites}
                emptyMessage={locale === 'ru' ? 'Нет избранных работ' : 'No favorite works'}
              />
            </TabsContent>
            <TabsContent value="achievements" className="mt-6">
              {achievements.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>{t.achievements.noAchievements}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {achievements.map((ua: UserAchievement) => (
                    <Card key={ua.id}>
                      <CardContent className="flex items-center gap-3 p-4">
                        <span className="text-3xl">{ua.achievement?.icon ?? '🏅'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">
                            {locale === 'ru' ? ua.achievement?.name_ru : ua.achievement?.name_en}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {locale === 'ru' ? ua.achievement?.description_ru : ua.achievement?.description_en}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {t.achievements.earnedAt}: {format(new Date(ua.earned_at), 'd MMM yyyy', { locale: dateLocale })}
                          </p>
                        </div>
                        {(ua.achievement?.gold_reward ?? 0) > 0 && (
                          <span className="text-sm text-yellow-600 shrink-0">+{ua.achievement?.gold_reward}✦</span>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
