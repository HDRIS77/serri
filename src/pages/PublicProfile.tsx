import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Lock, Send, User } from "lucide-react";

const PublicProfile = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"anonymous" | "personal">("anonymous");
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchProfile();
    checkCurrentUser();
  }, [username]);

  const checkCurrentUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      setCurrentUser(data);
    }
  };

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      .single();

    if (error || !data) {
      toast.error("Profile not found");
      setProfile(null);
    } else {
      setProfile(data);
    }
    setLoading(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setSending(true);

    try {
      const { error } = await supabase.from("public_messages").insert({
        to_user_id: profile.id,
        from_user_id: messageType === "personal" && currentUser ? currentUser.id : null,
        content: message,
        message_type: messageType,
      });

      if (error) throw error;

      toast.success("Message sent!");
      setMessage("");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <User className="w-16 h-16 mx-auto text-muted-foreground" />
            <div>
              <h2 className="text-2xl font-bold">Profile Not Found</h2>
              <p className="text-muted-foreground mt-2">
                The user @{username} doesn't exist
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background p-4">
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        <Card className="border-border/50 shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl font-bold text-primary-foreground">
                {profile.display_name?.[0]?.toUpperCase() || profile.username[0].toUpperCase()}
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl">
                {profile.display_name || profile.username}
              </CardTitle>
              <p className="text-muted-foreground">@{profile.username}</p>
            </div>
            {profile.bio && (
              <p className="text-sm text-foreground">{profile.bio}</p>
            )}
          </CardHeader>
        </Card>

        <Card className="border-border/50 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Send a Message
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Your message will be delivered privately to {profile.display_name || profile.username}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div className="space-y-2">
                <Label>Message Type</Label>
                <RadioGroup
                  value={messageType}
                  onValueChange={(value: "anonymous" | "personal") => setMessageType(value)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="anonymous" id="anonymous" />
                    <Label htmlFor="anonymous" className="cursor-pointer">
                      Anonymous
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="personal"
                      id="personal"
                      disabled={!currentUser}
                    />
                    <Label
                      htmlFor="personal"
                      className={currentUser ? "cursor-pointer" : "opacity-50"}
                    >
                      Personal
                      {!currentUser && " (Sign in required)"}
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Your Message</Label>
                <Textarea
                  id="message"
                  placeholder="Say something nice..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  maxLength={1000}
                  required
                />
                <p className="text-xs text-muted-foreground text-right">
                  {message.length}/1000
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                disabled={sending}
              >
                <Send className="w-4 h-4 mr-2" />
                {sending ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicProfile;