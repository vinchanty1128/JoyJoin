import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { User, GraduationCap, Briefcase, MapPin, RotateCw } from "lucide-react";
import EnergyRing from "./EnergyRing";
import MysteryBadge from "./MysteryBadge";
import type { AttendeeData } from "@/lib/attendeeAnalytics";

interface ConnectionTag {
  icon: string;
  label: string;
  type: "interest" | "background" | "experience";
}

interface UserConnectionCardProps {
  attendee: AttendeeData;
  connectionTags: ConnectionTag[];
}

const archetypeIcons: Record<string, string> = {
  "探索者": "🧭",
  "讲故事的人": "📖",
  "智者": "🦉",
  "发光体": "⭐",
  "稳定器": "⚓",
};

export default function UserConnectionCard({
  attendee,
  connectionTags,
}: UserConnectionCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [revealedBadges, setRevealedBadges] = useState<Set<number>>(new Set());

  const archetypeIcon = attendee.archetype
    ? archetypeIcons[attendee.archetype] || "✨"
    : "✨";

  const connectionStrength = Math.min(connectionTags.length, 8);

  const handleBadgeReveal = (index: number) => {
    setRevealedBadges((prev) => new Set(prev).add(index));
  };

  const allRevealed = revealedBadges.size === connectionTags.length;

  // Format display values
  const genderDisplay = attendee.gender === "Woman" ? "女" : 
                       attendee.gender === "Man" ? "男" : 
                       attendee.gender || "";
  
  const educationDisplay = attendee.educationLevel === "Bachelor's" ? "本科" :
                          attendee.educationLevel === "Master's" ? "硕士" :
                          attendee.educationLevel === "Doctorate" ? "博士" :
                          attendee.educationLevel || "";

  return (
    <div
      className="min-w-[240px] w-[240px] flex-shrink-0"
      data-testid={`connection-card-${attendee.userId}`}
    >
      <div 
        className="relative h-[360px]"
        style={{ perspective: "1000px" }}
      >
        <motion.div
          className="relative w-full h-full"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        >
          {/* Front Side - User Info */}
          <div
            className="absolute w-full h-full"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            <Card className="h-full overflow-hidden border-2 hover-elevate transition-all">
              <CardContent className="p-4 space-y-4 h-full flex flex-col">
                {/* Upper Zone: User Identity */}
                <div className="flex gap-3 items-start">
                  {/* Left: Energy Ring + Archetype */}
                  <div className="flex-shrink-0">
                    <EnergyRing strength={connectionStrength} maxStrength={8} size={90} strokeWidth={6}>
                      <div className="flex flex-col items-center">
                        <div className="text-3xl">{archetypeIcon}</div>
                        <div className="text-xs font-medium text-muted-foreground mt-0.5">
                          {attendee.archetype}
                        </div>
                      </div>
                    </EnergyRing>
                  </div>

                  {/* Right: Personal Info */}
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="font-bold text-base" data-testid={`text-name-${attendee.userId}`}>
                      {attendee.displayName}
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {/* Gender · Age */}
                      {(genderDisplay || attendee.age) && (
                        <div className="flex items-center gap-1.5 text-foreground">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span>
                            {genderDisplay && <span>{genderDisplay}</span>}
                            {genderDisplay && attendee.age && <span> · </span>}
                            {attendee.age && <span>{attendee.age}岁</span>}
                          </span>
                        </div>
                      )}

                      {/* Education · Industry */}
                      {(educationDisplay || attendee.industry) && (
                        <div className="flex items-center gap-1.5 text-foreground">
                          {educationDisplay && (
                            <>
                              <GraduationCap className="h-3 w-3 text-muted-foreground" />
                              <span>{educationDisplay}</span>
                            </>
                          )}
                          {educationDisplay && attendee.industry && <span className="text-muted-foreground">·</span>}
                          {attendee.industry && (
                            <>
                              {!educationDisplay && <Briefcase className="h-3 w-3 text-muted-foreground" />}
                              <span>{attendee.industry}</span>
                            </>
                          )}
                        </div>
                      )}

                      {/* Hometown */}
                      {attendee.hometown && (
                        <div className="flex items-center gap-1.5 text-foreground">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span>{attendee.hometown}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Lower Zone: Connection Count */}
                <div className="flex-1 flex flex-col justify-center items-center gap-4 border-t pt-4">
                  <div className="text-center space-y-2">
                    <div className="text-4xl font-bold text-primary">
                      {connectionTags.length}
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">
                      个潜在契合点
                    </div>
                  </div>

                  <motion.button
                    onClick={() => setIsFlipped(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover-elevate active-elevate-2 text-sm font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    data-testid={`button-flip-${attendee.userId}`}
                  >
                    <RotateCw className="h-4 w-4" />
                    点击翻转探索
                  </motion.button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Back Side - Mystery Badges */}
          <div
            className="absolute w-full h-full"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <Card className="h-full overflow-hidden border-2 hover-elevate transition-all">
              <CardContent className="p-4 h-full flex flex-col">
                {/* Header with flip back button */}
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-medium text-muted-foreground">
                    ✨ 我们的潜在契合点
                  </div>
                  <motion.button
                    onClick={() => setIsFlipped(false)}
                    className="p-1.5 rounded-md hover-elevate active-elevate-2 text-muted-foreground"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    data-testid={`button-flip-back-${attendee.userId}`}
                  >
                    <RotateCw className="h-4 w-4" />
                  </motion.button>
                </div>

                {/* Mystery Badges Grid */}
                <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  <div className="grid grid-cols-2 gap-2">
                    {connectionTags.map((badge, idx) => (
                      <MysteryBadge
                        key={idx}
                        icon={badge.icon}
                        label={badge.label}
                        type={badge.type}
                        isRevealed={revealedBadges.has(idx)}
                        onReveal={() => handleBadgeReveal(idx)}
                        delay={idx * 0.1}
                      />
                    ))}
                  </div>
                </div>

                {/* Completion Message */}
                <AnimatePresence>
                  {allRevealed && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ delay: 0.3 }}
                      className="text-center text-xs text-primary font-medium pt-3 border-t mt-3"
                    >
                      🎉 全部解锁完成！
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
