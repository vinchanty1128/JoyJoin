import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Users, Sparkles } from "lucide-react";
import {
  calculateCommonInterests,
  calculateArchetypeDistribution,
  calculateGroupInsights,
  type AttendeeData,
} from "@/lib/attendeeAnalytics";

const interestIcons: Record<string, string> = {
  "电影": "🎬",
  "电影娱乐": "🎬",
  "旅行": "✈️",
  "旅行探索": "✈️",
  "美食": "🍜",
  "美食餐饮": "🍜",
  "音乐": "🎵",
  "音乐演出": "🎵",
  "艺术": "🎨",
  "艺术文化": "🎨",
  "运动": "⚽",
  "运动健身": "⚽",
  "阅读": "📚",
  "阅读书籍": "📚",
  "游戏": "🎮",
  "摄影": "📷",
  "健身": "💪",
  "健身健康": "💪",
  "科技": "💻",
  "创业": "🚀",
  "社交拓展": "🤝",
  "户外活动": "🏕️",
  "瑜伽冥想": "🧘",
  "品酒": "🍷",
  "咖啡茶艺": "☕",
  "烹饪烘焙": "👨‍🍳",
};

const archetypeIcons: Record<string, string> = {
  "探索者": "🧭",
  "讲故事的人": "📖",
  "智者": "🦉",
  "发光体": "☀️",
  "稳定器": "⚓",
};

interface GroupSummaryCardProps {
  attendees: AttendeeData[];
}

export default function GroupSummaryCard({ attendees }: GroupSummaryCardProps) {
  const commonInterests = calculateCommonInterests(attendees);
  const archetypeDistribution = calculateArchetypeDistribution(attendees);
  const groupInsights = calculateGroupInsights(attendees);

  if (attendees.length === 0) {
    return null;
  }

  return (
    <Card className="mb-4" data-testid="card-group-summary">
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Target className="h-4 w-4 text-primary" />
            <span>本桌共同点</span>
          </div>
          {commonInterests.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {commonInterests.map((item, idx) => (
                <Badge
                  key={idx}
                  variant="default"
                  className="text-sm gap-1.5 no-default-active-elevate"
                  data-testid={`badge-common-interest-${idx}`}
                >
                  <span>{interestIcons[item.interest] || "·"}</span>
                  <span>{item.interest}</span>
                  {item.count > 1 && (
                    <span className="text-xs opacity-80">×{item.count}</span>
                  )}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">正在分析共同点...</p>
          )}
        </div>

        {groupInsights.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>潜在契合点</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {groupInsights.map((insight, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="text-sm gap-1.5 no-default-active-elevate"
                  data-testid={`badge-group-insight-${idx}`}
                >
                  <span>{insight.icon}</span>
                  <span>{insight.label}</span>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {archetypeDistribution.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4 text-primary" />
              <span>人群构成</span>
            </div>
            <div className="space-y-2">
              {archetypeDistribution.map((item, idx) => (
                <div key={idx} className="space-y-1" data-testid={`archetype-distribution-${idx}`}>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span>{archetypeIcons[item.archetype] || "✨"}</span>
                      <span className="text-muted-foreground">{item.archetype}</span>
                    </div>
                    <span className="font-medium">{item.percentage}%</span>
                  </div>
                  <Progress value={item.percentage} className="h-1.5" />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
