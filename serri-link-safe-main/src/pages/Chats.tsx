import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface Chat {
  id: string;
  last_message: string | null;
  last_message_at: string | null;
  user1_id: string;
  user2_id: string;
  other_user?: {
    username: string;
    display_name: string;
  };
}

const Chats = () => {
  const navigate = useNavigate();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setCurrentUserId(session.user.id);
        fetchChats(session.user.id);
      }
    });
  }, [navigate]);

  const fetchChats = async (userId: string) => {
    const { data, error } = await supabase
      .from("chats")
      .select("*")
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order("updated_at", { ascending: false });

    if (error) {
      toast.error("Error loading chats");
      setLoading(false);
      return;
    }

    // Fetch other user profiles
    const chatsWithProfiles = await Promise.all(
      (data || []).map(async (chat) => {
        const otherUserId = chat.user1_id === userId ? chat.user2_id : chat.user1_id;
        const { data: profile } = await supabase
          .from("profiles")
          .select("username, display_name")
          .eq("id", otherUserId)
          .single();

        return { ...chat, other_user: profile };
      })
    );

    setChats(chatsWithProfiles);
    setLoading(false);
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
          <div>
            <h1 className="text-3xl font-bold">Chats</h1>
            <p className="text-muted-foreground">Your private conversations</p>
          </div>

          {chats.length === 0 ? (
            <Card className="p-8 text-center space-y-4">
              <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="font-semibold">No chats yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Start a conversation from your inbox messages
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-2">
              {chats.map((chat) => (
                <Card
                  key={chat.id}
                  className="p-4 hover:bg-secondary/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/chat/${chat.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold">
                      {chat.other_user?.display_name?.[0]?.toUpperCase() || "?"}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">
                        {chat.other_user?.display_name || chat.other_user?.username || "Unknown User"}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {chat.last_message || "No messages yet"}
                      </p>
                    </div>
                    {chat.last_message_at && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(chat.last_message_at).toLocaleDateString()}
                      </p>
                    )}
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

export default Chats;