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
    // 12个社交动物原型的颜色配置
    const archetypeColors: Record<string, string> = {
      "开心柯基": "#f97316",      // orange-600
      "太阳鸡": "#f59e0b",        // amber-600
      "夸夸豚": "#06b6d4",        // cyan-600
      "机智狐": "#ea580c",        // orange-700
      "淡定海豚": "#4f46e5",      // indigo-600
      "织网蛛": "#a855f7",        // purple-600
      "暖心熊": "#ec4899",        // pink-600
      "灵感章鱼": "#8b5cf6",      // violet-600
      "沉思猫头鹰": "#64748b",    // slate-600
      "定心大象": "#6b7280",      // gray-600
      "稳如龟": "#10b981",        // emerald-600
      "隐身猫": "#6366f1",        // indigo-500
    };

    const archetypeEmojis: Record<string, string> = {
      "开心柯基": "🐕",
      "太阳鸡": "🐓",
      "夸夸豚": "🐬",
      "机智狐": "🦊",
      "淡定海豚": "🐬",
      "织网蛛": "🕷️",
      "暖心熊": "🐻",
      "灵感章鱼": "🐙",
      "沉思猫头鹰": "🦉",
      "定心大象": "🐘",
      "稳如龟": "🐢",
      "隐身猫": "🐱",
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
