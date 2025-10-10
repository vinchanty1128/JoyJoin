import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import VibePill from "./VibePill";

interface VibeProfileCardProps {
  name: string;
  initials: string;
  vibes: string[];
  eventsAttended: number;
  matchesMade: number;
}

export default function VibeProfileCard({ 
  name, 
  initials, 
  vibes, 
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
              <span>{eventsAttended} events</span>
              <span>•</span>
              <span>{matchesMade} matches</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm font-medium mb-2">My Vibe</p>
          <div className="flex flex-wrap gap-1.5">
            {vibes.map((vibe, i) => (
              <VibePill key={i} label={vibe} variant="secondary" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
