import { TrendingUp, Award, Package, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useProfile } from "@/hooks/useProfile";
import { BadgesDisplay } from "./BadgesDisplay";
import { Leaderboard } from "./Leaderboard";

interface VolunteerProfileProps {
  userId: string;
}

export const VolunteerProfile = ({ userId }: VolunteerProfileProps) => {
  const { profile, loading } = useProfile(userId);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-muted rounded-lg"></div>
        <div className="h-64 bg-muted rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Impact Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Package className="h-8 w-8 text-primary mb-2" />
              <p className="text-2xl font-bold">{profile?.total_deliveries || 0}</p>
              <p className="text-xs text-muted-foreground">Total Deliveries</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <TrendingUp className="h-8 w-8 text-success mb-2" />
              <p className="text-2xl font-bold">{profile?.total_meals_donated || 0}</p>
              <p className="text-xs text-muted-foreground">Meals Served</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Award className="h-8 w-8 text-accent mb-2" />
              <p className="text-2xl font-bold">{profile?.co2_saved_kg?.toFixed(1) || 0}</p>
              <p className="text-xs text-muted-foreground">kg CO₂ Saved</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Star className="h-8 w-8 text-yellow-500 mb-2" />
              <p className="text-2xl font-bold">{profile?.average_rating?.toFixed(1) || "N/A"}</p>
              <p className="text-xs text-muted-foreground">Avg Rating</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Badges */}
      <BadgesDisplay userId={userId} category="volunteer" />

      {/* Leaderboard */}
      <Leaderboard userId={userId} />

      {/* Profile Info */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-heading text-lg font-semibold mb-2">About Me</h3>
              <p className="text-sm text-muted-foreground">
                {profile?.bio || "No bio yet. Update your profile to share more about yourself!"}
              </p>
            </div>
            
            {profile?.phone && (
              <div>
                <h3 className="font-heading text-sm font-semibold mb-1">Contact</h3>
                <p className="text-sm text-muted-foreground">{profile.phone}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
