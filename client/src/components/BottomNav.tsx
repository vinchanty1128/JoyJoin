import { Compass, Calendar, MessageSquare, User } from "lucide-react";
import { useLocation } from "wouter";

const navItems = [
  { icon: Compass, label: "发现", path: "/", testId: "nav-discover" },
  { icon: Calendar, label: "活动", path: "/events", testId: "nav-events" },
  { icon: MessageSquare, label: "聊天", path: "/chats", testId: "nav-chats" },
  { icon: User, label: "我的", path: "/profile", testId: "nav-profile" }
];

export default function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t z-50 safe-area-pb">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location === item.path;
          return (
            <a
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
              data-testid={item.testId}
            >
              <item.icon className={`h-5 w-5 ${isActive ? "fill-primary/20" : ""}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
