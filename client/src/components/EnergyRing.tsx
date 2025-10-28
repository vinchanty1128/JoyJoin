import { motion } from "framer-motion";

interface EnergyRingProps {
  strength: number;
  maxStrength?: number;
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}

export default function EnergyRing({
  strength,
  maxStrength = 8,
  size = 120,
  strokeWidth = 8,
  children,
}: EnergyRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const segments = maxStrength;
  const segmentLength = circumference / segments;
  const gapLength = segmentLength * 0.15;
  const activeSegmentLength = segmentLength - gapLength;
  
  const activeSegments = Math.min(strength, maxStrength);
  const progressPercentage = (activeSegments / maxStrength) * 100;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        <defs>
          <linearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="1" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="1" />
          </linearGradient>
          
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {Array.from({ length: segments }).map((_, index) => {
          const isActive = index < activeSegments;
          const offset = index * segmentLength;
          
          return (
            <motion.circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={isActive ? "url(#energyGradient)" : "hsl(var(--muted))"}
              strokeWidth={strokeWidth}
              strokeDasharray={`${activeSegmentLength} ${circumference - activeSegmentLength}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              opacity={isActive ? 1 : 0.2}
              filter={isActive ? "url(#glow)" : "none"}
              initial={{ opacity: 0 }}
              animate={{
                opacity: isActive ? [0.6, 1, 0.6] : 0.2,
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.1,
              }}
              data-testid={`energy-segment-${index}`}
            />
          );
        })}
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>

      {progressPercentage > 0 && (
        <motion.div
          className="absolute -top-1 left-1/2 -translate-x-1/2"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          <div className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
            {Math.round(progressPercentage)}%
          </div>
        </motion.div>
      )}
    </div>
  );
}
