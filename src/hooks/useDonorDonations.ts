import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Donation {
  id: string;
  title: string;
  food_type: string;
  quantity: string;
  status: string;
  pickup_address: string;
  expiry_time: string;
  created_at: string;
  estimated_meals: number | null;
  images: string[] | null;
  description: string | null;
  requested_by: string | null;
}

export const useDonorDonations = (userId: string | undefined) => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;

    const fetchDonations = async () => {
      try {
        // @ts-ignore - Database types will be auto-generated
        const { data, error } = await supabase
          .from("donations")
          .select("*")
          .eq("donor_id", userId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setDonations(data || []);
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to load donations",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();

    // Subscribe to changes
    const channel = supabase
      .channel("donor-donations")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "donations",
          filter: `donor_id=eq.${userId}`,
        },
        () => {
          fetchDonations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, toast]);

  return { donations, loading };
};
