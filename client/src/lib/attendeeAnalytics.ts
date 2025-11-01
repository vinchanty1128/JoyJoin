export interface AttendeeData {
  userId: string;
  displayName: string;
  archetype?: string;
  topInterests?: string[];
  age?: number;
  birthdate?: string;
  industry?: string;
  ageVisible?: boolean;
  industryVisible?: boolean;
  gender?: string;
  pronouns?: string;
  educationLevel?: string;
  hometownCountry?: string;
  hometownRegionCity?: string;
  hometownAffinityOptin?: boolean;
  educationVisible?: boolean;
  relationshipStatus?: string;
  children?: string;
  studyLocale?: string;
  overseasRegions?: string[];
  seniority?: string;
  fieldOfStudy?: string;
  languagesComfort?: string[];
}

export interface CommonInterest {
  interest: string;
  count: number;
}

export interface ArchetypeDistribution {
  archetype: string;
  count: number;
  percentage: number;
}

export interface GroupInsight {
  type: 'industry' | 'interest' | 'experience';
  label: string;
  icon: string;
}

const interestNameMap: Record<string, string> = {
  "film_entertainment": "电影娱乐",
  "travel_exploration": "旅行探索",
  "food_dining": "美食餐饮",
  "music_concerts": "音乐演出",
  "reading_books": "阅读书籍",
  "art_culture": "艺术文化",
  "sports_fitness": "运动健身",
  "fitness_health": "健身健康",
  "photography": "摄影",
  "gaming": "游戏",
  "technology": "科技",
  "entrepreneurship": "创业",
  "networking": "社交拓展",
  "outdoor_activities": "户外活动",
  "yoga_meditation": "瑜伽冥想",
  "wine_spirits": "品酒",
  "coffee_tea": "咖啡茶艺",
  "cooking_baking": "烹饪烘焙",
};

export function normalizeInterestName(interest: string): string {
  return interestNameMap[interest] || interest;
}

export function calculateCommonInterests(
  attendees: AttendeeData[]
): CommonInterest[] {
  const interestMap = new Map<string, number>();
  
  attendees.forEach((attendee) => {
    if (attendee.topInterests) {
      attendee.topInterests.forEach((interest) => {
        const normalizedInterest = normalizeInterestName(interest);
        interestMap.set(normalizedInterest, (interestMap.get(normalizedInterest) || 0) + 1);
      });
    }
  });
  
  const commonInterests = Array.from(interestMap.entries())
    .map(([interest, count]) => ({ interest, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
  
  return commonInterests;
}

export function calculateArchetypeDistribution(
  attendees: AttendeeData[]
): ArchetypeDistribution[] {
  const archetypeMap = new Map<string, number>();
  const total = attendees.length;
  
  attendees.forEach((attendee) => {
    if (attendee.archetype) {
      archetypeMap.set(
        attendee.archetype,
        (archetypeMap.get(attendee.archetype) || 0) + 1
      );
    }
  });
  
  const distribution = Array.from(archetypeMap.entries())
    .map(([archetype, count]) => ({
      archetype,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
  
  return distribution;
}

export function calculateCommonInterestsWithUser(
  userInterests: string[],
  attendeeInterests: string[]
): number {
  if (!userInterests || !attendeeInterests) return 0;
  
  const userSet = new Set(userInterests);
  const commonCount = attendeeInterests.filter((interest) =>
    userSet.has(interest)
  ).length;
  
  return commonCount;
}

export const archetypeDescriptions: Record<string, string> = {
  // 8个核心社交角色
  "火花塞": "点燃话题，激发讨论的活力引擎",
  "探索者": "好奇心驱动，热衷于尝试新事物和新体验",
  "故事家": "善于表达，喜欢分享经历和倾听他人",
  "挑战者": "勇于质疑，推动深度思考和成长",
  "连接者": "擅长建立联系，串联不同的人和话题",
  "协调者": "平衡氛围，善于协调和化解分歧",
  "氛围组": "活跃气氛，让聚会充满欢声笑语",
  "肯定者": "给予支持和认可，提供情感价值",
  
  // 演示数据使用的角色
  "社交达人": "外向热情，擅长社交和建立人脉",
  "创意家": "充满想象力，带来新奇独特的视角",
  
  // 旧版角色（兼容性保留）
  "讲故事的人": "生动有趣，用故事连接彼此的情感",
  "智者": "深思熟虑，享受深度对话和知识交流",
  "发光体": "活力四射，能点燃团队氛围的正能量担当",
  "稳定器": "可靠稳重，为朋友提供情感支持和安全感",
};

export function generatePersonalizedDescription(
  attendee: AttendeeData
): string {
  if (!attendee.topInterests || attendee.topInterests.length === 0) {
    return "期待与你分享精彩时刻";
  }
  
  const interests = attendee.topInterests.slice(0, 2).join("、");
  const templates = [
    `最近迷上了${interests}`,
    `热爱${interests}的生活`,
    `喜欢探索${interests}的世界`,
    `${interests}是我的快乐源泉`,
  ];
  
  const hash = attendee.userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return templates[hash % templates.length];
}

const sparkPredictions: Record<string, string> = {
  "电影": "共同影迷",
  "旅行": "旅行搭子",
  "美食": "美食探店搭档",
  "音乐": "音乐知音",
  "阅读": "书友",
  "艺术": "艺术鉴赏伙伴",
  "运动": "运动伙伴",
  "健身": "健身搭子",
  "摄影": "摄影同好",
  "游戏": "游戏战友",
  "科技": "科技发烧友",
  "Film": "Movie Buddies",
  "Travel": "Travel Companions",
  "Food": "Foodie Friends",
  "Music": "Music Lovers",
  "Reading": "Book Club",
  "Art": "Art Enthusiasts",
  "Sports": "Sports Partners",
  "Fitness": "Gym Buddies",
  "Photography": "Photo Pals",
  "Gaming": "Gaming Partners",
  // English interest keys
  "film_entertainment": "共同影迷",
  "travel_exploration": "旅行搭子",
  "food_dining": "美食探店搭档",
  "music_concerts": "音乐知音",
  "reading_books": "书友",
  "art_culture": "艺术鉴赏伙伴",
  "sports_fitness": "运动伙伴",
  "fitness_health": "健身搭子",
  "photography": "摄影同好",
  "gaming": "游戏战友",
  "technology": "科技发烧友",
  "entrepreneurship": "创业搭档",
  "networking": "社交达人",
  "outdoor_activities": "户外探险伙伴",
  "yoga_meditation": "身心修炼伙伴",
  "wine_spirits": "品酒搭子",
  "coffee_tea": "咖啡/茶友",
  "cooking_baking": "下厨搭档",
};

export interface SparkPredictionContext {
  userInterests?: string[];
  userEducationLevel?: string;
  userIndustry?: string;
  userAge?: number;
  userRelationshipStatus?: string;
  userStudyLocale?: string;
  userSeniority?: string;
  userFieldOfStudy?: string;
  userLanguages?: string[];
}

export type RarityLevel = 'common' | 'rare' | 'epic';

export interface SparkPrediction {
  text: string;
  rarity: RarityLevel;
}

export type QualityTier = 'common' | 'rare' | 'epic';

export interface MatchQuality {
  rawScore: number;
  percentage: number;
  qualityTier: QualityTier;
  visualBoost: number;
}

// 契合点质量评分系统
export function calculateMatchQuality(connectionPoints: SparkPrediction[]): MatchQuality {
  const weights = {
    common: 1,    // 基础分
    rare: 3,      // 3倍权重
    epic: 6       // 6倍权重
  };
  
  let totalScore = 0;
  
  connectionPoints.forEach(point => {
    totalScore += weights[point.rarity];
  });
  
  // 能量环填充基于契合点数量（更宽松，更激励用户）
  // 假设6个契合点为满分（100%）
  const maxConnectionPoints = 6;
  const basePercentage = Math.min((connectionPoints.length / maxConnectionPoints) * 100, 100);
  
  // 质量层级基于最稀有的契合点（用于决定颜色和动效）
  let qualityTier: QualityTier;
  let visualBoost: number;
  
  const hasEpic = connectionPoints.some(point => point.rarity === 'epic');
  const hasRare = connectionPoints.some(point => point.rarity === 'rare');
  
  if (hasEpic) {
    qualityTier = 'epic';      // 有Epic契合点 - 金色能量环
    visualBoost = 15;           // 15%视觉加成
  } else if (hasRare) {
    qualityTier = 'rare';      // 有Rare契合点 - 紫色能量环  
    visualBoost = 10;           // 10%视觉加成
  } else {
    qualityTier = 'common';    // 只有Common契合点 - 灰色能量环
    visualBoost = 5;            // 5%视觉加成
  }
  
  return {
    rawScore: totalScore,
    percentage: basePercentage,
    qualityTier,
    visualBoost
  };
}

export function generateSparkPredictions(
  userContext: SparkPredictionContext,
  attendee: AttendeeData
): SparkPrediction[] {
  const predictions: SparkPrediction[] = [];
  
  // Priority 1: Interest-based predictions (most interesting and hidden)
  if (userContext.userInterests && attendee.topInterests) {
    const userSet = new Set(userContext.userInterests);
    const commonInterests = attendee.topInterests.filter((interest) =>
      userSet.has(interest)
    );
    
    // Interests are COMMON - many people share common interests
    const interestPredictions = commonInterests
      .map((interest) => sparkPredictions[interest])
      .filter((prediction): prediction is string => !!prediction)
      .slice(0, 3)
      .map(text => ({ text, rarity: 'common' as RarityLevel }));
    
    predictions.push(...interestPredictions);
  }
  
  // Priority 2: Study locale - Overseas experience (RARE - hidden info)
  if (userContext.userStudyLocale === "Overseas" && attendee.studyLocale === "Overseas") {
    predictions.push({ text: "都有海外留学经历", rarity: 'rare' });
  } else if (userContext.userStudyLocale === "Both" && attendee.studyLocale === "Both") {
    predictions.push({ text: "都有海外+国内学习经历", rarity: 'epic' }); // Very rare combination
  } else if (userContext.userStudyLocale && attendee.studyLocale && 
             userContext.userStudyLocale !== attendee.studyLocale) {
    // Different study backgrounds can also be interesting
    if ((userContext.userStudyLocale === "Overseas" && attendee.studyLocale === "Both") ||
        (userContext.userStudyLocale === "Both" && attendee.studyLocale === "Overseas")) {
      predictions.push({ text: "都有国际化视野", rarity: 'rare' });
    }
  }
  
  // Priority 3: Seniority-based predictions (RARE - career stage not obvious)
  if (userContext.userSeniority && attendee.seniority) {
    if (userContext.userSeniority === "Founder" && attendee.seniority === "Founder") {
      predictions.push({ text: "同为创业者", rarity: 'epic' }); // Founders are rare
    } else if (
      (userContext.userSeniority === "Senior" || userContext.userSeniority === "Executive") &&
      (attendee.seniority === "Senior" || attendee.seniority === "Executive")
    ) {
      predictions.push({ text: "都是职场老司机", rarity: 'rare' });
    } else if (
      userContext.userSeniority === "Junior" && attendee.seniority === "Junior"
    ) {
      predictions.push({ text: "都是职场新人", rarity: 'common' });
    } else if (
      userContext.userSeniority === "Mid" && attendee.seniority === "Mid"
    ) {
      predictions.push({ text: "职场中坚力量", rarity: 'common' });
    }
  }
  
  // Priority 4: Relationship status (COMMON - hidden but common)
  if (userContext.userRelationshipStatus && attendee.relationshipStatus) {
    if (userContext.userRelationshipStatus === "Married/Partnered" && 
        attendee.relationshipStatus === "Married/Partnered") {
      predictions.push({ text: "同为有伴一族", rarity: 'common' });
    } else if (userContext.userRelationshipStatus === "Single" && 
               attendee.relationshipStatus === "Single") {
      predictions.push({ text: "同为单身贵族", rarity: 'common' });
    }
  }
  
  // Priority 5: Education level (RARE/EPIC - advanced degrees)
  if (userContext.userEducationLevel && attendee.educationLevel) {
    if (userContext.userEducationLevel === attendee.educationLevel) {
      if (userContext.userEducationLevel === "Doctorate") {
        predictions.push({ text: "同为博士学历", rarity: 'epic' }); // PhDs are rare
      } else if (userContext.userEducationLevel === "Master's") {
        predictions.push({ text: "同为硕士学历", rarity: 'rare' });
      }
    }
  }
  
  // Priority 6: Age similarity (COMMON - life stage alignment)
  if (userContext.userAge && attendee.age) {
    const ageDiff = Math.abs(userContext.userAge - attendee.age);
    if (ageDiff <= 3) {
      predictions.push({ text: "年龄相近", rarity: 'common' });
    }
  }
  
  // Priority 7: Hometown matching (COMMON/RARE - regional connection)
  // Note: We don't have userHometown in context yet, so we'll skip for now
  // This can be enabled once we add hometown to SparkPredictionContext
  
  // Priority 8: Archetype matching (COMMON - personality alignment)
  if (attendee.archetype) {
    const archetypeMatches: Record<string, { compatible: string[]; text: string; rarity: RarityLevel }> = {
      "探索者": { 
        compatible: ["探索者", "发光体"], 
        text: "都喜欢探索新鲜事物",
        rarity: 'common'
      },
      "讲故事的人": { 
        compatible: ["讲故事的人", "智者"], 
        text: "都擅长分享与倾听",
        rarity: 'common'
      },
      "智者": { 
        compatible: ["智者", "讲故事的人"], 
        text: "都享受深度对话",
        rarity: 'common'
      },
      "发光体": { 
        compatible: ["发光体", "探索者"], 
        text: "都是活力满满的人",
        rarity: 'common'
      },
      "稳定器": { 
        compatible: ["稳定器", "智者"], 
        text: "都是可靠的伙伴",
        rarity: 'common'
      },
    };
    
    // Check if archetypes are compatible
    const userArchetype = Object.keys(archetypeMatches).find(key => 
      archetypeMatches[key].compatible.includes(attendee.archetype!)
    );
    
    if (userArchetype && archetypeMatches[userArchetype]) {
      predictions.push({ 
        text: archetypeMatches[userArchetype].text,
        rarity: archetypeMatches[userArchetype].rarity
      });
    }
  }
  
  // Priority 9: Industry matching (RARE - professional connection, but only if different from obvious info)
  if (userContext.userIndustry && attendee.industry && 
      userContext.userIndustry === attendee.industry &&
      !attendee.industryVisible) { // Only if industry not visible on card front
    
    const industryNames: Record<string, { text: string; rarity: RarityLevel }> = {
      "科技": { text: "都在科技圈", rarity: 'rare' },
      "金融": { text: "都在金融圈", rarity: 'rare' },
      "艺术": { text: "都在艺术领域", rarity: 'rare' },
      "医疗": { text: "都在医疗行业", rarity: 'rare' },
      "教育": { text: "都在教育行业", rarity: 'rare' },
    };
    
    if (industryNames[userContext.userIndustry]) {
      predictions.push({ 
        text: industryNames[userContext.userIndustry].text,
        rarity: industryNames[userContext.userIndustry].rarity
      });
    }
  }
  
  // Priority 10: Epic-level compound matches (multi-dimensional alignment)
  // These require 3+ factors to align - extremely rare
  
  // Triple match: Industry + Education + Study Locale (EPIC)
  if (userContext.userIndustry && attendee.industry &&
      userContext.userEducationLevel && attendee.educationLevel &&
      userContext.userStudyLocale && attendee.studyLocale &&
      userContext.userIndustry === attendee.industry &&
      userContext.userEducationLevel === "Master's" && attendee.educationLevel === "Master's" &&
      userContext.userStudyLocale === "Overseas" && attendee.studyLocale === "Overseas") {
    predictions.push({ 
      text: `同为${userContext.userIndustry}圈的硕士海归`,
      rarity: 'epic'
    });
  }
  
  // 🌟 NEW Epic-level predictions - Ultra-rare combinations
  
  // Creative interdisciplinary background (EPIC)
  if (userContext.userFieldOfStudy && attendee.fieldOfStudy) {
    const creativeFields = ["Arts/Design", "Music", "Film"];
    const techFields = ["CS", "Engineering"];
    const businessFields = ["Business", "Economics"];
    
    const userIsCreative = creativeFields.includes(userContext.userFieldOfStudy);
    const userIsTech = techFields.includes(userContext.userFieldOfStudy);
    const userIsBusiness = businessFields.includes(userContext.userFieldOfStudy);
    
    const attendeeIsCreative = creativeFields.includes(attendee.fieldOfStudy);
    const attendeeIsTech = techFields.includes(attendee.fieldOfStudy);
    const attendeeIsBusiness = businessFields.includes(attendee.fieldOfStudy);
    
    // Creative + Tech crossover
    if ((userIsCreative && attendeeIsTech) || (userIsTech && attendeeIsCreative)) {
      predictions.push({ 
        text: "跨界创意×技术的碰撞",
        rarity: 'epic'
      });
    }
    
    // Creative + Business crossover
    if ((userIsCreative && attendeeIsBusiness) || (userIsBusiness && attendeeIsCreative)) {
      predictions.push({ 
        text: "艺术与商业的融合",
        rarity: 'epic'
      });
    }
  }
  
  // Digital nomad lifestyle (EPIC)
  if (userContext.userInterests && attendee.topInterests) {
    const userHasRemoteWork = userContext.userInterests.some(i => 
      i.includes("远程工作") || i.includes("数字游民") || i.includes("自由职业")
    );
    const attendeeHasRemoteWork = attendee.topInterests.some(i => 
      i.includes("远程工作") || i.includes("数字游民") || i.includes("自由职业")
    );
    
    if (userHasRemoteWork && attendeeHasRemoteWork) {
      predictions.push({ 
        text: "同为数字游民一族",
        rarity: 'epic'
      });
    }
  }
  
  // Social impact orientation (EPIC)
  if (userContext.userInterests && attendee.topInterests) {
    const userHasSocialImpact = userContext.userInterests.some(i => 
      i.includes("公益") || i.includes("社会创新") || i.includes("可持续") || i.includes("环保")
    );
    const attendeeHasSocialImpact = attendee.topInterests.some(i => 
      i.includes("公益") || i.includes("社会创新") || i.includes("可持续") || i.includes("环保")
    );
    
    if (userHasSocialImpact && attendeeHasSocialImpact) {
      predictions.push({ 
        text: "都在做有意义的事",
        rarity: 'epic'
      });
    }
  }
  
  // Artistic creation experience (EPIC)
  if (userContext.userInterests && attendee.topInterests) {
    const artisticInterests = ["绘画", "摄影", "写作", "音乐创作", "设计"];
    
    const userArtisticCount = userContext.userInterests.filter(i => 
      artisticInterests.some(art => i.includes(art))
    ).length;
    
    const attendeeArtisticCount = attendee.topInterests.filter(i => 
      artisticInterests.some(art => i.includes(art))
    ).length;
    
    if (userArtisticCount >= 2 && attendeeArtisticCount >= 2) {
      predictions.push({ 
        text: "同为创作型灵魂",
        rarity: 'epic'
      });
    }
  }
  
  // Career transition journey (EPIC)
  if (userContext.userSeniority === "Founder" && attendee.seniority === "Founder" &&
      userContext.userIndustry && attendee.industry &&
      userContext.userIndustry !== attendee.industry) {
    predictions.push({ 
      text: "都在跨界创业",
      rarity: 'epic'
    });
  }
  
  // Multi-city living experience (EPIC - based on language diversity)
  if (userContext.userLanguages && attendee.languagesComfort) {
    const userLangCount = userContext.userLanguages.length;
    const attendeeLangCount = attendee.languagesComfort.length;
    
    if (userLangCount >= 3 && attendeeLangCount >= 3) {
      predictions.push({ 
        text: "都是多元文化的探索者",
        rarity: 'epic'
      });
    }
  }
  
  // Return top 6 predictions - perfect for 3x2 grid layout
  return predictions.slice(0, 6);
}

export function calculateGroupInsights(attendees: AttendeeData[]): GroupInsight[] {
  const insights: GroupInsight[] = [];
  
  // Industry diversity
  const industries = new Set<string>();
  attendees.forEach(attendee => {
    if (attendee.industry) {
      industries.add(attendee.industry);
    }
  });
  
  if (industries.size >= 3) {
    const industryList = Array.from(industries).slice(0, 3).join("、");
    insights.push({
      type: 'industry',
      label: `来自${industryList}等${industries.size}个行业`,
      icon: '💼'
    });
  } else if (industries.size === 2) {
    const industryList = Array.from(industries).join("、");
    insights.push({
      type: 'industry',
      label: `跨${industryList}行业`,
      icon: '💼'
    });
  }
  
  // Common interests
  const interestMap = new Map<string, number>();
  attendees.forEach(attendee => {
    if (attendee.topInterests) {
      attendee.topInterests.forEach(interest => {
        const normalizedInterest = normalizeInterestName(interest);
        interestMap.set(normalizedInterest, (interestMap.get(normalizedInterest) || 0) + 1);
      });
    }
  });
  
  const popularInterests = Array.from(interestMap.entries())
    .filter(([_, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  
  if (popularInterests.length > 0) {
    const interestList = popularInterests.map(([interest]) => interest).join("、");
    insights.push({
      type: 'interest',
      label: `都喜欢${interestList}`,
      icon: '✨'
    });
  }
  
  // Overseas experience
  const overseasCount = attendees.filter(
    a => a.studyLocale === "Overseas" || a.studyLocale === "Both"
  ).length;
  
  if (overseasCount >= 2) {
    if (overseasCount === attendees.length) {
      insights.push({
        type: 'experience',
        label: '均有海外经历',
        icon: '🌍'
      });
    } else {
      insights.push({
        type: 'experience',
        label: `${overseasCount}人有海外经历`,
        icon: '🌍'
      });
    }
  }
  
  // Career stage
  const seniorityCount = {
    'Founder': 0,
    'Executive': 0,
    'Senior': 0,
    'Mid': 0,
    'Junior': 0
  };
  
  attendees.forEach(attendee => {
    if (attendee.seniority && attendee.seniority in seniorityCount) {
      seniorityCount[attendee.seniority as keyof typeof seniorityCount]++;
    }
  });
  
  if (seniorityCount.Founder >= 2) {
    insights.push({
      type: 'experience',
      label: `${seniorityCount.Founder}位创业者`,
      icon: '🚀'
    });
  } else if (seniorityCount.Senior + seniorityCount.Executive >= 2) {
    insights.push({
      type: 'experience',
      label: '职场资深人士聚集',
      icon: '💡'
    });
  } else if (seniorityCount.Mid + seniorityCount.Junior >= 3) {
    insights.push({
      type: 'experience',
      label: '职场同龄人为主',
      icon: '🤝'
    });
  }
  
  // Relationship status
  const singleCount = attendees.filter(
    a => a.relationshipStatus === "Single"
  ).length;
  const marriedCount = attendees.filter(
    a => a.relationshipStatus === "Married/Partnered"
  ).length;
  
  if (singleCount >= 3) {
    insights.push({
      type: 'experience',
      label: '单身友好局',
      icon: '💫'
    });
  } else if (marriedCount >= 3) {
    insights.push({
      type: 'experience',
      label: '已婚/有伴侣人士',
      icon: '💑'
    });
  }
  
  // Education level
  const highEducation = attendees.filter(
    a => a.educationLevel === "Master's" || a.educationLevel === "Doctorate"
  ).length;
  
  if (highEducation >= 3) {
    insights.push({
      type: 'experience',
      label: '高学历人群',
      icon: '🎓'
    });
  }
  
  return insights.slice(0, 4);
}
