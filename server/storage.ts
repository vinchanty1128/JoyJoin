import { 
  type User, type UpsertUser, type UpdateProfile, type UpdatePersonality, type UpdateBudgetPreference,
  type Event, type EventAttendance, type ChatMessage, type EventFeedback, type BlindBoxEvent,
  type InsertEventAttendance, type InsertChatMessage, type InsertEventFeedback,
  users, events, eventAttendance, chatMessages, eventFeedback, blindBoxEvents
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateProfile(id: string, profile: UpdateProfile): Promise<User>;
  updatePersonality(id: string, personality: UpdatePersonality): Promise<User>;
  updateBudgetPreference(id: string, budget: UpdateBudgetPreference): Promise<User>;
  markProfileSetupComplete(id: string): Promise<void>;
  markVoiceQuizComplete(id: string): Promise<void>;
  
  // Event operations
  getUserJoinedEvents(userId: string): Promise<Array<Event & { attendanceStatus: string; attendeeCount: number; participants: Array<{ id: string; displayName: string | null; vibes: string[] | null }> }>>;
  getEventParticipants(eventId: string): Promise<Array<User>>;
  
  // Chat operations
  getEventMessages(eventId: string): Promise<Array<ChatMessage & { user: User }>>;
  createChatMessage(userId: string, message: InsertChatMessage): Promise<ChatMessage>;
  
  // Feedback operations
  getUserFeedback(userId: string, eventId: string): Promise<EventFeedback | undefined>;
  createEventFeedback(userId: string, feedback: InsertEventFeedback): Promise<EventFeedback>;

  // Blind Box Event operations
  getUserBlindBoxEvents(userId: string): Promise<Array<BlindBoxEvent>>;
  getBlindBoxEventById(eventId: string, userId: string): Promise<BlindBoxEvent | undefined>;
  createBlindBoxEvent(userId: string, eventData: { 
    date: string; 
    time: string; 
    eventType: string; 
    city: string;
    area: string; 
    budget: string[]; 
    acceptNearby?: boolean;
    selectedLanguages?: string[];
    selectedTasteIntensity?: string[];
    selectedCuisines?: string[];
  }): Promise<BlindBoxEvent>;
  cancelBlindBoxEvent(eventId: string, userId: string): Promise<BlindBoxEvent>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // First try to find existing user by id or email
    const existingById = await db.select().from(users).where(eq(users.id, userData.id!));
    const existingByEmail = userData.email 
      ? await db.select().from(users).where(eq(users.email, userData.email))
      : [];

    if (existingById.length > 0) {
      // Update existing user by id
      const [user] = await db
        .update(users)
        .set({
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userData.id!))
        .returning();
      return user;
    } else if (existingByEmail.length > 0) {
      // Update existing user by email (email exists but different id)
      const [user] = await db
        .update(users)
        .set({
          id: userData.id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
        })
        .where(eq(users.email, userData.email!))
        .returning();
      return user;
    } else {
      // Insert new user
      const [user] = await db
        .insert(users)
        .values(userData)
        .returning();
      return user;
    }
  }

  async updateProfile(id: string, profile: UpdateProfile): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...profile,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updatePersonality(id: string, personality: UpdatePersonality): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...personality,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateBudgetPreference(id: string, budget: UpdateBudgetPreference): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...budget,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async markProfileSetupComplete(id: string): Promise<void> {
    await db
      .update(users)
      .set({
        hasCompletedProfileSetup: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));
  }

  async markVoiceQuizComplete(id: string): Promise<void> {
    await db
      .update(users)
      .set({
        hasCompletedVoiceQuiz: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));
  }

  // Event operations
  async getUserJoinedEvents(userId: string): Promise<Array<Event & { attendanceStatus: string; attendeeCount: number; participants: Array<{ id: string; displayName: string | null; vibes: string[] | null }> }>> {
    const result = await db
      .select({
        event: events,
        attendanceStatus: eventAttendance.status,
        attendeeCount: sql<number>`(SELECT COUNT(*) FROM ${eventAttendance} WHERE ${eventAttendance.eventId} = ${events.id} AND ${eventAttendance.status} = 'confirmed')`,
      })
      .from(eventAttendance)
      .innerJoin(events, eq(eventAttendance.eventId, events.id))
      .where(eq(eventAttendance.userId, userId))
      .orderBy(desc(events.dateTime));

    // Get participants for each event
    const eventsWithParticipants = await Promise.all(
      result.map(async (r) => {
        const participants = await db
          .select({
            id: users.id,
            displayName: users.displayName,
            vibes: users.vibes,
          })
          .from(eventAttendance)
          .innerJoin(users, eq(eventAttendance.userId, users.id))
          .where(
            and(
              eq(eventAttendance.eventId, r.event.id),
              eq(eventAttendance.status, 'confirmed')
            )
          )

        return {
          ...r.event,
          attendanceStatus: r.attendanceStatus || 'confirmed',
          attendeeCount: Number(r.attendeeCount) || 0,
          participants: participants,
        };
      })
    );

    return eventsWithParticipants;
  }

  async getEventParticipants(eventId: string): Promise<Array<User>> {
    const result = await db
      .select({ user: users })
      .from(eventAttendance)
      .innerJoin(users, eq(eventAttendance.userId, users.id))
      .where(
        and(
          eq(eventAttendance.eventId, eventId),
          eq(eventAttendance.status, 'confirmed')
        )
      );

    return result.map(r => r.user);
  }

  // Chat operations
  async getEventMessages(eventId: string): Promise<Array<ChatMessage & { user: User }>> {
    const result = await db
      .select({
        message: chatMessages,
        user: users,
      })
      .from(chatMessages)
      .innerJoin(users, eq(chatMessages.userId, users.id))
      .where(eq(chatMessages.eventId, eventId))
      .orderBy(chatMessages.createdAt);

    return result.map(r => ({
      ...r.message,
      user: r.user,
    }));
  }

  async createChatMessage(userId: string, message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db
      .insert(chatMessages)
      .values({
        ...message,
        userId,
      })
      .returning();
    return newMessage;
  }

  // Feedback operations
  async getUserFeedback(userId: string, eventId: string): Promise<EventFeedback | undefined> {
    const [feedback] = await db
      .select()
      .from(eventFeedback)
      .where(
        and(
          eq(eventFeedback.userId, userId),
          eq(eventFeedback.eventId, eventId)
        )
      );
    return feedback;
  }

  async createEventFeedback(userId: string, feedback: InsertEventFeedback): Promise<EventFeedback> {
    const [newFeedback] = await db
      .insert(eventFeedback)
      .values({
        ...feedback,
        userId,
      })
      .returning();
    return newFeedback;
  }

  // Blind Box Event operations
  async getUserBlindBoxEvents(userId: string): Promise<Array<BlindBoxEvent>> {
    const events = await db
      .select()
      .from(blindBoxEvents)
      .where(eq(blindBoxEvents.userId, userId))
      .orderBy(desc(blindBoxEvents.dateTime));
    return events;
  }

  async getBlindBoxEventById(eventId: string, userId: string): Promise<BlindBoxEvent | undefined> {
    const [event] = await db
      .select()
      .from(blindBoxEvents)
      .where(
        and(
          eq(blindBoxEvents.id, eventId),
          eq(blindBoxEvents.userId, userId)
        )
      );
    return event;
  }

  async createBlindBoxEvent(userId: string, eventData: { 
    date: string; 
    time: string; 
    eventType: string; 
    city: string;
    area: string; 
    budget: string[]; 
    acceptNearby?: boolean;
    selectedLanguages?: string[];
    selectedTasteIntensity?: string[];
    selectedCuisines?: string[];
    inviteFriends?: boolean;
    friendsCount?: number;
  }): Promise<BlindBoxEvent> {
    // Parse area to get district (e.g., "深圳•南山区" -> "南山区")
    const district = eventData.area.includes('•') 
      ? eventData.area.split('•')[1] 
      : eventData.area;
    
    // Parse date (e.g., "周三") to get next occurrence of that weekday
    const parseWeekday = (weekdayStr: string): number => {
      const weekdayMap: { [key: string]: number } = {
        '周日': 0, '周一': 1, '周二': 2, '周三': 3, 
        '周四': 4, '周五': 5, '周六': 6
      };
      return weekdayMap[weekdayStr] ?? 0;
    };
    
    const getNextWeekdayDate = (weekdayStr: string, timeStr: string): Date => {
      const targetWeekday = parseWeekday(weekdayStr);
      const now = new Date();
      const currentWeekday = now.getDay();
      
      // Calculate days until target weekday
      let daysUntil = targetWeekday - currentWeekday;
      if (daysUntil <= 0) {
        daysUntil += 7; // Next week if target day has passed
      }
      
      // Parse time (e.g., "19:00")
      const [hours, minutes] = timeStr.split(':').map(Number);
      
      // Create target date
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() + daysUntil);
      targetDate.setHours(hours, minutes, 0, 0);
      
      return targetDate;
    };
    
    const dateTime = getNextWeekdayDate(eventData.date, eventData.time);
    
    // Create title
    const title = `${eventData.date} ${eventData.time} · ${eventData.eventType}`;
    
    // Join all budget tiers with "/"
    const budgetTier = eventData.budget.join('/');
    
    // Calculate invited count
    const invitedCount = eventData.inviteFriends ? (eventData.friendsCount || 1) : 0;
    
    const [newEvent] = await db
      .insert(blindBoxEvents)
      .values({
        userId,
        title,
        eventType: eventData.eventType,
        city: eventData.city,
        district,
        dateTime,
        budgetTier,
        selectedLanguages: eventData.selectedLanguages || null,
        selectedTasteIntensity: eventData.selectedTasteIntensity || null,
        selectedCuisines: eventData.selectedCuisines || null,
        acceptNearby: eventData.acceptNearby || false,
        invitedCount,
        invitedJoined: 0,
        status: 'pending_match',
        progress: 0,
        etaMinutes: 120, // Default 2 hours ETA
      })
      .returning();
    
    return newEvent;
  }

  async cancelBlindBoxEvent(eventId: string, userId: string): Promise<BlindBoxEvent> {
    const [event] = await db
      .update(blindBoxEvents)
      .set({
        status: 'canceled',
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(blindBoxEvents.id, eventId),
          eq(blindBoxEvents.userId, userId),
          eq(blindBoxEvents.status, 'pending_match') // Only can cancel pending events
        )
      )
      .returning();
    
    if (!event) {
      throw new Error('Event not found or cannot be canceled');
    }
    
    return event;
  }
}

export const storage = new DatabaseStorage();
