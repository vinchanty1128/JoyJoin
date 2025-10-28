import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, HelpCircle, Zap, Crown } from "lucide-react";

interface MysteryBadgeProps {
  icon: string;
  label: string;
  type: "interest" | "background" | "experience";
  rarity: "common" | "rare" | "epic";
  isRevealed: boolean;
  onReveal: () => void;
  delay?: number;
}

const rarityStyles = {
  common: {
    unrevealedBg: "from-muted to-muted/50",
    unrevealedBorder: "border-muted-foreground/20",
    revealedBg: "from-gray-500/15 to-gray-400/15",
    revealedBorder: "border-gray-500/30",
    revealedText: "text-gray-700 dark:text-gray-300",
    glow: "rgba(156, 163, 175, 0.3)",
    iconColor: "text-gray-500",
  },
  rare: {
    unrevealedBg: "from-blue-500/10 to-cyan-500/10",
    unrevealedBorder: "border-blue-500/20",
    revealedBg: "from-blue-500/20 to-cyan-500/20",
    revealedBorder: "border-blue-500/40",
    revealedText: "text-blue-700 dark:text-blue-300",
    glow: "rgba(59, 130, 246, 0.5)",
    iconColor: "text-blue-500",
  },
  epic: {
    unrevealedBg: "from-amber-500/10 to-orange-500/10",
    unrevealedBorder: "border-amber-500/20",
    revealedBg: "from-amber-500/25 to-orange-500/25",
    revealedBorder: "border-amber-500/50",
    revealedText: "text-amber-700 dark:text-amber-300",
    glow: "rgba(245, 158, 11, 0.7)",
    iconColor: "text-amber-500",
  },
};

const rarityIcons = {
  common: null,
  rare: Zap,
  epic: Crown,
};

export default function MysteryBadge({
  icon,
  label,
  type,
  rarity,
  isRevealed,
  onReveal,
  delay = 0,
}: MysteryBadgeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const styles = rarityStyles[rarity];
  const RarityIcon = rarityIcons[rarity];

  return (
    <motion.div
      className="relative w-full aspect-[4/5] cursor-pointer"
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
      whileHover={!isRevealed ? { y: -2 } : {}}
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
            className={`w-full h-full rounded-lg border-2 ${styles.unrevealedBorder} bg-gradient-to-br ${styles.unrevealedBg} flex flex-col items-center justify-center gap-2 ${
              !isRevealed ? "hover-elevate" : ""
            }`}
            animate={
              !isRevealed && isHovered
                ? {
                    scale: [1, 1.05, 1],
                    boxShadow: [
                      `0 0 0 ${styles.glow}`,
                      `0 0 20px ${styles.glow}`,
                      `0 0 0 ${styles.glow}`,
                    ],
                  }
                : {}
            }
            transition={{
              duration: rarity === "epic" ? 0.8 : 1,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <motion.div
              animate={{
                rotate: [0, rarity === "epic" ? 10 : 5, rarity === "epic" ? -10 : -5, 0],
              }}
              transition={{
                duration: rarity === "epic" ? 1.5 : 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <HelpCircle className={`w-6 h-6 ${styles.iconColor}`} />
            </motion.div>
            <div className={`text-[10px] font-medium ${styles.iconColor}`}>
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
            className={`w-full h-full rounded-lg border-2 ${styles.revealedBorder} bg-gradient-to-br ${styles.revealedBg} flex flex-col items-center justify-center gap-1 p-2 relative overflow-hidden`}
            initial={{ scale: 1 }}
            animate={
              isRevealed
                ? {
                    scale: [1, rarity === "epic" ? 1.08 : 1.05, 1],
                  }
                : {}
            }
            transition={{
              delay: 0.6,
              type: "spring",
              stiffness: rarity === "epic" ? 400 : 300,
            }}
          >
            {/* Epic glow effect */}
            {rarity === "epic" && isRevealed && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-amber-400/30 via-orange-400/20 to-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            )}

            <div className="text-xl relative z-10">{icon}</div>
            <div className={`text-[10px] font-medium text-center ${styles.revealedText} leading-tight px-1 relative z-10`}>
              {label}
            </div>

            {/* Rarity indicator icon */}
            {RarityIcon && (
              <div className="absolute top-1 right-1">
                <RarityIcon className={`w-3 h-3 ${styles.iconColor}`} />
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Sparkle effect when revealed */}
      <AnimatePresence>
        {isRevealed && (
          <>
            <motion.div
              className="absolute -top-2 -right-2"
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ delay: 0.5, type: "spring" }}
            >
              <Sparkles className={`w-4 h-4 ${styles.iconColor}`} />
            </motion.div>

            {/* Epic celebration effect */}
            {rarity === "epic" && (
              <>
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      left: "50%",
                      top: "50%",
                    }}
                    initial={{ scale: 0, x: "-50%", y: "-50%" }}
                    animate={{
                      scale: [0, 1, 0],
                      x: ["-50%", `${Math.cos((i * Math.PI) / 3) * 40}px`],
                      y: ["-50%", `${Math.sin((i * Math.PI) / 3) * 40}px`],
                      opacity: [1, 0.8, 0],
                    }}
                    transition={{
                      duration: 1.2,
                      delay: 0.6 + i * 0.05,
                      ease: "easeOut",
                    }}
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                  </motion.div>
                ))}
              </>
            )}
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
