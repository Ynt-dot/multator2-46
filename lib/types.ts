// Database types for Multator 2

export type WorkType = 'animation' | 'drawing' | 'comic'
export type WorkCategory = 'oldschool' | 'sandbox'
export type UserType = 'animator' | 'archaeologist'  // creative role
export type UserRole = 'user' | 'moderator' | 'admin' | 'blocked'  // permission level

export interface Profile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  user_type: UserType   // creative role: animator or archaeologist
  role: UserRole        // permission: user, moderator, admin, blocked
  rank: number          // 1-10 based on total_likes
  gold: number
  is_premium: boolean
  premium_until: string | null
  total_likes: number
  total_works: number
  is_verified: boolean
  locale: 'ru' | 'en'
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
  is_featured: boolean
  likes_count: number
  comments_count: number
  views_count: number
  daily_theme_id: string | null
  sound_url: string | null
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

export interface Medal {
  id: string
  giver_id: string
  work_id: string
  medal_type: 'bronze' | 'silver' | 'gold'
  created_at: string
  // Joined data
  giver?: Profile
}

export interface Comment {
  id: string
  user_id: string
  work_id: string
  parent_id: string | null
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
  suggested_by: string | null
  gold_cost: number
  created_at: string
}

export interface AchievementDefinition {
  id: string
  name_ru: string
  name_en: string
  description_ru: string
  description_en: string
  icon: string
  gold_reward: number
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  earned_at: string
  // Joined data
  achievement?: AchievementDefinition
}

export interface GoldTransaction {
  id: string
  user_id: string
  amount: number
  type: 'purchase' | 'daily_bonus' | 'like_reward' | 'top_reward' | 'achievement' | 'moderation' | 'featured_spot' | 'sound_attach' | 'download' | 'theme_suggest' | 'medal_give' | 'admin_grant'
  description: string | null
  work_id: string | null
  created_at: string
}

export interface Contest {
  id: string
  title: string
  description: string | null
  starts_at: string
  ends_at: string
  prize_description: string | null
  created_by: string | null
  is_active: boolean
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: 'like' | 'comment' | 'follow' | 'mention' | 'medal' | 'achievement' | 'system' | 'gold'
  actor_id: string | null
  work_id: string | null
  comment_id: string | null
  message: string | null
  is_read: boolean
  created_at: string
  // Joined data
  actor?: Profile
  work?: Work
}

// ==========================================
// RANK SYSTEM
// ==========================================

export const RANKS = [
  { level: 1,  name: { ru: 'Неизвестный',   en: 'Unknown' },     minLikes: 0 },
  { level: 2,  name: { ru: 'Новичок',        en: 'Newbie' },      minLikes: 10 },
  { level: 3,  name: { ru: 'Узнаваемый',     en: 'Recognized' },  minLikes: 50 },
  { level: 4,  name: { ru: 'Известный',      en: 'Known' },       minLikes: 150 },
  { level: 5,  name: { ru: 'Прославленный',  en: 'Celebrated' },  minLikes: 500 },
  { level: 6,  name: { ru: 'Выдающийся',     en: 'Outstanding' }, minLikes: 1000 },
  { level: 7,  name: { ru: 'Знаменитый',     en: 'Famous' },      minLikes: 2500 },
  { level: 8,  name: { ru: 'Величайший',     en: 'Greatest' },    minLikes: 5000 },
  { level: 9,  name: { ru: 'Бессмертный',    en: 'Immortal' },    minLikes: 10000 },
  { level: 10, name: { ru: 'Легенда',        en: 'Legend' },      minLikes: 25000 },
] as const

export function getRankInfo(rank: number, locale: 'ru' | 'en' = 'ru') {
  const rankData = RANKS.find(r => r.level === rank) || RANKS[0]
  return {
    level: rankData.level,
    name: rankData.name[locale],
    minLikes: rankData.minLikes,
    nextMinLikes: RANKS.find(r => r.level === rankData.level + 1)?.minLikes ?? null,
  }
}

export function getRankByLikes(totalLikes: number): number {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (totalLikes >= RANKS[i].minLikes) return RANKS[i].level
  }
  return 1
}

// ==========================================
// GOLD SYSTEM
// ==========================================

export const GOLD_COSTS = {
  FEATURED_SPOT_DAY: 100,    // Козырное место на 1 день
  FEATURED_SPOT_WEEK: 500,   // Козырное место на 7 дней
  SOUND_ATTACH: 20,           // Прикрепить звук к работе
  DOWNLOAD_WORK: 5,           // Скачать чужую работу
  SUGGEST_THEME: 50,          // Предложить тему дня
  GIVE_MEDAL_BRONZE: 5,
  GIVE_MEDAL_SILVER: 15,
  GIVE_MEDAL_GOLD: 30,
} as const

export const GOLD_REWARDS = {
  DAILY_LOGIN: 2,
  TOP_DAY: 25,
  TOP_WEEK: 75,
  TOP_MONTH: 200,
  ACHIEVEMENT_BASE: 10,
} as const

// 1 золото = 1 рубль (100 руб = 100 золота)
export const GOLD_TO_RUB = 1
export const PREMIUM_MIN_PURCHASE = 100  // минимум 100 рублей за раз для получения премиума
