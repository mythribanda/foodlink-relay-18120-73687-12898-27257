-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'donor', 'ngo', 'volunteer');

-- Create enum for donation status
CREATE TYPE public.donation_status AS ENUM ('available', 'requested', 'pickup_scheduled', 'in_transit', 'delivered', 'cancelled');

-- Create enum for task status
CREATE TYPE public.task_status AS ENUM ('available', 'assigned', 'in_progress', 'completed', 'cancelled');

-- Create enum for verification status
CREATE TYPE public.verification_status AS ENUM ('pending', 'approved', 'rejected');

-- User roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  avatar_url TEXT,
  bio TEXT,
  total_donations INTEGER DEFAULT 0,
  total_deliveries INTEGER DEFAULT 0,
  total_meals_donated INTEGER DEFAULT 0,
  co2_saved_kg DECIMAL(10, 2) DEFAULT 0,
  average_rating DECIMAL(3, 2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- NGO verification table
CREATE TABLE public.ngo_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  organization_name TEXT NOT NULL,
  registration_id TEXT NOT NULL,
  organization_type TEXT,
  contact_person TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,
  description TEXT,
  verification_documents TEXT[], -- URLs to uploaded documents
  status verification_status NOT NULL DEFAULT 'pending',
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Donations table
CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  food_type TEXT NOT NULL,
  quantity TEXT NOT NULL,
  estimated_meals INTEGER,
  expiry_time TIMESTAMPTZ NOT NULL,
  pickup_address TEXT NOT NULL,
  pickup_latitude DECIMAL(10, 8) NOT NULL,
  pickup_longitude DECIMAL(11, 8) NOT NULL,
  pickup_instructions TEXT,
  images TEXT[],
  status donation_status NOT NULL DEFAULT 'available',
  requested_by UUID REFERENCES auth.users(id),
  is_recurring BOOLEAN DEFAULT false,
  recurring_schedule JSONB, -- {day_of_week, time, frequency}
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Food requests table (reverse marketplace)
CREATE TABLE public.food_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  food_type TEXT NOT NULL,
  quantity_needed TEXT NOT NULL,
  meals_needed INTEGER,
  needed_by TIMESTAMPTZ NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_latitude DECIMAL(10, 8) NOT NULL,
  delivery_longitude DECIMAL(11, 8) NOT NULL,
  is_urgent BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'open', -- open, partially_filled, fulfilled, expired
  pledges JSONB DEFAULT '[]'::JSONB, -- Array of {donor_id, quantity, status}
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Wishlists table (non-food items)
CREATE TABLE public.wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_name TEXT NOT NULL,
  description TEXT,
  quantity_needed TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, urgent
  category TEXT, -- hygiene, clothing, medical, etc.
  status TEXT NOT NULL DEFAULT 'needed', -- needed, partially_fulfilled, fulfilled
  fulfilled_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Volunteer tasks table
CREATE TABLE public.volunteer_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id UUID REFERENCES public.donations(id) ON DELETE CASCADE NOT NULL,
  volunteer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  donor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ngo_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pickup_address TEXT NOT NULL,
  pickup_latitude DECIMAL(10, 8) NOT NULL,
  pickup_longitude DECIMAL(11, 8) NOT NULL,
  dropoff_address TEXT NOT NULL,
  dropoff_latitude DECIMAL(10, 8) NOT NULL,
  dropoff_longitude DECIMAL(11, 8) NOT NULL,
  estimated_distance_km DECIMAL(6, 2),
  status task_status NOT NULL DEFAULT 'available',
  accepted_at TIMESTAMPTZ,
  picked_up_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  bundled_tasks UUID[], -- Array of other task IDs bundled together
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ratings table
CREATE TABLE public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.volunteer_tasks(id) ON DELETE CASCADE NOT NULL,
  rater_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rated_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  category TEXT NOT NULL, -- food_quality, punctuality, communication, packaging, etc.
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(task_id, rater_id, rated_user_id, category)
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- donation_posted, task_available, status_update, etc.
  related_id UUID, -- ID of related donation, task, etc.
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Chat messages table
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.volunteer_tasks(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ngo_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for ngo_verifications
CREATE POLICY "Users can view their own verification"
  ON public.ngo_verifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all verifications"
  ON public.ngo_verifications FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create their own verification"
  ON public.ngo_verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending verification"
  ON public.ngo_verifications FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can update all verifications"
  ON public.ngo_verifications FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for donations
CREATE POLICY "Anyone can view available donations"
  ON public.donations FOR SELECT
  USING (true);

CREATE POLICY "Donors can create donations"
  ON public.donations FOR INSERT
  WITH CHECK (auth.uid() = donor_id AND public.has_role(auth.uid(), 'donor'));

CREATE POLICY "Donors can update their own donations"
  ON public.donations FOR UPDATE
  USING (auth.uid() = donor_id);

CREATE POLICY "NGOs can request donations"
  ON public.donations FOR UPDATE
  USING (public.has_role(auth.uid(), 'ngo'));

-- RLS Policies for food_requests
CREATE POLICY "Anyone can view food requests"
  ON public.food_requests FOR SELECT
  USING (true);

CREATE POLICY "NGOs can create food requests"
  ON public.food_requests FOR INSERT
  WITH CHECK (auth.uid() = ngo_id AND public.has_role(auth.uid(), 'ngo'));

CREATE POLICY "NGOs can update their own requests"
  ON public.food_requests FOR UPDATE
  USING (auth.uid() = ngo_id);

-- RLS Policies for wishlists
CREATE POLICY "Anyone can view wishlists"
  ON public.wishlists FOR SELECT
  USING (true);

CREATE POLICY "NGOs can create wishlists"
  ON public.wishlists FOR INSERT
  WITH CHECK (auth.uid() = ngo_id AND public.has_role(auth.uid(), 'ngo'));

CREATE POLICY "NGOs can update their own wishlists"
  ON public.wishlists FOR UPDATE
  USING (auth.uid() = ngo_id);

-- RLS Policies for volunteer_tasks
CREATE POLICY "Volunteers can view available tasks"
  ON public.volunteer_tasks FOR SELECT
  USING (
    status = 'available' OR 
    volunteer_id = auth.uid() OR 
    donor_id = auth.uid() OR 
    ngo_id = auth.uid()
  );

CREATE POLICY "System can create tasks"
  ON public.volunteer_tasks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Volunteers can update assigned tasks"
  ON public.volunteer_tasks FOR UPDATE
  USING (volunteer_id = auth.uid());

CREATE POLICY "Donors and NGOs can view their tasks"
  ON public.volunteer_tasks FOR SELECT
  USING (donor_id = auth.uid() OR ngo_id = auth.uid());

-- RLS Policies for ratings
CREATE POLICY "Users can view ratings for themselves"
  ON public.ratings FOR SELECT
  USING (rated_user_id = auth.uid() OR rater_id = auth.uid());

CREATE POLICY "Users can create ratings for completed tasks"
  ON public.ratings FOR INSERT
  WITH CHECK (auth.uid() = rater_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- RLS Policies for chat_messages
CREATE POLICY "Users can view their own messages"
  ON public.chat_messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received messages"
  ON public.chat_messages FOR UPDATE
  USING (auth.uid() = receiver_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ngo_verifications_updated_at
  BEFORE UPDATE ON public.ngo_verifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_donations_updated_at
  BEFORE UPDATE ON public.donations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_food_requests_updated_at
  BEFORE UPDATE ON public.food_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wishlists_updated_at
  BEFORE UPDATE ON public.wishlists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_volunteer_tasks_updated_at
  BEFORE UPDATE ON public.volunteer_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'));
  RETURN NEW;
END;
$$;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_donations_donor_id ON public.donations(donor_id);
CREATE INDEX idx_donations_status ON public.donations(status);
CREATE INDEX idx_donations_location ON public.donations(pickup_latitude, pickup_longitude);
CREATE INDEX idx_food_requests_ngo_id ON public.food_requests(ngo_id);
CREATE INDEX idx_food_requests_status ON public.food_requests(status);
CREATE INDEX idx_volunteer_tasks_volunteer_id ON public.volunteer_tasks(volunteer_id);
CREATE INDEX idx_volunteer_tasks_status ON public.volunteer_tasks(status);
CREATE INDEX idx_volunteer_tasks_donor_id ON public.volunteer_tasks(donor_id);
CREATE INDEX idx_volunteer_tasks_ngo_id ON public.volunteer_tasks(ngo_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_chat_messages_task_id ON public.chat_messages(task_id);
CREATE INDEX idx_ratings_rated_user_id ON public.ratings(rated_user_id);