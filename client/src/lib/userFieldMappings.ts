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

/**
 * Format age with Chinese unit
 */
export function formatAge(age: number | null | undefined): string {
  if (!age || age <= 0) return "";
  return `${age}岁`;
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
