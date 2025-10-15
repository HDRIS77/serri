-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Privacy settings
  allow_anonymous BOOLEAN NOT NULL DEFAULT true,
  who_can_message TEXT NOT NULL DEFAULT 'everyone' CHECK (who_can_message IN ('everyone', 'followers', 'none')),
  allow_view_once BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles are viewable by everyone
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create public messages table
CREATE TABLE public.public_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  from_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'anonymous' CHECK (message_type IN ('anonymous', 'personal')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'seen', 'deleted', 'reported', 'published')),
  ip_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.public_messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages sent to them
CREATE POLICY "Users can view their own messages"
  ON public.public_messages FOR SELECT
  USING (auth.uid() = to_user_id OR status = 'published');

-- Anyone can send public messages
CREATE POLICY "Anyone can send public messages"
  ON public.public_messages FOR INSERT
  WITH CHECK (true);

-- Users can update messages sent to them
CREATE POLICY "Users can update their received messages"
  ON public.public_messages FOR UPDATE
  USING (auth.uid() = to_user_id);

-- Create chats table
CREATE TABLE public.chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user1_id, user2_id),
  CHECK (user1_id < user2_id)
);

-- Enable RLS
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- Users can view chats they are part of
CREATE POLICY "Users can view their own chats"
  ON public.chats FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Users can create chats
CREATE POLICY "Users can create chats"
  ON public.chats FOR INSERT
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Users can update chats they are part of
CREATE POLICY "Users can update their chats"
  ON public.chats FOR UPDATE
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Create chat messages table
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image')),
  content TEXT NOT NULL,
  view_once BOOLEAN NOT NULL DEFAULT false,
  view_count INTEGER NOT NULL DEFAULT 0,
  screenshot_detected BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages in their chats
CREATE POLICY "Users can view messages in their chats"
  ON public.chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chats
      WHERE chats.id = chat_messages.chat_id
      AND (chats.user1_id = auth.uid() OR chats.user2_id = auth.uid())
    )
  );

-- Users can send messages in their chats
CREATE POLICY "Users can send messages in their chats"
  ON public.chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chats
      WHERE chats.id = chat_id
      AND (chats.user1_id = auth.uid() OR chats.user2_id = auth.uid())
    )
    AND sender_id = auth.uid()
  );

-- Users can update messages they sent
CREATE POLICY "Users can update their messages"
  ON public.chat_messages FOR UPDATE
  USING (sender_id = auth.uid());

-- Create reports table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('public_message', 'chat_message', 'user')),
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  handled BOOLEAN NOT NULL DEFAULT false,
  action_taken TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Users can create reports
CREATE POLICY "Users can create reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id OR reporter_id IS NULL);

-- Users can view their own reports
CREATE POLICY "Users can view their reports"
  ON public.reports FOR SELECT
  USING (auth.uid() = reporter_id);

-- Create blocked users table
CREATE TABLE public.blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, blocked_user_id)
);

-- Enable RLS
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- Users can view their blocked list
CREATE POLICY "Users can view their blocked list"
  ON public.blocked_users FOR SELECT
  USING (auth.uid() = user_id);

-- Users can block other users
CREATE POLICY "Users can block users"
  ON public.blocked_users FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can unblock users
CREATE POLICY "Users can unblock users"
  ON public.blocked_users FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add trigger to profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger to chats
CREATE TRIGGER update_chats_updated_at
  BEFORE UPDATE ON public.chats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for chats and messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.public_messages;