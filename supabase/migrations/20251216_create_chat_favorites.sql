-- Create chat_favorites table for favoriting chat rooms
CREATE TABLE IF NOT EXISTS public.chat_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Unique constraint: one user can favorite a room only once
  CONSTRAINT chat_favorites_user_room_unique UNIQUE (user_id, room_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_chat_favorites_user_id ON public.chat_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_favorites_room_id ON public.chat_favorites(room_id);

-- Enable RLS
ALTER TABLE public.chat_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only manage their own favorites
CREATE POLICY "Users can view their own favorites"
  ON public.chat_favorites
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own favorites"
  ON public.chat_favorites
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON public.chat_favorites
  FOR DELETE
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT, DELETE ON public.chat_favorites TO authenticated;
