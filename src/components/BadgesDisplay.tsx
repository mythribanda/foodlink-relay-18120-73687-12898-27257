import { Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBadges } from "@/hooks/useBadges";

interface BadgesDisplayProps {
  userId: string;
  category?: string;
}

export const BadgesDisplay = ({ userId, category }: BadgesDisplayProps) => {
  const { badges, userBadges, loading } = useBadges(userId);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Trophy className="h-8 w-8 mx-auto mb-2 text-muted-foreground animate-pulse" />
          <p className="text-sm text-muted-foreground">Loading badges...</p>
        </CardContent>
      </Card>
    );
  }

  const filteredBadges = category
    ? badges.filter((b) => b.category === category)
    : badges;

  const earnedBadgeIds = new Set(userBadges.map((ub) => ub.badge_id));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Badges
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filteredBadges.map((badge) => {
            const isEarned = earnedBadgeIds.has(badge.id);
            return (
              <div
                key={badge.id}
                className={`text-center p-4 rounded-lg border transition-all ${
                  isEarned
                    ? "bg-primary/5 border-primary"
                    : "bg-muted/30 opacity-50"
                }`}
              >
                <div className="text-4xl mb-2">{badge.icon}</div>
                <p className="font-semibold text-sm">{badge.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {badge.description}
                </p>
                {isEarned && (
                  <Badge variant="secondary" className="mt-2">
                    Earned!
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
