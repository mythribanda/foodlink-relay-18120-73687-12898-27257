import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, MapPin, User, Clock, CheckCircle, Package } from "lucide-react";

interface DeliveryStatusProps {
  donationId: string;
  status: string;
}

export const DeliveryStatusCard = ({ donationId, status }: DeliveryStatusProps) => {
  const [taskInfo, setTaskInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTaskInfo();

    // Subscribe to task updates
    const channel = supabase
      .channel(`task-${donationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'volunteer_tasks',
          filter: `donation_id=eq.${donationId}`
        },
        () => {
          fetchTaskInfo();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [donationId]);

  const fetchTaskInfo = async () => {
    try {
      const { data: task, error } = await supabase
        .from('volunteer_tasks')
        .select('*')
        .eq('donation_id', donationId)
        .maybeSingle();

      if (error) throw error;

      if (task) {
        // Fetch related profiles
        const [donorRes, ngoRes, volunteerRes] = await Promise.all([
          supabase.from('profiles').select('id, full_name, phone').eq('id', task.donor_id).single(),
          supabase.from('profiles').select('id, full_name, phone').eq('id', task.ngo_id).single(),
          task.volunteer_id ? supabase.from('profiles').select('id, full_name, phone').eq('id', task.volunteer_id).single() : null,
        ]);

        setTaskInfo({
          ...task,
          donor: donorRes.data,
          ngo: ngoRes.data,
          volunteer: volunteerRes?.data,
        });
      }
    } catch (error) {
      console.error('Error fetching task info:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !taskInfo) {
    return null;
  }

  const getStatusBadge = () => {
    switch (taskInfo.status) {
      case 'available':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Awaiting Volunteer</Badge>;
      case 'assigned':
        return <Badge variant="default" className="bg-blue-500">Volunteer Assigned</Badge>;
      case 'in_progress':
        return <Badge variant="default" className="bg-purple-500">In Transit</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Delivered</Badge>;
      default:
        return <Badge variant="outline">{taskInfo.status}</Badge>;
    }
  };

  return (
    <Card className="bg-blue-50/50 border-blue-200">
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-sm">Delivery Status</h4>
          {getStatusBadge()}
        </div>

        {/* NGO Information */}
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <Package className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Requested by</p>
              <p className="font-medium text-sm">{taskInfo.ngo?.full_name}</p>
              {taskInfo.ngo?.phone && (
                <a href={`tel:${taskInfo.ngo.phone}`} className="text-xs text-primary hover:underline flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {taskInfo.ngo.phone}
                </a>
              )}
            </div>
          </div>

          {/* Volunteer Information */}
          {taskInfo.volunteer_id && (
            <div className="flex items-start gap-2">
              <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Volunteer</p>
                <p className="font-medium text-sm">{taskInfo.volunteer?.full_name}</p>
                {taskInfo.volunteer?.phone && (
                  <a href={`tel:${taskInfo.volunteer.phone}`} className="text-xs text-primary hover:underline flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {taskInfo.volunteer.phone}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Delivery Address */}
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Delivering to</p>
              <p className="text-sm">{taskInfo.dropoff_address}</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="pt-2 border-t text-xs space-y-1">
            {taskInfo.accepted_at && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle className="h-3 w-3" />
                <span>Accepted {new Date(taskInfo.accepted_at).toLocaleString()}</span>
              </div>
            )}
            {taskInfo.picked_up_at && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle className="h-3 w-3" />
                <span>Picked up {new Date(taskInfo.picked_up_at).toLocaleString()}</span>
              </div>
            )}
            {taskInfo.delivered_at && (
              <div className="flex items-center gap-2 text-green-600 font-medium">
                <CheckCircle className="h-3 w-3" />
                <span>Delivered {new Date(taskInfo.delivered_at).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
