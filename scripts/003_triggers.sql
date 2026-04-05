-- Мультатор 2 - Database Triggers and Functions

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 0;
BEGIN
  -- Generate base username from email
  base_username := LOWER(SPLIT_PART(NEW.email, '@', 1));
  base_username := REGEXP_REPLACE(base_username, '[^a-z0-9]', '', 'g');
  
  -- Ensure minimum length
  IF LENGTH(base_username) < 3 THEN
    base_username := 'user';
  END IF;
  
  -- Find unique username
  final_username := base_username;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := base_username || counter::TEXT;
  END LOOP;
  
  INSERT INTO public.profiles (id, username, display_name, locale)
  VALUES (
    NEW.id,
    final_username,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', final_username),
    COALESCE(NEW.raw_user_meta_data ->> 'locale', 'ru')
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update likes count on works
CREATE OR REPLACE FUNCTION public.update_work_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.works SET likes_count = likes_count + 1 WHERE id = NEW.work_id;
    -- Update author's total likes
    UPDATE public.profiles 
    SET total_likes = total_likes + 1 
    WHERE id = (SELECT user_id FROM public.works WHERE id = NEW.work_id);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.works SET likes_count = likes_count - 1 WHERE id = OLD.work_id;
    -- Update author's total likes
    UPDATE public.profiles 
    SET total_likes = total_likes - 1 
    WHERE id = (SELECT user_id FROM public.works WHERE id = OLD.work_id);
    RETURN OLD;
  END IF;
END;
$$;

-- Trigger for likes count
DROP TRIGGER IF EXISTS on_like_change ON public.likes;
CREATE TRIGGER on_like_change
  AFTER INSERT OR DELETE ON public.likes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_work_likes_count();

-- Function to update comments count on works
CREATE OR REPLACE FUNCTION public.update_work_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.works SET comments_count = comments_count + 1 WHERE id = NEW.work_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.works SET comments_count = comments_count - 1 WHERE id = OLD.work_id;
    RETURN OLD;
  END IF;
END;
$$;

-- Trigger for comments count
DROP TRIGGER IF EXISTS on_comment_change ON public.comments;
CREATE TRIGGER on_comment_change
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_work_comments_count();

-- Function to update user rank based on total likes
CREATE OR REPLACE FUNCTION public.update_user_rank()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_rank INTEGER;
BEGIN
  -- Calculate new rank based on total_likes
  new_rank := CASE
    WHEN NEW.total_likes >= 25000 THEN 10  -- Легенда
    WHEN NEW.total_likes >= 10000 THEN 9   -- Бессмертный
    WHEN NEW.total_likes >= 5000 THEN 8    -- Величайший
    WHEN NEW.total_likes >= 2500 THEN 7    -- Знаменитый
    WHEN NEW.total_likes >= 1000 THEN 6    -- Выдающийся
    WHEN NEW.total_likes >= 500 THEN 5     -- Прославленный
    WHEN NEW.total_likes >= 200 THEN 4     -- Известный
    WHEN NEW.total_likes >= 50 THEN 3      -- Узнаваемый
    WHEN NEW.total_likes >= 10 THEN 2      -- Новичок
    ELSE 1                                  -- Неизвестный
  END;
  
  IF new_rank != NEW.rank THEN
    NEW.rank := new_rank;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for rank update
DROP TRIGGER IF EXISTS on_profile_likes_change ON public.profiles;
CREATE TRIGGER on_profile_likes_change
  BEFORE UPDATE OF total_likes ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_rank();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS on_profiles_update ON public.profiles;
CREATE TRIGGER on_profiles_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS on_works_update ON public.works;
CREATE TRIGGER on_works_update
  BEFORE UPDATE ON public.works
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS on_comments_update ON public.comments;
CREATE TRIGGER on_comments_update
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
