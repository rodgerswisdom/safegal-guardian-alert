-- Fix security warnings by setting search_path for all functions

-- Update get_user_role function with proper search path
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS public.user_role AS $$
  SELECT role FROM public.profiles WHERE user_id = user_uuid AND approved = true;
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Update get_user_county function with proper search path
CREATE OR REPLACE FUNCTION public.get_user_county(user_uuid UUID)
RETURNS UUID AS $$
  SELECT county_id FROM public.profiles WHERE user_id = user_uuid AND approved = true;
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Update get_user_school function with proper search path
CREATE OR REPLACE FUNCTION public.get_user_school(user_uuid UUID)
RETURNS UUID AS $$
  SELECT school_id FROM public.profiles WHERE user_id = user_uuid AND approved = true;
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Update generate_case_code function with proper search path
CREATE OR REPLACE FUNCTION public.generate_case_code(county_code TEXT)
RETURNS TEXT AS $$
DECLARE
  random_suffix TEXT;
BEGIN
  random_suffix := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || NOW()::TEXT) FROM 1 FOR 4));
  RETURN 'SG-' || UPPER(county_code) || '-' || random_suffix;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Update calculate_risk_score function with proper search path
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
$$ LANGUAGE plpgsql SET search_path = public;

-- Update detect_spike function with proper search path
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
$$ LANGUAGE plpgsql SET search_path = public;

-- Update handle_new_case function with proper search path
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
$$ LANGUAGE plpgsql SET search_path = public;

-- Update update_updated_at_column function with proper search path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;