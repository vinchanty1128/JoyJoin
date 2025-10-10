import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Users } from "lucide-react";
import { Link } from "wouter";
import VibeChip from "./VibeChip";
import MatchScoreBadge from "./MatchScoreBadge";

interface JoyEventCardProps {
  id: string;
  title: string;
  time: string;
  area: string;
  price: string;
  vibes: Array<{ emoji: string; label: string; gradient: string }>;
  spotsLeft: number;
  myFit: number;
  groupSpark?: "High" | "Medium" | "Low";
  vibeGradient: string;
  iconName?: string;
  socialProof?: string;
}

export default function JoyEventCard({
  id,
  title,
  time,
  area,
  vibes,
  spotsLeft,
  myFit,
  groupSpark,
  socialProof
}: JoyEventCardProps) {
  return (
    <Link href={`/event/${id}`}>
      <Card className="hover-elevate active-elevate-2 transition-all border-0 cursor-pointer" data-testid={`card-event-${title.toLowerCase().replace(/\s+/g, '-')}`}>
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              <h3 className="font-display font-bold text-xl leading-tight">{title}</h3>
              <div className="flex gap-1.5 flex-wrap">
                {vibes.slice(0, 3).map((vibe, i) => (
                  <VibeChip key={i} emoji={vibe.emoji} label={vibe.label} gradient={vibe.gradient} />
                ))}
              </div>
            </div>
            <MatchScoreBadge myFit={myFit} groupSpark={groupSpark} />
          </div>

          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{time}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{area}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 text-sm">
              <Users className="h-4 w-4 text-primary" />
              <span className="font-medium">剩余 {spotsLeft} 位</span>
            </div>
            {socialProof && (
              <Badge variant="secondary" className="text-xs">
                {socialProof}
              </Badge>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
