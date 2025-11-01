import MobileHeader from "@/components/MobileHeader";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, MapPin, MessageSquare, Users, User, Lock, Clock } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useMarkNotificationsAsRead } from "@/hooks/useNotificationCounts";
import ParticipantAvatars from "@/components/ParticipantAvatars";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Event, DirectMessageThread } from "@shared/schema";

type EventWithParticipants = Event & { 
  attendanceStatus: string; 
  attendeeCount: number;
  participants: Array<{ id: string; displayName: string | null; vibes: string[] | null }>;
};

type DirectThreadWithUser = DirectMessageThread & {
  otherUser: {
    id: string;
    displayName: string | null;
    archetype: string | null;
  };
  lastMessage: {
    content: string;
    createdAt: Date;
  } | null;
};

export default function ChatsPage() {
  const [, setLocation] = useLocation();
  const markAsRead = useMarkNotificationsAsRead();
  const { toast } = useToast();
  const [isCreatingDemo, setIsCreatingDemo] = useState(false);

  const { data: joinedEvents, isLoading: isLoadingEvents } = useQuery<Array<EventWithParticipants>>({
    queryKey: ["/api/events/joined"],
  });

  const { data: directThreads, isLoading: isLoadingThreads } = useQuery<Array<DirectThreadWithUser>>({
    queryKey: ["/api/direct-messages"],
  });

  const createNotificationMutation = useMutation({
    mutationFn: async (data: {
      category: string;
      type: string;
      title: string;
      message: string;
      relatedResourceId?: string;
    }) => {
      return await apiRequest("POST", "/api/notifications", data);
    },
  });

  const createDemoChats = async () => {
    try {
      setIsCreatingDemo(true);
      const response: any = await apiRequest("POST", "/api/chats/seed-demo", {});
      
      if (response.success) {
        toast({
          title: "演示数据创建成功",
          description: "已创建3个演示聊天窗口",
        });
        
        // Invalidate and refetch
        await queryClient.invalidateQueries({ queryKey: ["/api/events/joined"] });
        await queryClient.invalidateQueries({ queryKey: ["/api/direct-messages"] });
      }
    } catch (error) {
      toast({
        title: "创建失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsCreatingDemo(false);
    }
  };

  // Check if chat is unlocked (24 hours before event or event has passed)
  const isChatUnlocked = (eventDateTime: Date | null) => {
    if (!eventDateTime) return false;
    const now = new Date();
    const eventDate = new Date(eventDateTime);
    const hoursUntilEvent = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilEvent <= 24 || now > eventDate;
  };

  // Get unlock countdown text
  const getUnlockCountdown = (eventDateTime: Date | null) => {
    if (!eventDateTime) return "";
    const now = new Date();
    const eventDate = new Date(eventDateTime);
    const unlockTime = new Date(eventDate.getTime() - 24 * 60 * 60 * 1000); // 24 hours before
    
    if (now >= unlockTime) return "";
    
    const msUntilUnlock = unlockTime.getTime() - now.getTime();
    const days = Math.floor(msUntilUnlock / (1000 * 60 * 60 * 24));
    const hours = Math.floor((msUntilUnlock % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((msUntilUnlock % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days}天${hours}小时后开放`;
    } else if (hours > 0) {
      return `${hours}小时${minutes}分钟后开放`;
    } else {
      return `${minutes}分钟后开放`;
    }
  };

  // Auto-clear chat notifications when entering the page
  useEffect(() => {
    markAsRead.mutate('chat');
  }, []);

  // Check for newly unlocked chats and send notifications
  useEffect(() => {
    if (!joinedEvents || joinedEvents.length === 0) return;

    const notifiedChats = JSON.parse(localStorage.getItem('chat_unlock_notified') || '[]');
    
    joinedEvents.forEach((event) => {
      const isUnlocked = isChatUnlocked(event.dateTime);
      const alreadyNotified = notifiedChats.includes(event.id);
      
      if (isUnlocked && !alreadyNotified) {
        // Send unlock notification
        createNotificationMutation.mutate({
          category: 'chat',
          type: 'chat_unlocked',
          title: '群聊已开放',
          message: `「${event.title}」的群聊已开放，快来认识新朋友吧！`,
          relatedResourceId: event.id,
        });
        
        // Mark as notified
        const updated = [...notifiedChats, event.id];
        localStorage.setItem('chat_unlock_notified', JSON.stringify(updated));
      }
    });
  }, [joinedEvents]);

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

  const isLoading = isLoadingEvents || isLoadingThreads;

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

  const hasGroupChats = joinedEvents && joinedEvents.length > 0;
  const hasDirectChats = directThreads && directThreads.length > 0;

  return (
    <div className="min-h-screen bg-background pb-16">
      <MobileHeader title="聊天" />
      
      {!hasGroupChats && !hasDirectChats ? (
        <div className="px-4 py-4">
          <Card className="border shadow-sm">
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">暂无聊天</h3>
              <p className="text-sm text-muted-foreground mb-4">
                参加活动并与其他参与者匹配后，就可以在这里聊天了
              </p>
              <Button 
                onClick={createDemoChats}
                disabled={isCreatingDemo}
                variant="outline"
                size="sm"
                data-testid="button-create-demo"
              >
                {isCreatingDemo ? "创建中..." : "创建演示聊天（测试用）"}
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Direct chats section */}
          {hasDirectChats && (
            <div className="px-4 pt-4 space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">
                  私聊 ({directThreads.length})
                </p>
              </div>

              {directThreads.map((thread) => (
                <Card 
                  key={thread.id} 
                  className="hover-elevate active-elevate-2 transition-all cursor-pointer" 
                  onClick={() => setLocation(`/direct-chat/${thread.id}`)}
                  data-testid={`card-direct-${thread.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {thread.otherUser.displayName?.[0] || "?"}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold truncate">
                            {thread.otherUser.displayName || "用户"}
                          </h3>
                          {thread.lastMessage && (
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              {new Date(thread.lastMessage.createdAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>
                        
                        {thread.otherUser.archetype && (
                          <Badge variant="secondary" className="text-[10px] h-5 mb-2">
                            {thread.otherUser.archetype}
                          </Badge>
                        )}
                        
                        {thread.lastMessage ? (
                          <p className="text-sm text-muted-foreground truncate">
                            {thread.lastMessage.content}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">
                            开始聊天吧
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Group chats section */}
          {hasGroupChats && (
            <div className="px-4 pb-4 space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">
                  群聊 ({joinedEvents.length})
                </p>
              </div>

              {joinedEvents.map((event) => {
                const isPast = isEventPast(event.dateTime);
                const chatUnlocked = isChatUnlocked(event.dateTime);
                const countdown = getUnlockCountdown(event.dateTime);
                
                return (
                  <Card 
                    key={event.id} 
                    className={`hover-elevate active-elevate-2 transition-all cursor-pointer ${
                      !chatUnlocked && !isPast ? 'opacity-60' : ''
                    }`}
                    onClick={() => setLocation(`/chats/${event.id}`)}
                    data-testid={`card-event-${event.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{event.title}</h3>
                              {!chatUnlocked && !isPast && (
                                <Lock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              {isPast && (
                                <Badge variant="secondary" className="text-[10px] h-5">
                                  已结束
                                </Badge>
                              )}
                              {!chatUnlocked && !isPast && countdown && (
                                <Badge variant="outline" className="text-[10px] h-5 border-primary/30 text-primary">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {countdown}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <MessageSquare className={`h-5 w-5 flex-shrink-0 ${
                            chatUnlocked || isPast ? 'text-primary' : 'text-muted-foreground'
                          }`} />
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
              })}
            </div>
          )}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
