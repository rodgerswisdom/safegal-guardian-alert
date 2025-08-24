-- Create enum types for better data integrity
CREATE TYPE public.user_role AS ENUM ('teacher', 'guardian', 'cpo', 'ngo', 'admin');
CREATE TYPE public.age_band AS ENUM ('10-12', '13-15', '16-17');
CREATE TYPE public.case_status AS ENUM ('new', 'acknowledged', 'in_progress', 'closed', 'unfounded');
CREATE TYPE public.action_type AS ENUM ('created', 'cpo_ack', 'ngo_ack', 'call_guardian', 'school_visit_booked', 'escort_to_clinic', 'closed', 'marked_unfounded');

-- Counties table
CREATE TABLE public.counties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Schools table
CREATE TABLE public.schools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  county_id UUID NOT NULL REFERENCES public.counties(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.user_role NOT NULL,
  county_id UUID REFERENCES public.counties(id),
  school_id UUID REFERENCES public.schools(id),
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Cases table (FGM risk alerts)
CREATE TABLE public.cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_code TEXT NOT NULL UNIQUE,
  reporter_id UUID NOT NULL REFERENCES public.profiles(id),
  age_band public.age_band NOT NULL,
  county_id UUID NOT NULL REFERENCES public.counties(id),
  school_id UUID NOT NULL REFERENCES public.schools(id),
  risk_tags TEXT[] NOT NULL DEFAULT '{}',
  redacted_note TEXT,
  status public.case_status NOT NULL DEFAULT 'new',
  risk_score INTEGER NOT NULL DEFAULT 50,
  is_spike BOOLEAN NOT NULL DEFAULT false,
  cpo_acked BOOLEAN NOT NULL DEFAULT false,
  ngo_acked BOOLEAN NOT NULL DEFAULT false,
  cpo_acked_at TIMESTAMP WITH TIME ZONE,
  ngo_acked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Case actions table (audit trail)
CREATE TABLE public.case_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES public.profiles(id),
  action_type public.action_type NOT NULL,
  details JSONB,
  action_hash TEXT NOT NULL,
  prev_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Rate limiting table
CREATE TABLE public.user_rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  alerts_today INTEGER NOT NULL DEFAULT 0,
  last_alert_at TIMESTAMP WITH TIME ZONE,
  unfounded_count INTEGER NOT NULL DEFAULT 0,
  last_unfounded_at TIMESTAMP WITH TIME ZONE,
  is_soft_blocked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.counties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rate_limits ENABLE ROW LEVEL SECURITY;

-- Create security definer functions to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS public.user_role AS $$
  SELECT role FROM public.profiles WHERE user_id = user_uuid AND approved = true;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_user_county(user_uuid UUID)
RETURNS UUID AS $$
  SELECT county_id FROM public.profiles WHERE user_id = user_uuid AND approved = true;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_user_school(user_uuid UUID)
RETURNS UUID AS $$
  SELECT school_id FROM public.profiles WHERE user_id = user_uuid AND approved = true;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS Policies for counties (public read)
CREATE POLICY "Counties are viewable by everyone" ON public.counties FOR SELECT USING (true);
CREATE POLICY "Only admins can modify counties" ON public.counties FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for schools (public read)
CREATE POLICY "Schools are viewable by everyone" ON public.schools FOR SELECT USING (true);
CREATE POLICY "Only admins can modify schools" ON public.schools FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Users can create their own profile" ON public.profiles FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for cases
CREATE POLICY "Teachers/guardians can view their school's cases (redacted)" ON public.cases FOR SELECT USING (
  (public.get_user_role(auth.uid()) IN ('teacher', 'guardian') AND school_id = public.get_user_school(auth.uid()))
  OR (public.get_user_role(auth.uid()) IN ('cpo', 'ngo') AND county_id = public.get_user_county(auth.uid()))
  OR (public.get_user_role(auth.uid()) = 'admin')
);
CREATE POLICY "Teachers/guardians can create cases for their school" ON public.cases FOR INSERT WITH CHECK (
  public.get_user_role(auth.uid()) IN ('teacher', 'guardian') AND school_id = public.get_user_school(auth.uid())
);
CREATE POLICY "Officers can update cases in their county" ON public.cases FOR UPDATE USING (
  (public.get_user_role(auth.uid()) IN ('cpo', 'ngo') AND county_id = public.get_user_county(auth.uid()))
  OR (public.get_user_role(auth.uid()) = 'admin')
);

-- RLS Policies for case_actions (audit trail)
CREATE POLICY "Users can view actions for cases they can see" ON public.case_actions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.cases 
    WHERE id = case_actions.case_id 
    AND (
      (public.get_user_role(auth.uid()) IN ('teacher', 'guardian') AND school_id = public.get_user_school(auth.uid()))
      OR (public.get_user_role(auth.uid()) IN ('cpo', 'ngo') AND county_id = public.get_user_county(auth.uid()))
      OR (public.get_user_role(auth.uid()) = 'admin')
    )
  )
);
CREATE POLICY "Users can create case actions" ON public.case_actions FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.cases 
    WHERE id = case_actions.case_id 
    AND (
      (public.get_user_role(auth.uid()) IN ('teacher', 'guardian') AND school_id = public.get_user_school(auth.uid()))
      OR (public.get_user_role(auth.uid()) IN ('cpo', 'ngo') AND county_id = public.get_user_county(auth.uid()))
      OR (public.get_user_role(auth.uid()) = 'admin')
    )
  )
);

-- RLS Policies for rate limits
CREATE POLICY "Users can view their own rate limits" ON public.user_rate_limits FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = user_rate_limits.user_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update their own rate limits" ON public.user_rate_limits FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = user_rate_limits.user_id AND user_id = auth.uid())
);

-- Function to generate case codes
CREATE OR REPLACE FUNCTION public.generate_case_code(county_code TEXT)
RETURNS TEXT AS $$
DECLARE
  random_suffix TEXT;
BEGIN
  random_suffix := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || NOW()::TEXT) FROM 1 FOR 4));
  RETURN 'SG-' || UPPER(county_code) || '-' || random_suffix;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate case risk score (AI stub)
CREATE OR REPLACE FUNCTION public.calculate_risk_score(
  p_age_band public.age_band,
  p_risk_tags TEXT[],
  p_redacted_note TEXT
)
RETURNS INTEGER AS $$
DECLARE
  base_score INTEGER := 50;
  tag_score INTEGER := 0;
  note_score INTEGER := 0;
BEGIN
  -- Age band scoring
  base_score := CASE p_age_band
    WHEN '10-12' THEN 70
    WHEN '13-15' THEN 85
    WHEN '16-17' THEN 60
  END;
  
  -- Risk tags scoring
  tag_score := CASE 
    WHEN 'upcoming_ceremony' = ANY(p_risk_tags) THEN tag_score + 30
    ELSE tag_score
  END;
  
  tag_score := CASE 
    WHEN 'pressure_at_home' = ANY(p_risk_tags) THEN tag_score + 25
    ELSE tag_score
  END;
  
  tag_score := CASE 
    WHEN 'travel_plan' = ANY(p_risk_tags) THEN tag_score + 20
    ELSE tag_score
  END;
  
  tag_score := CASE 
    WHEN 'injury_signs' = ANY(p_risk_tags) THEN tag_score + 35
    ELSE tag_score
  END;
  
  tag_score := CASE 
    WHEN 'community_rumor' = ANY(p_risk_tags) THEN tag_score + 15
    ELSE tag_score
  END;
  
  -- Note length scoring (more detail = higher concern)
  IF p_redacted_note IS NOT NULL THEN
    note_score := LEAST(20, LENGTH(p_redacted_note) / 10);
  END IF;
  
  RETURN GREATEST(0, LEAST(100, base_score + tag_score + note_score));
END;
$$ LANGUAGE plpgsql;

-- Function to detect spikes (AI stub)
CREATE OR REPLACE FUNCTION public.detect_spike(
  p_county_id UUID,
  p_school_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  recent_count INTEGER;
  historical_avg DECIMAL;
BEGIN
  -- Count cases in last 7 days for this school
  SELECT COUNT(*) INTO recent_count
  FROM public.cases
  WHERE school_id = p_school_id 
  AND created_at >= NOW() - INTERVAL '7 days';
  
  -- Get historical average (last 30 days excluding recent 7)
  SELECT AVG(daily_count) INTO historical_avg
  FROM (
    SELECT COUNT(*) as daily_count
    FROM public.cases
    WHERE school_id = p_school_id
    AND created_at >= NOW() - INTERVAL '30 days'
    AND created_at < NOW() - INTERVAL '7 days'
    GROUP BY DATE(created_at)
  ) daily_counts;
  
  -- Spike if recent count is >3x historical average and >2 cases
  RETURN recent_count > 2 AND recent_count > COALESCE(historical_avg * 3, 0);
END;
$$ LANGUAGE plpgsql;

-- Trigger function for automatic case code generation and scoring
CREATE OR REPLACE FUNCTION public.handle_new_case()
RETURNS TRIGGER AS $$
DECLARE
  county_code TEXT;
BEGIN
  -- Get county code
  SELECT code INTO county_code FROM public.counties WHERE id = NEW.county_id;
  
  -- Generate case code
  NEW.case_code := public.generate_case_code(county_code);
  
  -- Calculate risk score
  NEW.risk_score := public.calculate_risk_score(NEW.age_band, NEW.risk_tags, NEW.redacted_note);
  
  -- Detect spike
  NEW.is_spike := public.detect_spike(NEW.county_id, NEW.school_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new cases
CREATE TRIGGER on_case_created
  BEFORE INSERT ON public.cases
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_case();

-- Trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON public.cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_rate_limits_updated_at
  BEFORE UPDATE ON public.user_rate_limits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample counties
INSERT INTO public.counties (name, code) VALUES
('Nairobi', 'NRB'),
('Mombasa', 'MSA'),
('Kisumu', 'KSM'),
('Nakuru', 'NKR'),
('Kiambu', 'KMB'),
('Kitui', 'KTH'),
('Meru', 'MRU'),
('Garissa', 'GRS'),
('Isiolo', 'ISL'),
('Samburu', 'SMB');

-- Insert sample schools
INSERT INTO public.schools (code, name, county_id) VALUES
('NRB001', 'Nairobi Primary School', (SELECT id FROM public.counties WHERE code = 'NRB')),
('NRB002', 'Kibera Secondary School', (SELECT id FROM public.counties WHERE code = 'NRB')),
('MSA001', 'Mombasa Girls School', (SELECT id FROM public.counties WHERE code = 'MSA')),
('KSM001', 'Kisumu Boys High', (SELECT id FROM public.counties WHERE code = 'KSM')),
('NKR001', 'Nakuru Academy', (SELECT id FROM public.counties WHERE code = 'NKR')),
('KTH001', 'Kitui Primary', (SELECT id FROM public.counties WHERE code = 'KTH')),
('MRU001', 'Meru Secondary', (SELECT id FROM public.counties WHERE code = 'MRU'));