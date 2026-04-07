'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { useTranslation } from '@/lib/i18n/context'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Trophy, Medal, Award, Crown, Star } from 'lucide-react'
import type { Profile } from '@/lib/types'
import { getRankInfo } from '@/lib/types'

export default function HallOfFamePage() {
  const { t, locale } = useTranslation()
  const [animators, setAnimators] = useState<Profile[]>([])
  const [archaeologists, setArchaeologists] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTopUsers = async () => {
      const supabase = createClient()

      const { data: animatorsData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'animator')
        .order('total_likes', { ascending: false })
        .limit(10)

      const { data: archaeologistsData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'archaeologist')
        .order('total_likes', { ascending: false })
        .limit(10)

      setAnimators(animatorsData as Profile[] || [])
      setArchaeologists(archaeologistsData as Profile[] || [])
      setLoading(false)
    }

    fetchTopUsers()
  }, [])

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="h-6 w-6 text-yellow-500" />
      case 1:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 2:
        return <Award className="h-6 w-6 text-amber-600" />
      default:
        return <Star className="h-5 w-5 text-muted-foreground" />
    }
  }

  const UserCard = ({ user, index }: { user: Profile; index: number }) => {
    const rankInfo = getRankInfo(user.rank, locale)
    const isTop3 = index < 3

    return (
      <Link href={`/profile/${user.username}`}>
        <Card className={`hover:shadow-md transition-shadow ${isTop3 ? 'border-primary/50' : ''}`}>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex items-center justify-center w-8">
              {getRankIcon(index)}
            </div>
            <Avatar className={isTop3 ? 'h-14 w-14' : 'h-12 w-12'}>
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className={`font-medium truncate ${isTop3 ? 'text-lg' : ''}`}>
                {user.display_name || user.username}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {rankInfo.name}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-primary">{user.total_likes}</p>
              <p className="text-xs text-muted-foreground">{t.works.likes}</p>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  const UserListSkeleton = () => (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="flex items-center gap-4 p-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-20 mt-1" />
            </div>
            <div className="text-right">
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-3 w-8 mt-1" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Trophy className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">{t.hallOfFame.title}</h1>
            <p className="text-muted-foreground mt-2">
              {locale === 'ru'
                ? 'Лучшие авторы платформы по количеству полученных лайков'
                : 'Top creators on the platform by total likes received'}
            </p>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="animators">
            <TabsList className="w-full">
              <TabsTrigger value="animators" className="flex-1">
                {t.hallOfFame.topAnimators}
              </TabsTrigger>
              <TabsTrigger value="archaeologists" className="flex-1">
                {t.hallOfFame.topArchaeologists}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="animators" className="mt-6">
              {loading ? (
                <UserListSkeleton />
              ) : animators.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8 text-muted-foreground">
                    {locale === 'ru' ? 'Пока нет аниматоров' : 'No animators yet'}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {animators.map((user, index) => (
                    <UserCard key={user.id} user={user} index={index} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="archaeologists" className="mt-6">
              {loading ? (
                <UserListSkeleton />
              ) : archaeologists.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8 text-muted-foreground">
                    {locale === 'ru' ? 'Пока нет археологов' : 'No archaeologists yet'}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {archaeologists.map((user, index) => (
                    <UserCard key={user.id} user={user} index={index} />
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
