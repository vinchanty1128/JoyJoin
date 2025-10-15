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
  vibes: text("vibes").array(),
  hasCompletedProfileSetup: boolean("has_completed_profile_setup").default(false),
  hasCompletedVoiceQuiz: boolean("has_completed_voice_quiz").default(false),
  
  // Registration fields (new)
  age: integer("age"),
  gender: varchar("gender"), // Male, Female, Non-binary, Prefer not to say
  relationshipStatus: varchar("relationship_status"), // Single, In a relationship, Married, Prefer not to say
  hasKids: boolean("has_kids"),
  industry: varchar("industry"), // 大厂, 金融, 科技, AI, etc.
  placeOfOrigin: varchar("place_of_origin"), // 籍贯
  longTermBase: varchar("long_term_base"), // 长期base (city)
  wechatId: varchar("wechat_id"), // WeChat ID
  hasCompletedRegistration: boolean("has_completed_registration").default(false),
  hasCompletedPersonalityTest: boolean("has_completed_personality_test").default(false),
  
  // Personality data
  personalityTraits: jsonb("personality_traits"),
  personalityChallenges: text("personality_challenges").array(),
  idealMatch: text("ideal_match"),
  energyLevel: integer("energy_level"),
  
  // Social role (from personality test)
  primaryRole: varchar("primary_role"), // 8 core roles
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
  vibes: text("vibes").array(),
  vibeGradient: varchar("vibe_gradient"),
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
  eventId: varchar("event_id").notNull().references(() => events.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  rating: integer("rating"), // 1-5 stars
  vibeMatch: integer("vibe_match"), // How well did the vibe match expectations (1-5)
  energyMatch: integer("energy_match"), // How well did the energy match (1-5)
  wouldAttendAgain: boolean("would_attend_again"),
  feedback: text("feedback"),
  connections: text("connections").array(), // User IDs of people they connected with
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
  vibes: true,
}).extend({
  displayName: z.string().min(1, "请输入昵称"),
  vibes: z.array(z.string()).min(1, "请至少选择一个标签"),
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

export const insertEventFeedbackSchema = createInsertSchema(eventFeedback).pick({
  eventId: true,
  rating: true,
  vibeMatch: true,
  energyMatch: true,
  wouldAttendAgain: true,
  feedback: true,
  connections: true,
}).extend({
  rating: z.number().min(1).max(5),
  vibeMatch: z.number().min(1).max(5),
  energyMatch: z.number().min(1).max(5),
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

// Registration schema
export const registerUserSchema = z.object({
  firstName: z.string().min(1, "请输入名字"),
  age: z.number().min(16, "年龄必须在16岁以上").max(80, "年龄必须在80岁以下"),
  gender: z.enum(["Male", "Female", "Non-binary", "Prefer not to say"], {
    errorMap: () => ({ message: "请选择性别" }),
  }),
  relationshipStatus: z.enum(["Single", "In a relationship", "Married", "Prefer not to say"], {
    errorMap: () => ({ message: "请选择关系状态" }),
  }),
  hasKids: z.boolean(),
  industry: z.string().min(1, "请选择行业"),
  placeOfOrigin: z.string().min(1, "请输入籍贯"),
  longTermBase: z.string().min(1, "请选择长期base"),
  wechatId: z.string().optional(),
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
