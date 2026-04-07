'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/header'
import { useTranslation } from '@/lib/i18n/context'
import { useAuth } from '@/lib/auth/context'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { Shield, Users, Image as ImageIcon, Trophy, Search, Ban, Crown } from 'lucide-react'
import type { Profile, Work } from '@/lib/types'

interface StatsData {
  totalUsers: number
  totalWorks: number
  totalLikes: number
  newUsersToday: number
}

export default function AdminPage() {
  const router = useRouter()
  const { locale } = useTranslation()
  const { user, profile } = useAuth()

  const [stats, setStats] = useState<StatsData>({ totalUsers: 0, totalWorks: 0, totalLikes: 0, newUsersToday: 0 })
  const [users, setUsers] = useState<Profile[]>([])
  const [works, setWorks] = useState<Work[]>([])
  const [searchUser, setSearchUser] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return }
    if (profile && profile.role !== 'admin') { router.push('/'); return }
    fetchData()
  }, [user, profile])

  const fetchData = async () => {
    const supabase = createClient()
    setLoading(true)

    const [usersRes, worksRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('works').select('*, profile:profiles!works_user_id_fkey(*)').order('created_at', { ascending: false }).limit(50),
    ])

    const allUsers = usersRes.data as Profile[] || []
    const allWorks = worksRes.data as Work[] || []

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const newToday = allUsers.filter(u => new Date(u.created_at) >= today).length

    setUsers(allUsers)
    setWorks(allWorks)
    setStats({
      totalUsers: allUsers.length,
      totalWorks: allWorks.length,
      totalLikes: allUsers.reduce((sum, u) => sum + (u.total_likes || 0), 0),
      newUsersToday: newToday,
    })
    setLoading(false)
  }

  const setUserRole = async (userId: string, role: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({ role }).eq('id', userId)
    if (error) {
      toast.error('Ошибка')
    } else {
      toast.success('Роль обновлена')
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: role as Profile['role'] } : u))
    }
  }

  const setUserType = async (userId: string, userType: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({ user_type: userType }).eq('id', userId)
    if (error) {
      toast.error('Ошибка')
    } else {
      toast.success('Тип обновлён')
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, user_type: userType as Profile['user_type'] } : u))
    }
  }

  const grantGold = async (userId: string, amount: number) => {
    const supabase = createClient()
    const { error } = await supabase.from('gold_transactions').insert({
      user_id: userId,
      amount,
      type: 'admin_grant',
      description: `Золото выдано администратором`,
    })
    if (error) {
      toast.error('Ошибка')
    } else {
      toast.success(`+${amount} золота выдано`)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, gold: (u.gold || 0) + amount } : u))
    }
  }

  const deleteWork = async (workId: string) => {
    if (!confirm(locale === 'ru' ? 'Удалить работу?' : 'Delete work?')) return
    const supabase = createClient()
    const { error } = await supabase.from('works').delete().eq('id', workId)
    if (error) {
      toast.error('Ошибка удаления')
    } else {
      toast.success('Работа удалена')
      setWorks(prev => prev.filter(w => w.id !== workId))
    }
  }

  const toggleFeatured = async (workId: string, current: boolean) => {
    const supabase = createClient()
    await supabase.from('works').update({ is_featured: !current }).eq('id', workId)
    setWorks(prev => prev.map(w => w.id === workId ? { ...w, is_featured: !current } : w))
    toast.success(current ? 'Убрано с козырного места' : 'Поставлено на козырное место')
  }

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(searchUser.toLowerCase()) ||
    (u.display_name || '').toLowerCase().includes(searchUser.toLowerCase())
  )

  const roleBadge = (role: string) => {
    const map: Record<string, string> = {
      admin: 'bg-red-500',
      moderator: 'bg-blue-500',
      blocked: 'bg-gray-500',
      user: 'bg-green-500',
    }
    return map[role] || 'bg-green-500'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 flex justify-center">
          <Spinner className="h-8 w-8" />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">
              {locale === 'ru' ? 'Панель администратора' : 'Admin Panel'}
            </h1>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: locale === 'ru' ? 'Пользователи' : 'Users', value: stats.totalUsers, icon: Users },
              { label: locale === 'ru' ? 'Работы' : 'Works', value: stats.totalWorks, icon: ImageIcon },
              { label: locale === 'ru' ? 'Всего лайков' : 'Total likes', value: stats.totalLikes, icon: Trophy },
              { label: locale === 'ru' ? 'Новых сегодня' : 'New today', value: stats.newUsersToday, icon: Crown },
            ].map(({ label, value, icon: Icon }) => (
              <Card key={label}>
                <CardContent className="flex items-center gap-3 p-4">
                  <Icon className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="users">
            <TabsList>
              <TabsTrigger value="users">
                <Users className="h-4 w-4 mr-2" />
                {locale === 'ru' ? 'Пользователи' : 'Users'}
              </TabsTrigger>
              <TabsTrigger value="works">
                <ImageIcon className="h-4 w-4 mr-2" />
                {locale === 'ru' ? 'Работы' : 'Works'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="mt-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder={locale === 'ru' ? 'Поиск пользователей...' : 'Search users...'}
                  value={searchUser}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchUser(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                {filteredUsers.map(u => (
                  <Card key={u.id}>
                    <CardContent className="flex items-center gap-3 p-3">
                      <Link href={`/profile/${u.username}`}>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={u.avatar_url || undefined} />
                          <AvatarFallback>{u.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Link href={`/profile/${u.username}`} className="font-medium hover:underline truncate">
                            {u.username}
                          </Link>
                          <Badge className={`text-white text-xs ${roleBadge(u.role)}`}>{u.role}</Badge>
                          <Badge variant="outline" className="text-xs">{u.user_type}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          ❤️ {u.total_likes} · ✦ {u.gold} · {locale === 'ru' ? 'Ранг' : 'Rank'} {u.rank}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Role selector */}
                        <Select value={u.role} onValueChange={(v: string) => setUserRole(u.id, v)}>
                          <SelectTrigger className="h-8 w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">user</SelectItem>
                            <SelectItem value="moderator">moderator</SelectItem>
                            <SelectItem value="blocked">blocked</SelectItem>
                          </SelectContent>
                        </Select>
                        {/* User type */}
                        <Select value={u.user_type} onValueChange={(v: string) => setUserType(u.id, v)}>
                          <SelectTrigger className="h-8 w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="animator">animator</SelectItem>
                            <SelectItem value="archaeologist">archaeologist</SelectItem>
                          </SelectContent>
                        </Select>
                        {/* Give gold */}
                        <Button size="sm" variant="outline" onClick={() => grantGold(u.id, 100)}>
                          +100✦
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="works" className="mt-4 space-y-2">
              {works.map(w => (
                <Card key={w.id}>
                  <CardContent className="flex items-center gap-3 p-3">
                    <Link href={`/work/${w.id}`} className="font-medium hover:underline flex-1 min-w-0 truncate">
                      {w.title}
                    </Link>
                    <Badge variant="outline">{w.category}</Badge>
                    <Badge variant="secondary">{w.type}</Badge>
                    <span className="text-sm text-muted-foreground">❤️ {w.likes_count}</span>
                    {w.profile && (
                      <Link href={`/profile/${w.profile.username}`} className="text-sm text-muted-foreground hover:underline shrink-0">
                        @{w.profile.username}
                      </Link>
                    )}
                    <Button
                      size="sm"
                      variant={w.is_featured ? 'default' : 'outline'}
                      onClick={() => toggleFeatured(w.id, w.is_featured)}
                    >
                      {w.is_featured ? '★' : '☆'}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteWork(w.id)}>
                      <Ban className="h-3 w-3" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
