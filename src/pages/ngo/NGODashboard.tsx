import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, MapPin, Clock, LogOut, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAvailableDonations } from "@/hooks/useAvailableDonations";
import { useProfile } from "@/hooks/useProfile";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const NGODashboard = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [foodTypeFilter, setFoodTypeFilter] = useState<string>("all");
  const { donations } = useAvailableDonations();
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
    if (!roles?.some((r) => r.role === "ngo")) {
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

  const handleRequestDonation = async (donationId: string) => {
    if (!userId) return;

    setRequestingId(donationId);
    try {
      // @ts-ignore - Database types will be auto-generated
      const { error } = await supabase
        .from("donations")
        // @ts-ignore
        .update({
          status: "requested",
          requested_by: userId,
        })
        .eq("id", donationId)
        .eq("status", "available");

      if (error) throw error;

      toast.success("Donation requested! A volunteer will be notified.");
    } catch (error: any) {
      toast.error(error.message || "Failed to request donation");
    } finally {
      setRequestingId(null);
    }
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

  const filteredDonations = donations.filter(
    (d) => foodTypeFilter === "all" || d.food_type === foodTypeFilter
  );

  const foodTypes = Array.from(new Set(donations.map((d) => d.food_type)));

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-card border-b shadow-sm sticky top-0 z-10">
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
      <main className="container mx-auto px-4 py-8">
        {/* Page Title & Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="font-heading text-2xl font-bold">Available Donations</h2>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={foodTypeFilter} onValueChange={setFoodTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {foodTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Donations Grid */}
        {filteredDonations.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="py-12 text-center">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No donations available at the moment</p>
              <p className="text-sm text-muted-foreground mt-2">Check back soon for new donations</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredDonations.map((donation) => (
              <Card key={donation.id} className="shadow-card hover:shadow-card-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{donation.title}</CardTitle>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      <Clock className="mr-1 h-3 w-3" />
                      Urgent
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Package className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">{donation.food_type}</p>
                        <p className="text-muted-foreground">{donation.quantity}</p>
                      </div>
                    </div>
                    
                    {donation.estimated_meals && (
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Serves:</span> ~{donation.estimated_meals} people
                      </p>
                    )}

                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-muted-foreground text-xs">{donation.pickup_address}</p>
                    </div>

                    {donation.description && (
                      <p className="text-xs text-muted-foreground italic">{donation.description}</p>
                    )}

                    <div className="pt-2 border-t space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Posted {formatDistanceToNow(new Date(donation.created_at), { addSuffix: true })}
                      </p>
                      <p className="text-xs text-urgent font-medium">
                        Expires {formatDistanceToNow(new Date(donation.expiry_time), { addSuffix: true })}
                      </p>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    variant="success"
                    onClick={() => handleRequestDonation(donation.id)}
                    disabled={requestingId === donation.id}
                  >
                    {requestingId === donation.id ? "Requesting..." : "Request Donation"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default NGODashboard;
