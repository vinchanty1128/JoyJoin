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
  
  // Personality data
  personalityTraits: jsonb("personality_traits"),
  personalityChallenges: text("personality_challenges").array(),
  idealMatch: text("ideal_match"),
  energyLevel: integer("energy_level"),
  
  // Gamification
  eventsAttended: integer("events_attended").default(0),
  matchesMade: integer("matches_made").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

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

export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;
export type UpdatePersonality = z.infer<typeof updatePersonalitySchema>;
