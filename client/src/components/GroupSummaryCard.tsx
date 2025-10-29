import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import {
  calculateArchetypeDistribution,
  calculateGroupInsights,
  archetypeDescriptions,
  type AttendeeData,
} from "@/lib/attendeeAnalytics";
import InteractiveArchetypeChart from "./InteractiveArchetypeChart";

interface GroupSummaryCardProps {
  attendees: AttendeeData[];
}

export default function GroupSummaryCard({ attendees }: GroupSummaryCardProps) {
  const archetypeDistribution = calculateArchetypeDistribution(attendees);
  const groupInsights = calculateGroupInsights(attendees);

  if (attendees.length === 0) {
    return null;
  }

  const archetypeChartData = archetypeDistribution.map(item => {
    // 8个核心社交角色的颜色配置 - 与UserConnectionCard保持一致
    const archetypeColors: Record<string, string> = {
      "火花塞": "#f97316",      // orange-600
      "探索者": "#06b6d4",      // cyan-600
      "故事家": "#a855f7",      // purple-600
      "挑战者": "#dc2626",      // red-600
      "连接者": "#10b981",      // emerald-600
      "协调者": "#4f46e5",      // indigo-600
      "氛围组": "#c026d3",      // fuchsia-600
      "肯定者": "#14b8a6",      // teal-600
    };

    const archetypeEmojis: Record<string, string> = {
      "火花塞": "🙌",
      "探索者": "🧭",
      "故事家": "🗣️",
      "挑战者": "💪",
      "连接者": "🤗",
      "协调者": "🧘",
      "氛围组": "🕺",
      "肯定者": "🙏",
    };

    return {
      name: item.archetype,
      percentage: item.percentage,
      color: archetypeColors[item.archetype] || "hsl(var(--primary))",
      emoji: archetypeEmojis[item.archetype] || "✨",
      description: archetypeDescriptions[item.archetype] || "独特的个性魅力",
    };
  });

  return (
    <Card className="mb-4 overflow-hidden" data-testid="card-group-summary">
      <CardContent className="p-4 space-y-6">
        {groupInsights.length > 0 && (
          <div className="space-y-3">
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

        {archetypeChartData.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="text-lg">👥</span>
              <span>人群构成</span>
            </div>
            <InteractiveArchetypeChart data={archetypeChartData} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
