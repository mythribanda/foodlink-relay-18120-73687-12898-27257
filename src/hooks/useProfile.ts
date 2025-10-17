import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Profile {
  id: string;
  full_name: string;
  total_donations: number;
  total_meals_donated: number;
  co2_saved_kg: number;
  average_rating: number;
  address?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
}

export const useProfile = (userId: string | undefined) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      try {
        // @ts-ignore - Database types will be auto-generated
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, total_donations, total_meals_donated, co2_saved_kg, average_rating, address, latitude, longitude, phone")
          .eq("id", userId)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, toast]);

  return { profile, loading };
};
