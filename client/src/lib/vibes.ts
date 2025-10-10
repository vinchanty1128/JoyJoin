export const VIBE_TYPES = {
  chill: { emoji: "😌", label: "Chill", gradient: "from-blue-400 to-cyan-400", color: "text-blue-600" },
  playful: { emoji: "🎈", label: "Playful", gradient: "from-pink-400 to-rose-400", color: "text-pink-600" },
  highEnergy: { emoji: "⚡", label: "High-Energy", gradient: "from-orange-400 to-red-500", color: "text-orange-600" },
  curious: { emoji: "🧠", label: "Curious", gradient: "from-purple-400 to-indigo-400", color: "text-purple-600" },
  cozy: { emoji: "🕯️", label: "Cozy", gradient: "from-amber-400 to-yellow-500", color: "text-amber-600" },
  adventurous: { emoji: "🧗", label: "Adventurous", gradient: "from-emerald-400 to-teal-500", color: "text-emerald-600" },
  social: { emoji: "🤝", label: "Social", gradient: "from-violet-400 to-fuchsia-400", color: "text-violet-600" },
  creative: { emoji: "🎨", label: "Creative", gradient: "from-indigo-400 to-pink-400", color: "text-indigo-600" }
} as const;

export type VibeType = keyof typeof VIBE_TYPES;

export const ENERGY_ROLES = {
  energizer: { emoji: "⚡", label: "Energizer", color: "text-orange-500" },
  connector: { emoji: "🤝", label: "Connector", color: "text-violet-500" },
  reflector: { emoji: "🌿", label: "Reflector", color: "text-emerald-500" }
} as const;

export type EnergyRole = keyof typeof ENERGY_ROLES;
