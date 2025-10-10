import { Bell, Settings, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MobileHeaderProps {
  title: string;
  showNotification?: boolean;
  showSettings?: boolean;
  showLogo?: boolean;
}

export default function MobileHeader({ 
  title, 
  showNotification = true, 
  showSettings = false,
  showLogo = false
}: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur-sm border-b">
      <div className="flex items-center justify-between h-14 px-4">
        {showLogo ? (
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <div>
              <span className="text-lg font-bold">悦聚</span>
              <span className="text-xs text-muted-foreground ml-1">Joy</span>
            </div>
          </div>
        ) : (
          <h1 className="text-lg font-semibold">{title}</h1>
        )}
        <div className="flex items-center gap-2">
          {showNotification && (
            <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                3
              </Badge>
            </Button>
          )}
          {showSettings && (
            <Button variant="ghost" size="icon" data-testid="button-settings">
              <Settings className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
