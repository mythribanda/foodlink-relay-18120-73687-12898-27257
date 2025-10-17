import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Shield } from "lucide-react";
import { NGOVerificationCard } from "@/components/admin/NGOVerificationCard";
import { UserManagement } from "@/components/admin/UserManagement";

interface NGOVerification {
  id: string;
  user_id: string;
  organization_name: string;
  registration_id: string;
  organization_type?: string;
  description?: string;
  website?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  status: string;
  rejection_reason?: string;
  created_at: string;
  verified_at?: string;
  profiles: {
    full_name: string;
  };
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [verifications, setVerifications] = useState<NGOVerification[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDonations: 0,
    totalMeals: 0,
    activeVolunteers: 0,
  });

  useEffect(() => {
    checkAuth();
    fetchVerifications();
    fetchStats();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate('/auth');
      return;
    }

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin');

    if (!roles || roles.length === 0) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges.",
        variant: "destructive",
      });
      navigate('/');
    }
  };

  const fetchVerifications = async () => {
    try {
      const { data, error } = await supabase
        .from('ngo_verifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles separately
      if (data) {
        const verificationsWithProfiles = await Promise.all(
          data.map(async (verification) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', verification.user_id)
              .single();

            return {
              ...verification,
              profiles: profile || { full_name: 'Unknown', email: '' },
            };
          })
        );
        setVerifications(verificationsWithProfiles as any);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: donationsCount } = await supabase
        .from('donations')
        .select('*', { count: 'exact', head: true });

      const { data: mealsData } = await supabase
        .from('donations')
        .select('estimated_meals');

      const totalMeals = mealsData?.reduce((sum, d) => sum + (d.estimated_meals || 0), 0) || 0;

      const { count: volunteersCount } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'volunteer');

      setStats({
        totalUsers: usersCount || 0,
        totalDonations: donationsCount || 0,
        totalMeals,
        activeVolunteers: volunteersCount || 0,
      });
    } catch (error: any) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleApprove = async (verificationId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('ngo_verifications')
        .update({
          status: 'approved',
          verified_by: user?.id,
          verified_at: new Date().toISOString(),
        })
        .eq('id', verificationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "NGO verification approved",
      });

      fetchVerifications();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleReject = async (verificationId: string, reason: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('ngo_verifications')
        .update({
          status: 'rejected',
          verified_by: user?.id,
          verified_at: new Date().toISOString(),
          rejection_reason: reason,
        })
        .eq('id', verificationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "NGO verification rejected",
      });

      fetchVerifications();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
          <Button onClick={handleSignOut} variant="outline">
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Users</CardDescription>
              <CardTitle className="text-3xl">{stats.totalUsers}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Donations</CardDescription>
              <CardTitle className="text-3xl">{stats.totalDonations}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Meals Donated</CardDescription>
              <CardTitle className="text-3xl">{stats.totalMeals}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active Volunteers</CardDescription>
              <CardTitle className="text-3xl">{stats.activeVolunteers}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="verifications" className="space-y-6">
          <TabsList>
            <TabsTrigger value="verifications">NGO Verifications</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
          </TabsList>

          <TabsContent value="verifications" className="space-y-4">
            {loading ? (
              <p>Loading...</p>
            ) : verifications.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No verification requests
                </CardContent>
              </Card>
            ) : (
              verifications.map((verification) => (
                <NGOVerificationCard
                  key={verification.id}
                  verification={verification}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
