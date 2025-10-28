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
          {/* Warm gradient: orange to pink for energy field effect */}
          <linearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B35" stopOpacity="1" />
            <stop offset="50%" stopColor="#FF8C42" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FF7BA9" stopOpacity="1" />
          </linearGradient>
          
          {/* Breathing glow effect - softer and more organic */}
          <filter id="breathingGlow">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
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
              opacity={isActive ? 1 : 0.15}
              filter={isActive ? "url(#breathingGlow)" : "none"}
              initial={{ opacity: 0 }}
              animate={{
                opacity: isActive ? [0.7, 1, 0.7] : 0.15,
                filter: isActive 
                  ? [
                      "url(#breathingGlow) drop-shadow(0 0 8px rgba(255, 107, 53, 0.4))",
                      "url(#breathingGlow) drop-shadow(0 0 12px rgba(255, 107, 53, 0.6))",
                      "url(#breathingGlow) drop-shadow(0 0 8px rgba(255, 107, 53, 0.4))"
                    ]
                  : "none"
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.08,
              }}
              data-testid={`energy-segment-${index}`}
            />
          );
        })}
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
