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
      // First get tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('volunteer_tasks')
        .select('*')
        .or(`status.eq.available,volunteer_id.eq.${volunteerId}`)
        .order('created_at', { ascending: false });

      if (tasksError) throw tasksError;

      // Then fetch related profile data
      if (tasksData && tasksData.length > 0) {
        const donorIds = [...new Set(tasksData.map(t => t.donor_id))];
        const ngoIds = [...new Set(tasksData.map(t => t.ngo_id))];
        
        const { data: donors } = await supabase
          .from('profiles')
          .select('id, full_name, phone')
          .in('id', donorIds);

        const { data: ngos } = await supabase
          .from('profiles')
          .select('id, full_name, phone')
          .in('id', ngoIds);

        // Map profiles to tasks
        const enrichedTasks = tasksData.map(task => ({
          ...task,
          donor: donors?.find(d => d.id === task.donor_id),
          ngo: ngos?.find(n => n.id === task.ngo_id)
        }));

        setTasks(enrichedTasks);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  return { tasks, loading, refetch: fetchTasks };
};
