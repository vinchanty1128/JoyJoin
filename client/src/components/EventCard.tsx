import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Sparkles } from "lucide-react";
import VibePill from "./VibePill";
import AttendeeAvatars from "./AttendeeAvatars";

interface EventCardProps {
  title: string;
  date: string;
  time: string;
  location: string;
  vibes: Array<{ label: string; icon?: any }>;
  attendees: Array<{ name: string; initials: string }>;
  spotsLeft: number;
  matchScore: number;
  matchReason: string;
  imageGradient?: string;
}

export default function EventCard({
  title,
  date,
  time,
  location,
  vibes,
  attendees,
  spotsLeft,
  matchScore,
  matchReason,
  imageGradient = "from-purple-500 to-pink-500"
}: EventCardProps) {
  return (
    <Card className="overflow-hidden hover-elevate active-elevate-2 transition-all duration-200 cursor-pointer" data-testid={`card-event-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className={`h-40 bg-gradient-to-br ${imageGradient} relative`}>
        <div className="absolute top-3 right-3">
          <Badge className="bg-background/90 backdrop-blur-sm text-foreground border-0">
            <Sparkles className="h-3 w-3 mr-1" />
            {matchScore}% Match
          </Badge>
        </div>
      </div>
      
      <CardHeader className="pb-3">
        <h3 className="font-semibold text-lg leading-tight">{title}</h3>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {vibes.slice(0, 3).map((vibe, i) => (
            <VibePill key={i} icon={vibe.icon} label={vibe.label} />
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-3">
        <div className="flex items-center text-sm text-muted-foreground gap-2">
          <Calendar className="h-4 w-4" />
          <span>{date} at {time}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground gap-2">
          <MapPin className="h-4 w-4" />
          <span>{location}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <AttendeeAvatars attendees={attendees} maxDisplay={3} />
          </div>
          <span className="text-xs text-muted-foreground">{spotsLeft} spots left</span>
        </div>
        <div className="bg-muted/50 rounded-lg p-2.5 mt-2">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Why this match:</span> {matchReason}
          </p>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button className="w-full" data-testid="button-rsvp">RSVP Now</Button>
      </CardFooter>
    </Card>
  );
}
