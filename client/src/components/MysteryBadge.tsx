import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, HelpCircle } from "lucide-react";

interface MysteryBadgeProps {
  icon: string;
  label: string;
  type: "interest" | "background" | "experience";
  isRevealed: boolean;
  onReveal: () => void;
  delay?: number;
}

const badgeColors = {
  interest: {
    bg: "from-pink-500/20 to-purple-500/20",
    border: "border-pink-500/30",
    text: "text-pink-700 dark:text-pink-300",
  },
  background: {
    bg: "from-blue-500/20 to-cyan-500/20",
    border: "border-blue-500/30",
    text: "text-blue-700 dark:text-blue-300",
  },
  experience: {
    bg: "from-amber-500/20 to-orange-500/20",
    border: "border-amber-500/30",
    text: "text-amber-700 dark:text-amber-300",
  },
};

export default function MysteryBadge({
  icon,
  label,
  type,
  isRevealed,
  onReveal,
  delay = 0,
}: MysteryBadgeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const colors = badgeColors[type];

  return (
    <motion.div
      className="relative w-24 h-28 cursor-pointer"
      style={{ perspective: "1000px" }}
      initial={{ scale: 0, y: 20, opacity: 0 }}
      animate={{
        scale: 1,
        y: 0,
        opacity: 1,
        rotateY: isHovered && !isRevealed ? 5 : 0,
      }}
      transition={{
        delay,
        type: "spring",
        stiffness: 260,
        damping: 20,
      }}
      onClick={!isRevealed ? onReveal : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={!isRevealed ? { y: -4 } : {}}
      data-testid={`mystery-badge-${label}`}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: isRevealed ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        {/* Front - Mystery Box */}
        <div
          className="absolute inset-0 backface-hidden"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          <motion.div
            className={`w-full h-full rounded-lg border-2 bg-gradient-to-br from-muted to-muted/50 flex flex-col items-center justify-center gap-2 ${
              !isRevealed ? "hover-elevate" : ""
            }`}
            animate={
              !isRevealed && isHovered
                ? {
                    scale: [1, 1.05, 1],
                    boxShadow: [
                      "0 0 0 rgba(var(--primary), 0)",
                      "0 0 20px rgba(var(--primary), 0.3)",
                      "0 0 0 rgba(var(--primary), 0)",
                    ],
                  }
                : {}
            }
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <HelpCircle className="w-8 h-8 text-muted-foreground" />
            </motion.div>
            <div className="text-xs text-muted-foreground font-medium">
              点击揭晓
            </div>
          </motion.div>
        </div>

        {/* Back - Revealed Badge */}
        <div
          className="absolute inset-0 backface-hidden"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <motion.div
            className={`w-full h-full rounded-lg border-2 ${colors.border} bg-gradient-to-br ${colors.bg} flex flex-col items-center justify-center gap-2 p-2`}
            initial={{ scale: 1 }}
            animate={
              isRevealed
                ? {
                    scale: [1, 1.1, 1],
                  }
                : {}
            }
            transition={{
              delay: 0.6,
              type: "spring",
              stiffness: 300,
            }}
          >
            <div className="text-2xl">{icon}</div>
            <div className={`text-xs font-medium text-center ${colors.text} leading-tight`}>
              {label}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Sparkle effect when revealed */}
      <AnimatePresence>
        {isRevealed && (
          <motion.div
            className="absolute -top-2 -right-2"
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            <Sparkles className="w-4 h-4 text-primary" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
