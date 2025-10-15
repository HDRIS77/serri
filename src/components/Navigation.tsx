import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, MessageCircle, Settings, Lock, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { toast } from "sonner";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      toast.success("Signed out successfully");
      navigate("/");
    }
  };

  const navItems = [
    { path: "/inbox", icon: Home, label: "Inbox" },
    { path: "/chats", icon: MessageCircle, label: "Chats" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 md:top-0 md:bottom-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="hidden md:flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Lock className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Serri
            </span>
          </div>

          <div className="flex items-center justify-around md:justify-center gap-1 md:gap-4 w-full md:w-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden md:inline text-sm font-medium">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="hidden md:flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;