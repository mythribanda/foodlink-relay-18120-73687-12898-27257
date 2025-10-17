-- Update the handle_new_user function to also create user role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role app_role;
BEGIN
  -- Get role from metadata, default to 'donor' if not specified
  user_role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::app_role,
    'donor'::app_role
  );
  
  -- Insert profile
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'));
  
  -- Insert user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);
  
  RETURN NEW;
END;
$$;

-- Update RLS policy to allow system (trigger) to insert roles
DROP POLICY IF EXISTS "Users can insert their own role during signup" ON public.user_roles;

CREATE POLICY "System can insert roles during signup"
ON public.user_roles
FOR INSERT
WITH CHECK (true);