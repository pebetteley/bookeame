export { supabase } from "@/integrations/supabase/client";

export type EventResponse = {
  id: string;
  person_name: string;
  unavailable_date: string;
  created_at: string;
};
