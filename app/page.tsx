'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/header'
import { WorkGrid } from '@/components/work-grid'
import { useTranslation } from '@/lib/i18n/context'
import { useAuth } from '@/lib/auth/context'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, TrendingUp, Clock, Users } from 'lucide-react'
import Link from 'next/link'
import type { Work } from '@/lib/types'

export default function HomePage() {
  const { t, locale } = useTranslation()
  const { user } = useAuth()
  const [works, setWorks] = useState<Work[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'popular' | 'newest' | 'following'>('popular')

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

      if (filter === 'popular') {
        query = query.order('likes_count', { ascending: false })
      } else if (filter === 'newest') {
        query = query.order('created_at', { ascending: false })
      } else if (filter === 'following' && user) {
        const { data: follows } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id)
        
        const followingIds = follows?.map(f => f.following_id) || []
        if (followingIds.length > 0) {
          query = query.in('user_id', followingIds)
        }
        query = query.order('created_at', { ascending: false })
      }

      query = query.limit(20)

      const { data } = await query

      setWorks(data as Work[] || [])
      setLoading(false)
    }

    fetchWorks()
  }, [filter, user])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero section */}
        <section className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
            {locale === 'ru' ? 'Создавай. Анимируй. Делись.' : 'Create. Animate. Share.'}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6 text-pretty">
            {locale === 'ru'
              ? 'Платформа для создания анимаций и рисунков. Присоединяйся к сообществу творцов!'
              : 'A platform for creating animations and drawings. Join the community of creators!'}
          </p>
          {!user && (
            <div className="flex items-center justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/auth/signup">{t.nav.signup}</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/auth/login">{t.nav.login}</Link>
              </Button>
            </div>
          )}
        </section>

        {/* Quick links */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <Card className="hover:shadow-md transition-shadow">
            <Link href="/oldschool">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="h-5 w-5 text-primary" />
                  {t.nav.oldschool}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {locale === 'ru'
                    ? 'Классические работы и ретро-стиль'
                    : 'Classic works and retro style'}
                </CardDescription>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <Link href="/sandbox">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  {t.nav.sandbox}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {locale === 'ru'
                    ? 'Экспериментируй и пробуй новое'
                    : 'Experiment and try new things'}
                </CardDescription>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <Link href="/hall-of-fame">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-chart-4" />
                  {t.nav.hallOfFame}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {locale === 'ru'
                    ? 'Лучшие авторы и их работы'
                    : 'Top creators and their works'}
                </CardDescription>
              </CardContent>
            </Link>
          </Card>
        </section>

        {/* Works feed */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{t.works.filter.all}</h2>
            <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <TabsList>
                <TabsTrigger value="popular" className="gap-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="hidden sm:inline">{t.works.filter.popular}</span>
                </TabsTrigger>
                <TabsTrigger value="newest" className="gap-1">
                  <Clock className="h-4 w-4" />
                  <span className="hidden sm:inline">{t.works.filter.newest}</span>
                </TabsTrigger>
                {user && (
                  <TabsTrigger value="following" className="gap-1">
                    <Users className="h-4 w-4" />
                    <span className="hidden sm:inline">{t.works.filter.following}</span>
                  </TabsTrigger>
                )}
              </TabsList>
            </Tabs>
          </div>

          <WorkGrid works={works} loading={loading} />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Multator 2 - {locale === 'ru' ? 'Платформа для творчества' : 'A platform for creativity'}</p>
        </div>
      </footer>
    </div>
  )
}
