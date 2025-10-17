import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Shield, Users, CheckCircle, XCircle, Clock } from "lucide-react";

interface NGOVerification {
  id: string;
  user_id: string;
  organization_name: string;
  registration_id: string;
  status: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
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

  const handleVerification = async (verificationId: string, status: 'approved' | 'rejected', reason?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('ngo_verifications')
        .update({
          status,
          verified_by: user?.id,
          verified_at: new Date().toISOString(),
          rejection_reason: reason || null,
        })
        .eq('id', verificationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `NGO verification ${status}`,
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
                <Card key={verification.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{verification.organization_name}</CardTitle>
                        <CardDescription className="mt-2">
                          Registration ID: {verification.registration_id}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={
                          verification.status === 'approved' ? 'default' :
                          verification.status === 'rejected' ? 'destructive' :
                          'secondary'
                        }
                      >
                        {verification.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                        {verification.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {verification.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                        {verification.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <p><strong>Submitted by:</strong> {verification.profiles?.full_name}</p>
                      <p><strong>Date:</strong> {new Date(verification.created_at).toLocaleDateString()}</p>
                    </div>
                    {verification.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleVerification(verification.id, 'approved')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleVerification(verification.id, 'rejected', 'Invalid documentation')}
                          variant="destructive"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage all platform users</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">User management features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
