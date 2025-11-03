/**
 * User field Chinese mappings for displaying demographic information
 */

export const genderMap: Record<string, string> = {
  "Woman": "女",
  "Man": "男",
  "Nonbinary": "非二元",
  "Self-describe": "自定义",
  "Prefer not to say": "不便透露",
};

export const genderIconMap: Record<string, string> = {
  "Woman": "♀",
  "Man": "♂",
  "Nonbinary": "⚧",
  "Self-describe": "◆",
  "Prefer not to say": "•",
};

export const educationLevelMap: Record<string, string> = {
  "High school/below": "高中及以下",
  "Some college/Associate": "大专",
  "Bachelor's": "本科",
  "Master's": "硕士",
  "Doctorate": "博士",
  "Trade/Vocational": "职业技术",
  "Prefer not to say": "不便透露",
};

export const relationshipStatusMap: Record<string, string> = {
  "Single": "单身",
  "In a relationship": "恋爱中",
  "Married/Partnered": "已婚",
  "It's complicated": "复杂",
  "Prefer not to say": "不便透露",
};

export const studyLocaleMap: Record<string, string> = {
  "Local": "本地",
  "Overseas": "海外",
  "Both": "都有",
  "Prefer not to say": "不便透露",
};

export const seniorityMap: Record<string, string> = {
  "Intern": "实习生",
  "Junior": "初级",
  "Mid": "中级",
  "Senior": "高级",
  "Founder": "创始人",
  "Executive": "高管",
};

export const childrenMap: Record<string, string> = {
  "No kids": "无孩子",
  "Expecting": "期待中",
  "0-5": "0-5岁",
  "6-12": "6-12岁",
  "13-18": "13-18岁",
  "Adult": "成年",
  "Prefer not to say": "不便透露",
};

export const intentMap: Record<string, string> = {
  "networking": "拓展人脉",
  "friends": "交朋友",
  "discussion": "深度讨论",
  "fun": "娱乐放松",
  "romance": "浪漫社交",
};

/**
 * Format age with Chinese unit
 */
export function formatAge(age: number | null | undefined): string {
  if (!age || age <= 0) return "";
  return `${age}岁`;
}

/**
 * Calculate age from birthdate
 */
export function calculateAge(birthdate: string | null | undefined): number {
  if (!birthdate) return 0;
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/**
 * Get gender display text
 */
export function getGenderDisplay(gender: string | null | undefined): string {
  if (!gender) return "";
  return genderMap[gender] || gender;
}

/**
 * Get gender icon
 */
export function getGenderIcon(gender: string | null | undefined): string {
  if (!gender) return "";
  return genderIconMap[gender] || "•";
}

/**
 * Get education level display text
 */
export function getEducationDisplay(educationLevel: string | null | undefined): string {
  if (!educationLevel) return "";
  return educationLevelMap[educationLevel] || educationLevel;
}

/**
 * Get relationship status display text
 */
export function getRelationshipDisplay(relationshipStatus: string | null | undefined): string {
  if (!relationshipStatus) return "";
  return relationshipStatusMap[relationshipStatus] || relationshipStatus;
}

/**
 * Get study locale display text
 */
export function getStudyLocaleDisplay(studyLocale: string | null | undefined): string {
  if (!studyLocale) return "";
  return studyLocaleMap[studyLocale] || studyLocale;
}

/**
 * Get seniority display text
 */
export function getSeniorityDisplay(seniority: string | null | undefined): string {
  if (!seniority) return "";
  return seniorityMap[seniority] || seniority;
}

/**
 * Get children status display text
 */
export function getChildrenDisplay(children: string | null | undefined): string {
  if (!children) return "";
  return childrenMap[children] || children;
}

/**
 * Get intent display text
 */
export function getIntentDisplay(intent: string | null | undefined): string {
  if (!intent) return "";
  return intentMap[intent] || intent;
}

/**
 * Format array with bullet separator
 */
export function formatArray(arr: string[] | null | undefined): string {
  if (!arr || arr.length === 0) return "";
  return arr.join(" · ");
}
