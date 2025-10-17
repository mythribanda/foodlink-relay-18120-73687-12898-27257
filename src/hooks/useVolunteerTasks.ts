import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useVolunteerTasks = (volunteerId?: string) => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!volunteerId) return;
    
    fetchTasks();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('volunteer-tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'volunteer_tasks',
          filter: `volunteer_id=eq.${volunteerId}`
        },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [volunteerId]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('volunteer_tasks')
        .select(`
          *,
          donor:profiles!volunteer_tasks_donor_id_fkey(full_name, phone),
          ngo:profiles!volunteer_tasks_ngo_id_fkey(full_name, phone)
        `)
        .or(`status.eq.available,volunteer_id.eq.${volunteerId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  return { tasks, loading, refetch: fetchTasks };
};
