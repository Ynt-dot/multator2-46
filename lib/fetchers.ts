import { createClient } from '@/lib/supabase/client'
import type { Feedback, Profile, Work, WorkCategory, WorkType } from '@/lib/types'

export const FEED_PAGE_SIZE = 20

// ── Follows ──────────────────────────────────────────────────────────────────

export async function fetchFollowingIds([, userId]: [string, string]): Promise<string[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId)
  return data?.map(f => f.following_id) ?? []
}

// ── Feed (home) ───────────────────────────────────────────────────────────────

export async function fetchFeedPage(
  key: [string, string, string, number],
): Promise<Work[]> {
  const [, filter, followingIdsStr, page] = key
  const supabase = createClient()
  const from = page * FEED_PAGE_SIZE

  let query = supabase
    .from('works')
    .select('*, profile:profiles!works_user_id_fkey(*)')
    .eq('is_published', true)

  if (filter === 'popular') {
    query = query.order('likes_count', { ascending: false })
  } else if (filter === 'newest') {
    query = query.order('created_at', { ascending: false })
  } else if (filter === 'following') {
    const ids = followingIdsStr.split(',').filter(Boolean)
    if (ids.length === 0) return []
    query = query.in('user_id', ids).order('created_at', { ascending: false })
  }

  const { data, error } = await query.range(from, from + FEED_PAGE_SIZE - 1)
  if (error) throw error
  return (data as Work[]) ?? []
}

// ── Category pages (oldschool / sandbox) ─────────────────────────────────────

export async function fetchCategoryPage(
  key: [string, WorkCategory, string, WorkType | 'all', number],
): Promise<Work[]> {
  const [, category, sortBy, typeFilter, page] = key
  const supabase = createClient()
  const from = page * FEED_PAGE_SIZE

  let query = supabase
    .from('works')
    .select('*, profile:profiles!works_user_id_fkey(*)')
    .eq('is_published', true)
    .eq('category', category)

  if (typeFilter !== 'all') query = query.eq('type', typeFilter as WorkType)

  query = sortBy === 'popular'
    ? query.order('likes_count', { ascending: false })
    : query.order('created_at', { ascending: false })

  const { data, error } = await query.range(from, from + FEED_PAGE_SIZE - 1)
  if (error) throw error
  return (data as Work[]) ?? []
}

// ── Profile ───────────────────────────────────────────────────────────────────

export async function fetchProfile([, username]: [string, string]): Promise<Profile | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .maybeSingle()
  return data as Profile | null
}

export async function fetchProfileData([, userId]: [string, string]) {
  const supabase = createClient()
  const [worksRes, favRes, achRes, followersRes, followingRes] = await Promise.all([
    supabase
      .from('works')
      .select('*, profile:profiles!works_user_id_fkey(*)')
      .eq('user_id', userId)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('favorites')
      .select('work:works(*, profile:profiles!works_user_id_fkey(*))')
      .eq('user_id', userId)
      .limit(50),
    supabase
      .from('user_achievements')
      .select('*, achievement:achievement_definitions(*)')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false }),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId),
  ])

  return {
    works: (worksRes.data as Work[]) ?? [],
    favorites: (favRes.data?.map(f => f.work).filter(Boolean) as Work[]) ?? [],
    achievements: achRes.data ?? [],
    followersCount: followersRes.count ?? 0,
    followingCount: followingRes.count ?? 0,
  }
}

export async function fetchIsFollowing([, followerId, followingId]: [string, string, string]): Promise<boolean> {
  const supabase = createClient()
  const { data } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .maybeSingle()
  return !!data
}

// ── Feedback ──────────────────────────────────────────────────────────────────

export async function fetchFeedbackHistory(): Promise<Feedback[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20)
  return (data as Feedback[]) ?? []
}
