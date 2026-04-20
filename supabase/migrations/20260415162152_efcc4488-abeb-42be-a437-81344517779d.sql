
CREATE TABLE public.event_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  person_name TEXT NOT NULL,
  unavailable_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(person_name, unavailable_date)
);

ALTER TABLE public.event_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view responses" ON public.event_responses FOR SELECT USING (true);
CREATE POLICY "Anyone can insert responses" ON public.event_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete responses" ON public.event_responses FOR DELETE USING (true);
