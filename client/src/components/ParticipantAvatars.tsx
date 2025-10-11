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

const VIBE_COLORS: Record<string, string> = {
  "悠闲": "from-blue-400 to-cyan-400",
  "玩乐": "from-pink-400 to-rose-400",
  "活力": "from-orange-400 to-amber-400",
  "探索": "from-purple-400 to-violet-400",
  "温馨": "from-emerald-400 to-teal-400",
  "冒险": "from-red-400 to-orange-400",
  "社交": "from-yellow-400 to-lime-400",
  "创意": "from-indigo-400 to-purple-400",
};

const SIZE_CLASSES = {
  sm: "h-8 w-8 text-[10px]",
  md: "h-10 w-10 text-xs",
  lg: "h-12 w-12 text-sm",
};

export default function ParticipantAvatars({ 
  participants, 
  maxDisplay = 8,
  size = "md" 
}: ParticipantAvatarsProps) {
  const displayedParticipants = participants.slice(0, maxDisplay);
  const remainingCount = participants.length - maxDisplay;

  const getVibeGradient = (vibes: string[] | null) => {
    if (!vibes || vibes.length === 0) return "from-gray-400 to-gray-500";
    const firstVibe = vibes[0];
    return VIBE_COLORS[firstVibe] || "from-gray-400 to-gray-500";
  };

  const getVibeLabel = (vibes: string[] | null) => {
    if (!vibes || vibes.length === 0) return "?";
    return vibes[0].charAt(0);
  };

  return (
    <div className="flex items-center -space-x-2">
      {displayedParticipants.map((participant, index) => (
        <div
          key={participant.id}
          className={`${SIZE_CLASSES[size]} rounded-full bg-gradient-to-br ${getVibeGradient(participant.vibes)} flex items-center justify-center font-semibold text-white border-2 border-background shadow-sm transition-transform hover:scale-110 hover:z-10`}
          style={{ zIndex: displayedParticipants.length - index }}
          title={`${participant.displayName || "用户"} - ${participant.vibes?.join(", ") || "未设置"}`}
        >
          {getVibeLabel(participant.vibes)}
        </div>
      ))}
      
      {remainingCount > 0 && (
        <div
          className={`${SIZE_CLASSES[size]} rounded-full bg-muted flex items-center justify-center font-semibold text-muted-foreground border-2 border-background`}
          title={`还有 ${remainingCount} 位参与者`}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}
