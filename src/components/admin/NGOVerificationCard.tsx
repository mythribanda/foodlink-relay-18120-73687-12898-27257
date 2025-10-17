import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Clock, FileText, Mail, Phone, User, Building, Globe } from "lucide-react";

interface NGOVerificationCardProps {
  verification: {
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
  };
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}

export const NGOVerificationCard = ({ verification, onApprove, onReject }: NGOVerificationCardProps) => {
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleReject = () => {
    if (rejectionReason.trim()) {
      onReject(verification.id, rejectionReason);
      setShowRejectDialog(false);
      setRejectionReason("");
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{verification.organization_name}</CardTitle>
              <CardDescription className="mt-2 space-y-1">
                <div className="flex items-center gap-2">
                  <FileText className="h-3 w-3" />
                  <span>Registration ID: {verification.registration_id}</span>
                </div>
                {verification.organization_type && (
                  <div className="flex items-center gap-2">
                    <Building className="h-3 w-3" />
                    <span>{verification.organization_type}</span>
                  </div>
                )}
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
            <p className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <strong>Submitted by:</strong> {verification.profiles?.full_name}
            </p>
            <p className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <strong>Date:</strong> {new Date(verification.created_at).toLocaleDateString()}
            </p>
            {verification.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{verification.description}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setShowDetailsDialog(true)}
              variant="outline"
            >
              View Details
            </Button>
            {verification.status === 'pending' && (
              <>
                <Button
                  onClick={() => onApprove(verification.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={() => setShowRejectDialog(true)}
                  variant="destructive"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </>
            )}
          </div>

          {verification.status === 'rejected' && verification.rejection_reason && (
            <div className="mt-4 p-3 bg-destructive/10 rounded-md">
              <p className="text-sm text-destructive font-semibold">Rejection Reason:</p>
              <p className="text-sm text-muted-foreground">{verification.rejection_reason}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{verification.organization_name}</DialogTitle>
            <DialogDescription>Complete verification details</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Registration ID</Label>
                <p className="font-medium">{verification.registration_id}</p>
              </div>
              {verification.organization_type && (
                <div>
                  <Label className="text-muted-foreground">Organization Type</Label>
                  <p className="font-medium">{verification.organization_type}</p>
                </div>
              )}
            </div>

            {verification.description && (
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="text-sm">{verification.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3">
              {verification.contact_person && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label className="text-muted-foreground">Contact Person</Label>
                    <p className="font-medium">{verification.contact_person}</p>
                  </div>
                </div>
              )}
              {verification.contact_email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-medium">{verification.contact_email}</p>
                  </div>
                </div>
              )}
              {verification.contact_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label className="text-muted-foreground">Phone</Label>
                    <p className="font-medium">{verification.contact_phone}</p>
                  </div>
                </div>
              )}
              {verification.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label className="text-muted-foreground">Website</Label>
                    <a href={verification.website} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
                      {verification.website}
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Submitted by</Label>
                  <p>{verification.profiles?.full_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Submitted on</Label>
                  <p>{new Date(verification.created_at).toLocaleString()}</p>
                </div>
                {verification.verified_at && (
                  <div>
                    <Label className="text-muted-foreground">Verified on</Label>
                    <p>{new Date(verification.verified_at).toLocaleString()}</p>
                  </div>
                )}
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge variant={verification.status === 'approved' ? 'default' : verification.status === 'rejected' ? 'destructive' : 'secondary'}>
                    {verification.status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject NGO Verification</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this verification. This will be visible to the applicant.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Rejection Reason *</Label>
              <Textarea
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g., Invalid documentation, Organization not registered, Missing required information..."
                rows={4}
                className="mt-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={!rejectionReason.trim()}
            >
              Reject Verification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
