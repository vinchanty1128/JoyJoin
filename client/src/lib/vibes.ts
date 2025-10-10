export const VIBE_TAGS = {
  chill: { label: "悠闲", emoji: "😌", color: "from-blue-400 to-cyan-400" },
  playful: { label: "玩乐", emoji: "🎈", color: "from-pink-400 to-rose-400" },
  highEnergy: { label: "活力", emoji: "⚡", color: "from-orange-400 to-red-500" },
  curious: { label: "探索", emoji: "🧠", color: "from-purple-400 to-indigo-400" },
  cozy: { label: "温馨", emoji: "🕯️", color: "from-amber-400 to-yellow-400" },
  adventurous: { label: "冒险", emoji: "🧗", color: "from-emerald-400 to-teal-400" },
  social: { label: "社交", emoji: "🤝", color: "from-violet-400 to-purple-400" },
  creative: { label: "创意", emoji: "🎨", color: "from-fuchsia-400 to-pink-400" }
} as const;

export type VibeKey = keyof typeof VIBE_TAGS;

export const ROLE_TYPES = {
  energizer: { label: "启动者", icon: "⚡", color: "text-orange-500" },
  connector: { label: "连接者", icon: "🤝", color: "text-purple-500" },
  reflector: { label: "思考者", icon: "🌿", color: "text-green-500" }
} as const;
