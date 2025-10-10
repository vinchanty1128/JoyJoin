import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Users } from "lucide-react";
import VibeChip from "./VibeChip";
import DualMatchScore from "./DualMatchScore";
import { VibeType } from "@/lib/vibes";

interface JoyEventCardProps {
  title: string;
  time: string;
  area: string;
  price: string;
  vibes: VibeType[];
  spotsLeft: number;
  myFit: number;
  groupSpark: "High" | "Medium" | "Low";
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
    <Card className="overflow-hidden hover-elevate active-elevate-2 transition-all cursor-pointer" data-testid={`card-event-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className={`h-36 bg-gradient-to-br ${imageGradient} relative`}>
        <div className="absolute top-2 left-2 flex gap-1">
          {vibes.slice(0, 3).map((vibe, i) => (
            <VibeChip key={i} vibe={vibe} />
          ))}
        </div>
        <div className="absolute top-2 right-2">
          <DualMatchScore myFit={myFit} groupSpark={groupSpark} />
        </div>
        {socialProof && (
          <div className="absolute bottom-2 right-2">
            <Badge className="text-[10px] px-2 py-0.5 bg-background/90 backdrop-blur-sm text-foreground border-0">
              {socialProof}
            </Badge>
          </div>
        )}
      </div>
      
      <div className="p-3 space-y-2">
        <h3 className="font-bold text-base leading-tight">{title}</h3>
        
        <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {time}
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {area}
          </div>
          <span>•</span>
          <span className="font-medium text-foreground">{price}</span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1 text-xs">
            <Users className="h-3.5 w-3.5 text-primary" />
            <span className="font-medium text-primary">{spotsLeft} spots left</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
