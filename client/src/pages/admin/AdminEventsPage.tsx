import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar, Users, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useWebSocket } from "@/hooks/useWebSocket";
import { invalidateCacheForEvent } from "@/lib/cacheInvalidation";

interface EventCreator {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phoneNumber: string | null;
}

interface BlindBoxEvent {
  id: string;
  userId: string;
  title: string;
  eventType: string;
  city: string;
  district: string;
  dateTime: string;
  budgetTier: string;
  selectedLanguages: string[] | null;
  selectedTasteIntensity: string[] | null;
  selectedCuisines: string[] | null;
  acceptNearby: boolean;
  status: string;
  progress: number;
  currentParticipants: number;
  etaMinutes: number | null;
  restaurantName: string | null;
  restaurantAddress: string | null;
  totalParticipants: number | null;
  maleCount: number | null;
  femaleCount: number | null;
  isGirlsNight: boolean;
  matchedAttendees: any[] | null;
  matchExplanation: string | null;
  invitedCount: number;
  invitedJoined: number;
  createdAt: string;
  updatedAt: string;
  creator?: EventCreator;
}

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending_match: { label: "待匹配", variant: "secondary" },
  matched: { label: "已匹配", variant: "default" },
  completed: { label: "已完成", variant: "outline" },
  canceled: { label: "已取消", variant: "destructive" },
};

export default function AdminEventsPage() {
  const [filterStatus, setFilterStatus] = useState<"all" | "pending_match" | "matched" | "completed">("all");
  const [selectedEvent, setSelectedEvent] = useState<BlindBoxEvent | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  
  const { toast } = useToast();
  const { subscribe, isConnected } = useWebSocket();

  const { data: events = [], isLoading } = useQuery<BlindBoxEvent[]>({
    queryKey: ["/api/admin/events"],
  });

  // WebSocket实时更新订阅
  useEffect(() => {
    const unsubscribeStatus = subscribe('EVENT_STATUS_CHANGED', async (message) => {
      console.log('[Admin] Event status changed:', message);
      await invalidateCacheForEvent(message);
      
      const statusData = message.data as any;
      toast({
        title: "活动状态更新",
        description: `活动"${statusData.eventTitle || '未知'}"状态已变更为: ${statusData.newStatus}`,
      });
    });

    const unsubscribeMatched = subscribe('EVENT_MATCHED', async (message) => {
      console.log('[Admin] Event matched:', message);
      await invalidateCacheForEvent(message);
      
      toast({
        title: "新匹配完成",
        description: "有活动完成匹配，列表已更新",
      });
    });

    const unsubscribeUser = subscribe('USER_CONFIRMED', async (message) => {
      console.log('[Admin] User confirmed:', message);
      await invalidateCacheForEvent(message);
    });

    const unsubscribeCompleted = subscribe('EVENT_COMPLETED', async (message) => {
      console.log('[Admin] Event completed:', message);
      await invalidateCacheForEvent(message);
      
      toast({
        title: "活动已完成",
        description: "有活动已标记为完成",
      });
    });

    return () => {
      unsubscribeStatus();
      unsubscribeMatched();
      unsubscribeUser();
      unsubscribeCompleted();
    };
  }, [subscribe, toast]);

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      fetch(`/api/admin/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/events"] });
      toast({
        title: "状态更新成功",
        description: "活动状态已更新",
      });
    },
    onError: () => {
      toast({
        title: "更新失败",
        description: "无法更新活动状态，请重试",
        variant: "destructive",
      });
    },
  });

  const handleViewDetails = async (event: BlindBoxEvent) => {
    // Fetch detailed event data
    try {
      const response = await fetch(`/api/admin/events/${event.id}`, {
        credentials: "include",
      });
      const detailedEvent = await response.json();
      setSelectedEvent(detailedEvent);
      setShowDetailsDialog(true);
    } catch (error) {
      toast({
        title: "加载失败",
        description: "无法加载活动详情",
        variant: "destructive",
      });
    }
  };

  const handleStatusUpdate = (newStatus: string) => {
    if (selectedEvent) {
      updateStatusMutation.mutate({ id: selectedEvent.id, status: newStatus });
      setSelectedEvent({ ...selectedEvent, status: newStatus });
    }
  };

  const filteredEvents = filterStatus === "all" 
    ? events 
    : events.filter(e => e.status === filterStatus);

  const totalEvents = events.length;
  const pendingCount = events.filter(e => e.status === "pending_match").length;
  const matchedCount = events.filter(e => e.status === "matched").length;
  const completedCount = events.filter(e => e.status === "completed").length;

  const formatDateTime = (dateTimeStr: string) => {
    try {
      const date = new Date(dateTimeStr);
      return format(date, "yyyy年MM月dd日 HH:mm", { locale: zhCN });
    } catch (e) {
      return dateTimeStr;
    }
  };

  const getCreatorName = (event: BlindBoxEvent) => {
    if (!event.creator) return "未知用户";
    const firstName = event.creator.firstName || "";
    const lastName = event.creator.lastName || "";
    return `${firstName} ${lastName}`.trim() || event.creator.email || "未知用户";
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} data-testid={`skeleton-metric-${i}`}>
                <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">加载中...</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">--</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card data-testid="card-metric-total">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总活动数</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-events">{totalEvents}</div>
            <p className="text-xs text-muted-foreground">所有盲盒活动</p>
          </CardContent>
        </Card>

        <Card data-testid="card-metric-pending">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待匹配</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-pending-events">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">等待匹配中</p>
          </CardContent>
        </Card>

        <Card data-testid="card-metric-matched">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已匹配</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-matched-events">{matchedCount}</div>
            <p className="text-xs text-muted-foreground">成功匹配</p>
          </CardContent>
        </Card>

        <Card data-testid="card-metric-completed">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已完成</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-completed-events">{completedCount}</div>
            <p className="text-xs text-muted-foreground">活动已结束</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Card data-testid="card-events-list">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>活动列表</CardTitle>
          </div>
          <Tabs value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
            <TabsList data-testid="tabs-filter">
              <TabsTrigger value="all" data-testid="tab-all">全部</TabsTrigger>
              <TabsTrigger value="pending_match" data-testid="tab-pending">待匹配</TabsTrigger>
              <TabsTrigger value="matched" data-testid="tab-matched">已匹配</TabsTrigger>
              <TabsTrigger value="completed" data-testid="tab-completed">已完成</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {filteredEvents.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground" data-testid="text-no-events">
              暂无活动
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event) => (
                <Card key={event.id} className="overflow-hidden" data-testid={`card-event-${event.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-1">
                        <CardTitle className="text-base" data-testid={`text-event-title-${event.id}`}>
                          {event.title}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" data-testid={`badge-event-type-${event.id}`}>
                            {event.eventType}
                          </Badge>
                          <Badge 
                            variant={STATUS_MAP[event.status]?.variant || "default"}
                            data-testid={`badge-event-status-${event.id}`}
                          >
                            {STATUS_MAP[event.status]?.label || event.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">创建者:</span>
                        <span data-testid={`text-creator-name-${event.id}`}>
                          {getCreatorName(event)}
                        </span>
                      </div>
                      {event.creator?.email && (
                        <div className="text-xs text-muted-foreground" data-testid={`text-creator-email-${event.id}`}>
                          {event.creator.email}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span data-testid={`text-event-datetime-${event.id}`}>
                          {formatDateTime(event.dateTime)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span data-testid={`text-participants-${event.id}`}>
                          {event.currentParticipants}/{event.totalParticipants || "?"} 参与者
                        </span>
                      </div>
                      {(event.restaurantName || event.city) && (
                        <div className="text-xs text-muted-foreground" data-testid={`text-location-${event.id}`}>
                          📍 {event.restaurantName || `${event.city} ${event.district}`}
                        </div>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleViewDetails(event)}
                      data-testid={`button-view-details-${event.id}`}
                    >
                      查看详情
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto" data-testid="dialog-event-details">
          <DialogHeader>
            <DialogTitle data-testid="text-dialog-title">
              {selectedEvent?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-3">
                <h3 className="font-semibold">基本信息</h3>
                <div className="grid gap-3 text-sm">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-muted-foreground">活动类型:</span>
                    <span className="col-span-2" data-testid="text-detail-event-type">
                      {selectedEvent.eventType}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-muted-foreground">活动时间:</span>
                    <span className="col-span-2" data-testid="text-detail-datetime">
                      {formatDateTime(selectedEvent.dateTime)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-muted-foreground">城市/商圈:</span>
                    <span className="col-span-2" data-testid="text-detail-location">
                      {selectedEvent.city} - {selectedEvent.district}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-muted-foreground">预算:</span>
                    <span className="col-span-2" data-testid="text-detail-budget">
                      ¥{selectedEvent.budgetTier}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-muted-foreground">状态:</span>
                    <div className="col-span-2">
                      <Badge 
                        variant={STATUS_MAP[selectedEvent.status]?.variant || "default"}
                        data-testid="badge-detail-status"
                      >
                        {STATUS_MAP[selectedEvent.status]?.label || selectedEvent.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Creator Info */}
              <div className="space-y-3">
                <h3 className="font-semibold">创建者信息</h3>
                <div className="grid gap-3 text-sm">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-muted-foreground">姓名:</span>
                    <span className="col-span-2" data-testid="text-detail-creator-name">
                      {getCreatorName(selectedEvent)}
                    </span>
                  </div>
                  {selectedEvent.creator?.email && (
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-muted-foreground">邮箱:</span>
                      <span className="col-span-2" data-testid="text-detail-creator-email">
                        {selectedEvent.creator.email}
                      </span>
                    </div>
                  )}
                  {selectedEvent.creator?.phoneNumber && (
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-muted-foreground">电话:</span>
                      <span className="col-span-2" data-testid="text-detail-creator-phone">
                        {selectedEvent.creator.phoneNumber}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Preferences */}
              <div className="space-y-3">
                <h3 className="font-semibold">活动偏好</h3>
                <div className="grid gap-3 text-sm">
                  {selectedEvent.selectedLanguages && selectedEvent.selectedLanguages.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-muted-foreground">语言:</span>
                      <span className="col-span-2" data-testid="text-detail-languages">
                        {selectedEvent.selectedLanguages.join(", ")}
                      </span>
                    </div>
                  )}
                  {selectedEvent.selectedCuisines && selectedEvent.selectedCuisines.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-muted-foreground">菜系:</span>
                      <span className="col-span-2" data-testid="text-detail-cuisines">
                        {selectedEvent.selectedCuisines.join(", ")}
                      </span>
                    </div>
                  )}
                  {selectedEvent.selectedTasteIntensity && selectedEvent.selectedTasteIntensity.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-muted-foreground">口味强度:</span>
                      <span className="col-span-2" data-testid="text-detail-taste">
                        {selectedEvent.selectedTasteIntensity.join(", ")}
                      </span>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-muted-foreground">接受附近:</span>
                    <span className="col-span-2" data-testid="text-detail-nearby">
                      {selectedEvent.acceptNearby ? "是" : "否"}
                    </span>
                  </div>
                  {selectedEvent.isGirlsNight && (
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-muted-foreground">女生专场:</span>
                      <span className="col-span-2" data-testid="text-detail-girls-night">
                        是
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Matched Details */}
              {(selectedEvent.status === "matched" || selectedEvent.status === "completed") && (
                <>
                  {selectedEvent.restaurantName && (
                    <div className="space-y-3">
                      <h3 className="font-semibold">场地信息</h3>
                      <div className="grid gap-3 text-sm">
                        <div className="grid grid-cols-3 gap-2">
                          <span className="text-muted-foreground">餐厅名称:</span>
                          <span className="col-span-2" data-testid="text-detail-restaurant">
                            {selectedEvent.restaurantName}
                          </span>
                        </div>
                        {selectedEvent.restaurantAddress && (
                          <div className="grid grid-cols-3 gap-2">
                            <span className="text-muted-foreground">地址:</span>
                            <span className="col-span-2" data-testid="text-detail-address">
                              {selectedEvent.restaurantAddress}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedEvent.matchedAttendees && selectedEvent.matchedAttendees.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-semibold">参与者列表</h3>
                      <div className="space-y-2">
                        {selectedEvent.matchedAttendees.map((attendee: any, idx: number) => (
                          <div 
                            key={idx} 
                            className="rounded-lg border p-3 text-sm"
                            data-testid={`card-attendee-${idx}`}
                          >
                            <div className="font-medium" data-testid={`text-attendee-name-${idx}`}>
                              {attendee.displayName || "匿名用户"}
                            </div>
                            {attendee.archetype && (
                              <div className="text-xs text-muted-foreground">
                                {attendee.archetype}
                              </div>
                            )}
                            {attendee.topInterests && attendee.topInterests.length > 0 && (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {attendee.topInterests.map((interest: string, i: number) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {interest}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedEvent.matchExplanation && (
                    <div className="space-y-3">
                      <h3 className="font-semibold">匹配说明</h3>
                      <p className="text-sm text-muted-foreground" data-testid="text-detail-explanation">
                        {selectedEvent.matchExplanation}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Status Update */}
              <div className="space-y-3">
                <h3 className="font-semibold">管理操作</h3>
                <div className="flex items-center gap-3">
                  <Label>更新状态:</Label>
                  <Select 
                    value={selectedEvent.status} 
                    onValueChange={handleStatusUpdate}
                  >
                    <SelectTrigger className="w-40" data-testid="select-update-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending_match" data-testid="option-status-pending">
                        待匹配
                      </SelectItem>
                      <SelectItem value="matched" data-testid="option-status-matched">
                        已匹配
                      </SelectItem>
                      <SelectItem value="completed" data-testid="option-status-completed">
                        已完成
                      </SelectItem>
                      <SelectItem value="canceled" data-testid="option-status-canceled">
                        已取消
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
