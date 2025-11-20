/**
 * Pool-Based Matching Service (池内匹配服务)
 * 两阶段匹配模型 - Stage 2: 用户报名后，在活动池内进行智能分组
 * 
 * 匹配逻辑：
 * 1. 硬约束过滤：检查用户是否符合活动池的硬性限制（性别、行业、年龄等）
 * 2. 软约束评分：基于5个维度计算用户之间的匹配分数
 *    - Personality Chemistry (性格兼容性)
 *    - Interest Overlap (兴趣重叠度)
 *    - Background Diversity (背景多样性)
 *    - Conversation Compatibility (语言沟通)
 *    - Event Preferences (活动偏好: 预算、饮食、社交目的)
 * 3. 智能分组：使用贪婪+优化算法形成高质量小组
 */

import { db } from "./db";
import { 
  eventPools, 
  eventPoolRegistrations, 
  eventPoolGroups,
  users, 
  matchingConfig,
  invitationUses,
  invitations,
  coupons,
  userCoupons
} from "@shared/schema";
import { eq, and, inArray } from "drizzle-orm";
import { wsService } from "./wsService";
import type { PoolMatchedData } from "../shared/wsEvents";

// 14种人格原型化学反应矩阵 (0-100分)
const CHEMISTRY_MATRIX: Record<string, Record<string, number>> = {
  "社交蝴蝶": { "社交蝴蝶": 75, "活动策划家": 90, "故事大王": 85, "群聊发动机": 80, "温暖聆听者": 70, "深度交流家": 65, "神秘观察者": 50, "灵魂摆渡人": 60, "幽默调和者": 88, "氛围感知者": 75, "好奇探索者": 82, "理性分析师": 55, "价值观守护者": 60, "独立思考者": 45 },
  "活动策划家": { "社交蝴蝶": 90, "活动策划家": 70, "故事大王": 75, "群聊发动机": 85, "温暖聆听者": 80, "深度交流家": 70, "神秘观察者": 55, "灵魂摆渡人": 65, "幽默调和者": 92, "氛围感知者": 88, "好奇探索者": 78, "理性分析师": 72, "价值观守护者": 68, "独立思考者": 50 },
  "故事大王": { "社交蝴蝶": 85, "活动策划家": 75, "故事大王": 65, "群聊发动机": 78, "温暖聆听者": 88, "深度交流家": 82, "神秘观察者": 60, "灵魂摆渡人": 75, "幽默调和者": 90, "氛围感知者": 80, "好奇探索者": 85, "理性分析师": 58, "价值观守护者": 72, "独立思考者": 55 },
  "群聊发动机": { "社交蝴蝶": 80, "活动策划家": 85, "故事大王": 78, "群聊发动机": 70, "温暖聆听者": 75, "深度交流家": 68, "神秘观察者": 52, "灵魂摆渡人": 62, "幽默调和者": 95, "氛围感知者": 82, "好奇探索者": 88, "理性分析师": 60, "价值观守护者": 65, "独立思考者": 48 },
  "温暖聆听者": { "社交蝴蝶": 70, "活动策划家": 80, "故事大王": 88, "群聊发动机": 75, "温暖聆听者": 85, "深度交流家": 95, "神秘观察者": 78, "灵魂摆渡人": 92, "幽默调和者": 80, "氛围感知者": 90, "好奇探索者": 75, "理性分析师": 70, "价值观守护者": 88, "独立思考者": 65 },
  "深度交流家": { "社交蝴蝶": 65, "活动策划家": 70, "故事大王": 82, "群聊发动机": 68, "温暖聆听者": 95, "深度交流家": 88, "神秘观察者": 80, "灵魂摆渡人": 90, "幽默调和者": 72, "氛围感知者": 85, "好奇探索者": 78, "理性分析师": 75, "价值观守护者": 92, "独立思考者": 82 },
  "神秘观察者": { "社交蝴蝶": 50, "活动策划家": 55, "故事大王": 60, "群聊发动机": 52, "温暖聆听者": 78, "深度交流家": 80, "神秘观察者": 70, "灵魂摆渡人": 85, "幽默调和者": 58, "氛围感知者": 88, "好奇探索者": 72, "理性分析师": 82, "价值观守护者": 75, "独立思考者": 90 },
  "灵魂摆渡人": { "社交蝴蝶": 60, "活动策划家": 65, "故事大王": 75, "群聊发动机": 62, "温暖聆听者": 92, "深度交流家": 90, "神秘观察者": 85, "灵魂摆渡人": 88, "幽默调和者": 70, "氛围感知者": 95, "好奇探索者": 68, "理性分析师": 72, "价值观守护者": 90, "独立思考者": 80 },
  "幽默调和者": { "社交蝴蝶": 88, "活动策划家": 92, "故事大王": 90, "群聊发动机": 95, "温暖聆听者": 80, "深度交流家": 72, "神秘观察者": 58, "灵魂摆渡人": 70, "幽默调和者": 75, "氛围感知者": 85, "好奇探索者": 90, "理性分析师": 65, "价值观守护者": 70, "独立思考者": 52 },
  "氛围感知者": { "社交蝴蝶": 75, "活动策划家": 88, "故事大王": 80, "群聊发动机": 82, "温暖聆听者": 90, "深度交流家": 85, "神秘观察者": 88, "灵魂摆渡人": 95, "幽默调和者": 85, "氛围感知者": 92, "好奇探索者": 78, "理性分析师": 75, "价值观守护者": 88, "独立思考者": 70 },
  "好奇探索者": { "社交蝴蝶": 82, "活动策划家": 78, "故事大王": 85, "群聊发动机": 88, "温暖聆听者": 75, "深度交流家": 78, "神秘观察者": 72, "灵魂摆渡人": 68, "幽默调和者": 90, "氛围感知者": 78, "好奇探索者": 80, "理性分析师": 85, "价值观守护者": 70, "独立思考者": 75 },
  "理性分析师": { "社交蝴蝶": 55, "活动策划家": 72, "故事大王": 58, "群聊发动机": 60, "温暖聆听者": 70, "深度交流家": 75, "神秘观察者": 82, "灵魂摆渡人": 72, "幽默调和者": 65, "氛围感知者": 75, "好奇探索者": 85, "理性分析师": 88, "价值观守护者": 78, "独立思考者": 92 },
  "价值观守护者": { "社交蝴蝶": 60, "活动策划家": 68, "故事大王": 72, "群聊发动机": 65, "温暖聆听者": 88, "深度交流家": 92, "神秘观察者": 75, "灵魂摆渡人": 90, "幽默调和者": 70, "氛围感知者": 88, "好奇探索者": 70, "理性分析师": 78, "价值观守护者": 90, "独立思考者": 82 },
  "独立思考者": { "社交蝴蝶": 45, "活动策划家": 50, "故事大王": 55, "群聊发动机": 48, "温暖聆听者": 65, "深度交流家": 82, "神秘观察者": 90, "灵魂摆渡人": 80, "幽默调和者": 52, "氛围感知者": 70, "好奇探索者": 75, "理性分析师": 92, "价值观守护者": 82, "独立思考者": 85 }
};

export interface UserWithProfile {
  userId: string;
  registrationId: string;
  
  // User profile (permanent)
  gender: string | null;
  age: number | null;
  industry: string | null;
  seniority: string | null;
  educationLevel: string | null;
  archetype: string | null;
  interestsTop: string[] | null;
  languagesComfort: string[] | null;
  
  // Event preferences (temporary, from registration)
  budgetRange: string[] | null;
  preferredLanguages: string[] | null;
  socialGoals: string[] | null;
  cuisinePreferences: string[] | null;
  dietaryRestrictions: string[] | null;
  tasteIntensity: string[] | null;
}

export interface MatchGroup {
  members: UserWithProfile[];
  avgPairScore: number;  // 平均配对兼容性分数（chemistry + interest + preference + language）
  diversityScore: number;  // 小组多样性分数
  overallScore: number;  // 综合分数 = avgPairScore × 0.7 + diversityScore × 0.3
  explanation: string;
}

/**
 * 硬约束检查：验证用户是否符合活动池的所有限制
 */
function meetsHardConstraints(
  user: UserWithProfile, 
  pool: typeof eventPools.$inferSelect
): boolean {
  // 性别限制
  if (pool.genderRestriction && user.gender !== pool.genderRestriction) {
    return false;
  }
  
  // 行业限制
  if (pool.industryRestrictions && pool.industryRestrictions.length > 0) {
    if (!user.industry || !pool.industryRestrictions.includes(user.industry)) {
      return false;
    }
  }
  
  // 职级限制
  if (pool.seniorityRestrictions && pool.seniorityRestrictions.length > 0) {
    if (!user.seniority || !pool.seniorityRestrictions.includes(user.seniority)) {
      return false;
    }
  }
  
  // 学历限制
  if (pool.educationLevelRestrictions && pool.educationLevelRestrictions.length > 0) {
    if (!user.educationLevel || !pool.educationLevelRestrictions.includes(user.educationLevel)) {
      return false;
    }
  }
  
  // 年龄限制
  if (pool.ageRangeMin && user.age && user.age < pool.ageRangeMin) {
    return false;
  }
  if (pool.ageRangeMax && user.age && user.age > pool.ageRangeMax) {
    return false;
  }
  
  return true;
}

/**
 * 计算两个用户之间的性格化学反应分数 (0-100)
 */
function calculateChemistryScore(user1: UserWithProfile, user2: UserWithProfile): number {
  const archetype1 = user1.archetype || "社交蝴蝶";
  const archetype2 = user2.archetype || "社交蝴蝶";
  
  return CHEMISTRY_MATRIX[archetype1]?.[archetype2] || 50;
}

/**
 * 计算兴趣重叠度 (0-100)
 */
function calculateInterestScore(user1: UserWithProfile, user2: UserWithProfile): number {
  const interests1 = user1.interestsTop || [];
  const interests2 = user2.interestsTop || [];
  
  if (interests1.length === 0 || interests2.length === 0) return 50;
  
  const overlap = interests1.filter(i => interests2.includes(i)).length;
  const totalUnique = new Set([...interests1, ...interests2]).size;
  
  return Math.round((overlap / totalUnique) * 100);
}

/**
 * 计算语言沟通兼容性 (0-100)
 */
function calculateLanguageScore(user1: UserWithProfile, user2: UserWithProfile): number {
  const langs1 = user1.languagesComfort || user1.preferredLanguages || [];
  const langs2 = user2.languagesComfort || user2.preferredLanguages || [];
  
  if (langs1.length === 0 || langs2.length === 0) return 70; // 默认假设可以沟通
  
  const overlap = langs1.filter(l => langs2.includes(l)).length;
  return overlap > 0 ? 100 : 30; // 有共同语言=100，无共同语言=30
}

/**
 * 计算活动偏好兼容性 (0-100)
 * 考虑：预算、饮食偏好、社交目的
 */
function calculatePreferenceScore(user1: UserWithProfile, user2: UserWithProfile): number {
  let score = 0;
  let factors = 0;
  
  // 预算兼容性
  const budget1 = user1.budgetRange || [];
  const budget2 = user2.budgetRange || [];
  if (budget1.length > 0 && budget2.length > 0) {
    const budgetOverlap = budget1.filter(b => budget2.includes(b)).length;
    score += (budgetOverlap / Math.max(budget1.length, budget2.length)) * 100;
    factors++;
  }
  
  // 饮食偏好兼容性
  const cuisine1 = user1.cuisinePreferences || [];
  const cuisine2 = user2.cuisinePreferences || [];
  if (cuisine1.length > 0 && cuisine2.length > 0) {
    const cuisineOverlap = cuisine1.filter(c => cuisine2.includes(c)).length;
    score += (cuisineOverlap / Math.max(cuisine1.length, cuisine2.length)) * 100;
    factors++;
  }
  
  // 社交目的兼容性
  const goals1 = user1.socialGoals || [];
  const goals2 = user2.socialGoals || [];
  if (goals1.length > 0 && goals2.length > 0) {
    const goalsOverlap = goals1.filter(g => goals2.includes(g)).length;
    score += (goalsOverlap / Math.max(goals1.length, goals2.length)) * 100;
    factors++;
  }
  
  return factors > 0 ? Math.round(score / factors) : 60; // 默认中等兼容
}

/**
 * 计算背景多样性分数 (0-100)
 * 不同行业、职级 = 更高分（鼓励多样性）
 */
function calculateDiversityScore(user1: UserWithProfile, user2: UserWithProfile): number {
  let diversityPoints = 0;
  
  // 不同行业 +50
  if (user1.industry && user2.industry && user1.industry !== user2.industry) {
    diversityPoints += 50;
  }
  
  // 不同职级 +30
  if (user1.seniority && user2.seniority && user1.seniority !== user2.seniority) {
    diversityPoints += 30;
  }
  
  // 不同性别 +20
  if (user1.gender && user2.gender && user1.gender !== user2.gender) {
    diversityPoints += 20;
  }
  
  return Math.min(diversityPoints, 100);
}

/**
 * 计算两个用户的配对兼容性分数 (0-100)
 * 注意：diversity在小组层面单独计算，不在配对层面重复计算
 */
function calculatePairScore(user1: UserWithProfile, user2: UserWithProfile): number {
  const chemistry = calculateChemistryScore(user1, user2);
  const interest = calculateInterestScore(user1, user2);
  const language = calculateLanguageScore(user1, user2);
  const preference = calculatePreferenceScore(user1, user2);
  
  // 权重配置：仅包含配对兼容性维度（总和100%）
  // diversity在小组层面单独计算，避免重复计算
  const weights = {
    chemistry: 0.375,   // 性格兼容性 37.5%
    interest: 0.3125,   // 兴趣重叠 31.25%
    preference: 0.25,   // 活动偏好 25%
    language: 0.1875    // 语言沟通 18.75%
  };
  
  const totalScore = 
    chemistry * weights.chemistry +
    interest * weights.interest +
    preference * weights.preference +
    language * weights.language;
  
  return Math.round(totalScore);
}

/**
 * 计算小组内所有成员的平均配对兼容性分数
 * 包含：chemistry + interest + preference + language（不含diversity）
 */
function calculateGroupPairScore(members: UserWithProfile[]): number {
  if (members.length < 2) return 0;
  
  let totalScore = 0;
  let pairCount = 0;
  
  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      totalScore += calculatePairScore(members[i], members[j]);
      pairCount++;
    }
  }
  
  return pairCount > 0 ? Math.round(totalScore / pairCount) : 0;
}

/**
 * 计算小组的多样性分数
 */
function calculateGroupDiversity(members: UserWithProfile[]): number {
  const uniqueIndustries = new Set(members.map(m => m.industry).filter(Boolean)).size;
  const uniqueSeniorities = new Set(members.map(m => m.seniority).filter(Boolean)).size;
  const uniqueGenders = new Set(members.map(m => m.gender).filter(Boolean)).size;
  const uniqueArchetypes = new Set(members.map(m => m.archetype).filter(Boolean)).size;
  
  // 归一化到 0-100
  const maxDiversity = members.length;
  const diversityScore = 
    (uniqueIndustries / maxDiversity) * 25 +
    (uniqueSeniorities / maxDiversity) * 25 +
    (uniqueGenders / maxDiversity) * 25 +
    (uniqueArchetypes / maxDiversity) * 25;
  
  return Math.round(diversityScore * 100);
}

/**
 * 生成小组匹配解释文案
 */
function generateGroupExplanation(group: MatchGroup): string {
  const archetypes = group.members.map(m => m.archetype || "未知").filter((v, i, a) => a.indexOf(v) === i);
  const industries = group.members.map(m => m.industry || "未知").filter((v, i, a) => a.indexOf(v) === i);
  
  return `这个小组有${group.members.length}位成员，包含${archetypes.length}种人格类型（${archetypes.join("、")}），来自${industries.length}个行业。平均配对兼容性${group.avgPairScore}，多样性分数${group.diversityScore}，综合匹配度${group.overallScore}。`;
}

/**
 * 主匹配算法：贪婪+优化策略
 * 1. 按匹配分数排序所有可能的配对
 * 2. 贪婪地组建小组，确保每个小组质量
 * 3. 优化：调整边界成员以提升整体分数
 */
export async function matchEventPool(poolId: string): Promise<MatchGroup[]> {
  // 1. 获取活动池配置
  const pool = await db.query.eventPools.findFirst({
    where: eq(eventPools.id, poolId)
  });
  
  if (!pool) {
    throw new Error("活动池不存在");
  }
  
  // 2. 获取所有报名者 + 用户资料
  const registrations = await db
    .select({
      registrationId: eventPoolRegistrations.id,
      userId: eventPoolRegistrations.userId,
      budgetRange: eventPoolRegistrations.budgetRange,
      preferredLanguages: eventPoolRegistrations.preferredLanguages,
      socialGoals: eventPoolRegistrations.socialGoals,
      cuisinePreferences: eventPoolRegistrations.cuisinePreferences,
      dietaryRestrictions: eventPoolRegistrations.dietaryRestrictions,
      tasteIntensity: eventPoolRegistrations.tasteIntensity,
      gender: users.gender,
      age: users.age,
      industry: users.industry,
      seniority: users.seniority,
      educationLevel: users.educationLevel,
      archetype: users.archetype,
      interestsTop: users.interestsTop,
      languagesComfort: users.languagesComfort,
    })
    .from(eventPoolRegistrations)
    .innerJoin(users, eq(eventPoolRegistrations.userId, users.id))
    .where(
      and(
        eq(eventPoolRegistrations.poolId, poolId),
        eq(eventPoolRegistrations.matchStatus, "pending")
      )
    );
  
  // 3. 硬约束过滤
  const eligibleUsers = registrations.filter((reg: any) => 
    meetsHardConstraints(reg as UserWithProfile, pool)
  );
  
  if (eligibleUsers.length < (pool.minGroupSize || 4)) {
    throw new Error(`报名人数不足，至少需要${pool.minGroupSize}人`);
  }
  
  // 3.5 获取邀请关系 (invitation relationships)
  // Query all invitation uses for registrations in this pool
  const registrationIds = eligibleUsers.map(u => u.registrationId);
  
  // Build invitation map: inviteeUserId -> inviterUserId
  // This will help us prioritize matching invited users with their inviters
  const invitationPairs: Array<{inviterId: string, inviteeId: string}> = [];
  
  for (const user of eligibleUsers) {
    // Check if this user was invited (is an invitee)
    const [inviteUse] = await db
      .select()
      .from(invitationUses)
      .where(eq(invitationUses.poolRegistrationId, user.registrationId))
      .limit(1);
    
    if (inviteUse && inviteUse.invitationId) {
      // Get the invitation to find who invited this user
      const [invitation] = await db
        .select()
        .from(invitations)
        .where(eq(invitations.code, inviteUse.invitationId))
        .limit(1);
      
      if (invitation) {
        // Check if inviter is also in this pool
        const inviter = eligibleUsers.find(u => u.userId === invitation.inviterId);
        if (inviter) {
          invitationPairs.push({
            inviterId: inviter.userId,
            inviteeId: user.userId
          });
        }
      }
    }
  }
  
  // 4. 贪婪分组算法（优先处理邀请关系）
  const groups: MatchGroup[] = [];
  const used = new Set<string>();
  const targetGroupSize = pool.maxGroupSize || 6;
  const minGroupSize = pool.minGroupSize || 4;
  
  // 计算所有可能的配对分数，并为邀请关系加权
  const pairScores: { user1: UserWithProfile; user2: UserWithProfile; score: number; isInvited: boolean }[] = [];
  for (let i = 0; i < eligibleUsers.length; i++) {
    for (let j = i + 1; j < eligibleUsers.length; j++) {
      let score = calculatePairScore(
        eligibleUsers[i] as UserWithProfile, 
        eligibleUsers[j] as UserWithProfile
      );
      
      // Check if this pair has an invitation relationship
      const user1 = eligibleUsers[i] as UserWithProfile;
      const user2 = eligibleUsers[j] as UserWithProfile;
      const isInvited = invitationPairs.some(pair => 
        (pair.inviterId === user1.userId && pair.inviteeId === user2.userId) ||
        (pair.inviterId === user2.userId && pair.inviteeId === user1.userId)
      );
      
      // Boost score for invited pairs (soft constraint)
      if (isInvited) {
        score = Math.min(100, score + 20); // Add 20 points bonus
      }
      
      pairScores.push({
        user1,
        user2,
        score,
        isInvited
      });
    }
  }
  
  // 按分数降序排序（邀请关系会自动排在前面因为有加分）
  pairScores.sort((a, b) => b.score - a.score);
  
  // 贪婪组建小组
  for (const pair of pairScores) {
    if (used.has(pair.user1.userId) || used.has(pair.user2.userId)) continue;
    
    // 以这对高分用户为核心，找到其他合适的成员
    const groupMembers = [pair.user1, pair.user2];
    used.add(pair.user1.userId);
    used.add(pair.user2.userId);
    
    // 继续添加成员直到达到目标人数
    while (groupMembers.length < targetGroupSize) {
      let bestCandidate: UserWithProfile | null = null;
      let bestScore = 0;
      
      for (const candidate of eligibleUsers as UserWithProfile[]) {
        if (used.has(candidate.userId)) continue;
        
        // 计算候选人与当前小组成员的平均分数
        let totalScore = 0;
        for (const member of groupMembers) {
          totalScore += calculatePairScore(candidate, member);
        }
        const avgScore = totalScore / groupMembers.length;
        
        if (avgScore > bestScore) {
          bestScore = avgScore;
          bestCandidate = candidate;
        }
      }
      
      if (bestCandidate && bestScore >= 60) { // 最低质量门槛
        groupMembers.push(bestCandidate);
        used.add(bestCandidate.userId);
      } else {
        break; // 没有合适的候选人
      }
    }
    
    // 只保留达到最小人数的小组
    if (groupMembers.length >= minGroupSize) {
      const avgPairScore = calculateGroupPairScore(groupMembers);
      const diversity = calculateGroupDiversity(groupMembers);
      const overall = Math.round((avgPairScore * 0.7) + (diversity * 0.3));
      
      const group: MatchGroup = {
        members: groupMembers,
        avgPairScore: avgPairScore,
        diversityScore: diversity,
        overallScore: overall,
        explanation: ""
      };
      
      group.explanation = generateGroupExplanation(group);
      groups.push(group);
    } else {
      // 释放这些成员，允许他们加入其他组
      groupMembers.forEach(m => used.delete(m.userId));
    }
    
    // 达到目标组数就停止
    if (groups.length >= (pool.targetGroups || 1)) {
      break;
    }
  }
  
  return groups;
}

/**
 * 保存匹配结果到数据库
 */
export async function saveMatchResults(poolId: string, groups: MatchGroup[]): Promise<void> {
  // 获取活动池信息用于通知
  const [pool] = await db.select().from(eventPools).where(eq(eventPools.id, poolId));
  
  // 1. 创建小组记录并发送WebSocket通知
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    
    const [groupRecord] = await db.insert(eventPoolGroups).values({
      poolId,
      groupNumber: i + 1,
      memberCount: group.members.length,
      avgChemistryScore: group.avgPairScore,
      diversityScore: group.diversityScore,
      overallScore: group.overallScore,
      matchExplanation: group.explanation,
      status: "confirmed"
    }).returning();
    
    // 2. 更新用户报名状态
    const memberRegistrationIds = group.members.map(m => m.registrationId);
    await db.update(eventPoolRegistrations)
      .set({
        matchStatus: "matched",
        assignedGroupId: groupRecord.id,
        matchScore: group.overallScore,
        updatedAt: new Date()
      })
      .where(inArray(eventPoolRegistrations.id, memberRegistrationIds));
    
    // 3. 发送WebSocket通知给每个匹配到的用户
    const memberUserIds = group.members.map(m => m.userId);
    const notificationData: PoolMatchedData = {
      poolId,
      poolTitle: pool?.title || "活动池",
      groupId: groupRecord.id,
      groupNumber: i + 1,
      matchScore: group.overallScore,
      memberCount: group.members.length
    };
    
    memberUserIds.forEach(userId => {
      wsService.broadcastToUser(userId, {
        type: "POOL_MATCHED",
        data: notificationData,
        timestamp: new Date().toISOString()
      });
    });
    
    console.log(`[Pool Matching] Sent POOL_MATCHED notification to ${memberUserIds.length} users for group ${i + 1}`);
  }
  
  // 4. 更新活动池状态
  await db.update(eventPools)
    .set({
      status: "matched",
      successfulMatches: groups.reduce((sum, g) => sum + g.members.length, 0),
      matchedAt: new Date(),
      updatedAt: new Date()
    })
    .where(eq(eventPools.id, poolId));
  
  // 5. 标记未匹配用户
  await db.update(eventPoolRegistrations)
    .set({
      matchStatus: "unmatched",
      updatedAt: new Date()
    })
    .where(
      and(
        eq(eventPoolRegistrations.poolId, poolId),
        eq(eventPoolRegistrations.matchStatus, "pending")
      )
    );
  
  // 6. 发放邀请奖励优惠券 (Invitation Reward Coupons)
  await processInvitationRewards(poolId, groups);
}

/**
 * 处理邀请奖励：为成功匹配的邀请关系发放优惠券
 */
async function processInvitationRewards(poolId: string, groups: MatchGroup[]): Promise<void> {
  // 查找邀请奖励优惠券（管理员需要预先创建code为"INVITE_REWARD"的优惠券）
  const [inviteRewardCoupon] = await db.select()
    .from(coupons)
    .where(eq(coupons.code, "INVITE_REWARD"))
    .limit(1);
  
  if (!inviteRewardCoupon || !inviteRewardCoupon.isActive) {
    console.log('[Invitation Reward] No active INVITE_REWARD coupon found, skipping rewards');
    return;
  }
  
  // 获取该pool的所有成功匹配的用户
  const allMatchedUserIds = groups.flatMap(g => g.members.map(m => m.userId));
  
  // 查找所有涉及该pool的邀请使用记录
  const poolRegistrations = await db.select()
    .from(eventPoolRegistrations)
    .where(eq(eventPoolRegistrations.poolId, poolId));
  
  const registrationIds = poolRegistrations.map(r => r.id);
  
  if (registrationIds.length === 0) return;
  
  const inviteUses = await db.select()
    .from(invitationUses)
    .where(inArray(invitationUses.poolRegistrationId, registrationIds));
  
  // 对于每个邀请使用记录，检查是否成功匹配到同一局
  for (const inviteUse of inviteUses) {
    if (inviteUse.rewardIssued || !inviteUse.invitationId) continue;
    
    // 获取邀请信息
    const [invitation] = await db.select()
      .from(invitations)
      .where(eq(invitations.code, inviteUse.invitationId))
      .limit(1);
    
    if (!invitation) continue;
    
    const inviterId = invitation.inviterId;
    const inviteeId = inviteUse.inviteeId;
    
    // 检查inviter和invitee是否都在匹配用户列表中
    if (!allMatchedUserIds.includes(inviterId) || !allMatchedUserIds.includes(inviteeId)) {
      continue;
    }
    
    // 检查他们是否在同一个group中
    let matchedTogether = false;
    for (const group of groups) {
      const groupUserIds = group.members.map(m => m.userId);
      if (groupUserIds.includes(inviterId) && groupUserIds.includes(inviteeId)) {
        matchedTogether = true;
        break;
      }
    }
    
    if (matchedTogether) {
      // 发放优惠券给邀请人
      try {
        await db.insert(userCoupons).values({
          userId: inviterId,
          couponId: inviteRewardCoupon.id,
          source: "invitation_reward",
          sourceId: invitation.id,
          isUsed: false
        });
        
        // 标记奖励已发放
        await db.update(invitationUses)
          .set({
            matchedTogether: true,
            rewardIssued: true,
            matchedAt: new Date()
          })
          .where(eq(invitationUses.id, inviteUse.id));
        
        console.log(`[Invitation Reward] Issued coupon to user ${inviterId} for inviting ${inviteeId}`);
      } catch (error) {
        console.error(`[Invitation Reward] Failed to issue coupon:`, error);
      }
    }
  }
}
