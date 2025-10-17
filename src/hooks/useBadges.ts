import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useBadges = (userId?: string) => {
  const [badges, setBadges] = useState<any[]>([]);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBadges();
  }, [userId]);

  const fetchBadges = async () => {
    try {
      // Fetch all available badges
      const { data: allBadges, error: badgesError } = await supabase
        .from('badges')
        .select('*')
        .order('requirement_value', { ascending: true });

      if (badgesError) throw badgesError;

      // Fetch user's earned badges if userId provided
      if (userId) {
        const { data: earnedBadges, error: userBadgesError } = await supabase
          .from('user_badges')
          .select(`
            *,
            badge:badges(*)
          `)
          .eq('user_id', userId);

        if (userBadgesError) throw userBadgesError;
        setUserBadges(earnedBadges || []);
      }

      setBadges(allBadges || []);
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAndAwardBadge = async (category: string, currentCount: number) => {
    if (!userId) return;

    try {
      // Find badges that should be awarded
      const eligibleBadges = badges.filter(
        (badge) =>
          badge.category === category &&
          badge.requirement_value <= currentCount &&
          !userBadges.some((ub) => ub.badge_id === badge.id)
      );

      for (const badge of eligibleBadges) {
        const { error } = await supabase
          .from('user_badges')
          .insert({
            user_id: userId,
            badge_id: badge.id,
          });

        if (error && !error.message.includes('duplicate')) {
          console.error('Error awarding badge:', error);
        }
      }

      if (eligibleBadges.length > 0) {
        await fetchBadges();
      }
    } catch (error) {
      console.error('Error checking badges:', error);
    }
  };

  return { badges, userBadges, loading, checkAndAwardBadge };
};
