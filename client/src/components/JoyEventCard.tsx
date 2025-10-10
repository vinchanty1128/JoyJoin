import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Users } from "lucide-react";
import VibeChip from "./VibeChip";
import MatchScoreBadge from "./MatchScoreBadge";

interface JoyEventCardProps {
  title: string;
  time: string;
  area: string;
  price: string;
  vibes: Array<{ emoji: string; label: string; gradient: string }>;
  spotsLeft: number;
  myFit: number;
  groupSpark?: "High" | "Medium" | "Low";
  imageGradient: string;
  socialProof?: string;
}

export default function JoyEventCard({
  title,
  time,
  area,
  price,
  vibes,
  spotsLeft,
  myFit,
  groupSpark,
  imageGradient,
  socialProof
}: JoyEventCardProps) {
  return (
    <Card className="overflow-hidden hover-elevate active-elevate-2 transition-all border-0" data-testid={`card-event-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className={`relative h-48 bg-gradient-to-br ${imageGradient}`}>
        <div className="absolute top-3 left-3 flex gap-1.5">
          {vibes.slice(0, 3).map((vibe, i) => (
            <VibeChip key={i} emoji={vibe.emoji} label={vibe.label} gradient={vibe.gradient} />
          ))}
        </div>
        
        <div className="absolute top-3 right-3">
          <MatchScoreBadge myFit={myFit} groupSpark={groupSpark} />
        </div>

        {socialProof && (
          <div className="absolute bottom-3 left-3">
            <Badge className="bg-background/90 backdrop-blur-sm text-foreground border-0 text-xs">
              {socialProof}
            </Badge>
          </div>
        )}
      </div>

      <div className="p-3 space-y-2">
        <h3 className="font-display font-bold text-lg leading-tight">{title}</h3>
        
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{time}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>{area}</span>
          </div>
          <span>•</span>
          <span className="font-medium text-foreground">{price}</span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1 text-xs">
            <Users className="h-3.5 w-3.5 text-primary" />
            <span className="font-medium">{spotsLeft} spots left</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
