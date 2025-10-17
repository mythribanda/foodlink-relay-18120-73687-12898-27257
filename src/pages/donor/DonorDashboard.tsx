import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Package, User, Home, Clock, LogOut, TrendingUp, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDonorDonations } from "@/hooks/useDonorDonations";
import { useProfile } from "@/hooks/useProfile";
import { formatDistanceToNow } from "date-fns";

const DonorDashboard = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>();
  const [loading, setLoading] = useState(true);
  const { donations } = useDonorDonations(userId);
  const { profile } = useProfile(userId);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    // @ts-ignore - Database types will be auto-generated
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    // @ts-ignore
    if (!roles?.some((r) => r.role === "donor")) {
      navigate("/auth");
      return;
    }

    setUserId(user.id);
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const activeDonations = donations.filter(
    (d) => d.status === "available" || d.status === "confirmed"
  );
  const pastDonations = donations.filter(
    (d) => d.status === "completed" || d.status === "cancelled"
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-6 w-6 text-primary" />
              <span className="font-heading text-xl font-bold text-primary">Foodlink</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-lg font-semibold">Hi, {profile?.full_name || "Friend"}!</h1>
              <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign Out">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 pb-24">
        {/* Impact Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <TrendingUp className="h-8 w-8 text-primary mb-2" />
                <p className="text-2xl font-bold">{profile?.total_donations || 0}</p>
                <p className="text-xs text-muted-foreground">Donations</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Package className="h-8 w-8 text-success mb-2" />
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
                <div className="flex items-center gap-1 mb-2">
                  <span className="text-2xl">⭐</span>
                </div>
                <p className="text-2xl font-bold">{profile?.average_rating?.toFixed(1) || "N/A"}</p>
                <p className="text-xs text-muted-foreground">Rating</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Primary CTA */}
        <div className="mb-8">
          <Link to="/donor/create-donation">
            <Button variant="urgent" size="lg" className="w-full md:w-auto">
              <Plus className="mr-2 h-5 w-5" />
              Post a New Donation
            </Button>
          </Link>
        </div>

        {/* Active Donations */}
        <section className="mb-12">
          <h2 className="font-heading text-2xl font-bold mb-6">Active Donations</h2>
          {activeDonations.length === 0 ? (
            <Card className="shadow-card">
              <CardContent className="py-12 text-center">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No active donations yet</p>
                <Link to="/donor/create-donation">
                  <Button variant="default">Post Your First Donation</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeDonations.map((donation) => (
                <Card key={donation.id} className="shadow-card hover:shadow-card-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{donation.title}</CardTitle>
                      {donation.status === "available" ? (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          <Clock className="mr-1 h-3 w-3" />
                          Available
                        </Badge>
                      ) : (
                        <Badge className="bg-green-50 text-green-700 border-green-200">
                          ✓ Confirmed
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1 text-sm">
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Type:</span> {donation.food_type}
                      </p>
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Quantity:</span> {donation.quantity}
                      </p>
                      {donation.estimated_meals && (
                        <p className="text-muted-foreground">
                          <span className="font-medium text-foreground">Serves:</span> ~{donation.estimated_meals} people
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Posted {formatDistanceToNow(new Date(donation.created_at), { addSuffix: true })}
                      </p>
                      <p className="text-xs text-urgent font-medium">
                        Expires {formatDistanceToNow(new Date(donation.expiry_time), { addSuffix: true })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Past Donations */}
        {pastDonations.length > 0 && (
          <section>
            <h2 className="font-heading text-2xl font-bold mb-6">Past Donations</h2>
            <div className="space-y-3">
              {pastDonations.map((donation) => (
                <Card key={donation.id} className="shadow-card">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{donation.title}</h3>
                        <p className="text-sm text-muted-foreground">{donation.food_type} • {donation.quantity}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(donation.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-muted">
                        {donation.status === "completed" ? "Completed" : "Cancelled"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg md:hidden z-50">
        <div className="grid grid-cols-2 gap-1 p-2">
          <Link to="/donor/dashboard">
            <Button variant="ghost" className="w-full flex-col h-auto py-3 bg-primary/10">
              <Home className="h-5 w-5 mb-1 text-primary" />
              <span className="text-xs text-primary font-medium">Home</span>
            </Button>
          </Link>
          <Link to="/donor/create-donation">
            <Button variant="ghost" className="w-full flex-col h-auto py-3">
              <Plus className="h-5 w-5 mb-1" />
              <span className="text-xs">Post Donation</span>
            </Button>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default DonorDashboard;
