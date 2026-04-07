'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth/context'
import { useI18n } from '@/lib/i18n/context'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import {
  Palette,
  Menu,
  User,
  Settings,
  LogOut,
  Bell,
  Plus,
  Sun,
  Moon,
  Globe,
  Trophy,
  Shield,
  ShieldCheck,
  Coins,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useState } from 'react'
import { getRankInfo } from '@/lib/types'

export function Header() {
  const pathname = usePathname()
  const { user, profile, signOut } = useAuth()
  const { t, locale, setLocale } = useI18n()
  const { theme, setTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: t.nav.home, href: '/' },
    { name: t.nav.oldschool, href: '/oldschool' },
    { name: t.nav.sandbox, href: '/sandbox' },
    { name: t.nav.hallOfFame, href: '/hall-of-fame' },
    { name: locale === 'ru' ? 'Темы' : 'Themes', href: '/themes' },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const isModOrAdmin = profile && ['admin', 'moderator'].includes(profile.role)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Palette className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg hidden sm:inline">Multator 2</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive(item.href)
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Create button */}
          {user && (
            <Button asChild size="sm" className="hidden sm:flex">
              <Link href="/editor">
                <Plus className="h-4 w-4 mr-1" />
                {t.common.create}
              </Link>
            </Button>
          )}

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Language toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocale(locale === 'ru' ? 'en' : 'ru')}
          >
            <Globe className="h-4 w-4" />
            <span className="sr-only">Toggle language</span>
          </Button>

          {user && profile ? (
            <>
              {/* Gold balance */}
              <Link
                href="/settings"
                className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium text-yellow-600 hover:bg-yellow-500/10 transition-colors"
              >
                <Coins className="h-3.5 w-3.5" />
                {profile.gold}
              </Link>

              {/* Notifications */}
              <Button variant="ghost" size="icon" asChild>
                <Link href="/notifications">
                  <Bell className="h-4 w-4" />
                  <span className="sr-only">{t.notifications.title}</span>
                </Link>
              </Button>

              {/* Moderation link for mods/admins */}
              {isModOrAdmin && (
                <Button variant="ghost" size="icon" asChild title={locale === 'ru' ? 'Модерация' : 'Moderation'}>
                  <Link href="/moderation">
                    <ShieldCheck className="h-4 w-4 text-blue-500" />
                  </Link>
                </Button>
              )}

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile.avatar_url || undefined} alt={profile.username} />
                      <AvatarFallback>
                        {profile.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 flex-1">
                      <p className="text-sm font-medium leading-none">{profile.display_name || profile.username}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {getRankInfo(profile.rank, locale).name}
                        </p>
                        <p className="text-xs text-yellow-600 flex items-center gap-1">
                          <Coins className="h-3 w-3" />
                          {profile.gold}
                        </p>
                      </div>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/profile/${profile.username}`}>
                      <User className="mr-2 h-4 w-4" />
                      {t.nav.profile}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      {t.nav.settings}
                    </Link>
                  </DropdownMenuItem>
                  {profile.role === 'moderator' && (
                    <DropdownMenuItem asChild>
                      <Link href="/moderation">
                        <ShieldCheck className="mr-2 h-4 w-4 text-blue-500" />
                        {locale === 'ru' ? 'Модерация' : 'Moderation'}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {profile.role === 'admin' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/moderation">
                          <ShieldCheck className="mr-2 h-4 w-4 text-blue-500" />
                          {locale === 'ru' ? 'Модерация' : 'Moderation'}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin">
                          <Shield className="mr-2 h-4 w-4 text-red-500" />
                          {locale === 'ru' ? 'Администрирование' : 'Admin panel'}
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t.nav.logout}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">{t.nav.login}</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/signup">{t.nav.signup}</Link>
              </Button>
            </div>
          )}

          {/* Mobile menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <nav className="flex flex-col gap-2 mt-8">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'px-3 py-2 text-sm font-medium rounded-md transition-colors',
                      isActive(item.href)
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
                {user && profile && (
                  <>
                    <div className="px-3 py-2 text-sm text-yellow-600 flex items-center gap-2">
                      <Coins className="h-4 w-4" />
                      {profile.gold} {locale === 'ru' ? 'золота' : 'gold'}
                    </div>
                    <Link
                      href="/editor"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground"
                    >
                      <Plus className="h-4 w-4 inline mr-2" />
                      {t.common.create}
                    </Link>
                    {isModOrAdmin && (
                      <Link
                        href="/moderation"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-3 py-2 text-sm font-medium rounded-md text-blue-600 hover:bg-blue-500/10"
                      >
                        <ShieldCheck className="h-4 w-4 inline mr-2" />
                        {locale === 'ru' ? 'Модерация' : 'Moderation'}
                      </Link>
                    )}
                    {profile.role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-3 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-500/10"
                      >
                        <Shield className="h-4 w-4 inline mr-2" />
                        {locale === 'ru' ? 'Администрирование' : 'Admin'}
                      </Link>
                    )}
                  </>
                )}
                {!user && (
                  <>
                    <Link
                      href="/auth/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
                    >
                      {t.nav.login}
                    </Link>
                    <Link
                      href="/auth/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground"
                    >
                      {t.nav.signup}
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
