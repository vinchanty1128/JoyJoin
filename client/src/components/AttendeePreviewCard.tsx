import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Briefcase } from "lucide-react";

const archetypeIcons: Record<string, string> = {
  "The Explorer": "🧭",
  "The Storyteller": "📖",
  "The Sage": "🦉",
  "The Radiator": "☀️",
  "The Anchor": "⚓",
  "探索者": "🧭",
  "讲故事的人": "📖",
  "智者": "🦉",
  "发光体": "☀️",
  "稳定器": "⚓",
};

const interestIcons: Record<string, string> = {
  "Film": "🎬",
  "Travel": "✈️",
  "Food": "🍜",
  "Music": "🎵",
  "Art": "🎨",
  "Sports": "⚽",
  "Reading": "📚",
  "Gaming": "🎮",
  "Photography": "📷",
  "Fitness": "💪",
  "电影": "🎬",
  "旅行": "✈️",
  "美食": "🍜",
  "音乐": "🎵",
  "艺术": "🎨",
  "运动": "⚽",
  "阅读": "📚",
  "游戏": "🎮",
  "摄影": "📷",
  "健身": "💪",
};

interface AttendeeData {
  userId: string;
  displayName: string;
  archetype?: string;
  topInterests?: string[]; // 1-2 top interests
  ageBand?: string;
  industry?: string;
  ageVisible?: boolean;
  industryVisible?: boolean;
}

interface AttendeePreviewCardProps {
  attendee: AttendeeData;
}

export default function AttendeePreviewCard({ attendee }: AttendeePreviewCardProps) {
  const archetypeIcon = attendee.archetype ? archetypeIcons[attendee.archetype] || "✨" : "✨";
  
  const topInterests = (attendee.topInterests || []).slice(0, 2);
  
  const showContextLine = (attendee.ageVisible && attendee.ageBand) || (attendee.industryVisible && attendee.industry);
  
  return (
    <Card 
      className="min-w-[160px] flex-shrink-0 hover-elevate transition-all" 
      data-testid={`card-attendee-${attendee.userId}`}
    >
      <CardContent className="p-4 space-y-2">
        <div className="font-semibold text-base" data-testid={`text-attendee-name-${attendee.userId}`}>
          {attendee.displayName}
        </div>
        
        {attendee.archetype && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <span className="text-base">{archetypeIcon}</span>
            <span data-testid={`text-attendee-archetype-${attendee.userId}`}>{attendee.archetype}</span>
          </div>
        )}
        
        {topInterests.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {topInterests.map((interest, idx) => (
              <Badge 
                key={idx} 
                variant="secondary" 
                className="text-xs gap-1 no-default-active-elevate"
                data-testid={`badge-interest-${attendee.userId}-${idx}`}
              >
                <span>{interestIcons[interest] || "·"}</span>
                <span>{interest}</span>
              </Badge>
            ))}
          </div>
        )}
        
        {showContextLine && (
          <div className="text-xs text-muted-foreground flex items-center gap-1.5" data-testid={`text-attendee-context-${attendee.userId}`}>
            {attendee.ageVisible && attendee.ageBand && (
              <>
                <User className="h-3 w-3" />
                <span>{attendee.ageBand}</span>
              </>
            )}
            {attendee.ageVisible && attendee.ageBand && attendee.industryVisible && attendee.industry && (
              <span>•</span>
            )}
            {attendee.industryVisible && attendee.industry && (
              <>
                <Briefcase className="h-3 w-3" />
                <span>{attendee.industry}</span>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
