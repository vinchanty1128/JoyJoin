/**
 * 12-Archetype Animal Social Vibe System
 * 用于JoyJoin盲盒活动的AI匹配算法
 */

export const archetypeConfig: Record<string, { 
  icon: string; 
  color: string;
  bgColor: string;
  description: string;
  traits: string[]; // 核心特质
  energyLevel: number; // 社交能量值 (30-95)
}> = {
  // 高能量区 (82-95)
  "开心柯基": { 
    icon: "🐕", 
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-900/20",
    description: "团队永动机，摇尾点火官，擅长破冰和带动气氛",
    traits: ["破冰高手", "活力充沛", "热情洋溢", "快速建立连接"],
    energyLevel: 95
  },
  "太阳鸡": { 
    icon: "🐓", 
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/20",
    description: "人间小暖气，咯咯小太阳，散发稳定温暖的正能量",
    traits: ["温暖包容", "积极乐观", "照顾他人", "提升幸福感"],
    energyLevel: 90
  },
  "夸夸豚": { 
    icon: "🐬", 
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-100 dark:bg-cyan-900/20",
    description: "掌声发动机，首席鼓掌官，善于发现和放大他人优点",
    traits: ["积极反馈", "鼓励他人", "热情回应", "增强信心"],
    energyLevel: 85
  },
  "机智狐": { 
    icon: "🦊", 
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/20",
    description: "城市探险家，巷口密探，好奇心强、信息灵通",
    traits: ["探索新鲜", "信息丰富", "勇于尝试", "带来惊喜"],
    energyLevel: 82
  },
  
  // 中能量区 (68-75)
  "淡定海豚": { 
    icon: "🐬", 
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/20",
    description: "气氛调频手，气氛冲浪手，情商高、应变力强",
    traits: ["平衡氛围", "察觉情绪", "化解冲突", "灵活应变"],
    energyLevel: 75
  },
  "织网蛛": { 
    icon: "🕷️", 
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/20",
    description: "社交黏合剂，关系织网师，善于建立连接和构建网络",
    traits: ["连接他人", "发现共同点", "人脉广泛", "社交敏锐"],
    energyLevel: 72
  },
  "暖心熊": { 
    icon: "🐻", 
    color: "text-pink-600 dark:text-pink-400",
    bgColor: "bg-pink-100 dark:bg-pink-900/20",
    description: "故事收藏家，怀抱故事熊，善于倾听和共情",
    traits: ["深度倾听", "温暖包容", "情感连接", "真诚共情"],
    energyLevel: 70
  },
  "灵感章鱼": { 
    icon: "🐙", 
    color: "text-violet-600 dark:text-violet-400",
    bgColor: "bg-violet-100 dark:bg-violet-900/20",
    description: "创意喷射器，脑洞喷墨章，思维跳跃、联想丰富",
    traits: ["创意发散", "多线思维", "激发脑暴", "无穷想象"],
    energyLevel: 68
  },
  
  // 低能量区 (52-55)
  "沉思猫头鹰": { 
    icon: "🦉", 
    color: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-100 dark:bg-slate-900/20",
    description: "哲学带师，推镜思考官，逻辑性强、善于提问",
    traits: ["深度思考", "逻辑严密", "洞察力强", "发现盲点"],
    energyLevel: 55
  },
  "定心大象": { 
    icon: "🐘", 
    color: "text-gray-600 dark:text-gray-400",
    bgColor: "bg-gray-100 dark:bg-gray-900/20",
    description: "团队定盘星，象鼻定心锚，稳重可靠、包容豁达",
    traits: ["稳定支持", "可靠后盾", "包容大度", "安全感强"],
    energyLevel: 52
  },
  
  // 超低能量区 (30-38)
  "稳如龟": { 
    icon: "🐢", 
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/20",
    description: "人间观察家，慢语真知龟，思考深入、言简意赅",
    traits: ["深度洞察", "一针见血", "观察敏锐", "低频高质"],
    energyLevel: 38
  },
  "隐身猫": { 
    icon: "🐱", 
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/20",
    description: "安静陪伴者，安静伴伴猫，存在感低但不施加压力",
    traits: ["安静陪伴", "轻松自在", "不施压力", "享受旁观"],
    energyLevel: 30
  },
};

// 原型分类（按能量区分）
export const archetypeCategories = {
  highEnergy: ["开心柯基", "太阳鸡", "夸夸豚", "机智狐"],
  mediumEnergy: ["淡定海豚", "织网蛛", "暖心熊", "灵感章鱼"],
  lowEnergy: ["沉思猫头鹰", "定心大象"],
  veryLowEnergy: ["稳如龟", "隐身猫"],
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

// 根据能量等级获取原型
export function getArchetypesByEnergyRange(min: number, max: number): string[] {
  return allArchetypes.filter(
    archetype => {
      const energy = archetypeConfig[archetype].energyLevel;
      return energy >= min && energy <= max;
    }
  );
}
