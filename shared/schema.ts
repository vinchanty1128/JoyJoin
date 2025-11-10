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
  password: varchar("password"), // Hashed password for admin login
  
  // Registration fields - Access & Safety
  accessibilityNeeds: text("accessibility_needs"), // Optional text
  safetyNoteHost: text("safety_note_host"), // Private note to host
  
  // Default event intent (can be overridden per event) - multiple selections allowed
  intent: text("intent").array(), // Can include: networking, friends, discussion, fun, romance, flexible
  
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
  
  // Gamification
  eventsAttended: integer("events_attended").default(0),
  matchesMade: integer("matches_made").default(0),
  
  // Admin & Moderation
  isAdmin: boolean("is_admin").default(false),
  isBanned: boolean("is_banned").default(false),
  
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
  intent: text("intent").array(), // Event-specific intent: networking, friends, discussion, fun, romance, flexible
});

// Match history table - tracks who has been matched together before (anti-repetition)
export const matchHistory = pgTable("match_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user1Id: varchar("user1_id").notNull().references(() => users.id),
  user2Id: varchar("user2_id").notNull().references(() => users.id),
  eventId: varchar("event_id").notNull().references(() => events.id),
  matchedAt: timestamp("matched_at").defaultNow(),
  connectionQuality: integer("connection_quality"), // Post-event feedback: 1-5 score
  wouldMeetAgain: boolean("would_meet_again"), // Whether they'd want to be matched again
  connectionPointTypes: text("connection_point_types").array(), // Types of connection points that led to this match (for feedback correlation)
});

// Chat messages table (for event group chats)
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Direct message threads table (1-on-1 chats unlocked via mutual matching)
export const directMessageThreads = pgTable("direct_message_threads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user1Id: varchar("user1_id").notNull().references(() => users.id),
  user2Id: varchar("user2_id").notNull().references(() => users.id),
  eventId: varchar("event_id").notNull().references(() => events.id), // Event where they matched
  unlockedAt: timestamp("unlocked_at").defaultNow(), // When mutual matching unlocked the thread
  lastMessageAt: timestamp("last_message_at"), // For sorting threads by activity
  createdAt: timestamp("created_at").defaultNow(),
});

// Direct messages table (1-on-1 private messages)
export const directMessages = pgTable("direct_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  threadId: varchar("thread_id").notNull().references(() => directMessageThreads.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Post-event feedback table
export const eventFeedback = pgTable("event_feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id),
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

// Comprehensive profile update schema for editing profile
export const updateFullProfileSchema = createInsertSchema(users).pick({
  displayName: true,
  birthdate: true,
  gender: true,
  relationshipStatus: true,
  children: true,
  educationLevel: true,
  studyLocale: true,
  overseasRegions: true,
  fieldOfStudy: true,
  industry: true,
  roleTitleShort: true,
  seniority: true,
  hometownCountry: true,
  hometownRegionCity: true,
  languagesComfort: true,
  intent: true,
  interestsTop: true,
  topicsHappy: true,
  topicsAvoid: true,
  workVisibility: true,
}).partial();

export const updatePersonalitySchema = createInsertSchema(users).pick({
  personalityTraits: true,
  personalityChallenges: true,
  idealMatch: true,
  energyLevel: true,
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

export const insertDirectMessageThreadSchema = createInsertSchema(directMessageThreads).pick({
  user1Id: true,
  user2Id: true,
  eventId: true,
});

export const insertDirectMessageSchema = createInsertSchema(directMessages).pick({
  threadId: true,
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
  
  // Event intent (default, can be overridden per event) - multiple selections allowed
  intent: z.array(z.enum(["networking", "friends", "discussion", "fun", "romance", "flexible"])).min(1, "请至少选择一个活动意图"),
  
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

// ============ ADMIN PORTAL TABLES ============

// Venues table - Restaurant/Bar partners
export const venues = pgTable("venues", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(), // restaurant, bar
  address: text("address").notNull(),
  city: varchar("city").notNull(), // 深圳, 香港
  district: varchar("district").notNull(), // 南山区, 中环 etc.
  contactName: varchar("contact_name"),
  contactPhone: varchar("contact_phone"),
  commissionRate: integer("commission_rate").default(20), // percentage
  
  // Venue tags for matching
  tags: text("tags").array(), // atmosphere tags: cozy, lively, upscale, casual
  cuisines: text("cuisines").array(), // 粤菜, 川菜, 日料, 西餐 etc.
  priceRange: varchar("price_range"), // 100-200, 200-300, 300+ per person
  
  // Capacity management
  maxConcurrentEvents: integer("max_concurrent_events").default(1), // How many events can run at same time
  
  // Status
  isActive: boolean("is_active").default(true),
  notes: text("notes"), // Internal admin notes
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Event Templates table - Recurring time slots and themes
export const eventTemplates = pgTable("event_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(), // e.g., "周三晚餐局", "Girls Night"
  eventType: varchar("event_type").notNull(), // 饭局, 酒局
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 (Sunday-Saturday)
  timeOfDay: varchar("time_of_day").notNull(), // e.g., "19:00", "21:00"
  
  // Theme and restrictions
  theme: varchar("theme"), // e.g., "Girls Night", "商务社交"
  genderRestriction: varchar("gender_restriction"), // null, "Woman", "Man"
  minAge: integer("min_age"),
  maxAge: integer("max_age"),
  
  // Participant settings
  minParticipants: integer("min_participants").default(5),
  maxParticipants: integer("max_participants").default(10),
  
  // Pricing (for future premium events)
  customPrice: integer("custom_price"), // null = use default pricing (会员免费/非会员¥68)
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Subscriptions table - User memberships
export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  
  // Subscription period
  subscriptionType: varchar("subscription_type").notNull(), // "1_month", "3_months"
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  
  // Payment
  amount: integer("amount").notNull(), // ¥98 or ¥294
  paymentId: varchar("payment_id").references(() => payments.id), // References payments table
  
  // Status
  status: varchar("status").notNull().default("active"), // active, expired, cancelled
  autoRenew: boolean("auto_renew").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payments table - Unified payment records
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  
  // Payment type
  paymentType: varchar("payment_type").notNull(), // "subscription", "event"
  relatedId: varchar("related_id"), // subscription ID or event ID
  
  // Amount
  originalAmount: integer("original_amount").notNull(), // Before discount
  discountAmount: integer("discount_amount").default(0),
  finalAmount: integer("final_amount").notNull(), // After discount
  
  // Coupon
  couponId: varchar("coupon_id"), // null if no coupon used
  
  // WeChat Pay details
  wechatTransactionId: varchar("wechat_transaction_id"), // WeChat Pay transaction ID
  wechatOrderId: varchar("wechat_order_id"), // Our order ID sent to WeChat
  
  // Status
  status: varchar("status").notNull().default("pending"), // pending, completed, failed, refunded
  paidAt: timestamp("paid_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Coupons table - Discount codes
export const coupons = pgTable("coupons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code").notNull().unique(), // e.g., "WELCOME50"
  
  // Discount details
  discountType: varchar("discount_type").notNull(), // "fixed_amount", "percentage"
  discountValue: integer("discount_value").notNull(), // ¥50 or 20 (for 20%)
  
  // Usage limits
  maxUses: integer("max_uses"), // null = unlimited
  currentUses: integer("current_uses").default(0),
  maxUsesPerUser: integer("max_uses_per_user").default(1),
  
  // Validity
  validFrom: timestamp("valid_from").defaultNow(),
  validUntil: timestamp("valid_until"),
  
  // Applicable to
  applicableTo: varchar("applicable_to").default("all"), // "all", "subscription_only", "event_only"
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Coupon Usage table - Track coupon redemptions
export const couponUsage = pgTable("coupon_usage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  couponId: varchar("coupon_id").notNull().references(() => coupons.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  paymentId: varchar("payment_id").notNull().references(() => payments.id),
  
  discountApplied: integer("discount_applied").notNull(), // Actual discount amount
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Venue Bookings table - Track venue capacity per time slot
export const venueBookings = pgTable("venue_bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  venueId: varchar("venue_id").notNull().references(() => venues.id),
  eventId: varchar("event_id").notNull().references(() => blindBoxEvents.id),
  
  bookingDate: timestamp("booking_date").notNull(),
  bookingTime: varchar("booking_time").notNull(), // e.g., "19:00"
  
  participantCount: integer("participant_count").notNull(),
  
  // Sales tracking for commission
  estimatedRevenue: integer("estimated_revenue"), // Per-person average × participant count
  actualRevenue: integer("actual_revenue"), // Updated post-event
  commissionAmount: integer("commission_amount"), // actualRevenue × commissionRate
  
  status: varchar("status").default("confirmed"), // confirmed, completed, cancelled
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reports table - User reports
export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reporterId: varchar("reporter_id").notNull().references(() => users.id),
  reportedUserId: varchar("reported_user_id").references(() => users.id), // null if reporting content
  
  // Report details
  category: varchar("category").notNull(), // harassment, inappropriate_content, fake_profile, other
  description: text("description").notNull(),
  relatedEventId: varchar("related_event_id").references(() => events.id),
  
  // Moderation
  status: varchar("status").default("pending"), // pending, reviewing, resolved, dismissed
  reviewedBy: varchar("reviewed_by").references(() => users.id), // Admin user ID
  reviewedAt: timestamp("reviewed_at"),
  resolution: text("resolution"), // Admin's resolution notes
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Moderation Logs table - Track admin actions
export const moderationLogs = pgTable("moderation_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminId: varchar("admin_id").notNull().references(() => users.id),
  
  // Action details
  action: varchar("action").notNull(), // ban_user, unban_user, delete_content, resolve_report
  targetUserId: varchar("target_user_id").references(() => users.id),
  relatedReportId: varchar("related_report_id").references(() => reports.id),
  
  reason: text("reason"),
  notes: text("notes"), // Internal admin notes
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas for admin tables
export const insertVenueSchema = createInsertSchema(venues).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEventTemplateSchema = createInsertSchema(eventTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

export const insertCouponSchema = createInsertSchema(coupons).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
});

export const insertModerationLogSchema = createInsertSchema(moderationLogs).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;
export type UpdateFullProfile = z.infer<typeof updateFullProfileSchema>;
export type UpdatePersonality = z.infer<typeof updatePersonalitySchema>;
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type InterestsTopics = z.infer<typeof interestsTopicsSchema>;

export type Event = typeof events.$inferSelect;
export type EventAttendance = typeof eventAttendance.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type DirectMessageThread = typeof directMessageThreads.$inferSelect;
export type DirectMessage = typeof directMessages.$inferSelect;
export type EventFeedback = typeof eventFeedback.$inferSelect;
export type BlindBoxEvent = typeof blindBoxEvents.$inferSelect;
export type PersonalityQuestion = typeof personalityQuestions.$inferSelect;
export type TestResponse = typeof testResponses.$inferSelect;
export type RoleResult = typeof roleResults.$inferSelect;

export type InsertEventAttendance = z.infer<typeof insertEventAttendanceSchema>;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type InsertDirectMessageThread = z.infer<typeof insertDirectMessageThreadSchema>;
export type InsertDirectMessage = z.infer<typeof insertDirectMessageSchema>;
export type InsertEventFeedback = z.infer<typeof insertEventFeedbackSchema>;
export type InsertBlindBoxEvent = z.infer<typeof insertBlindBoxEventSchema>;
export type InsertTestResponse = z.infer<typeof insertTestResponseSchema>;
export type InsertRoleResult = z.infer<typeof insertRoleResultSchema>;

// Admin Portal Types
export type Venue = typeof venues.$inferSelect;
export type EventTemplate = typeof eventTemplates.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Coupon = typeof coupons.$inferSelect;
export type CouponUsage = typeof couponUsage.$inferSelect;
export type VenueBooking = typeof venueBookings.$inferSelect;
export type Report = typeof reports.$inferSelect;
export type ModerationLog = typeof moderationLogs.$inferSelect;

export type InsertVenue = z.infer<typeof insertVenueSchema>;
export type InsertEventTemplate = z.infer<typeof insertEventTemplateSchema>;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type InsertCoupon = z.infer<typeof insertCouponSchema>;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type InsertModerationLog = z.infer<typeof insertModerationLogSchema>;

// ============ MATCHING ALGORITHM TABLES ============

// Matching configuration table - stores algorithm weights
export const matchingConfig = pgTable("matching_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  configName: varchar("config_name").notNull().default("default"), // config version name
  
  // 5个维度的权重 (0-100, 总和应为100)
  personalityWeight: integer("personality_weight").notNull().default(30), // 性格兼容性权重
  interestsWeight: integer("interests_weight").notNull().default(25),     // 兴趣匹配权重
  intentWeight: integer("intent_weight").notNull().default(20),           // 意图匹配权重
  backgroundWeight: integer("background_weight").notNull().default(15),   // 背景多样性权重
  cultureWeight: integer("culture_weight").notNull().default(10),         // 文化语言权重
  
  // 其他匹配参数
  minGroupSize: integer("min_group_size").default(5),
  maxGroupSize: integer("max_group_size").default(10),
  preferredGroupSize: integer("preferred_group_size").default(7),
  
  // 约束条件
  maxSameArchetypeRatio: integer("max_same_archetype_ratio").default(40), // 同一原型最多占比（%）
  minChemistryScore: integer("min_chemistry_score").default(60),          // 最低化学反应分数
  
  // 是否为活跃配置
  isActive: boolean("is_active").default(false),
  
  // 元数据
  notes: text("notes"), // 配置说明
  createdBy: varchar("created_by"), // 创建者ID（admin）
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMatchingConfigSchema = createInsertSchema(matchingConfig).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  configName: z.string().min(1, "配置名称不能为空"),
  personalityWeight: z.number().min(0).max(100),
  interestsWeight: z.number().min(0).max(100),
  intentWeight: z.number().min(0).max(100),
  backgroundWeight: z.number().min(0).max(100),
  cultureWeight: z.number().min(0).max(100),
});

export type MatchingConfig = typeof matchingConfig.$inferSelect;
export type InsertMatchingConfig = z.infer<typeof insertMatchingConfigSchema>;

// Matching results table - stores historical matching results for analysis
export const matchingResults = pgTable("matching_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id"), // 可选，关联到具体活动
  configId: varchar("config_id").references(() => matchingConfig.id),
  
  // 输入数据
  userIds: text("user_ids").array(), // 参与匹配的用户ID列表
  userCount: integer("user_count").notNull(),
  
  // 匹配结果
  groups: jsonb("groups").notNull(), // [{groupId, userIds, chemistryScore, diversityScore, overallScore}]
  groupCount: integer("group_count").notNull(),
  
  // 评分指标
  avgChemistryScore: integer("avg_chemistry_score"), // 平均化学反应分数
  avgDiversityScore: integer("avg_diversity_score"), // 平均多样性分数
  overallMatchQuality: integer("overall_match_quality"), // 整体匹配质量 (0-100)
  
  // 性能指标
  executionTimeMs: integer("execution_time_ms"), // 匹配算法执行时间（毫秒）
  
  // 元数据
  isTestRun: boolean("is_test_run").default(false), // 是否为测试运行
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMatchingResultSchema = createInsertSchema(matchingResults).omit({
  id: true,
  createdAt: true,
});

export type MatchingResult = typeof matchingResults.$inferSelect;
export type InsertMatchingResult = z.infer<typeof insertMatchingResultSchema>;

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
