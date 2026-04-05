// Database types for Multator 2

export type WorkType = 'animation' | 'drawing' | 'comic'
export type WorkCategory = 'oldschool' | 'sandbox'
export type UserRole = 'animator' | 'archaeologist'

export interface Profile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  role: UserRole
  rank: number
  total_likes: number
  total_works: number
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface Work {
  id: string
  user_id: string
  title: string
  description: string | null
  type: WorkType
  category: WorkCategory
  thumbnail_url: string | null
  content_url: string
  frames_data: Record<string, unknown> | null
  is_published: boolean
  likes_count: number
  comments_count: number
  views_count: number
  created_at: string
  updated_at: string
  // Joined data
  profile?: Profile
}

export interface Like {
  id: string
  user_id: string
  work_id: string
  created_at: string
}

export interface Comment {
  id: string
  user_id: string
  work_id: string
  content: string
  created_at: string
  updated_at: string
  // Joined data
  profile?: Profile
}

export interface Favorite {
  id: string
  user_id: string
  work_id: string
  created_at: string
}

export interface Follow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

export interface DailyTheme {
  id: string
  title: string
  description: string | null
  date: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: 'like' | 'comment' | 'follow' | 'mention'
  actor_id: string | null
  work_id: string | null
  message: string
  is_read: boolean
  created_at: string
  // Joined data
  actor?: Profile
  work?: Work
}

// Rank information
export const RANKS = [
  { level: 1, name: { ru: 'Неизвестный', en: 'Unknown' }, minLikes: 0 },
  { level: 2, name: { ru: 'Новичок', en: 'Newbie' }, minLikes: 10 },
  { level: 3, name: { ru: 'Ученик', en: 'Apprentice' }, minLikes: 50 },
  { level: 4, name: { ru: 'Подмастерье', en: 'Journeyman' }, minLikes: 150 },
  { level: 5, name: { ru: 'Мастер', en: 'Master' }, minLikes: 500 },
  { level: 6, name: { ru: 'Эксперт', en: 'Expert' }, minLikes: 1000 },
  { level: 7, name: { ru: 'Виртуоз', en: 'Virtuoso' }, minLikes: 2500 },
  { level: 8, name: { ru: 'Гуру', en: 'Guru' }, minLikes: 5000 },
  { level: 9, name: { ru: 'Мэтр', en: 'Maestro' }, minLikes: 10000 },
  { level: 10, name: { ru: 'Легенда', en: 'Legend' }, minLikes: 25000 },
] as const

export function getRankInfo(rank: number, locale: 'ru' | 'en' = 'ru') {
  const rankData = RANKS.find(r => r.level === rank) || RANKS[0]
  return {
    level: rankData.level,
    name: rankData.name[locale],
    minLikes: rankData.minLikes,
  }
}
