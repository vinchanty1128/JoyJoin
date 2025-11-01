import MobileHeader from "@/components/MobileHeader";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, MessageSquare } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { useMarkNotificationsAsRead } from "@/hooks/useNotificationCounts";
import ParticipantAvatars from "@/components/ParticipantAvatars";
import type { Event } from "@shared/schema";

type EventWithParticipants = Event & { 
  attendanceStatus: string; 
  attendeeCount: number;
  participants: Array<{ id: string; displayName: string | null; vibes: string[] | null }>;
};

export default function ChatsPage() {
  const [, setLocation] = useLocation();
  const markAsRead = useMarkNotificationsAsRead();

  // Auto-clear chat notifications when entering the page
  useEffect(() => {
    markAsRead.mutate('chat');
  }, []);
  
  const { data: joinedEvents, isLoading } = useQuery<Array<EventWithParticipants>>({
    queryKey: ["/api/events/joined"],
  });

  const formatDate = (dateTime: Date | null) => {
    if (!dateTime) return "";
    const date = new Date(dateTime);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${month}月${day}日 ${hours}:${minutes}`;
  };

  const isEventPast = (dateTime: Date | null) => {
    if (!dateTime) return false;
    return new Date(dateTime) < new Date();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-16">
        <MobileHeader title="聊天" />
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">加载中...</p>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <MobileHeader title="聊天" />
      
      <div className="px-4 py-4 space-y-4">
        <p className="text-sm text-muted-foreground">
          你参加的活动群聊
        </p>

        {!joinedEvents || joinedEvents.length === 0 ? (
          <Card className="border shadow-sm">
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">暂无活动</h3>
              <p className="text-sm text-muted-foreground">
                参加活动后，就可以在这里和其他参与者聊天了
              </p>
            </CardContent>
          </Card>
        ) : (
          joinedEvents.map((event) => {
            const isPast = isEventPast(event.dateTime);
            
            return (
              <Card 
                key={event.id} 
                className="hover-elevate active-elevate-2 transition-all cursor-pointer" 
                onClick={() => setLocation(`/chats/${event.id}`)}
                data-testid={`card-event-${event.id}`}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold">{event.title}</h3>
                        {isPast && (
                          <Badge variant="secondary" className="mt-1 text-[10px] h-5">
                            已结束
                          </Badge>
                        )}
                      </div>
                      <MessageSquare className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    </div>
                    
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDate(event.dateTime)}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{event.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">参与者</span>
                        <ParticipantAvatars 
                          participants={event.participants || []} 
                          maxDisplay={8}
                          size="sm"
                        />
                        {event.attendeeCount > 8 && (
                          <span className="text-xs text-muted-foreground ml-1">
                            共{event.attendeeCount}人
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <BottomNav />
    </div>
  );
}
