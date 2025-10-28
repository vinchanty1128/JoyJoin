export interface AttendeeData {
  userId: string;
  displayName: string;
  archetype?: string;
  topInterests?: string[];
  ageBand?: string;
  age?: number;
  industry?: string;
  ageVisible?: boolean;
  industryVisible?: boolean;
  gender?: string;
  educationLevel?: string;
  hometown?: string;
  educationVisible?: boolean;
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

export function calculateCommonInterests(
  attendees: AttendeeData[]
): CommonInterest[] {
  const interestMap = new Map<string, number>();
  
  attendees.forEach((attendee) => {
    if (attendee.topInterests) {
      attendee.topInterests.forEach((interest) => {
        interestMap.set(interest, (interestMap.get(interest) || 0) + 1);
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
  "探索者": "好奇心驱动，热衷于尝试新事物和新体验",
  "讲故事的人": "善于表达，喜欢分享经历和倾听他人",
  "智者": "深思熟虑，享受深度对话和知识交流",
  "发光体": "活力四射，能点燃团队氛围的正能量担当",
  "稳定器": "可靠稳重，为朋友提供情感支持和安全感",
  "The Explorer": "Curiosity-driven, loves trying new things",
  "The Storyteller": "Great at sharing experiences and listening",
  "The Sage": "Thoughtful, enjoys deep conversations",
  "The Radiator": "Energetic, lights up any gathering",
  "The Anchor": "Reliable, provides emotional support",
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

export function generateSparkPredictions(
  userInterests: string[],
  attendeeInterests: string[]
): string[] {
  if (!userInterests || !attendeeInterests) return [];
  
  const userSet = new Set(userInterests);
  const commonInterests = attendeeInterests.filter((interest) =>
    userSet.has(interest)
  );
  
  const predictions = commonInterests
    .map((interest) => sparkPredictions[interest])
    .filter((prediction): prediction is string => !!prediction)
    .slice(0, 2);
  
  return predictions;
}
