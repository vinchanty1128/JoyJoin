/**
 * Archetype configuration with icons, colors, and descriptions
 */

export const archetypeConfig: Record<string, { 
  icon: string; 
  color: string;
  bgColor: string;
  description: string;
}> = {
  "火花塞": { 
    icon: "🙌", 
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-900/20",
    description: "点燃话题的开场高手，能打破沉默，带动气氛"
  },
  "探索者": { 
    icon: "🧭", 
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/20",
    description: "好奇心驱动，喜欢发现新事物和深入讨论"
  },
  "故事家": { 
    icon: "📖", 
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/20",
    description: "善于分享经历，用故事连接人心"
  },
  "挑战者": { 
    icon: "⚡", 
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/20",
    description: "思维敏锐，喜欢辩论和挑战传统观点"
  },
  "连接者": { 
    icon: "🤝", 
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-100 dark:bg-cyan-900/20",
    description: "天生的社交桥梁，帮助他人建立联系"
  },
  "协调者": { 
    icon: "🎯", 
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/20",
    description: "平衡各方意见，确保每个人都被听到"
  },
  "氛围组": { 
    icon: "🎭", 
    color: "text-pink-600 dark:text-pink-400",
    bgColor: "bg-pink-100 dark:bg-pink-900/20",
    description: "活跃气氛，用幽默和活力感染他人"
  },
  "肯定者": { 
    icon: "🌟", 
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
    description: "给予鼓励和支持，让他人感到被认可"
  },
};
