import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";
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
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [revealedBadges, setRevealedBadges] = useState<Set<number>>(new Set());

  const archetypeIcon = attendee.archetype
    ? archetypeIcons[attendee.archetype] || "✨"
    : "✨";

  const quickTags = connectionTags.slice(0, 3);
  const mysteryBadges = connectionTags;
  const connectionStrength = Math.min(connectionTags.length, 8);

  const handleUnlock = () => {
    setIsUnlocking(true);
  };

  const handleBadgeReveal = (index: number) => {
    setRevealedBadges((prev) => new Set(prev).add(index));
  };

  const allRevealed = revealedBadges.size === mysteryBadges.length;

  return (
    <div
      className="min-w-[200px] w-[200px] flex-shrink-0"
      data-testid={`connection-card-${attendee.userId}`}
    >
      <Card className="h-full overflow-hidden border-2 hover-elevate transition-all">
        <CardContent className="p-4 space-y-3 h-full flex flex-col">
          {/* Energy Ring with Archetype */}
          <div className="flex justify-center">
            <EnergyRing strength={connectionStrength} maxStrength={8} size={120}>
              <div className="flex flex-col items-center gap-1">
                <div className="text-4xl">{archetypeIcon}</div>
                <div className="text-xs font-medium text-muted-foreground">
                  {attendee.archetype}
                </div>
              </div>
            </EnergyRing>
          </div>

          {/* Name */}
          <div className="text-center">
            <div className="font-bold text-lg" data-testid={`text-name-${attendee.userId}`}>
              {attendee.displayName}
            </div>
          </div>

          {/* Quick Tags or Mystery Badges */}
          <AnimatePresence mode="wait">
            {!isUnlocking ? (
              <motion.div
                key="quick-tags"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-3 flex-1 flex flex-col justify-end"
              >
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {quickTags.map((tag, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="text-xs gap-1 no-default-active-elevate bg-primary/10 text-primary"
                      data-testid={`quick-tag-${idx}`}
                    >
                      <span>{tag.icon}</span>
                      <span>{tag.label}</span>
                    </Badge>
                  ))}
                </div>

                {connectionTags.length > 0 && (
                  <motion.button
                    onClick={handleUnlock}
                    className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1 py-2 rounded-md hover-elevate active-elevate-2 cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    data-testid="button-unlock"
                  >
                    <span className="font-medium">
                      {connectionTags.length > 3 ? "轻点探索更多默契" : "轻点解锁盲盒"}
                    </span>
                    <ChevronDown className="w-3 h-3" />
                  </motion.button>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="mystery-badges"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3 flex-1 flex flex-col justify-center"
              >
                <div className="flex flex-wrap gap-2 justify-center">
                  {mysteryBadges.map((badge, idx) => (
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

                {allRevealed && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-center text-xs text-primary font-medium py-2"
                  >
                    ✨ 全部解锁完成！
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
