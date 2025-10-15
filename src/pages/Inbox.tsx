import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Copy, Eye, MessageCircle, Trash2, Flag, Share2 } from "lucide-react";

interface PublicMessage {
  id: string;
  content: string;
  message_type: string;
  status: string;
  created_at: string;
  from_user_id: string | null;
  profiles?: {
    username: string;
    display_name: string;
  };
}

const Inbox = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<PublicMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        fetchProfile(session.user.id);
        fetchMessages(session.user.id);
      }
    });
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    setCurrentUser(data);
  };

  const fetchMessages = async (userId: string) => {
    const { data, error } = await supabase
      .from("public_messages")
      .select(`
        *,
        profiles!public_messages_from_user_id_fkey (
          username,
          display_name
        )
      `)
      .eq("to_user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Error loading messages");
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  };

  const handleMarkSeen = async (messageId: string) => {
    const { error } = await supabase
      .from("public_messages")
      .update({ status: "seen" })
      .eq("id", messageId);

    if (error) {
      toast.error("Error updating message");
    } else {
      setMessages(messages.map(m => m.id === messageId ? { ...m, status: "seen" } : m));
    }
  };

  const handleDelete = async (messageId: string) => {
    const { error } = await supabase
      .from("public_messages")
      .update({ status: "deleted" })
      .eq("id", messageId);

    if (error) {
      toast.error("Error deleting message");
    } else {
      setMessages(messages.filter(m => m.id !== messageId));
      toast.success("Message deleted");
    }
  };

  const handleReport = async (messageId: string) => {
    const { error } = await supabase
      .from("reports")
      .insert({
        reporter_id: currentUser?.id,
        target_type: "public_message",
        target_id: messageId,
        reason: "Inappropriate content",
      });

    if (error) {
      toast.error("Error reporting message");
    } else {
      toast.success("Message reported");
    }
  };

  const copyProfileLink = () => {
    const link = `${window.location.origin}/u/${currentUser?.username}`;
    navigator.clipboard.writeText(link);
    toast.success("Profile link copied!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 pb-20 md:pb-8 px-4">
          <div className="max-w-2xl mx-auto text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20 pb-20 md:pb-8 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Inbox</h1>
              <p className="text-muted-foreground">Your anonymous messages</p>
            </div>
            <Button onClick={copyProfileLink} variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share Profile
            </Button>
          </div>

          {messages.length === 0 ? (
            <Card className="p-8 text-center space-y-4">
              <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="font-semibold">No messages yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Share your profile link to receive anonymous messages
                </p>
              </div>
              <Button onClick={copyProfileLink}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Profile Link
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => (
                <Card key={message.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={message.message_type === "anonymous" ? "secondary" : "default"}>
                          {message.message_type === "anonymous" ? "Anonymous" : "Personal"}
                        </Badge>
                        {message.status === "new" && (
                          <Badge variant="outline">New</Badge>
                        )}
                        {message.profiles && (
                          <span className="text-sm text-muted-foreground">
                            from @{message.profiles.username}
                          </span>
                        )}
                      </div>
                      <p className="text-foreground whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(message.created_at).toLocaleDateString()} at{" "}
                        {new Date(message.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center gap-2 flex-wrap">
                    {message.status === "new" && (
                      <Button
                        onClick={() => handleMarkSeen(message.id)}
                        variant="outline"
                        size="sm"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Mark Seen
                      </Button>
                    )}
                    <Button
                      onClick={() => handleDelete(message.id)}
                      variant="outline"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                    <Button
                      onClick={() => handleReport(message.id)}
                      variant="outline"
                      size="sm"
                    >
                      <Flag className="w-4 h-4 mr-1" />
                      Report
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inbox;