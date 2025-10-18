import { useEffect, useState } from "react";
import { Trophy, Medal, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface LeaderboardProps {
  userId?: string;
}

export const Leaderboard = ({ userId }: LeaderboardProps) => {
  const [topVolunteers, setTopVolunteers] = useState<any[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [userId]);

  const fetchLeaderboard = async () => {
    try {
      // Get top volunteers by deliveries
      const { data: volunteers, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, total_deliveries, co2_saved_kg, average_rating')
        .order('total_deliveries', { ascending: false })
        .limit(10);

      if (error) throw error;

      setTopVolunteers(volunteers || []);

      // Find current user's rank if provided
      if (userId) {
        const { data: allVolunteers } = await supabase
          .from('profiles')
          .select('id, total_deliveries')
          .order('total_deliveries', { ascending: false });

        const rank = allVolunteers?.findIndex((v) => v.id === userId);
        if (rank !== undefined && rank !== -1) {
          setUserRank(rank + 1);
        }
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (index === 1) return <Medal className="h-6 w-6 text-gray-400" />;
    if (index === 2) return <Medal className="h-6 w-6 text-amber-600" />;
    return <Award className="h-5 w-5 text-muted-foreground" />;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Trophy className="h-8 w-8 mx-auto mb-2 text-muted-foreground animate-pulse" />
          <p className="text-sm text-muted-foreground">Loading leaderboard...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Top Volunteers
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User's rank if not in top 10 */}
        {userId && userRank && userRank > 10 && (
          <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
            <p className="text-sm text-center">
              Your Rank: <span className="font-bold text-primary">#{userRank}</span>
            </p>
          </div>
        )}

        {/* Leaderboard */}
        <div className="space-y-3">
          {topVolunteers.map((volunteer, index) => {
            const isCurrentUser = userId === volunteer.id;
            return (
              <div
                key={volunteer.id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                  isCurrentUser
                    ? "bg-primary/10 border-2 border-primary"
                    : "bg-muted/30 hover:bg-muted/50"
                }`}
              >
                {/* Rank */}
                <div className="flex items-center justify-center w-10">
                  {index < 3 ? (
                    getRankIcon(index)
                  ) : (
                    <span className="text-lg font-bold text-muted-foreground">
                      {index + 1}
                    </span>
                  )}
                </div>

                {/* Avatar */}
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {volunteer.full_name?.charAt(0) || "V"}
                  </AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="flex-1">
                  <p className="font-semibold text-sm">
                    {volunteer.full_name}
                    {isCurrentUser && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        You
                      </Badge>
                    )}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span>{volunteer.total_deliveries || 0} deliveries</span>
                    {volunteer.average_rating > 0 && (
                      <span>⭐ {volunteer.average_rating.toFixed(1)}</span>
                    )}
                  </div>
                </div>

                {/* CO2 Impact */}
                {volunteer.co2_saved_kg > 0 && (
                  <div className="text-right">
                    <p className="text-sm font-semibold text-success">
                      {volunteer.co2_saved_kg.toFixed(1)}kg
                    </p>
                    <p className="text-xs text-muted-foreground">CO₂ saved</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {topVolunteers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No volunteers yet. Be the first!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
