import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Sparkles } from "lucide-react";
import { Link } from "wouter";
import MatchScoreBadge from "./MatchScoreBadge";
import ParticipantAvatars from "./ParticipantAvatars";

interface JoyEventCardProps {
  id: string;
  title: string;
  time: string;
  area: string;
  price: string;
  spotsLeft: number;
  myFit: number;
  groupSpark?: "High" | "Medium" | "Low";
  iconName?: string;
  socialProof?: string;
  discount?: number;
  participants?: Array<{ id: string; displayName: string | null }>;
  attendeeCount?: number;
}

export default function JoyEventCard({
  id,
  title,
  time,
  area,
  spotsLeft,
  myFit,
  groupSpark,
  socialProof,
  discount,
  participants = [],
  attendeeCount = 0
}: JoyEventCardProps) {
  return (
    <Link href={`/event/${id}`}>
      <Card className="hover-elevate active-elevate-2 transition-all cursor-pointer border shadow-sm" data-testid={`card-event-${title.toLowerCase().replace(/\s+/g, '-')}`}>
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              <div className="flex items-start gap-2">
                <h3 className="font-display font-bold text-xl leading-tight flex-1">{title}</h3>
                {discount && discount > 0 && (
                  <Badge className="bg-primary/10 text-primary border-0 gap-1">
                    <Sparkles className="h-3 w-3" />
                    <span className="text-xs font-semibold">-{discount}%</span>
                  </Badge>
                )}
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
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">参与者</span>
              <ParticipantAvatars 
                participants={participants} 
                maxDisplay={8}
                size="sm"
              />
              {attendeeCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  {spotsLeft > 0 ? `剩余 ${spotsLeft} 位` : '已满'}
                </span>
              )}
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
