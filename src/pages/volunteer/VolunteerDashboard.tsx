import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Navigation, User, CheckCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useVolunteerTasks } from "@/hooks/useVolunteerTasks";
import { useProfile } from "@/hooks/useProfile";
import { useBadges } from "@/hooks/useBadges";
import { ChatDialog } from "@/components/ChatDialog";
import { NotificationCenter } from "@/components/NotificationCenter";
import { BadgesDisplay } from "@/components/BadgesDisplay";

const VolunteerDashboard = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<any>(null);
  const [showBadges, setShowBadges] = useState(false);
  
  const { tasks, refetch: refetchTasks } = useVolunteerTasks(userId);
  const { profile } = useProfile(userId);
  const { checkAndAwardBadge } = useBadges(userId);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    if (!roles?.some((r: any) => r.role === "volunteer")) {
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

  const handleAcceptTask = async (task: any) => {
    if (!userId) return;

    try {
      // @ts-ignore - Database types will be auto-generated
      const { error } = await supabase
        .from("volunteer_tasks")
        .update({
          status: "assigned",
          volunteer_id: userId,
          accepted_at: new Date().toISOString(),
        })
        .eq("id", task.id)
        .eq("status", "available");

      if (error) throw error;

      // @ts-ignore
      await supabase.from("notifications").insert({
        user_id: task.donor_id,
        type: "task_accepted",
        title: "Volunteer Assigned",
        message: `A volunteer has accepted your donation pickup.`,
        related_id: task.id,
      });

      setActiveTask(task);
      toast.success("Task accepted! Navigate to pickup location.");
      refetchTasks();
    } catch (error: any) {
      toast.error(error.message || "Failed to accept task");
    }
  };

  const handleConfirmPickup = async () => {
    if (!activeTask || !userId) return;

    try {
      // @ts-ignore - Database types will be auto-generated
      const { error } = await supabase
        .from("volunteer_tasks")
        .update({
          status: "in_progress",
          picked_up_at: new Date().toISOString(),
        })
        .eq("id", activeTask.id);

      if (error) throw error;

      // @ts-ignore
      await supabase.from("notifications").insert({
        user_id: activeTask.ngo_id,
        type: "pickup_confirmed",
        title: "Food Picked Up",
        message: `Food has been collected and is on the way.`,
        related_id: activeTask.id,
      });

      toast.success("Pickup confirmed! Navigate to dropoff location.");
      refetchTasks();
    } catch (error: any) {
      toast.error(error.message || "Failed to confirm pickup");
    }
  };

  const handleConfirmDelivery = async () => {
    if (!activeTask || !userId) return;

    try {
      // @ts-ignore - Database types will be auto-generated
      const { error } = await supabase
        .from("volunteer_tasks")
        .update({
          status: "completed",
          delivered_at: new Date().toISOString(),
        })
        .eq("id", activeTask.id);

      if (error) throw error;

      // @ts-ignore
      await Promise.all([
        supabase.from("notifications").insert({
          user_id: activeTask.donor_id,
          type: "delivery_complete",
          title: "Delivery Complete",
          message: `Your donation has been successfully delivered!`,
          related_id: activeTask.id,
        }),
        supabase.from("notifications").insert({
          user_id: activeTask.ngo_id,
          type: "delivery_complete",
          title: "Food Delivered",
          message: `Food has been delivered successfully!`,
          related_id: activeTask.id,
        }),
      ]);

      // @ts-ignore - profile types will be generated
      const deliveryCount = (profile?.total_deliveries || 0) + 1;
      await checkAndAwardBadge("volunteer", deliveryCount);

      toast.success("Delivery completed! Thank you for your service.");
      setActiveTask(null);
      refetchTasks();
    } catch (error: any) {
      toast.error(error.message || "Failed to confirm delivery");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const currentActiveTask = tasks.find(
    (t) => t.volunteer_id === userId && ["assigned", "in_progress"].includes(t.status)
  );

  if (currentActiveTask && !activeTask) {
    setActiveTask(currentActiveTask);
  }

  if (activeTask) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card border-b shadow-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="font-heading text-xl font-bold">Active Delivery</h1>
            {userId && <NotificationCenter userId={userId} />}
          </div>
        </header>

        {/* Active Task Flow */}
        <main className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
          {/* Map Placeholder */}
          <div className="bg-muted rounded-lg h-64 flex items-center justify-center border-2 border-border">
            <div className="text-center">
              <MapPin className="h-12 w-12 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">Route visualization</p>
            </div>
          </div>

          {/* Step 1: Pickup */}
          <Card className="shadow-card-lg border-2 border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Step 1: Pickup</CardTitle>
                <Badge className="bg-primary">In Progress</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Location</p>
                <p className="font-semibold text-lg">{activeTask.pickup_address}</p>
              </div>
              
              {/* Chat with Donor */}
              {userId && activeTask.donor_id && (
                <div className="flex justify-center">
                  <ChatDialog
                    taskId={activeTask.id}
                    currentUserId={userId}
                    otherUserId={activeTask.donor_id}
                    otherUserName={activeTask.donor?.full_name || "Donor"}
                  />
                </div>
              )}

              <Button variant="default" size="lg" className="w-full">
                <Navigation className="mr-2 h-5 w-5" />
                Navigate to Pickup
              </Button>
              
              {activeTask.status === "assigned" && (
                <div className="pt-4">
                  <p className="text-sm text-muted-foreground mb-3 text-center">
                    Arrived at pickup location?
                  </p>
                  <Button
                    variant="success"
                    size="lg"
                    className="w-full"
                    onClick={handleConfirmPickup}
                  >
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Confirm Food Collected
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Dropoff */}
          <Card className={activeTask.status === "in_progress" ? "shadow-card-lg border-2 border-primary" : "shadow-card opacity-60"}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Step 2: Dropoff</CardTitle>
                <Badge variant={activeTask.status === "in_progress" ? "default" : "outline"}>
                  {activeTask.status === "in_progress" ? "In Progress" : "Pending"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Location</p>
                <p className="font-semibold text-lg">{activeTask.dropoff_address}</p>
              </div>

              {activeTask.status === "in_progress" && (
                <>
                  {/* Chat with NGO */}
                  {userId && activeTask.ngo_id && (
                    <div className="flex justify-center">
                      <ChatDialog
                        taskId={activeTask.id}
                        currentUserId={userId}
                        otherUserId={activeTask.ngo_id}
                        otherUserName={activeTask.ngo?.full_name || "NGO"}
                      />
                    </div>
                  )}

                  <Button variant="default" size="lg" className="w-full">
                    <Navigation className="mr-2 h-5 w-5" />
                    Navigate to Dropoff
                  </Button>

                  <div className="pt-4">
                    <p className="text-sm text-muted-foreground mb-3 text-center">
                      Arrived at dropoff location?
                    </p>
                    <Button
                      variant="success"
                      size="lg"
                      className="w-full"
                      onClick={handleConfirmDelivery}
                    >
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Confirm Delivery Complete
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            <span className="font-heading text-xl font-bold text-primary">Foodlink</span>
          </div>
          {userId && <NotificationCenter userId={userId} />}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Map View */}
        <div className="bg-muted rounded-lg h-[300px] mb-6 flex items-center justify-center border-2 border-border">
          <div className="text-center">
            <MapPin className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Available delivery tasks near you</p>
          </div>
        </div>

        {/* Available Tasks */}
        <div className="space-y-4">
          <h2 className="font-heading text-2xl font-bold">Available Tasks</h2>
          {tasks.filter(t => t.status === 'available').length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No available tasks at the moment
              </CardContent>
            </Card>
          ) : (
            tasks.filter(t => t.status === 'available').map((task) => (
              <Card key={task.id} className="shadow-card hover:shadow-card-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Food Delivery Task</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    From: {task.donor?.full_name || 'Donor'} → To: {task.ngo?.full_name || 'NGO'}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="bg-primary/10 rounded-full p-2 mt-0.5">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Pickup</p>
                        <p className="font-medium">{task.pickup_address}</p>
                        {task.donor?.phone && (
                          <p className="text-xs text-muted-foreground">Phone: {task.donor.phone}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="bg-secondary/10 rounded-full p-2 mt-0.5">
                        <Navigation className="h-4 w-4 text-secondary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Deliver To</p>
                        <p className="font-medium">{task.dropoff_address}</p>
                        {task.ngo?.phone && (
                          <p className="text-xs text-muted-foreground">Phone: {task.ngo.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  {task.estimated_distance_km && (
                    <div className="flex gap-4 text-sm">
                      <Badge variant="outline">{task.estimated_distance_km.toFixed(1)} km</Badge>
                    </div>
                  )}
                  <Button
                    variant="urgent"
                    size="lg"
                    className="w-full"
                    onClick={() => handleAcceptTask(task)}
                  >
                    Accept Task
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg">
        <div className="grid grid-cols-4 gap-1 p-2">
          <Button variant="ghost" className="w-full flex-col h-auto py-3 bg-primary/10">
            <MapPin className="h-5 w-5 mb-1 text-primary" />
            <span className="text-xs text-primary font-medium">Tasks</span>
          </Button>
          <Button variant="ghost" className="w-full flex-col h-auto py-3 opacity-50">
            <Navigation className="h-5 w-5 mb-1" />
            <span className="text-xs">Active</span>
          </Button>
          <Button 
            variant="ghost" 
            className="w-full flex-col h-auto py-3"
            onClick={() => setShowBadges(true)}
          >
            <User className="h-5 w-5 mb-1" />
            <span className="text-xs">Profile</span>
          </Button>
          <Button 
            variant="ghost" 
            className="w-full flex-col h-auto py-3"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5 mb-1" />
            <span className="text-xs">Sign Out</span>
          </Button>
        </div>
      </nav>

      {/* Badges Dialog */}
      <Dialog open={showBadges} onOpenChange={setShowBadges}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Your Achievements</DialogTitle>
          </DialogHeader>
          {userId && <BadgesDisplay userId={userId} category="volunteer" />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VolunteerDashboard;
