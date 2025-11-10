/**
 * 14种社交性格原型配置
 * 用于JoyJoin盲盒活动的AI匹配算法
 */

export const archetypeConfig: Record<string, { 
  icon: string; 
  color: string;
  bgColor: string;
  description: string;
  traits: string[]; // 核心特质
}> = {
  // 1. 外向活力型（Energizers）
  "火花塞": { 
    icon: "🙌", 
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-900/20",
    description: "点燃话题的开场高手，能打破沉默，带动气氛",
    traits: ["开场破冰", "带动气氛", "高能量", "热情"]
  },
  "氛围组": { 
    icon: "🎭", 
    color: "text-pink-600 dark:text-pink-400",
    bgColor: "bg-pink-100 dark:bg-pink-900/20",
    description: "活跃气氛，用幽默和活力感染他人",
    traits: ["幽默风趣", "表演力强", "感染力", "轻松愉快"]
  },
  "连接者": { 
    icon: "🤝", 
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-100 dark:bg-cyan-900/20",
    description: "天生的社交桥梁，帮助他人建立联系",
    traits: ["社交高手", "介绍引荐", "人脉广", "善于联结"]
  },
  
  // 2. 智慧探索型（Intellectuals）
  "探索者": { 
    icon: "🧭", 
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/20",
    description: "好奇心驱动，喜欢发现新事物和深入讨论",
    traits: ["好奇心强", "深度探索", "开放思维", "求知欲"]
  },
  "挑战者": { 
    icon: "⚡", 
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/20",
    description: "思维敏锐，喜欢辩论和挑战传统观点",
    traits: ["批判思维", "喜欢辩论", "逻辑严密", "不怕冲突"]
  },
  "智者": { 
    icon: "🦉", 
    color: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-100 dark:bg-slate-900/20",
    description: "深思熟虑，提供有见地的观点和建议",
    traits: ["深度思考", "洞察力强", "智慧沉稳", "理性分析"]
  },
  
  // 3. 温暖支持型（Nurturers）
  "肯定者": { 
    icon: "🌟", 
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
    description: "给予鼓励和支持，让他人感到被认可",
    traits: ["积极鼓励", "善于倾听", "情感支持", "正能量"]
  },
  "协调者": { 
    icon: "🎯", 
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/20",
    description: "平衡各方意见，确保每个人都被听到",
    traits: ["平衡协调", "公平公正", "照顾全局", "化解矛盾"]
  },
  "守护者": { 
    icon: "🛡️", 
    color: "text-teal-600 dark:text-teal-400",
    bgColor: "bg-teal-100 dark:bg-teal-900/20",
    description: "创造安全空间，让每个人都感到被尊重",
    traits: ["心理安全", "包容温暖", "保护弱势", "营造信任"]
  },
  
  // 4. 创意表达型（Creatives）
  "故事家": { 
    icon: "📖", 
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/20",
    description: "善于分享经历，用故事连接人心",
    traits: ["故事讲述", "经历丰富", "感染力", "生动有趣"]
  },
  "梦想家": { 
    icon: "🌈", 
    color: "text-violet-600 dark:text-violet-400",
    bgColor: "bg-violet-100 dark:bg-violet-900/20",
    description: "充满创意和想象力，激发新的可能性",
    traits: ["创意思维", "想象力", "未来导向", "启发灵感"]
  },
  "艺术家": { 
    icon: "🎨", 
    color: "text-fuchsia-600 dark:text-fuchsia-400",
    bgColor: "bg-fuchsia-100 dark:bg-fuchsia-900/20",
    description: "独特的审美视角，带来新鲜的观察角度",
    traits: ["审美独特", "感性细腻", "艺术气质", "观察敏锐"]
  },
  
  // 5. 务实执行型（Pragmatists）
  "组织者": { 
    icon: "📋", 
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/20",
    description: "高效有序，推动事情向前发展",
    traits: ["高效执行", "结构清晰", "目标导向", "实际可行"]
  },
  "实干家": { 
    icon: "🔧", 
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/20",
    description: "注重实践，提供具体可行的解决方案",
    traits: ["解决问题", "动手能力", "务实靠谱", "经验丰富"]
  },
};

// 原型分类
export const archetypeCategories = {
  energizers: ["火花塞", "氛围组", "连接者"],
  intellectuals: ["探索者", "挑战者", "智者"],
  nurturers: ["肯定者", "协调者", "守护者"],
  creatives: ["故事家", "梦想家", "艺术家"],
  pragmatists: ["组织者", "实干家"],
};

// 获取所有原型名称
export const allArchetypes = Object.keys(archetypeConfig);

// 根据分类获取原型
export function getArchetypesByCategory(category: keyof typeof archetypeCategories): string[] {
  return archetypeCategories[category];
}

// 检查是否为有效原型
export function isValidArchetype(archetype: string): boolean {
  return allArchetypes.includes(archetype);
}
