import { Smile, PartyPopper, Zap, Compass, Flame, Mountain, Users, Palette } from "lucide-react";

interface Participant {
  id: string;
  displayName: string | null;
  vibes: string[] | null;
}

interface ParticipantAvatarsProps {
  participants: Participant[];
  maxDisplay?: number;
  size?: "sm" | "md" | "lg";
}

const VIBE_CONFIG: Record<string, { color: string; icon: React.ComponentType<{ className?: string }> }> = {
  "悠闲": { color: "from-blue-400 to-cyan-400", icon: Smile },
  "relaxed": { color: "from-blue-400 to-cyan-400", icon: Smile },
  "chill": { color: "from-blue-400 to-cyan-400", icon: Smile },
  
  "玩乐": { color: "from-pink-400 to-rose-400", icon: PartyPopper },
  "playful": { color: "from-pink-400 to-rose-400", icon: PartyPopper },
  
  "活力": { color: "from-orange-400 to-red-500", icon: Zap },
  "energetic": { color: "from-orange-400 to-red-500", icon: Zap },
  "highEnergy": { color: "from-orange-400 to-red-500", icon: Zap },
  
  "探索": { color: "from-purple-400 to-indigo-400", icon: Compass },
  "exploratory": { color: "from-purple-400 to-indigo-400", icon: Compass },
  "curious": { color: "from-purple-400 to-indigo-400", icon: Compass },
  
  "温馨": { color: "from-amber-400 to-yellow-400", icon: Flame },
  "cozy": { color: "from-amber-400 to-yellow-400", icon: Flame },
  
  "冒险": { color: "from-emerald-400 to-teal-400", icon: Mountain },
  "adventurous": { color: "from-emerald-400 to-teal-400", icon: Mountain },
  
  "社交": { color: "from-violet-400 to-purple-400", icon: Users },
  "social": { color: "from-violet-400 to-purple-400", icon: Users },
  
  "创意": { color: "from-fuchsia-400 to-pink-400", icon: Palette },
  "creative": { color: "from-fuchsia-400 to-pink-400", icon: Palette },
};

const SIZE_CLASSES = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

const ICON_SIZE_CLASSES = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export default function ParticipantAvatars({ 
  participants, 
  maxDisplay = 8,
  size = "md" 
}: ParticipantAvatarsProps) {
  const displayedParticipants = participants.slice(0, maxDisplay);
  const remainingCount = participants.length - maxDisplay;

  const getVibeConfig = (vibes: string[] | null) => {
    if (!vibes || vibes.length === 0) {
      return { color: "from-gray-400 to-gray-500", icon: Smile };
    }
    const firstVibe = vibes[0].toLowerCase();
    return VIBE_CONFIG[firstVibe] || VIBE_CONFIG[vibes[0]] || { color: "from-gray-400 to-gray-500", icon: Smile };
  };

  return (
    <div className="flex items-center -space-x-2">
      {displayedParticipants.map((participant, index) => {
        const vibeConfig = getVibeConfig(participant.vibes);
        const VibeIcon = vibeConfig.icon;
        
        return (
          <div
            key={participant.id}
            className={`${SIZE_CLASSES[size]} rounded-full bg-gradient-to-br ${vibeConfig.color} flex items-center justify-center text-white border-2 border-background shadow-sm transition-transform hover:scale-110 hover:z-10`}
            style={{ zIndex: displayedParticipants.length - index }}
            title={`${participant.displayName || "用户"} - ${participant.vibes?.join(", ") || "未设置"}`}
          >
            <VibeIcon className={ICON_SIZE_CLASSES[size]} />
          </div>
        );
      })}
      
      {remainingCount > 0 && (
        <div
          className={`${SIZE_CLASSES[size]} rounded-full bg-muted flex items-center justify-center font-semibold text-muted-foreground border-2 border-background text-xs`}
          title={`还有 ${remainingCount} 位参与者`}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}
