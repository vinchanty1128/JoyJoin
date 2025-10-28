import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Briefcase, RotateCw, GraduationCap, MapPin } from "lucide-react";
import {
  calculateCommonInterestsWithUser,
  archetypeDescriptions,
  generateSparkPredictions,
  normalizeInterestName,
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
  userEducationLevel?: string;
  userIndustry?: string;
  userAgeBand?: string;
  userRelationshipStatus?: string;
  userStudyLocale?: string;
  userSeniority?: string;
}

export default function AttendeePreviewCard({
  attendee,
  userInterests = [],
  userEducationLevel,
  userIndustry,
  userAgeBand,
  userRelationshipStatus,
  userStudyLocale,
  userSeniority,
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

  const sparkPredictions = generateSparkPredictions(
    {
      userInterests,
      userEducationLevel,
      userIndustry,
      userAgeBand,
      userRelationshipStatus,
      userStudyLocale,
      userSeniority,
    },
    attendee
  );

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
      className="min-w-[180px] w-[180px] h-[320px] flex-shrink-0"
      style={{ perspective: "1000px" }}
      data-testid={`card-attendee-${attendee.userId}`}
    >
      <div
        className="relative w-full h-[320px]"
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
          <CardContent className="p-3 space-y-2 h-[320px] flex flex-col items-center justify-center text-center">
            <div className="absolute top-2 right-2">
              <RotateCw className="h-4 w-4 text-muted-foreground" />
            </div>

            {attendee.archetype && (
              <div className="text-6xl mb-1">{archetypeIcon}</div>
            )}

            <div className="space-y-1.5">
              <div
                className="font-semibold text-xl"
                data-testid={`text-attendee-name-${attendee.userId}`}
              >
                {attendee.displayName}
              </div>
              
              {attendee.archetype && (
                <div className="space-y-1">
                  <div
                    className="text-base font-medium text-primary"
                    data-testid={`text-attendee-archetype-${attendee.userId}`}
                  >
                    {attendee.archetype}
                  </div>
                  {archetypeDescription && (
                    <div className="text-sm text-muted-foreground px-1">
                      {archetypeDescription}
                    </div>
                  )}
                </div>
              )}
            </div>

            {commonInterestsCount > 0 && (
              <div
                className="flex items-center gap-1 text-sm text-muted-foreground mt-auto"
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
          <CardContent className="p-3 space-y-2.5 h-[320px] flex flex-col">
            <div className="flex items-start justify-between">
              <div className="font-semibold text-lg">
                {attendee.displayName}
              </div>
              <RotateCw className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </div>

            <div className="space-y-1.5 text-sm">
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-foreground">
                {genderDisplay && (
                  <div className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
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

              <div className="flex flex-wrap gap-x-3 gap-y-1 text-foreground">
                {educationDisplay && (
                  <div className="flex items-center gap-1">
                    <GraduationCap className="h-3.5 w-3.5" />
                    <span>{educationDisplay}</span>
                  </div>
                )}
                {attendee.industry && (
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5" />
                    <span>{attendee.industry}</span>
                  </div>
                )}
              </div>

              {attendee.hometown && (
                <div className="flex items-center gap-1 text-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{attendee.hometown}</span>
                </div>
              )}
            </div>

            {topInterests.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-xs font-medium text-muted-foreground">
                  个人兴趣
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {topInterests.map((interest, idx) => {
                    const normalizedInterest = normalizeInterestName(interest);
                    return (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="text-xs gap-1 no-default-active-elevate bg-accent/30"
                        data-testid={`badge-interest-${attendee.userId}-${idx}`}
                      >
                        <span>{interestIcons[normalizedInterest] || interestIcons[interest] || "·"}</span>
                        <span>{normalizedInterest}</span>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {sparkPredictions.length > 0 && (
              <div className="space-y-1.5 mt-auto">
                <div className="text-xs font-medium text-muted-foreground">
                  我们之间的契合点
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {sparkPredictions.map((prediction, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="text-xs no-default-active-elevate bg-primary/10 text-primary border-primary/30"
                      data-testid={`badge-spark-back-${attendee.userId}-${idx}`}
                    >
                      ✨ {prediction}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
