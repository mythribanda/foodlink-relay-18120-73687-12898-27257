import { useState } from "react";
import { Heart, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface KudosButtonProps {
  taskId: string;
  recipientId: string;
  recipientName: string;
  senderId: string;
}

export const KudosButton = ({ taskId, recipientId, recipientName, senderId }: KudosButtonProps) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendKudos = async () => {
    if (!message.trim()) {
      toast.error("Please write a message");
      return;
    }

    setSending(true);
    try {
      // Send as a notification
      const { error } = await supabase.from('notifications').insert({
        user_id: recipientId,
        type: 'kudos',
        title: '❤️ You received kudos!',
        message: `"${message}"`,
        related_id: taskId,
      });

      if (error) throw error;

      toast.success(`Kudos sent to ${recipientName}!`);
      setMessage("");
      setOpen(false);
    } catch (error: any) {
      console.error('Error sending kudos:', error);
      toast.error("Failed to send kudos");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Heart className="h-4 w-4" />
          Send Kudos
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Kudos to {recipientName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Share your appreciation for their great work!
          </p>
          <Textarea
            placeholder="Write your message of appreciation..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            maxLength={200}
          />
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">
              {message.length}/200 characters
            </p>
            <Button
              onClick={handleSendKudos}
              disabled={sending || !message.trim()}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              Send Kudos
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
