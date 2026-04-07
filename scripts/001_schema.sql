-- Мультатор 2 - Database Schema v2
-- Run this in Supabase SQL editor

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  -- user_type: creative role (animator draws quality works, archaeologist draws simpler works)
  user_type TEXT DEFAULT 'archaeologist' CHECK (user_type IN ('animator', 'archaeologist')),
  -- role: site permission level
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin', 'blocked')),
  rank INTEGER DEFAULT 1 CHECK (rank >= 1 AND rank <= 10),
  gold INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT FALSE,
  premium_until TIMESTAMPTZ,
  total_likes INTEGER DEFAULT 0,
  total_works INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  locale TEXT DEFAULT 'ru' CHECK (locale IN ('ru', 'en')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Works table (animations and drawings)
CREATE TABLE IF NOT EXISTS public.works (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('animation', 'drawing', 'comic')),
  category TEXT DEFAULT 'sandbox' CHECK (category IN ('oldschool', 'sandbox')),
  thumbnail_url TEXT,
  content_url TEXT DEFAULT '',
  frames_data JSONB NOT NULL DEFAULT '{}',
  is_published BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  daily_theme_id UUID,
  sound_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Likes table
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  work_id UUID NOT NULL REFERENCES public.works(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, work_id)
);

-- Medals table (users give medals to works)
CREATE TABLE IF NOT EXISTS public.medals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  giver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  work_id UUID NOT NULL REFERENCES public.works(id) ON DELETE CASCADE,
  medal_type TEXT NOT NULL CHECK (medal_type IN ('bronze', 'silver', 'gold')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(giver_id, work_id)
);

-- Comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  work_id UUID NOT NULL REFERENCES public.works(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  work_id UUID NOT NULL REFERENCES public.works(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, work_id)
);

-- Follows table
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Daily themes table
CREATE TABLE IF NOT EXISTS public.daily_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  date DATE UNIQUE NOT NULL,
  suggested_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  gold_cost INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Achievements definitions table
CREATE TABLE IF NOT EXISTS public.achievement_definitions (
  id TEXT PRIMARY KEY,
  name_ru TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_ru TEXT NOT NULL,
  description_en TEXT NOT NULL,
  icon TEXT NOT NULL,
  gold_reward INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES public.achievement_definitions(id),
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Gold transactions table
CREATE TABLE IF NOT EXISTS public.gold_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,  -- positive = earned, negative = spent
  type TEXT NOT NULL CHECK (type IN (
    'purchase',      -- bought with real money
    'daily_bonus',   -- daily login reward
    'like_reward',   -- earned from likes
    'top_reward',    -- top of the day/week/month reward
    'achievement',   -- achievement reward
    'moderation',    -- helped moderators
    'featured_spot', -- spent on featured spot
    'sound_attach',  -- spent attaching sound
    'download',      -- spent downloading work
    'theme_suggest', -- spent suggesting daily theme
    'medal_give',    -- spent giving medal
    'admin_grant'    -- admin gave gold
  )),
  description TEXT,
  work_id UUID REFERENCES public.works(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Featured spots table (козырное место)
CREATE TABLE IF NOT EXISTS public.featured_spots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id UUID NOT NULL REFERENCES public.works(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  gold_paid INTEGER NOT NULL,
  active_from TIMESTAMPTZ DEFAULT NOW(),
  active_until TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contests table
CREATE TABLE IF NOT EXISTS public.contests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  prize_description TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contest entries table
CREATE TABLE IF NOT EXISTS public.contest_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id UUID NOT NULL REFERENCES public.contests(id) ON DELETE CASCADE,
  work_id UUID NOT NULL REFERENCES public.works(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(contest_id, work_id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'mention', 'medal', 'achievement', 'system', 'gold')),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  work_id UUID REFERENCES public.works(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_works_user_id ON public.works(user_id);
CREATE INDEX IF NOT EXISTS idx_works_category ON public.works(category);
CREATE INDEX IF NOT EXISTS idx_works_created_at ON public.works(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_works_likes_count ON public.works(likes_count DESC);
CREATE INDEX IF NOT EXISTS idx_works_is_published ON public.works(is_published);
CREATE INDEX IF NOT EXISTS idx_likes_work_id ON public.likes(work_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_work_id ON public.comments(work_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_medals_work_id ON public.medals(work_id);
CREATE INDEX IF NOT EXISTS idx_gold_transactions_user_id ON public.gold_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);

-- ==========================================
-- FUNCTIONS
-- ==========================================

-- Auto-create profile when user registers
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, user_type, locale)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'archaeologist'),
    COALESCE(NEW.raw_user_meta_data->>'locale', 'ru')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_new_user ON auth.users;
CREATE TRIGGER trigger_new_user
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();



-- Increment views counter
CREATE OR REPLACE FUNCTION increment_views(work_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.works SET views_count = views_count + 1 WHERE id = work_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update likes_count and total_likes when a like is inserted/deleted
CREATE OR REPLACE FUNCTION handle_like_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment work likes_count
    UPDATE public.works SET likes_count = likes_count + 1 WHERE id = NEW.work_id;
    -- Increment author total_likes
    UPDATE public.profiles SET total_likes = total_likes + 1
      WHERE id = (SELECT user_id FROM public.works WHERE id = NEW.work_id);
    -- Create notification for work author
    INSERT INTO public.notifications (user_id, type, actor_id, work_id)
      SELECT user_id, 'like', NEW.user_id, NEW.work_id
      FROM public.works
      WHERE id = NEW.work_id AND user_id != NEW.user_id;
    -- Update rank based on total_likes
    UPDATE public.profiles SET rank = (
      CASE
        WHEN total_likes >= 25000 THEN 10
        WHEN total_likes >= 10000 THEN 9
        WHEN total_likes >= 5000  THEN 8
        WHEN total_likes >= 2500  THEN 7
        WHEN total_likes >= 1000  THEN 6
        WHEN total_likes >= 500   THEN 5
        WHEN total_likes >= 150   THEN 4
        WHEN total_likes >= 50    THEN 3
        WHEN total_likes >= 10    THEN 2
        ELSE 1
      END
    ) WHERE id = (SELECT user_id FROM public.works WHERE id = NEW.work_id);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.works SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.work_id;
    UPDATE public.profiles SET total_likes = GREATEST(total_likes - 1, 0)
      WHERE id = (SELECT user_id FROM public.works WHERE id = OLD.work_id);
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_like_change ON public.likes;
CREATE TRIGGER trigger_like_change
  AFTER INSERT OR DELETE ON public.likes
  FOR EACH ROW EXECUTE FUNCTION handle_like_change();

-- Update comments_count when a comment is inserted/deleted
CREATE OR REPLACE FUNCTION handle_comment_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.works SET comments_count = comments_count + 1 WHERE id = NEW.work_id;
    -- Notify work author
    INSERT INTO public.notifications (user_id, type, actor_id, work_id, comment_id)
      SELECT user_id, 'comment', NEW.user_id, NEW.work_id, NEW.id
      FROM public.works
      WHERE id = NEW.work_id AND user_id != NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.works SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.work_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_comment_change ON public.comments;
CREATE TRIGGER trigger_comment_change
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION handle_comment_change();

-- Update total_works when a work is published/unpublished/deleted
CREATE OR REPLACE FUNCTION handle_work_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.is_published = TRUE THEN
    UPDATE public.profiles SET total_works = total_works + 1 WHERE id = NEW.user_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.is_published = FALSE AND NEW.is_published = TRUE THEN
      UPDATE public.profiles SET total_works = total_works + 1 WHERE id = NEW.user_id;
    ELSIF OLD.is_published = TRUE AND NEW.is_published = FALSE THEN
      UPDATE public.profiles SET total_works = GREATEST(total_works - 1, 0) WHERE id = NEW.user_id;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.is_published = TRUE THEN
    UPDATE public.profiles SET total_works = GREATEST(total_works - 1, 0) WHERE id = OLD.user_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_work_change ON public.works;
CREATE TRIGGER trigger_work_change
  AFTER INSERT OR UPDATE OR DELETE ON public.works
  FOR EACH ROW EXECUTE FUNCTION handle_work_change();

-- Handle follow notifications
CREATE OR REPLACE FUNCTION handle_follow_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.notifications (user_id, type, actor_id)
      VALUES (NEW.following_id, 'follow', NEW.follower_id);
    RETURN NEW;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_follow_change ON public.follows;
CREATE TRIGGER trigger_follow_change
  AFTER INSERT ON public.follows
  FOR EACH ROW EXECUTE FUNCTION handle_follow_change();

-- Handle gold transactions (update user balance)
CREATE OR REPLACE FUNCTION handle_gold_transaction()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
    SET gold = gold + NEW.amount
    WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_gold_transaction ON public.gold_transactions;
CREATE TRIGGER trigger_gold_transaction
  AFTER INSERT ON public.gold_transactions
  FOR EACH ROW EXECUTE FUNCTION handle_gold_transaction();

-- Updated_at timestamp auto-update
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_works_updated_at ON public.works;
CREATE TRIGGER trigger_works_updated_at
  BEFORE UPDATE ON public.works
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ==========================================
-- ROW LEVEL SECURITY
-- ==========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.works ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gold_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_spots ENABLE ROW LEVEL SECURITY;

-- Profiles: anyone can read, only own profile can update
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Works: published works viewable by all, own works full access
CREATE POLICY "Published works viewable by all" ON public.works
  FOR SELECT USING (is_published = true OR auth.uid() = user_id);
CREATE POLICY "Users can insert own works" ON public.works
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own works" ON public.works
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own works" ON public.works
  FOR DELETE USING (auth.uid() = user_id);

-- Likes: anyone can see, authenticated users can manage own
CREATE POLICY "Likes viewable by everyone" ON public.likes
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like" ON public.likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own likes" ON public.likes
  FOR DELETE USING (auth.uid() = user_id);

-- Medals: anyone can see, premium users can give
CREATE POLICY "Medals viewable by everyone" ON public.medals
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can give medals" ON public.medals
  FOR INSERT WITH CHECK (auth.uid() = giver_id);
CREATE POLICY "Users can remove own medals" ON public.medals
  FOR DELETE USING (auth.uid() = giver_id);

-- Comments: anyone can see, authenticated can post
CREATE POLICY "Comments viewable by everyone" ON public.comments
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON public.comments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    (SELECT role FROM public.profiles WHERE id = auth.uid()) != 'blocked'
  );
CREATE POLICY "Users can delete own comments" ON public.comments
  FOR DELETE USING (auth.uid() = user_id);

-- Favorites: only own
CREATE POLICY "Users can view own favorites" ON public.favorites
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own favorites" ON public.favorites
  FOR ALL USING (auth.uid() = user_id);

-- Follows: anyone can see, authenticated can manage own
CREATE POLICY "Follows viewable by everyone" ON public.follows
  FOR SELECT USING (true);
CREATE POLICY "Users can manage own follows" ON public.follows
  FOR ALL USING (auth.uid() = follower_id);

-- Daily themes: anyone can see
CREATE POLICY "Daily themes viewable by everyone" ON public.daily_themes
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage daily themes" ON public.daily_themes
  FOR ALL USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'moderator')
  );

-- Notifications: only own
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- User achievements: anyone can view
CREATE POLICY "Achievements viewable by everyone" ON public.user_achievements
  FOR SELECT USING (true);

-- Gold transactions: only own
CREATE POLICY "Users can view own gold transactions" ON public.gold_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Featured spots: anyone can see
CREATE POLICY "Featured spots viewable by everyone" ON public.featured_spots
  FOR SELECT USING (true);

-- ==========================================
-- DEFAULT ACHIEVEMENT DEFINITIONS
-- ==========================================
INSERT INTO public.achievement_definitions (id, name_ru, name_en, description_ru, description_en, icon, gold_reward)
VALUES
  ('first_work',     'Первая работа',       'First Work',        'Опубликуй свою первую работу',          'Publish your first work',         '🎨', 10),
  ('ten_works',      '10 работ',            '10 Works',          'Опубликуй 10 работ',                    'Publish 10 works',                '🖼️', 30),
  ('hundred_works',  '100 работ',           '100 Works',         'Опубликуй 100 работ',                   'Publish 100 works',               '💯', 100),
  ('first_like',     'Первый лайк',         'First Like',        'Получи первый лайк',                    'Receive your first like',         '❤️', 5),
  ('hundred_likes',  '100 лайков',          '100 Likes',         'Набери 100 лайков суммарно',            'Reach 100 total likes',           '💝', 20),
  ('thousand_likes', '1000 лайков',         '1000 Likes',        'Набери 1000 лайков суммарно',           'Reach 1000 total likes',          '🔥', 50),
  ('oldschool_hit',  'Попал в Олдскул',     'Oldschool Hit',     'Попади в раздел Олдскул',               'Get into Oldschool section',      '⭐', 15),
  ('daily_winner',   'Мульт дня',           'Toon of the Day',   'Стань мультом дня',                     'Become toon of the day',          '🏆', 25),
  ('week_winner',    'Мульт недели',        'Toon of the Week',  'Стань мультом недели',                  'Become toon of the week',         '🥇', 75),
  ('month_winner',   'Мульт месяца',        'Toon of the Month', 'Стань мультом месяца',                  'Become toon of the month',        '👑', 200),
  ('first_comment',  'Первый комментарий',  'First Comment',     'Оставь первый комментарий',             'Leave your first comment',        '💬', 5),
  ('day_streak_7',   'Неделя подряд',       '7-Day Streak',      'Заходи на сайт 7 дней подряд',          'Log in 7 days in a row',          '📅', 20),
  ('animator_rank',  'Аниматор',            'Animator',          'Получи ранг Аниматора',                 'Earn the Animator rank',          '🎬', 50),
  ('theme_artist',   'Художник темы дня',   'Theme Artist',      'Нарисуй на тему дня',                   'Draw on the daily theme',         '🎯', 10)
ON CONFLICT (id) DO NOTHING;
