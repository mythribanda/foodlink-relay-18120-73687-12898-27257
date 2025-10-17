import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Donation } from "./useDonorDonations";

export const useAvailableDonations = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        // @ts-ignore - Database types will be auto-generated
        const { data, error } = await supabase
          .from("donations")
          .select("*")
          .in("status", ["available", "requested"])
          .order("expiry_time", { ascending: true});

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
      .channel("available-donations")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "donations",
        },
        () => {
          fetchDonations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  return { donations, loading };
};
