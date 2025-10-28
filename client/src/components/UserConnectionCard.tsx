import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { User, GraduationCap, Briefcase, MapPin } from "lucide-react";
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
      <Card className="overflow-hidden border-2 hover-elevate transition-all">
        <CardContent className="p-4 space-y-4">
          {/* 上区：身份信息面板 */}
          <div className="flex gap-3 items-start">
            {/* 左侧：能量环 + 原型 */}
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

            {/* 右侧：个人信息两栏布局 */}
            <div className="flex-1 space-y-2 pt-1">
              <div className="font-bold text-base" data-testid={`text-name-${attendee.userId}`}>
                {attendee.displayName}
              </div>

              <div className="space-y-1.5 text-xs">
                {/* 性别 · 年龄 */}
                {(genderDisplay || attendee.age || attendee.ageBand) && (
                  <div className="flex items-center gap-1.5 text-foreground">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span>
                      {genderDisplay && <span>{genderDisplay}</span>}
                      {(genderDisplay && (attendee.age || attendee.ageBand)) && <span> · </span>}
                      {attendee.age && <span>{attendee.age}岁</span>}
                      {!attendee.age && attendee.ageBand && <span>{attendee.ageBand}</span>}
                    </span>
                  </div>
                )}

                {/* 学历 · 行业 */}
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

                {/* 家乡 */}
                {attendee.hometown && (
                  <div className="flex items-center gap-1.5 text-foreground">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span>{attendee.hometown}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 下区：盲盒探索区 */}
          {connectionTags.length > 0 && (
            <div className="space-y-3 pt-2 border-t">
              <div className="text-xs font-medium text-center text-muted-foreground">
                ✨ 我们的潜在契合点
              </div>

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

              <AnimatePresence>
                {allRevealed && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="text-center text-xs text-primary font-medium py-1"
                  >
                    🎉 全部解锁完成！
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
