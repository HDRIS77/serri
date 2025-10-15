import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lock, Shield, Eye, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const features = [
    {
      icon: Lock,
      title: "Anonymous Messages",
      description: "Receive honest feedback and messages without knowing who sent them",
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your privacy is our priority. All data is encrypted and secure",
    },
    {
      icon: Eye,
      title: "View-Once Media",
      description: "Share photos that disappear after being viewed once",
    },
    {
      icon: MessageCircle,
      title: "Private Chats",
      description: "Have secure 1-on-1 conversations with end-to-end protection",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-8 pt-12">
          <div className="flex items-center justify-center mb-8">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl">
              <Lock className="w-12 h-12 text-primary-foreground" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Serri
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Privacy-first messaging where anonymity meets authenticity
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            {isAuthenticated ? (
              <>
                <Button
                  onClick={() => navigate("/inbox")}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity px-8"
                >
                  Go to Inbox
                </Button>
                <Button
                  onClick={() => navigate("/settings")}
                  size="lg"
                  variant="outline"
                  className="px-8"
                >
                  Settings
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => navigate("/auth")}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity px-8"
                >
                  Get Started
                </Button>
                <Button
                  onClick={() => navigate("/auth")}
                  size="lg"
                  variant="outline"
                  className="px-8"
                >
                  Sign In
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="p-6 border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:scale-105"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center space-y-6 py-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to experience privacy-first messaging?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join thousands of users who trust Serri for honest, anonymous communication
          </p>
          {!isAuthenticated && (
            <Button
              onClick={() => navigate("/auth")}
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity px-12"
            >
              Create Your Profile
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;