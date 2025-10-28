import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Sparkles } from "lucide-react";
import {
  calculateCommonInterests,
  calculateArchetypeDistribution,
  calculateGroupInsights,
  archetypeDescriptions,
  type AttendeeData,
} from "@/lib/attendeeAnalytics";
import InteractiveArchetypeChart from "./InteractiveArchetypeChart";
import InterestTagCloud from "./InterestTagCloud";

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

  const archetypeChartData = archetypeDistribution.map(item => {
    const archetypeColors: Record<string, string> = {
      "探索者": "hsl(var(--primary))",
      "讲故事的人": "#8B5CF6",
      "智者": "#0EA5E9",
      "发光体": "#F59E0B",
      "稳定器": "#10B981",
    };

    const archetypeEmojis: Record<string, string> = {
      "探索者": "🧭",
      "讲故事的人": "📖",
      "智者": "🦉",
      "发光体": "⭐",
      "稳定器": "⚓",
    };

    return {
      name: item.archetype,
      percentage: item.percentage,
      color: archetypeColors[item.archetype] || "hsl(var(--primary))",
      emoji: archetypeEmojis[item.archetype] || "✨",
      description: archetypeDescriptions[item.archetype] || "独特的个性魅力",
    };
  });

  const commonInterestNames = commonInterests.map(item => item.interest);

  return (
    <Card className="mb-4 overflow-hidden" data-testid="card-group-summary">
      <CardContent className="p-4 space-y-6">
        {commonInterestNames.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Target className="h-4 w-4 text-primary" />
              <span>都喜欢</span>
            </div>
            <InterestTagCloud interests={commonInterestNames} />
          </div>
        )}

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
