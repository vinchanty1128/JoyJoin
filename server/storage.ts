import { 
  type User, type UpsertUser, type UpdateProfile, type UpdateFullProfile, type UpdatePersonality,
  type Event, type EventAttendance, type ChatMessage, type EventFeedback, type BlindBoxEvent,
  type InsertEventAttendance, type InsertChatMessage, type InsertEventFeedback,
  type RegisterUser, type InsertTestResponse, type InsertRoleResult, type RoleResult, type InterestsTopics,
  type Notification, type InsertNotification, type NotificationCounts,
  type DirectMessageThread, type DirectMessage, type InsertDirectMessageThread, type InsertDirectMessage,
  users, events, eventAttendance, chatMessages, eventFeedback, blindBoxEvents, testResponses, roleResults, notifications,
  directMessageThreads, directMessages
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getUserByPhone(phoneNumber: string): Promise<User[]>;
  createUserWithPhone(data: { phoneNumber: string; email: string; firstName: string; lastName: string }): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateProfile(id: string, profile: UpdateProfile): Promise<User>;
  updateFullProfile(id: string, profile: UpdateFullProfile): Promise<User>;
  updatePersonality(id: string, personality: UpdatePersonality): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  markProfileSetupComplete(id: string): Promise<void>;
  markVoiceQuizComplete(id: string): Promise<void>;
  registerUser(id: string, data: RegisterUser): Promise<User>;
  markRegistrationComplete(id: string): Promise<void>;
  markPersonalityTestComplete(id: string): Promise<void>;
  updateInterestsTopics(id: string, data: InterestsTopics): Promise<User>;
  
  // Personality test operations
  saveTestResponses(userId: string, responses: Record<number, any>): Promise<void>;
  saveRoleResult(userId: string, result: InsertRoleResult): Promise<RoleResult>;
  getRoleResult(userId: string): Promise<RoleResult | undefined>;
  getPersonalityDistribution(): Promise<Record<string, number>>;
  
  // Event operations
  getUserJoinedEvents(userId: string): Promise<Array<Event & { attendanceStatus: string; attendeeCount: number; participants: Array<{ id: string; displayName: string | null; archetype: string | null }> }>>;
  getEventParticipants(eventId: string): Promise<Array<User>>;
  
  // Chat operations
  getEventMessages(eventId: string): Promise<Array<ChatMessage & { user: User }>>;
  createChatMessage(userId: string, message: InsertChatMessage): Promise<ChatMessage>;
  
  // Feedback operations
  getUserAllFeedbacks(userId: string): Promise<Array<EventFeedback>>;
  getUserFeedback(userId: string, eventId: string): Promise<EventFeedback | undefined>;
  getEventFeedbacks(eventId: string): Promise<Array<EventFeedback>>;
  createEventFeedback(userId: string, feedback: InsertEventFeedback): Promise<EventFeedback>;
  updateEventFeedbackDeep(userId: string, eventId: string, deepData: any): Promise<EventFeedback>;

  // Direct message operations
  findDirectMessageThread(userId1: string, userId2: string, eventId: string): Promise<DirectMessageThread | undefined>;
  createDirectMessageThread(data: InsertDirectMessageThread): Promise<DirectMessageThread>;
  getUserDirectMessageThreads(userId: string): Promise<Array<DirectMessageThread & { otherUser: User; lastMessage?: DirectMessage }>>;
  getThreadMessages(threadId: string): Promise<Array<DirectMessage & { sender: User }>>;
  sendDirectMessage(senderId: string, data: InsertDirectMessage): Promise<DirectMessage>;

  // Blind Box Event operations
  getAllBlindBoxEvents(): Promise<Array<BlindBoxEvent>>;
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
    inviteFriends?: boolean;
    friendsCount?: number;
  }): Promise<BlindBoxEvent>;
  updateBlindBoxEventPreferences(eventId: string, userId: string, preferences: {
    budget?: string[];
    acceptNearby?: boolean;
    selectedLanguages?: string[];
    selectedTasteIntensity?: string[];
    selectedCuisines?: string[];
  }): Promise<BlindBoxEvent>;
  cancelBlindBoxEvent(eventId: string, userId: string): Promise<BlindBoxEvent>;
  setBlindBoxEventMatchData(eventId: string, userId: string, matchData: {
    matchedAttendees: any[];
    matchExplanation?: string;
  }): Promise<BlindBoxEvent>;
  
  // Notification operations
  getNotificationCounts(userId: string): Promise<{ discover: number; activities: number; chat: number; total: number }>;
  markNotificationsAsRead(userId: string, category: string): Promise<void>;
  createNotification(data: {
    userId: string;
    category: string;
    type: string;
    title: string;
    message?: string;
    relatedResourceId?: string;
  }): Promise<void>;

  // Admin Subscription operations
  getAllSubscriptions(): Promise<any[]>;
  getActiveSubscriptions(): Promise<any[]>;
  getUserSubscription(userId: string): Promise<any | undefined>;
  createSubscription(data: any): Promise<any>;
  updateSubscription(id: string, updates: any): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUserByPhone(phoneNumber: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.phoneNumber, phoneNumber));
  }

  async createUserWithPhone(data: { phoneNumber: string; email: string; firstName: string; lastName: string }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        phoneNumber: data.phoneNumber,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        // Removed DEMO MODE - Users must complete full registration flow
        hasCompletedRegistration: false,
        hasCompletedInterestsTopics: false,
        hasCompletedPersonalityTest: false,
        hasCompletedProfileSetup: false,
        hasCompletedVoiceQuiz: false,
      })
      .returning();
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

  async updateFullProfile(id: string, profile: UpdateFullProfile): Promise<User> {
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

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...updates,
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

  async registerUser(id: string, data: RegisterUser): Promise<User> {
    console.log("[Storage] Updating user registration:", { id, data });
    
    const [user] = await db
      .update(users)
      .set({
        displayName: data.displayName,
        birthdate: data.birthdate,
        ageVisibility: data.ageVisibility,
        gender: data.gender,
        pronouns: data.pronouns,
        relationshipStatus: data.relationshipStatus,
        children: data.children,
        educationLevel: data.educationLevel,
        studyLocale: data.studyLocale,
        overseasRegions: data.overseasRegions,
        fieldOfStudy: data.fieldOfStudy,
        educationVisibility: data.educationVisibility,
        industry: data.industry,
        roleTitleShort: data.roleTitleShort,
        seniority: data.seniority,
        workVisibility: data.workVisibility,
        hometownCountry: data.hometownCountry,
        hometownRegionCity: data.hometownRegionCity,
        hometownAffinityOptin: data.hometownAffinityOptin,
        languagesComfort: data.languagesComfort,
        accessibilityNeeds: data.accessibilityNeeds,
        safetyNoteHost: data.safetyNoteHost,
        wechatId: data.wechatId,
        hasCompletedRegistration: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    
    console.log("[Storage] User updated result:", { id: user.id, displayName: user.displayName, gender: user.gender, birthdate: user.birthdate });
    return user;
  }

  async updateInterestsTopics(id: string, data: InterestsTopics): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        interestsTop: data.interestsTop,
        interestsRankedTop3: data.interestsRankedTop3,
        topicsHappy: data.topicsHappy,
        topicsAvoid: data.topicsAvoid,
        hasCompletedInterestsTopics: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async markRegistrationComplete(id: string): Promise<void> {
    await db
      .update(users)
      .set({
        hasCompletedRegistration: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));
  }

  async markPersonalityTestComplete(id: string): Promise<void> {
    await db
      .update(users)
      .set({
        hasCompletedPersonalityTest: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));
  }

  async saveTestResponses(userId: string, responses: Record<number, any>): Promise<void> {
    // Store test responses
    // Note: For simplicity, we're not implementing full question tracking
    // In production, you would map questionIds properly
    // This is a simplified implementation
  }

  async saveRoleResult(userId: string, result: InsertRoleResult): Promise<RoleResult> {
    // First update user table with role information
    await db
      .update(users)
      .set({
        primaryRole: result.primaryRole,
        secondaryRole: result.secondaryRole,
        roleSubtype: result.roleSubtype,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // Then insert role result
    const [roleResult] = await db
      .insert(roleResults)
      .values({
        ...result,
        userId,
      })
      .returning();
    
    return roleResult;
  }

  async getRoleResult(userId: string): Promise<RoleResult | undefined> {
    const [result] = await db
      .select()
      .from(roleResults)
      .where(eq(roleResults.userId, userId))
      .orderBy(desc(roleResults.createdAt))
      .limit(1);
    
    return result;
  }

  async getPersonalityDistribution(): Promise<Record<string, number>> {
    const results = await db
      .select({
        primaryRole: users.primaryRole,
        count: sql<number>`count(*)`,
      })
      .from(users)
      .where(sql`${users.primaryRole} IS NOT NULL`)
      .groupBy(users.primaryRole);

    const distribution: Record<string, number> = {};
    let total = 0;
    
    for (const row of results) {
      if (row.primaryRole) {
        distribution[row.primaryRole] = Number(row.count);
        total += Number(row.count);
      }
    }

    // Convert to percentages
    const percentages: Record<string, number> = {};
    for (const [role, count] of Object.entries(distribution)) {
      percentages[role] = total > 0 ? Math.round((count / total) * 100) : 0;
    }

    return percentages;
  }

  // Event operations
  async getUserJoinedEvents(userId: string): Promise<Array<Event & { attendanceStatus: string; attendeeCount: number; participants: Array<{ id: string; displayName: string | null; archetype: string | null }> }>> {
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
            archetype: users.archetype,
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
  async getUserAllFeedbacks(userId: string): Promise<Array<EventFeedback>> {
    const feedbacks = await db
      .select()
      .from(eventFeedback)
      .where(eq(eventFeedback.userId, userId))
      .orderBy(desc(eventFeedback.createdAt));
    return feedbacks;
  }

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

  async getEventFeedbacks(eventId: string): Promise<Array<EventFeedback>> {
    const feedbacks = await db
      .select()
      .from(eventFeedback)
      .where(eq(eventFeedback.eventId, eventId));
    return feedbacks;
  }

  async updateEventFeedbackDeep(userId: string, eventId: string, deepData: any): Promise<EventFeedback> {
    const [updatedFeedback] = await db
      .update(eventFeedback)
      .set(deepData)
      .where(
        and(
          eq(eventFeedback.userId, userId),
          eq(eventFeedback.eventId, eventId)
        )
      )
      .returning();
    return updatedFeedback;
  }

  // Direct message operations
  async findDirectMessageThread(userId1: string, userId2: string, eventId: string): Promise<DirectMessageThread | undefined> {
    const [thread] = await db
      .select()
      .from(directMessageThreads)
      .where(
        and(
          eq(directMessageThreads.eventId, eventId),
          sql`(
            (${directMessageThreads.user1Id} = ${userId1} AND ${directMessageThreads.user2Id} = ${userId2})
            OR
            (${directMessageThreads.user1Id} = ${userId2} AND ${directMessageThreads.user2Id} = ${userId1})
          )`
        )
      );
    return thread;
  }

  async createDirectMessageThread(data: InsertDirectMessageThread): Promise<DirectMessageThread> {
    const [thread] = await db
      .insert(directMessageThreads)
      .values(data)
      .returning();
    return thread;
  }

  async getUserDirectMessageThreads(userId: string): Promise<Array<DirectMessageThread & { otherUser: User; lastMessage?: DirectMessage }>> {
    const threads = await db
      .select()
      .from(directMessageThreads)
      .where(
        sql`${directMessageThreads.user1Id} = ${userId} OR ${directMessageThreads.user2Id} = ${userId}`
      )
      .orderBy(desc(directMessageThreads.lastMessageAt));

    // Fetch other user data and last message for each thread
    const threadsWithData = await Promise.all(
      threads.map(async (thread) => {
        const otherUserId = thread.user1Id === userId ? thread.user2Id : thread.user1Id;
        const otherUser = await this.getUser(otherUserId);
        
        const [lastMessage] = await db
          .select()
          .from(directMessages)
          .where(eq(directMessages.threadId, thread.id))
          .orderBy(desc(directMessages.createdAt))
          .limit(1);

        return {
          ...thread,
          otherUser: otherUser!,
          lastMessage,
        };
      })
    );

    return threadsWithData;
  }

  async getThreadMessages(threadId: string): Promise<Array<DirectMessage & { sender: User }>> {
    const messages = await db
      .select()
      .from(directMessages)
      .where(eq(directMessages.threadId, threadId))
      .orderBy(directMessages.createdAt);

    const messagesWithUser = await Promise.all(
      messages.map(async (message) => {
        const sender = await this.getUser(message.senderId);
        return {
          ...message,
          sender: sender!,
        };
      })
    );

    return messagesWithUser;
  }

  async sendDirectMessage(senderId: string, data: InsertDirectMessage): Promise<DirectMessage> {
    const [message] = await db
      .insert(directMessages)
      .values({
        ...data,
        senderId,
      })
      .returning();

    // Update thread's lastMessageAt
    await db
      .update(directMessageThreads)
      .set({ lastMessageAt: new Date() })
      .where(eq(directMessageThreads.id, data.threadId));

    return message;
  }

  // Blind Box Event operations
  async getAllBlindBoxEvents(): Promise<Array<BlindBoxEvent>> {
    return await db.select().from(blindBoxEvents);
  }

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
      .where(eq(blindBoxEvents.id, eventId));
    
    // Allow viewing matched events (for demo/preview), but only allow owner to view pending events
    if (event && event.status !== 'matched' && event.userId !== userId) {
      return undefined;
    }
    
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
    
    // Create corresponding event record for chat/attendance tracking
    const [correspondingEvent] = await db
      .insert(events)
      .values({
        title,
        description: `${eventData.eventType} · ${budgetTier}`,
        dateTime,
        location: `${district}`,
        area: district,
        price: null,
        maxAttendees: 6,
        currentAttendees: 1,
        hostId: userId,
        status: 'upcoming',
      })
      .returning();
    
    // Create event attendance record for the creator
    await db
      .insert(eventAttendance)
      .values({
        eventId: correspondingEvent.id,
        userId,
        status: 'confirmed',
      });
    
    return newEvent;
  }

  async updateBlindBoxEventPreferences(
    eventId: string, 
    userId: string, 
    preferences: {
      budget?: string[];
      acceptNearby?: boolean;
      selectedLanguages?: string[];
      selectedTasteIntensity?: string[];
      selectedCuisines?: string[];
    }
  ): Promise<BlindBoxEvent> {
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (preferences.budget && preferences.budget.length > 0) {
      updateData.budgetTier = preferences.budget.join('/');
    }
    
    if (preferences.acceptNearby !== undefined) {
      updateData.acceptNearby = preferences.acceptNearby;
    }
    
    if (preferences.selectedLanguages !== undefined) {
      updateData.selectedLanguages = preferences.selectedLanguages.length > 0 ? preferences.selectedLanguages : null;
    }
    
    if (preferences.selectedTasteIntensity !== undefined) {
      updateData.selectedTasteIntensity = preferences.selectedTasteIntensity.length > 0 ? preferences.selectedTasteIntensity : null;
    }
    
    if (preferences.selectedCuisines !== undefined) {
      updateData.selectedCuisines = preferences.selectedCuisines.length > 0 ? preferences.selectedCuisines : null;
    }

    const [event] = await db
      .update(blindBoxEvents)
      .set(updateData)
      .where(
        and(
          eq(blindBoxEvents.id, eventId),
          eq(blindBoxEvents.userId, userId),
          eq(blindBoxEvents.status, 'pending_match') // Only can update pending events
        )
      )
      .returning();
    
    if (!event) {
      throw new Error('Event not found or cannot be updated');
    }
    
    return event;
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

  async setBlindBoxEventMatchData(
    eventId: string,
    userId: string,
    matchData: {
      matchedAttendees: any[];
      matchExplanation?: string;
    }
  ): Promise<BlindBoxEvent> {
    const [event] = await db
      .update(blindBoxEvents)
      .set({
        status: 'matched',
        matchedAttendees: matchData.matchedAttendees as any,
        matchExplanation: matchData.matchExplanation,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(blindBoxEvents.id, eventId),
          eq(blindBoxEvents.userId, userId)
        )
      )
      .returning();
    
    if (!event) {
      throw new Error('Event not found');
    }
    
    return event;
  }

  // Notification operations
  async getNotificationCounts(userId: string): Promise<NotificationCounts> {
    const result = await db
      .select({
        category: notifications.category,
        count: sql<number>`count(*)::int`,
      })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )
      )
      .groupBy(notifications.category);

    const counts: NotificationCounts = {
      discover: 0,
      activities: 0,
      chat: 0,
      total: 0,
    };

    result.forEach(row => {
      const count = Number(row.count) || 0;
      if (row.category === 'discover') counts.discover = count;
      if (row.category === 'activities') counts.activities = count;
      if (row.category === 'chat') counts.chat = count;
      counts.total += count;
    });

    return counts;
  }

  async markNotificationsAsRead(userId: string, category: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.category, category),
          eq(notifications.isRead, false)
        )
      );
  }

  async createNotification(data: {
    userId: string;
    category: string;
    type: string;
    title: string;
    message?: string;
    relatedResourceId?: string;
  }): Promise<void> {
    await db.insert(notifications).values({
      userId: data.userId,
      category: data.category,
      type: data.type,
      title: data.title,
      message: data.message,
      relatedResourceId: data.relatedResourceId,
      isRead: false,
    });
  }

  // Admin Subscription operations
  async getAllSubscriptions(): Promise<any[]> {
    const result = await db.execute(sql`
      SELECT s.*, u.first_name, u.last_name, u.email, u.phone_number
      FROM subscriptions s
      LEFT JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC
    `);
    return result.rows;
  }

  async getActiveSubscriptions(): Promise<any[]> {
    const result = await db.execute(sql`
      SELECT s.*, u.first_name, u.last_name, u.email, u.phone_number
      FROM subscriptions s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.is_active = true AND s.end_date > NOW()
      ORDER BY s.created_at DESC
    `);
    return result.rows;
  }

  async getUserSubscription(userId: string): Promise<any | undefined> {
    const result = await db.execute(sql`
      SELECT * FROM subscriptions
      WHERE user_id = ${userId} AND is_active = true AND end_date > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `);
    return result.rows[0];
  }

  async createSubscription(data: any): Promise<any> {
    const result = await db.execute(sql`
      INSERT INTO subscriptions (user_id, plan_type, start_date, end_date, is_active, auto_renew, payment_id)
      VALUES (${data.userId}, ${data.planType}, ${data.startDate}, ${data.endDate}, ${data.isActive || true}, ${data.autoRenew || false}, ${data.paymentId || null})
      RETURNING *
    `);
    return result.rows[0];
  }

  async updateSubscription(id: string, updates: any): Promise<any> {
    const setClauses = [];
    const values: any[] = [];
    
    if (updates.isActive !== undefined) {
      setClauses.push(`is_active = $${values.length + 1}`);
      values.push(updates.isActive);
    }
    if (updates.autoRenew !== undefined) {
      setClauses.push(`auto_renew = $${values.length + 1}`);
      values.push(updates.autoRenew);
    }
    if (updates.endDate !== undefined) {
      setClauses.push(`end_date = $${values.length + 1}`);
      values.push(updates.endDate);
    }

    if (setClauses.length === 0) {
      const result = await db.execute(sql`SELECT * FROM subscriptions WHERE id = ${id}`);
      return result.rows[0];
    }

    values.push(id);
    const query = `UPDATE subscriptions SET ${setClauses.join(', ')} WHERE id = $${values.length} RETURNING *`;
    const result = await db.execute({ text: query, values });
    return result.rows[0];
  }
}

export const storage = new DatabaseStorage();
