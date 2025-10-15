import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import VibePill from "./VibePill";

interface VibeProfileCardProps {
  name: string;
  initials: string;
  eventsAttended: number;
  matchesMade: number;
}

export default function VibeProfileCard({ 
  name, 
  initials, 
  eventsAttended, 
  matchesMade 
}: VibeProfileCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-xl">{name}</CardTitle>
            <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
              <span>{eventsAttended} 场活动</span>
              <span>•</span>
              <span>{matchesMade} 个匹配</span>
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
