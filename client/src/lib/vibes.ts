export const VIBE_TAGS = {
  chill: { label: "Chill", emoji: "😌", color: "from-blue-400 to-cyan-400" },
  playful: { label: "Playful", emoji: "🎈", color: "from-pink-400 to-rose-400" },
  highEnergy: { label: "High-Energy", emoji: "⚡", color: "from-orange-400 to-coral-500" },
  curious: { label: "Curious", emoji: "🧠", color: "from-purple-400 to-indigo-400" },
  cozy: { label: "Cozy", emoji: "🕯️", color: "from-amber-400 to-yellow-400" },
  adventurous: { label: "Adventurous", emoji: "🧗", color: "from-emerald-400 to-teal-400" },
  social: { label: "Social", emoji: "🤝", color: "from-violet-400 to-purple-400" },
  creative: { label: "Creative", emoji: "🎨", color: "from-fuchsia-400 to-pink-400" }
} as const;

export type VibeKey = keyof typeof VIBE_TAGS;

export const ROLE_TYPES = {
  energizer: { label: "Energizer", icon: "⚡", color: "text-orange-500" },
  connector: { label: "Connector", icon: "🤝", color: "text-purple-500" },
  reflector: { label: "Reflector", icon: "🌿", color: "text-green-500" }
} as const;
