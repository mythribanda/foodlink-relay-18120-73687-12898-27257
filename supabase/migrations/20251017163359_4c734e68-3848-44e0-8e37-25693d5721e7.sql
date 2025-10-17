-- Create badges table
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_badges table (many-to-many relationship)
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Create achievements table
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for badges (everyone can view)
CREATE POLICY "Anyone can view badges"
ON public.badges
FOR SELECT
USING (true);

-- RLS Policies for user_badges
CREATE POLICY "Users can view all user badges"
ON public.user_badges
FOR SELECT
USING (true);

CREATE POLICY "System can award badges"
ON public.user_badges
FOR INSERT
WITH CHECK (true);

-- RLS Policies for achievements
CREATE POLICY "Users can view their own achievements"
ON public.achievements
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can view others' achievements"
ON public.achievements
FOR SELECT
USING (true);

CREATE POLICY "System can create achievements"
ON public.achievements
FOR INSERT
WITH CHECK (true);

-- Enable realtime for chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Enable realtime for volunteer_tasks
ALTER PUBLICATION supabase_realtime ADD TABLE public.volunteer_tasks;

-- Insert initial badges
INSERT INTO public.badges (name, description, icon, category, requirement_value) VALUES
('First Delivery', 'Complete your first food delivery', '🎯', 'volunteer', 1),
('Delivery Hero', 'Complete 10 food deliveries', '⭐', 'volunteer', 10),
('Super Volunteer', 'Complete 50 food deliveries', '🏆', 'volunteer', 50),
('Community Champion', 'Complete 100 food deliveries', '👑', 'volunteer', 100),
('Generous Donor', 'Make 5 food donations', '💝', 'donor', 5),
('Food Guardian', 'Make 20 food donations', '🛡️', 'donor', 20),
('Helping Hand', 'Fulfill 10 food requests', '🤝', 'ngo', 10),
('Community Builder', 'Fulfill 50 food requests', '🏗️', 'ngo', 50);