import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const CreateDonation = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [foodType, setFoodType] = useState<string>("");
  const [quantity, setQuantity] = useState("");
  const [estimatedMeals, setEstimatedMeals] = useState("");
  const [shelfLife, setShelfLife] = useState<string>("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setLongitude] = useState<number>(0);

  const foodTypes = ["Cooked Meal", "Vegetables", "Fruit", "Packaged", "Bakery"];
  const shelfLifeOptions = ["1-2 Hours", "3-6 Hours", "1 Day"];

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
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setLocation("Current Location (GPS)");
          toast.success("Location detected!");
        },
        () => {
          toast.error("Could not get location. Please enter manually.");
        }
      );
    }
  };

  const getExpiryTime = (shelfLife: string): Date => {
    const now = new Date();
    switch (shelfLife) {
      case "1-2 Hours":
        now.setHours(now.getHours() + 2);
        break;
      case "3-6 Hours":
        now.setHours(now.getHours() + 6);
        break;
      case "1 Day":
        now.setDate(now.getDate() + 1);
        break;
    }
    return now;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !foodType || !quantity || !shelfLife || !location || !userId) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      // @ts-ignore - Database types will be auto-generated
      const { error } = await supabase.from("donations").insert({
        donor_id: userId,
        title,
        food_type: foodType,
        quantity,
        estimated_meals: estimatedMeals ? parseInt(estimatedMeals) : null,
        pickup_address: location,
        pickup_latitude: latitude || 0,
        pickup_longitude: longitude || 0,
        expiry_time: getExpiryTime(shelfLife).toISOString(),
        description: description || null,
        status: "available",
      });

      if (error) throw error;

      // Update donor stats
      // @ts-ignore
      const { data: currentProfile } = await supabase
        .from("profiles")
        .select("total_donations")
        .eq("id", userId)
        .single();

      if (currentProfile) {
        // @ts-ignore
        await supabase
          .from("profiles")
          // @ts-ignore
          .update({ total_donations: (currentProfile.total_donations || 0) + 1 })
          .eq("id", userId);
      }

      toast.success("Donation posted successfully!");
      navigate("/donor/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to create donation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-heading text-xl font-bold">Post a Donation</h1>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="container mx-auto px-4 py-6 max-w-2xl pb-24">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Donation Title *</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="text"
                placeholder="e.g., Fresh Vegetable Mix, Cooked Rice & Curry"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </CardContent>
          </Card>

          {/* Food Type */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Food Type *</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {foodTypes.map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant={foodType === type ? "default" : "outline"}
                    size="default"
                    onClick={() => setFoodType(type)}
                    className="rounded-full"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quantity */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Quantity *</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                type="text"
                placeholder="e.g., 3 large boxes, 5kg"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
              <div>
                <Label htmlFor="meals">Estimated Meals (Optional)</Label>
                <Input
                  id="meals"
                  type="number"
                  placeholder="How many people can this serve?"
                  value={estimatedMeals}
                  onChange={(e) => setEstimatedMeals(e.target.value)}
                  min="1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Description (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Any additional details about the food..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Shelf Life */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Shelf Life (Urgency) *</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {shelfLifeOptions.map((option) => (
                  <Button
                    key={option}
                    type="button"
                    variant={shelfLife === option ? "urgent" : "outline"}
                    size="default"
                    onClick={() => setShelfLife(option)}
                    className={shelfLife === option ? "" : "border-2"}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pickup Location */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Pickup Location *</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                type="button"
                variant="secondary"
                size="default"
                onClick={handleCurrentLocation}
                className="w-full"
              >
                <MapPin className="mr-2 h-4 w-4" />
                Use My Current Location
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or enter manually</span>
                </div>
              </div>
              <Textarea
                placeholder="Enter your address..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                rows={3}
                required
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button type="submit" variant="success" size="lg" className="w-full" disabled={loading}>
            {loading ? "Posting..." : "Post Donation"}
          </Button>
        </form>
      </main>
    </div>
  );
};

export default CreateDonation;
