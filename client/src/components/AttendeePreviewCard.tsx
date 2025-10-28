import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Briefcase, RotateCw } from "lucide-react";
import {
  calculateCommonInterestsWithUser,
  generatePersonalizedDescription,
  type AttendeeData,
} from "@/lib/attendeeAnalytics";

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
  "科技": "💻",
};

interface AttendeePreviewCardProps {
  attendee: AttendeeData;
  userInterests?: string[];
}

export default function AttendeePreviewCard({
  attendee,
  userInterests = [],
}: AttendeePreviewCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const archetypeIcon = attendee.archetype
    ? archetypeIcons[attendee.archetype] || "✨"
    : "✨";

  const topInterests = (attendee.topInterests || []).slice(0, 3);
  const commonInterestsCount = calculateCommonInterestsWithUser(
    userInterests,
    attendee.topInterests || []
  );
  const personalizedDescription = generatePersonalizedDescription(attendee);

  const showContextLine =
    (attendee.ageVisible && attendee.ageBand) ||
    (attendee.industryVisible && attendee.industry);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div
      className="min-w-[180px] flex-shrink-0 perspective-1000"
      data-testid={`card-attendee-${attendee.userId}`}
    >
      <div
        className={`relative w-full transition-transform duration-500 transform-style-3d ${
          isFlipped ? "rotate-y-180" : ""
        }`}
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 0.5s",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        <Card
          className="w-full cursor-pointer hover-elevate transition-all backface-hidden"
          onClick={handleFlip}
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          <CardContent className="p-4 space-y-3 min-h-[180px] flex flex-col">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <div
                  className="font-semibold text-base"
                  data-testid={`text-attendee-name-${attendee.userId}`}
                >
                  {attendee.displayName}
                </div>
                {attendee.archetype && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <span className="text-base">{archetypeIcon}</span>
                    <span
                      className="text-muted-foreground"
                      data-testid={`text-attendee-archetype-${attendee.userId}`}
                    >
                      {attendee.archetype}
                    </span>
                  </div>
                )}
              </div>
              <RotateCw className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </div>

            <div className="flex-1" />

            {commonInterestsCount > 0 && (
              <div
                className="flex items-center gap-1 text-xs text-muted-foreground"
                data-testid={`text-common-interests-${attendee.userId}`}
              >
                <span>与你有{commonInterestsCount}个共同点</span>
                <div className="flex gap-0.5 ml-1">
                  {[...Array(3)].map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-1.5 h-1.5 rounded-full ${
                        idx < commonInterestsCount
                          ? "bg-primary"
                          : "bg-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card
          className="absolute inset-0 w-full cursor-pointer hover-elevate transition-all backface-hidden"
          onClick={handleFlip}
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <CardContent className="p-4 space-y-3 min-h-[180px]">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <div className="font-semibold text-base">
                  {attendee.displayName}
                </div>
                {showContextLine && (
                  <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-1">
                    {attendee.ageVisible && attendee.ageBand && (
                      <>
                        <User className="h-3 w-3" />
                        <span>{attendee.ageBand}</span>
                      </>
                    )}
                    {attendee.ageVisible &&
                      attendee.ageBand &&
                      attendee.industryVisible &&
                      attendee.industry && <span>•</span>}
                    {attendee.industryVisible && attendee.industry && (
                      <>
                        <Briefcase className="h-3 w-3" />
                        <span>{attendee.industry}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
              <RotateCw className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </div>

            {attendee.archetype && (
              <div className="flex items-center gap-1.5 text-sm">
                <span className="text-base">{archetypeIcon}</span>
                <span className="text-muted-foreground">
                  {attendee.archetype}
                </span>
              </div>
            )}

            {topInterests.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {topInterests.map((interest, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="text-xs gap-1 no-default-active-elevate"
                  >
                    <span>{interestIcons[interest] || "·"}</span>
                    <span>{interest}</span>
                  </Badge>
                ))}
              </div>
            )}

            <div className="text-xs text-muted-foreground italic">
              "{personalizedDescription}"
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
