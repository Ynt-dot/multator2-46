-- Function to increment views count
CREATE OR REPLACE FUNCTION increment_views(work_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE works
  SET views_count = views_count + 1
  WHERE id = work_id;
END;
$$;
