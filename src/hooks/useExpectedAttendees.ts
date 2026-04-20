import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useExpectedAttendees() {
  return useQuery<string[]>({
    queryKey: ["expected-attendees"],
    queryFn: async () => {
      const { data, error } = await supabase.from("expected_attendees").select("person_name").order("person_name");
      if (error) { console.warn("expected_attendees table error:", error.message); return []; }
      return (data ?? []).map((r) => r.person_name);
    },
  });
}

export function useAddExpectedAttendee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (personName: string) => {
      const { error } = await supabase.from("expected_attendees").insert({ person_name: personName });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["expected-attendees"] }),
  });
}

export function useRemoveExpectedAttendee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (personName: string) => {
      const { error } = await supabase.from("expected_attendees").delete().eq("person_name", personName);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["expected-attendees"] }),
  });
}
