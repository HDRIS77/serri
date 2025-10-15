import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const Settings = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        fetchProfile(session.user.id);
      }
    });
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      toast.error("Error loading profile");
    } else {
      setProfile(data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: profile.display_name,
          bio: profile.bio,
          allow_anonymous: profile.allow_anonymous,
          who_can_message: profile.who_can_message,
          allow_view_once: profile.allow_view_once,
        })
        .eq("id", profile.id);

      if (error) throw error;

      toast.success("Settings saved!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profile) {
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
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your account and privacy</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your public profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={profile.username}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Your username cannot be changed
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={profile.display_name || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, display_name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio || ""}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={3}
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {(profile.bio || "").length}/200
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Privacy</CardTitle>
              <CardDescription>Control who can interact with you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allowAnonymous">Allow Anonymous Messages</Label>
                  <p className="text-sm text-muted-foreground">
                    People can send you messages without revealing their identity
                  </p>
                </div>
                <Switch
                  id="allowAnonymous"
                  checked={profile.allow_anonymous}
                  onCheckedChange={(checked) =>
                    setProfile({ ...profile, allow_anonymous: checked })
                  }
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="whoCanMessage">Who Can Message You</Label>
                <Select
                  value={profile.who_can_message}
                  onValueChange={(value) =>
                    setProfile({ ...profile, who_can_message: value })
                  }
                >
                  <SelectTrigger id="whoCanMessage">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="everyone">Everyone</SelectItem>
                    <SelectItem value="followers">Followers Only</SelectItem>
                    <SelectItem value="none">No One</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allowViewOnce">Allow View-Once Media</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable temporary media in private chats
                  </p>
                </div>
                <Switch
                  id="allowViewOnce"
                  checked={profile.allow_view_once}
                  onCheckedChange={(checked) =>
                    setProfile({ ...profile, allow_view_once: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;