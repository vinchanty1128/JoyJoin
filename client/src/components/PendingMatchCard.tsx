import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Users, DollarSign, Clock, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { BlindBoxEvent } from "@shared/schema";
import { getCurrencySymbol } from "@/lib/currency";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PendingMatchCardProps {
  event: BlindBoxEvent;
  onCancel: (eventId: string) => void;
}

export default function PendingMatchCard({ event, onCancel }: PendingMatchCardProps) {
  const currencySymbol = getCurrencySymbol(event.city as "香港" | "深圳");
  const progress = event.progress || 0;
  const etaText = event.etaMinutes 
    ? `预计${Math.floor(event.etaMinutes / 60)}-${Math.floor(event.etaMinutes / 60) + 1}小时`
    : "预计1-3小时";

  const formatDate = (dateTime: Date) => {
    const date = new Date(dateTime);
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekday = weekdays[date.getDay()];
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${weekday} ${hours}:${minutes}`;
  };

  return (
    <Card className="border shadow-sm" data-testid={`card-pending-${event.id}`}>
      <CardContent className="p-4 space-y-3">
        {/* 标题 */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="text-base font-semibold">{formatDate(event.dateTime)} · {event.eventType}</h3>
          </div>
          <Badge variant="secondary" className="text-xs bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
            匹配中
          </Badge>
        </div>

        {/* 地区/商圈 */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{event.city}•{event.district}</span>
          {event.acceptNearby && (
            <Badge variant="outline" className="text-xs">含相邻商圈</Badge>
          )}
        </div>

        {/* 预算档 */}
        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{currencySymbol}{event.budgetTier}</span>
        </div>

        {/* 目标人数 */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>4-6人</span>
        </div>

        {/* 匹配进度 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">正在为你匹配同频伙伴…</span>
            <span className="text-xs text-muted-foreground">{etaText}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* 已邀请 */}
        {(event.invitedCount || 0) > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>已邀请{event.invitedCount}位（{event.invitedJoined}位已加入）</span>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-2 pt-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 text-destructive hover:text-destructive"
                data-testid={`button-cancel-${event.id}`}
              >
                <X className="h-4 w-4 mr-1" />
                取消报名
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确认取消报名？</AlertDialogTitle>
                <AlertDialogDescription>
                  取消后将退还全额费用。确定要取消吗？
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>再想想</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => onCancel(event.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  确认取消
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
