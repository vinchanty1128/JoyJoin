import MobileHeader from "@/components/MobileHeader";
import BottomNav from "@/components/BottomNav";
import PendingMatchCard from "@/components/PendingMatchCard";
import MatchedEventCard from "@/components/MatchedEventCard";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { BlindBoxEvent } from "@shared/schema";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EventsPage() {
  const [showCompleted, setShowCompleted] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: events, isLoading } = useQuery<Array<BlindBoxEvent>>({
    queryKey: ["/api/my-events"],
  });

  const cancelMutation = useMutation({
    mutationFn: async (eventId: string) => {
      return await apiRequest("POST", `/api/blind-box-events/${eventId}/cancel`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-events"] });
      toast({
        title: "已取消",
        description: "活动已取消，费用将原路退回",
      });
    },
    onError: (error) => {
      toast({
        title: "取消失败",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const pendingEvents = events?.filter(e => e.status === "pending_match") || [];
  const matchedEvents = events?.filter(e => e.status === "matched") || [];
  const completedEvents = events?.filter(e => e.status === "completed") || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-16">
        <MobileHeader title="活动" />
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

  const hasNoEvents = !events || events.length === 0;

  return (
    <div className="min-h-screen bg-background pb-16">
      <MobileHeader title="活动" />
      
      <div className="px-4 py-4 space-y-4">
        <p className="text-sm text-muted-foreground">
          展示你已报名的盲盒与已匹配活动
        </p>

        {hasNoEvents ? (
          <div className="text-center py-12">
            <div className="mb-4">
              <div className="h-16 w-16 rounded-full bg-muted mx-auto flex items-center justify-center">
                <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
            </div>
            <h3 className="font-semibold mb-2">你还没有正在匹配的盲盒</h3>
            <p className="text-sm text-muted-foreground">去发现页看看热门场次吧</p>
          </div>
        ) : (
          <>
            {/* 待匹配 Section */}
            {pendingEvents.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-muted-foreground">待匹配</h2>
                {pendingEvents.map(event => (
                  <PendingMatchCard 
                    key={event.id} 
                    event={event} 
                    onCancel={(eventId) => cancelMutation.mutate(eventId)}
                  />
                ))}
              </div>
            )}

            {/* 已匹配 Section */}
            {matchedEvents.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-muted-foreground">已匹配</h2>
                {matchedEvents.map(event => (
                  <MatchedEventCard key={event.id} event={event} />
                ))}
              </div>
            )}

            {/* 已结束 Section (可折叠) */}
            {completedEvents.length > 0 && (
              <div className="space-y-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="w-full justify-between text-sm font-semibold text-muted-foreground hover:bg-transparent"
                  data-testid="button-toggle-completed"
                >
                  已结束 ({completedEvents.length})
                  {showCompleted ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
                {showCompleted && completedEvents.map(event => (
                  <MatchedEventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
