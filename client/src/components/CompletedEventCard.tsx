import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import type { BlindBoxEvent } from "@shared/schema";
import { Link } from "wouter";

interface CompletedEventCardProps {
  event: BlindBoxEvent;
  hasFeedback: boolean;
}

export default function CompletedEventCard({ event, hasFeedback }: CompletedEventCardProps) {
  const eventDate = event.dateTime ? new Date(event.dateTime) : null;
  const formattedDate = eventDate ? format(eventDate, 'M月d日 (EEE)', { locale: zhCN }) : '';
  const formattedTime = eventDate ? format(eventDate, 'HH:mm') : '';
  
  const eventTypeDisplay = event.eventType === '饭局' ? '🍽️ 饭局' : '🍷 酒局';
  const totalPeople = event.totalParticipants || 0;

  return (
    <Card className="overflow-hidden hover-elevate transition-all" data-testid={`completed-event-card-${event.id}`}>
      <CardContent className="p-4 space-y-4">
        {/* Header: Event Type & Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">{eventTypeDisplay}</span>
            <Badge variant="outline" className="text-xs">已完成</Badge>
          </div>
          {hasFeedback && (
            <Badge className="bg-primary/10 text-primary">已反馈</Badge>
          )}
        </div>

        {/* Event Info Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {/* Date */}
          <div className="flex items-center gap-2 text-foreground">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formattedDate}</span>
          </div>

          {/* Time */}
          <div className="flex items-center gap-2 text-foreground">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{formattedTime}</span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-foreground col-span-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">
              {event.restaurantName || `${event.city} · ${event.district}`}
            </span>
          </div>

          {/* Participants */}
          <div className="flex items-center gap-2 text-foreground">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{totalPeople}人参加</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {!hasFeedback && (
            <Link href={`/events/${event.id}/feedback`} className="flex-1">
              <Button 
                className="w-full" 
                size="default"
                data-testid={`button-give-feedback-${event.id}`}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                分享反馈
              </Button>
            </Link>
          )}
          
          <Link href={`/blind-box-events/${event.id}`} className={hasFeedback ? "flex-1" : ""}>
            <Button 
              variant={hasFeedback ? "default" : "outline"} 
              className="w-full"
              data-testid={`button-view-details-${event.id}`}
            >
              查看详情
            </Button>
          </Link>
        </div>

        {/* Feedback Incentive (only if no feedback) */}
        {!hasFeedback && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
            <span className="text-2xl">🎁</span>
            <div className="flex-1">
              <p className="text-xs font-medium text-primary">分享体验获得50积分</p>
              <p className="text-xs text-muted-foreground">帮助我们做得更好</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
