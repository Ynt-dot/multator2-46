-- Мультатор 2 - Feedback Table Migration
-- Run this in Supabase SQL editor after 001_schema.sql

-- Feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('bug', 'suggestion', 'praise', 'other')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  message TEXT NOT NULL CHECK (char_length(message) >= 10 AND char_length(message) <= 2000),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON public.feedback(status);

-- Enable RLS
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "feedback_select_own" ON public.feedback;
DROP POLICY IF EXISTS "feedback_insert_own" ON public.feedback;
DROP POLICY IF EXISTS "feedback_select_admin" ON public.feedback;
DROP POLICY IF EXISTS "feedback_update_admin" ON public.feedback;

-- Users can only see their own feedback
CREATE POLICY "feedback_select_own" ON public.feedback
  FOR SELECT USING (auth.uid() = user_id);

-- Users can submit feedback
CREATE POLICY "feedback_insert_own" ON public.feedback
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    (SELECT role FROM public.profiles WHERE id = auth.uid()) != 'blocked'
  );

-- Admins and moderators can view all feedback
CREATE POLICY "feedback_select_admin" ON public.feedback
  FOR SELECT USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'moderator')
  );

-- Admins and moderators can update feedback status
CREATE POLICY "feedback_update_admin" ON public.feedback
  FOR UPDATE USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'moderator')
  );
