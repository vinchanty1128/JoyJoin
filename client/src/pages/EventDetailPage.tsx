import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, MapPin, DollarSign, Users, ChevronDown } from "lucide-react";
import { useLocation } from "wouter";
import VibeChip from "@/components/VibeChip";
import GroupSparkMeter from "@/components/GroupSparkMeter";
import { useState } from "react";

export default function EventDetailPage() {
  const [showSafety, setShowSafety] = useState(false);
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center h-14 px-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setLocation("/")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="ml-2 font-semibold">活动详情</h1>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-2xl font-display font-bold flex-1">墨西哥卷挑战赛</h2>
              <span className="text-xl font-bold text-primary">¥88</span>
            </div>

            <div className="flex gap-1.5 flex-wrap">
              <VibeChip emoji="⚡" label="活力" gradient="from-orange-400 to-red-500" />
              <VibeChip emoji="🎈" label="玩乐" gradient="from-pink-400 to-rose-400" />
              <VibeChip emoji="🤝" label="社交" gradient="from-violet-400 to-purple-400" />
            </div>
            
            <p className="text-sm text-muted-foreground">
              快节奏游戏+精酿啤酒。期待欢笑、团队轮换和友好的主持人。
            </p>

            <div className="flex items-center gap-2 pt-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">LN</AvatarFallback>
              </Avatar>
              <div className="text-xs">
                <p className="font-medium">主办 Luna</p>
                <p className="text-muted-foreground">启动者 & 破冰专家 ⚡</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card className="border-0 bg-muted/30">
            <CardContent className="p-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <div className="text-xs">
                <p className="font-medium">开始时间</p>
                <p className="text-muted-foreground">今晚 7:30</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-muted/30">
            <CardContent className="p-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <div className="text-xs">
                <p className="font-medium">地点</p>
                <p className="text-muted-foreground">中环</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-muted/30">
            <CardContent className="p-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <div className="text-xs">
                <p className="font-medium">价格</p>
                <p className="text-muted-foreground">¥88</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-muted/30">
            <CardContent className="p-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <div className="text-xs">
                <p className="font-medium">剩余名额</p>
                <p className="text-muted-foreground">3 / 8</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <GroupSparkMeter energizers={3} connectors={2} reflectors={3} />

        <Card className="border-0 bg-muted/30">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold text-sm">活动流程</h3>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex gap-2">
                <span className="font-medium text-foreground">7:30</span>
                <span>热身 • 到场取饮品</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium text-foreground">7:45</span>
                <span>破冰 • 快速介绍游戏</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium text-foreground">8:00</span>
                <span>团队轮换 • 墨西哥卷挑战赛</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium text-foreground">9:00</span>
                <span>放松 • 自由交流+交换联系方式</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="border-0 bg-muted/30 cursor-pointer hover-elevate active-elevate-2 transition-all"
          onClick={() => setShowSafety(!showSafety)}
          data-testid="card-safety-comfort"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">安全与舒适</h3>
              <ChevronDown className={`h-4 w-4 transition-transform ${showSafety ? 'rotate-180' : ''}`} />
            </div>
            {showSafety && (
              <div className="mt-3 space-y-2 text-xs text-muted-foreground">
                <p>• 无障碍场地</p>
                <p>• 提供素食和清真选择</p>
                <p>• 无酒精饮品</p>
                <p>• 安静休息区</p>
                <p>• 行为守则严格执行</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 bg-primary/5">
          <CardContent className="p-3 space-y-2">
            <p className="text-xs font-medium">为什么推荐给你：</p>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="secondary" className="text-[10px]">你 + 2位启动者 = 完美节奏</Badge>
              <Badge variant="secondary" className="text-[10px]">共同兴趣：桌游、居酒屋</Badge>
              <Badge variant="secondary" className="text-[10px]">平衡：3位高能量、4位沉思型</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 flex gap-3">
        <Button variant="outline" className="flex-1" data-testid="button-shortlist">
          收藏更多
        </Button>
        <Button className="flex-1" data-testid="button-join">
          加入这个氛围
        </Button>
      </div>
    </div>
  );
}
