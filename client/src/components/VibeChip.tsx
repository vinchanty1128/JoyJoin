import { Badge } from "@/components/ui/badge";
import { VIBE_TYPES, VibeType } from "@/lib/vibes";

interface VibeChipProps {
  vibe: VibeType;
  size?: "sm" | "md";
}

export default function VibeChip({ vibe, size = "sm" }: VibeChipProps) {
  const vibeData = VIBE_TYPES[vibe];
  const sizeClass = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";
  
  return (
    <Badge 
      variant="secondary" 
      className={`${sizeClass} font-medium bg-background/90 backdrop-blur-sm border-0 hover-elevate active-elevate-2`}
    >
      <span className="mr-1">{vibeData.emoji}</span>
      {vibeData.label}
    </Badge>
  );
}
