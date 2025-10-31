import { Compass, Calendar, MessageSquare, User } from "lucide-react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  icon: any;
  label: string;
  path: string;
  testId: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { icon: Compass, label: "发现", path: "/", testId: "nav-discover", badge: 0 },
  { icon: Calendar, label: "活动", path: "/events", testId: "nav-events", badge: 0 },
  { icon: MessageSquare, label: "聊天", path: "/chats", testId: "nav-chats", badge: 0 },
  { icon: User, label: "我的", path: "/profile", testId: "nav-profile" }
];

export default function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t z-50 safe-area-pb">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const showBadge = item.badge !== undefined && item.badge > 0;
          
          return (
            <a
              key={item.path}
              href={item.path}
              className={`relative flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
              data-testid={item.testId}
            >
              <div className="relative">
                <item.icon className={`h-5 w-5 ${isActive ? "fill-primary/20" : ""}`} />
                {showBadge && (
                  <Badge 
                    className="absolute -top-2 -right-2 h-[18px] min-w-[18px] px-1.5 flex items-center justify-center text-[11px] font-semibold bg-primary text-primary-foreground animate-pulse"
                    data-testid={`badge-${item.testId}`}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </Badge>
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
