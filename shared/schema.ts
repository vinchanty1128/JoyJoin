import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  
  // Profile fields
  displayName: varchar("display_name"),
  hasCompletedProfileSetup: boolean("has_completed_profile_setup").default(false),
  hasCompletedVoiceQuiz: boolean("has_completed_voice_quiz").default(false),
  
  // Registration fields - Identity
  birthdate: date("birthdate"), // Used to calculate age
  age: integer("age"), // Deprecated - calculated from birthdate
  ageVisibility: varchar("age_visibility").default("hide_all"), // hide_all, show_exact_age
  gender: varchar("gender"), // Woman, Man, Nonbinary, Self-describe, Prefer not to say
  pronouns: varchar("pronouns"), // She/Her, He/Him, They/Them, Self-describe, Prefer not to say
  
  // Registration fields - Background
  relationshipStatus: varchar("relationship_status"), // Single, In a relationship, Married/Partnered, It's complicated, Prefer not to say
  children: varchar("children"), // No kids, Expecting, 0-5, 6-12, 13-18, Adult, Prefer not to say
  hasKids: boolean("has_kids"), // Deprecated in favor of children
  
  // Registration fields - Education
  educationLevel: varchar("education_level"), // High school/below, Some college/Associate, Bachelor's, Master's, Doctorate, Trade/Vocational, Prefer not to say
  studyLocale: varchar("study_locale"), // Local, Overseas, Both, Prefer not to say
  overseasRegions: text("overseas_regions").array(), // NA, Europe, East Asia, SE Asia, etc.
  fieldOfStudy: varchar("field_of_study"), // Business, Engineering, CS, Arts/Design, etc.
  educationVisibility: varchar("education_visibility").default("hide_all"), // hide_all, show_level_only, show_level_and_field
  
  // Registration fields - Work
  industry: varchar("industry"), // Coarse taxonomy
  roleTitleShort: varchar("role_title_short"), // Optional short text
  seniority: varchar("seniority"), // Intern, Junior, Mid, Senior, Founder, Executive
  workVisibility: varchar("work_visibility").default("show_industry_only"), // hide_all, show_industry_only
  
  // Registration fields - Culture & Language
  hometownCountry: varchar("hometown_country"),
  hometownRegionCity: varchar("hometown_region_city"),
  hometownAffinityOptin: boolean("hometown_affinity_optin").default(true),
  languagesComfort: text("languages_comfort").array(), // English, Mandarin, Cantonese, etc.
  
  // Registration fields - Deprecated/Legacy
  placeOfOrigin: varchar("place_of_origin"), // Deprecated in favor of hometown fields
  longTermBase: varchar("long_term_base"), // Deprecated - use location preferences
  wechatId: varchar("wechat_id"), // WeChat ID
  phoneNumber: varchar("phone_number").unique(), // Phone number for authentication
  
  // Registration fields - Access & Safety
  accessibilityNeeds: text("accessibility_needs"), // Optional text
  safetyNoteHost: text("safety_note_host"), // Private note to host
  
  // Onboarding progress
  hasCompletedRegistration: boolean("has_completed_registration").default(false),
  hasCompletedInterestsTopics: boolean("has_completed_interests_topics").default(false),
  hasCompletedPersonalityTest: boolean("has_completed_personality_test").default(false),
  
  // Interests & Topics (Step 2)
  interestsTop: text("interests_top").array(), // 3-7 selected interests
  interestsRankedTop3: text("interests_ranked_top3").array(), // Top 3 ranked interests
  topicsHappy: text("topics_happy").array(), // Topics user enjoys discussing
  topicsAvoid: text("topics_avoid").array(), // Topics to avoid
  
  // Personality data (Step 3 - Vibe Vector)
  vibeVector: jsonb("vibe_vector"), // {energy, conversation_style, initiative, novelty, humor} scored 0-1
  archetype: varchar("archetype"), // Radiator, Anchor, Explorer, Storyteller, Sage
  debateComfort: integer("debate_comfort"), // 1-7 scale
  
  // Legacy personality data (deprecated)
  personalityTraits: jsonb("personality_traits"),
  personalityChallenges: text("personality_challenges").array(),
  idealMatch: text("ideal_match"),
  energyLevel: integer("energy_level"),
  
  // Social role (from personality test - now mapped to archetype)
  primaryRole: varchar("primary_role"), // 8 core roles - legacy
  secondaryRole: varchar("secondary_role"),
  roleSubtype: varchar("role_subtype"),
  
  // Budget preference
  budgetPreference: text("budget_preference").array(),
  
  // Gamification
  eventsAttended: integer("events_attended").default(0),
  matchesMade: integer("matches_made").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Events table
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  dateTime: timestamp("date_time").notNull(),
  location: varchar("location").notNull(),
  area: varchar("area"),
  price: integer("price"),
  maxAttendees: integer("max_attendees").default(10),
  currentAttendees: integer("current_attendees").default(0),
  iconName: varchar("icon_name"),
  hostId: varchar("host_id").references(() => users.id),
  status: varchar("status").default("upcoming"), // upcoming, ongoing, completed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Event attendance table
export const eventAttendance = pgTable("event_attendance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  joinedAt: timestamp("joined_at").defaultNow(),
  status: varchar("status").default("confirmed"), // confirmed, cancelled, attended
  intent: varchar("intent"), // Event-specific intent: networking, friends, discussion, fun, romance
});

// Match history table - tracks who has been matched together before (anti-repetition)
export const matchHistory = pgTable("match_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user1Id: varchar("user1_id").notNull().references(() => users.id),
  user2Id: varchar("user2_id").notNull().references(() => users.id),
  eventId: varchar("event_id").notNull().references(() => blindBoxEvents.id),
  matchedAt: timestamp("matched_at").defaultNow(),
  connectionQuality: integer("connection_quality"), // Post-event feedback: 1-5 score
  wouldMeetAgain: boolean("would_meet_again"), // Whether they'd want to be matched again
});

// Chat messages table
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Post-event feedback table
export const eventFeedback = pgTable("event_feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => blindBoxEvents.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  
  // Legacy fields (deprecated but kept for backward compatibility)
  rating: integer("rating"), // 1-5 stars
  vibeMatch: integer("vibe_match"), // How well did the vibe match expectations (1-5)
  energyMatch: integer("energy_match"), // How well did the energy match (1-5)
  wouldAttendAgain: boolean("would_attend_again"),
  feedback: text("feedback"),
  connections: text("connections").array(), // User IDs of people they connected with
  
  // New balanced feedback system fields
  // Dimension 1: Overall Atmosphere - Thermometer
  atmosphereScore: integer("atmosphere_score"), // 1-5 (1=尴尬, 2=平淡, 3=舒适, 4=热烈, 5=完美)
  atmosphereNote: text("atmosphere_note"), // Optional supplementary note
  
  // Dimension 2: Attendee Impressions - Trait Tags
  attendeeTraits: jsonb("attendee_traits"), // {userId: {displayName, tags: string[], needsImprovement: boolean, improvementNote: string}}
  
  // Dimension 3: Connection Radar
  connectionRadar: jsonb("connection_radar"), // {topicResonance: 1-5, personalityMatch: 1-5, backgroundDiversity: 1-5, overallFit: 1-5}
  hasNewConnections: boolean("has_new_connections"), // Whether they want to keep in touch with anyone
  connectionStatus: varchar("connection_status"), // "已交换联系方式", "有但还没联系", "没有但很愉快", "没有不太合适"
  
  // Dimension 4: Improvement Suggestions - Magic Recipe Cards
  improvementAreas: text("improvement_areas").array(), // Max 3 areas
  improvementOther: text("improvement_other"), // Custom improvement suggestion
  
  // Gamification & Rewards
  completedAt: timestamp("completed_at"),
  rewardsClaimed: boolean("rewards_claimed").default(false),
  rewardPoints: integer("reward_points").default(50), // Points earned for completing feedback
  
  // Deep Feedback (Optional) - User Co-creation Module
  hasDeepFeedback: boolean("has_deep_feedback").default(false),
  
  // Module 1: Match Point Validation
  matchPointValidation: jsonb("match_point_validation"), // {[matchPoint]: {discussed: 'deeply'|'briefly'|'not', notes: string}}
  additionalMatchPoints: text("additional_match_points"), // Other common points that facilitated conversation
  
  // Module 2: Conversation Dynamics
  conversationBalance: integer("conversation_balance"), // 0-100 (0=all them, 50=balanced, 100=all me)
  conversationComfort: integer("conversation_comfort"), // 0-100 comfort level
  conversationNotes: text("conversation_notes"), // Optional notes about dynamics
  
  // Module 3: Matching Preferences
  futurePreferences: text("future_preferences").array(), // Array of preference tags
  futurePreferencesOther: text("future_preferences_other"), // Custom preferences
  
  deepFeedbackCompletedAt: timestamp("deep_feedback_completed_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Schemas
export const upsertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const updateProfileSchema = createInsertSchema(users).pick({
  displayName: true,
}).extend({
  displayName: z.string().min(1, "请输入昵称"),
});

export const updatePersonalitySchema = createInsertSchema(users).pick({
  personalityTraits: true,
  personalityChallenges: true,
  idealMatch: true,
  energyLevel: true,
});

export const updateBudgetPreferenceSchema = createInsertSchema(users).pick({
  budgetPreference: true,
}).extend({
  budgetPreference: z.array(z.string()).min(1, "请至少选择一个预算档位"),
});

export const insertEventAttendanceSchema = createInsertSchema(eventAttendance).pick({
  eventId: true,
  userId: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  eventId: true,
  message: true,
}).extend({
  message: z.string().min(1, "消息不能为空"),
});

export const insertEventFeedbackSchema = createInsertSchema(eventFeedback).omit({
  id: true,
  createdAt: true,
  userId: true, // Auto-populated from session
}).extend({
  // Legacy fields validation
  rating: z.number().min(1).max(5).optional(),
  vibeMatch: z.number().min(1).max(5).optional(),
  energyMatch: z.number().min(1).max(5).optional(),
  
  // New balanced feedback system validation
  atmosphereScore: z.number().min(1).max(5).optional(),
  atmosphereNote: z.string().optional(),
  attendeeTraits: z.any().optional(), // JSON object
  connectionRadar: z.any().optional(), // JSON object  
  hasNewConnections: z.boolean().optional(),
  connectionStatus: z.enum(["已交换联系方式", "有但还没联系", "没有但很愉快", "没有不太合适"]).optional(),
  improvementAreas: z.array(z.string()).max(3).optional(),
  improvementOther: z.string().optional(),
});

// Blind Box Events table
export const blindBoxEvents = pgTable("blind_box_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  
  // Basic info
  title: varchar("title").notNull(), // e.g., "周三 19:00 · 饭局"
  eventType: varchar("event_type").notNull(), // 饭局/酒局
  city: varchar("city").notNull(), // 深圳/香港
  district: varchar("district").notNull(), // 南山区
  dateTime: timestamp("date_time").notNull(),
  
  // Budget and preferences
  budgetTier: varchar("budget_tier").notNull(), // "100-200"
  selectedLanguages: text("selected_languages").array(),
  selectedTasteIntensity: text("selected_taste_intensity").array(),
  selectedCuisines: text("selected_cuisines").array(),
  acceptNearby: boolean("accept_nearby").default(false),
  
  // Matching status
  status: varchar("status").notNull().default("pending_match"), // pending_match, matched, completed, canceled
  progress: integer("progress").default(0), // 0-100
  currentParticipants: integer("current_participants").default(1), // Includes creator + joined invites
  etaMinutes: integer("eta_minutes"), // Estimated time to match
  
  // Matched event details (populated when status = matched)
  restaurantName: varchar("restaurant_name"),
  restaurantAddress: varchar("restaurant_address"),
  restaurantLat: varchar("restaurant_lat"),
  restaurantLng: varchar("restaurant_lng"),
  cuisineTags: text("cuisine_tags").array(),
  
  // Participant info (populated when status = matched)
  totalParticipants: integer("total_participants"),
  maleCount: integer("male_count"),
  femaleCount: integer("female_count"),
  isGirlsNight: boolean("is_girls_night").default(false),
  
  // Matched attendee data (populated when status = matched)
  matchedAttendees: jsonb("matched_attendees"), // Array of {userId, displayName, archetype, topInterests, age, industry, ageVisible, industryVisible}
  matchExplanation: text("match_explanation"), // "Why This Table?" auto-generated narrative
  
  // Invite info
  invitedCount: integer("invited_count").default(0),
  invitedJoined: integer("invited_joined").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schema for blind box events
export const insertBlindBoxEventSchema = createInsertSchema(blindBoxEvents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  title: z.string().min(1, "活动标题不能为空"),
  eventType: z.string().min(1, "活动类型不能为空"),
  city: z.string().min(1, "城市不能为空"),
  district: z.string().min(1, "商圈不能为空"),
  budgetTier: z.string().min(1, "预算档位不能为空"),
});

// Personality test questions table
export const personalityQuestions = pgTable("personality_questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  questionNumber: integer("question_number").notNull(),
  category: varchar("category").notNull(), // "基础行为模式", "反应偏好", "自我认知"
  questionText: text("question_text").notNull(),
  questionType: varchar("question_type").notNull(), // "single" or "dual"
  options: jsonb("options").notNull(), // Array of {value: string, text: string, roleMapping: string}
  testVersion: integer("test_version").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

// Test responses table (stores user answers)
export const testResponses = pgTable("test_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  questionId: varchar("question_id").notNull().references(() => personalityQuestions.id),
  selectedOption: varchar("selected_option"), // For single choice
  mostLikeOption: varchar("most_like_option"), // For dual choice (2 points)
  secondLikeOption: varchar("second_like_option"), // For dual choice (1 point)
  testVersion: integer("test_version").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

// Role results table (stores personality test results)
export const roleResults = pgTable("role_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  
  // Role scores (8 core roles)
  primaryRole: varchar("primary_role").notNull(), // Highest scoring role
  primaryRoleScore: integer("primary_role_score").notNull(),
  secondaryRole: varchar("secondary_role"), // Second highest scoring role
  secondaryRoleScore: integer("secondary_role_score"),
  roleSubtype: varchar("role_subtype"), // Subtype based on answer patterns
  
  // Role score breakdown
  roleScores: jsonb("role_scores").notNull(), // {火花塞: 5, 探索者: 3, ...}
  
  // Six-dimensional trait scores (0-10 scale)
  affinityScore: integer("affinity_score").notNull(), // 亲和力
  opennessScore: integer("openness_score").notNull(), // 开放性
  conscientiousnessScore: integer("conscientiousness_score").notNull(), // 责任心
  emotionalStabilityScore: integer("emotional_stability_score").notNull(), // 情绪稳定性
  extraversionScore: integer("extraversion_score").notNull(), // 外向性
  positivityScore: integer("positivity_score").notNull(), // 正能量性
  
  // Insights (generated text)
  strengths: text("strengths"),
  challenges: text("challenges"),
  idealFriendTypes: text("ideal_friend_types").array(),
  
  testVersion: integer("test_version").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

// Registration schema (Step 1: The Essentials)
export const registerUserSchema = z.object({
  // Identity
  displayName: z.string().min(1, "请输入昵称"),
  birthdate: z.string().min(1, "请选择生日"), // ISO date string - now required
  ageVisibility: z.enum(["hide_all", "show_exact_age"]).default("hide_all"),
  gender: z.enum(["Woman", "Man", "Nonbinary", "Self-describe", "Prefer not to say"], {
    errorMap: () => ({ message: "请选择性别" }),
  }),
  pronouns: z.enum(["She/Her", "He/Him", "They/Them", "Self-describe", "Prefer not to say"]).optional(),
  
  // Background
  relationshipStatus: z.enum(["Single", "In a relationship", "Married/Partnered", "It's complicated", "Prefer not to say"], {
    errorMap: () => ({ message: "请选择关系状态" }),
  }),
  children: z.enum(["No kids", "Expecting", "0-5", "6-12", "13-18", "Adult", "Prefer not to say"]).optional(),
  
  // Education
  educationLevel: z.enum(["High school/below", "Some college/Associate", "Bachelor's", "Master's", "Doctorate", "Trade/Vocational", "Prefer not to say"]).optional(),
  studyLocale: z.enum(["Local", "Overseas", "Both", "Prefer not to say"]).optional(),
  overseasRegions: z.array(z.string()).optional(),
  fieldOfStudy: z.string().optional(),
  educationVisibility: z.enum(["hide_all", "show_level_only", "show_level_and_field"]).default("hide_all"),
  
  // Work
  industry: z.string().min(1, "请选择行业"),
  roleTitleShort: z.string().optional(),
  seniority: z.enum(["Intern", "Junior", "Mid", "Senior", "Founder", "Executive"]).optional(),
  workVisibility: z.enum(["hide_all", "show_industry_only"]).default("show_industry_only"),
  
  // Culture & Language
  hometownCountry: z.string().optional(),
  hometownRegionCity: z.string().optional(),
  hometownAffinityOptin: z.boolean().default(false),
  languagesComfort: z.array(z.string()).optional(),
  
  // Access & Safety
  accessibilityNeeds: z.string().optional(),
  safetyNoteHost: z.string().optional(),
  
  // Legacy/Optional
  wechatId: z.string().optional(),
});

// Interests & Topics schema (Step 2)
export const interestsTopicsSchema = z.object({
  interestsTop: z.array(z.string()).min(3, "请至少选择3个兴趣").max(7, "最多选择7个兴趣"),
  interestsRankedTop3: z.array(z.string()).length(3, "请将你最喜欢的3个兴趣排序"),
  topicsHappy: z.array(z.string()).min(1, "请至少选择一个你喜欢的话题"),
  topicsAvoid: z.array(z.string()).optional(),
});

// Test response schema
export const insertTestResponseSchema = createInsertSchema(testResponses).omit({
  id: true,
  createdAt: true,
});

// Role result schema
export const insertRoleResultSchema = createInsertSchema(roleResults).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;
export type UpdatePersonality = z.infer<typeof updatePersonalitySchema>;
export type UpdateBudgetPreference = z.infer<typeof updateBudgetPreferenceSchema>;
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type InterestsTopics = z.infer<typeof interestsTopicsSchema>;

export type Event = typeof events.$inferSelect;
export type EventAttendance = typeof eventAttendance.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type EventFeedback = typeof eventFeedback.$inferSelect;
export type BlindBoxEvent = typeof blindBoxEvents.$inferSelect;
export type PersonalityQuestion = typeof personalityQuestions.$inferSelect;
export type TestResponse = typeof testResponses.$inferSelect;
export type RoleResult = typeof roleResults.$inferSelect;

export type InsertEventAttendance = z.infer<typeof insertEventAttendanceSchema>;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type InsertEventFeedback = z.infer<typeof insertEventFeedbackSchema>;
export type InsertBlindBoxEvent = z.infer<typeof insertBlindBoxEventSchema>;
export type InsertTestResponse = z.infer<typeof insertTestResponseSchema>;
export type InsertRoleResult = z.infer<typeof insertRoleResultSchema>;

// Notifications table
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  category: varchar("category").notNull(), // discover, activities, chat
  type: varchar("type").notNull(), // new_activity, matching_progress, match_success, activity_reminder, feedback_reminder, new_message
  title: varchar("title").notNull(),
  message: text("message"),
  relatedResourceId: varchar("related_resource_id"), // event ID, chat ID, etc.
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// Notification count response type
export type NotificationCounts = {
  discover: number;
  activities: number;
  chat: number;
  total: number;
};
