import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Briefcase, RotateCw, GraduationCap, MapPin } from "lucide-react";
import {
  calculateCommonInterestsWithUser,
  archetypeDescriptions,
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
  const archetypeDescription = attendee.archetype 
    ? archetypeDescriptions[attendee.archetype] || ""
    : "";

  const genderDisplay = attendee.gender === "Woman" ? "女" : 
                       attendee.gender === "Man" ? "男" : 
                       attendee.gender || "";
  
  const educationDisplay = attendee.educationLevel === "Bachelor's" ? "本科" :
                          attendee.educationLevel === "Master's" ? "硕士" :
                          attendee.educationLevel === "Doctorate" ? "博士" :
                          attendee.educationLevel || "";

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div
      className="min-w-[180px] w-[180px] flex-shrink-0"
      style={{ perspective: "1000px" }}
      data-testid={`card-attendee-${attendee.userId}`}
    >
      <div
        className="relative w-full h-[240px]"
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 0.5s",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        <Card
          className="w-full cursor-pointer hover-elevate transition-all backface-hidden bg-gradient-to-br from-background via-background to-primary/5"
          onClick={handleFlip}
          style={{
            position: "absolute",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          <CardContent className="p-4 space-y-3 h-[240px] flex flex-col items-center justify-center text-center">
            <div className="absolute top-3 right-3">
              <RotateCw className="h-4 w-4 text-muted-foreground" />
            </div>

            {attendee.archetype && (
              <div className="text-6xl mb-2">{archetypeIcon}</div>
            )}

            <div className="space-y-2">
              <div
                className="font-semibold text-lg"
                data-testid={`text-attendee-name-${attendee.userId}`}
              >
                {attendee.displayName}
              </div>
              
              {attendee.archetype && (
                <div className="space-y-1">
                  <div
                    className="text-sm font-medium text-primary"
                    data-testid={`text-attendee-archetype-${attendee.userId}`}
                  >
                    {attendee.archetype}
                  </div>
                  {archetypeDescription && (
                    <div className="text-xs text-muted-foreground px-2">
                      {archetypeDescription}
                    </div>
                  )}
                </div>
              )}
            </div>

            {commonInterestsCount > 0 && (
              <div
                className="flex items-center gap-1 text-xs text-muted-foreground mt-auto"
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
          className="absolute inset-0 w-full cursor-pointer hover-elevate transition-all backface-hidden bg-gradient-to-br from-background via-accent/10 to-accent/20"
          onClick={handleFlip}
          style={{
            position: "absolute",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <CardContent className="p-4 space-y-3 h-[240px] flex flex-col">
            <div className="flex items-start justify-between">
              <div className="font-semibold text-base">
                {attendee.displayName}
              </div>
              <RotateCw className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-muted-foreground">
                {genderDisplay && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{genderDisplay}</span>
                  </div>
                )}
                {attendee.age && (
                  <span>{attendee.age}岁</span>
                )}
                {!attendee.age && attendee.ageBand && (
                  <span>{attendee.ageBand}</span>
                )}
              </div>

              <div className="flex flex-wrap gap-x-3 gap-y-1 text-muted-foreground">
                {educationDisplay && (
                  <div className="flex items-center gap-1">
                    <GraduationCap className="h-3 w-3" />
                    <span>{educationDisplay}</span>
                  </div>
                )}
                {attendee.industry && (
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    <span>{attendee.industry}</span>
                  </div>
                )}
              </div>

              {attendee.hometown && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{attendee.hometown}</span>
                </div>
              )}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
