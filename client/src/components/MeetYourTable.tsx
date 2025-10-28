import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import GroupSummaryCard from "./GroupSummaryCard";
import UserConnectionCard from "./UserConnectionCard";
import { generateSparkPredictions, normalizeInterestName, type AttendeeData } from "@/lib/attendeeAnalytics";

interface MeetYourTableProps {
  attendees: AttendeeData[];
  userInterests?: string[];
  userEducationLevel?: string;
  userIndustry?: string;
  userAgeBand?: string;
  userRelationshipStatus?: string;
  userStudyLocale?: string;
  userSeniority?: string;
}

export default function MeetYourTable({
  attendees,
  userInterests = [],
  userEducationLevel,
  userIndustry,
  userAgeBand,
  userRelationshipStatus,
  userStudyLocale,
  userSeniority,
}: MeetYourTableProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      return () => container.removeEventListener('scroll', checkScrollButtons);
    }
  }, [attendees]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      const newScrollLeft = direction === 'left'
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  if (!attendees || attendees.length === 0) {
    return null;
  }

  const userContext = {
    userInterests,
    userEducationLevel,
    userIndustry,
    userAgeBand,
    userRelationshipStatus,
    userStudyLocale,
    userSeniority,
  };

  const interestIcons: Record<string, string> = {
    "电影娱乐": "🎬",
    "旅行探索": "✈️",
    "美食餐饮": "🍜",
    "音乐演出": "🎵",
    "阅读书籍": "📚",
    "艺术文化": "🎨",
    "运动健身": "⚽",
    "健身健康": "💪",
    "摄影": "📷",
    "游戏": "🎮",
    "科技": "💻",
  };

  return (
    <div className="space-y-4" data-testid="section-meet-your-table">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">认识你的桌友</h3>
        <p className="text-sm text-muted-foreground">
          提前了解一起聚会的朋友，减少冷场尴尬
        </p>
      </div>

      <GroupSummaryCard attendees={attendees} />

      <div className="relative">
        {canScrollLeft && (
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full shadow-lg bg-background"
            onClick={() => scroll('left')}
            data-testid="button-scroll-left"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        
        {canScrollRight && (
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full shadow-lg bg-background"
            onClick={() => scroll('right')}
            data-testid="button-scroll-right"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}

        <div 
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {attendees.map((attendee) => {
            const sparkPredictions = generateSparkPredictions(userContext, attendee);
            
            const connectionTags = sparkPredictions.map((prediction) => {
              let icon = "✨";
              let type: "interest" | "background" | "experience" = "experience";
              
              if (prediction.includes("同城") || prediction.includes("同区")) {
                icon = "📍";
                type = "background";
              } else if (prediction.includes("海归") || prediction.includes("学历")) {
                icon = "🎓";
                type = "background";
              } else if (prediction.includes("创业") || prediction.includes("行业")) {
                icon = "💼";
                type = "experience";
              } else if (attendee.topInterests) {
                for (const interest of attendee.topInterests) {
                  const normalizedInterest = normalizeInterestName(interest);
                  if (prediction.includes(normalizedInterest)) {
                    icon = interestIcons[normalizedInterest] || "🎯";
                    type = "interest";
                    break;
                  }
                }
              }
              
              return { icon, label: prediction, type };
            });

            return (
              <UserConnectionCard
                key={attendee.userId}
                attendee={attendee}
                connectionTags={connectionTags}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
