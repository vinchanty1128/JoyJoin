import { 
  type User, type UpsertUser, type UpdateProfile, type UpdateFullProfile, type UpdatePersonality,
  type Event, type EventAttendance, type ChatMessage, type EventFeedback, type BlindBoxEvent,
  type InsertEventAttendance, type InsertChatMessage, type InsertEventFeedback,
  type RegisterUser, type InsertTestResponse, type InsertRoleResult, type RoleResult, type InterestsTopics,
  type Notification, type InsertNotification, type NotificationCounts,
  type DirectMessageThread, type DirectMessage, type InsertDirectMessageThread, type InsertDirectMessage,
  type Content, type InsertContent,
  users, events, eventAttendance, chatMessages, eventFeedback, blindBoxEvents, testResponses, roleResults, notifications,
  directMessageThreads, directMessages, payments, coupons, couponUsage, subscriptions, contents
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

  // Admin Coupon operations
  getAllCoupons(): Promise<any[]>;
  getCoupon(id: string): Promise<any | undefined>;
  createCoupon(data: any): Promise<any>;
  updateCoupon(id: string, updates: any): Promise<any>;
  getCouponUsageStats(couponId: string): Promise<any>;
  recordCouponUsage(data: { couponId: string; userId: string; paymentId: string; discountApplied: number }): Promise<void>;

  // Admin Payment operations
  getAllPayments(): Promise<any[]>;
  createPayment(data: any): Promise<any>;
  updatePayment(id: string, updates: any): Promise<any>;

  // Admin Venue operations
  getAllVenues(): Promise<any[]>;
  getVenue(id: string): Promise<any>;
  updateVenue(id: string, updates: any): Promise<any>;
  deleteVenue(id: string): Promise<void>;

  // Venue Booking operations
  checkVenueAvailability(venueId: string, bookingDate: Date, bookingTime: string): Promise<boolean>;
  createVenueBooking(data: {
    venueId: string;
    eventId: string;
    bookingDate: Date;
    bookingTime: string;
    participantCount: number;
    estimatedRevenue?: number;
  }): Promise<any>;
  getVenueBookings(venueId: string): Promise<any[]>;
  getEventVenueBooking(eventId: string): Promise<any | undefined>;
  cancelVenueBooking(bookingId: string): Promise<any>;
  updateVenueBookingRevenue(bookingId: string, actualRevenue: number): Promise<any>;

  // Admin Event Template operations
  getAllEventTemplates(): Promise<any[]>;
  createEventTemplate(data: any): Promise<any>;
  updateEventTemplate(id: string, updates: any): Promise<any>;

  // Admin Finance operations
  getFinanceStats(): Promise<any>;
  getVenueCommissions(): Promise<any[]>;

  // Admin Moderation operations
  getModerationStats(): Promise<any>;
  getAllReports(): Promise<any[]>;
  getPendingReports(): Promise<any[]>;
  updateReportStatus(id: string, status: string, adminNotes?: string): Promise<any>;
  createModerationLog(data: any): Promise<any>;
  getModerationLogs(): Promise<any[]>;

  // Admin Insights operations
  getInsightsData(): Promise<any>;

  // Admin Content Management operations
  getAllContents(type?: string): Promise<any[]>;
  getContent(id: string): Promise<any | undefined>;
  createContent(data: any): Promise<any>;
  updateContent(id: string, updates: any): Promise<any>;
  deleteContent(id: string): Promise<void>;
  getPublishedContents(type: string): Promise<any[]>;

  // Matching Algorithm operations
  getUserById(id: string): Promise<User | undefined>;
  getActiveMatchingConfig(): Promise<any | undefined>;
  updateMatchingConfig(config: any): Promise<any>;
  saveMatchingResult(result: any): Promise<any>;
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
    const query = sql.raw(`UPDATE subscriptions SET ${setClauses.join(', ')} WHERE id = $${values.length} RETURNING *`);
    const result = await db.execute(query);
    return result.rows[0];
  }

  // Admin Coupon operations
  async getAllCoupons(): Promise<any[]> {
    const result = await db.execute(sql`
      SELECT c.*, 
        COUNT(cu.id) as usage_count
      FROM coupons c
      LEFT JOIN coupon_usage cu ON c.id = cu.coupon_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);
    return result.rows;
  }

  async getCoupon(id: string): Promise<any | undefined> {
    const result = await db.execute(sql`
      SELECT c.*, 
        COUNT(cu.id) as usage_count
      FROM coupons c
      LEFT JOIN coupon_usage cu ON c.id = cu.coupon_id
      WHERE c.id = ${id}
      GROUP BY c.id
    `);
    return result.rows[0];
  }

  async createCoupon(data: any): Promise<any> {
    const result = await db.execute(sql`
      INSERT INTO coupons (code, discount_type, discount_value, valid_from, valid_until, usage_limit, is_active)
      VALUES (${data.code}, ${data.discountType}, ${data.discountValue}, ${data.validFrom}, ${data.validUntil}, ${data.maxUses || null}, true)
      RETURNING *
    `);
    return result.rows[0];
  }

  async updateCoupon(id: string, updates: any): Promise<any> {
    const setClauses = [];
    const values: any[] = [];
    
    if (updates.code !== undefined) {
      setClauses.push(`code = $${values.length + 1}`);
      values.push(updates.code);
    }
    if (updates.discountType !== undefined) {
      setClauses.push(`discount_type = $${values.length + 1}`);
      values.push(updates.discountType);
    }
    if (updates.discountValue !== undefined) {
      setClauses.push(`discount_value = $${values.length + 1}`);
      values.push(updates.discountValue);
    }
    if (updates.validFrom !== undefined) {
      setClauses.push(`valid_from = $${values.length + 1}`);
      values.push(updates.validFrom);
    }
    if (updates.validUntil !== undefined) {
      setClauses.push(`valid_until = $${values.length + 1}`);
      values.push(updates.validUntil);
    }
    if (updates.maxUses !== undefined) {
      setClauses.push(`usage_limit = $${values.length + 1}`);
      values.push(updates.maxUses);
    }
    if (updates.isActive !== undefined) {
      setClauses.push(`is_active = $${values.length + 1}`);
      values.push(updates.isActive);
    }

    if (setClauses.length === 0) {
      return this.getCoupon(id);
    }

    values.push(id);
    const query = sql.raw(`UPDATE coupons SET ${setClauses.join(', ')} WHERE id = $${values.length} RETURNING *`);
    const result = await db.execute(query);
    return result.rows[0];
  }

  async getCouponUsageStats(couponId: string): Promise<any> {
    const result = await db.execute(sql`
      SELECT 
        cu.*, 
        u.first_name, 
        u.last_name, 
        u.email
      FROM coupon_usage cu
      LEFT JOIN users u ON cu.user_id = u.id
      WHERE cu.coupon_id = ${couponId}
      ORDER BY cu.created_at DESC
    `);
    return result.rows;
  }

  async recordCouponUsage(data: { couponId: string; userId: string; paymentId: string; discountApplied: number }): Promise<void> {
    await db.execute(sql`
      INSERT INTO coupon_usage (coupon_id, user_id, payment_id, discount_applied)
      VALUES (${data.couponId}, ${data.userId}, ${data.paymentId}, ${data.discountApplied})
    `);
    
    // Increment coupon usage count
    await db.execute(sql`
      UPDATE coupons SET current_uses = current_uses + 1 WHERE id = ${data.couponId}
    `);
  }

  // ============ PAYMENTS ============
  async createPayment(data: any): Promise<any> {
    const result = await db.execute(sql`
      INSERT INTO payments (user_id, payment_type, related_id, original_amount, discount_amount, final_amount, coupon_id, wechat_order_id, status)
      VALUES (${data.userId}, ${data.paymentType}, ${data.relatedId || null}, ${data.originalAmount}, ${data.discountAmount || 0}, ${data.finalAmount}, ${data.couponId || null}, ${data.wechatOrderId}, ${data.status || 'pending'})
      RETURNING *
    `);
    return result.rows[0];
  }

  async updatePayment(id: string, updates: any): Promise<any> {
    const setClauses = [];
    const values: any[] = [];
    
    if (updates.status !== undefined) {
      setClauses.push(`status = $${values.length + 1}`);
      values.push(updates.status);
    }
    if (updates.wechatTransactionId !== undefined) {
      setClauses.push(`wechat_transaction_id = $${values.length + 1}`);
      values.push(updates.wechatTransactionId);
    }
    if (updates.paidAt !== undefined) {
      setClauses.push(`paid_at = $${values.length + 1}`);
      values.push(updates.paidAt);
    }

    if (setClauses.length === 0) {
      const result = await db.execute(sql`SELECT * FROM payments WHERE id = ${id}`);
      return result.rows[0];
    }

    values.push(id);
    const query = sql.raw(`UPDATE payments SET ${setClauses.join(', ')} WHERE id = $${values.length} RETURNING *`);
    const result = await db.execute(query);
    return result.rows[0];
  }

  // ============ VENUES ============
  async getAllVenues(): Promise<any[]> {
    const result = await db.execute(sql`
      SELECT v.*,
        COALESCE(COUNT(DISTINCT vb.id), 0)::text as booking_count,
        COALESCE(SUM(vb.commission_amount), 0)::text as total_commission
      FROM venues v
      LEFT JOIN venue_bookings vb ON v.id = vb.venue_id AND vb.status = 'completed'
      GROUP BY v.id
      ORDER BY v.created_at DESC
    `);
    return result.rows;
  }

  async getVenue(id: string): Promise<any> {
    const result = await db.execute(sql`SELECT * FROM venues WHERE id = ${id}`);
    return result.rows[0];
  }

  async createVenue(data: any): Promise<any> {
    const result = await db.execute(sql`
      INSERT INTO venues (name, type, address, city, district, contact_name, contact_phone, commission_rate, tags, cuisines, price_range, max_concurrent_events, is_active, notes)
      VALUES (${data.name}, ${data.type}, ${data.address}, ${data.city}, ${data.district}, ${data.contactName || null}, ${data.contactPhone || null}, ${data.commissionRate || 20}, ${data.tags || []}, ${data.cuisines || []}, ${data.priceRange || null}, ${data.maxConcurrentEvents || 1}, ${data.isActive !== false}, ${data.notes || null})
      RETURNING *
    `);
    return result.rows[0];
  }

  async updateVenue(id: string, updates: any): Promise<any> {
    const setClauses = [];
    const values: any[] = [];
    
    if (updates.name !== undefined) {
      setClauses.push(`name = $${values.length + 1}`);
      values.push(updates.name);
    }
    if (updates.type !== undefined) {
      setClauses.push(`type = $${values.length + 1}`);
      values.push(updates.type);
    }
    if (updates.address !== undefined) {
      setClauses.push(`address = $${values.length + 1}`);
      values.push(updates.address);
    }
    if (updates.city !== undefined) {
      setClauses.push(`city = $${values.length + 1}`);
      values.push(updates.city);
    }
    if (updates.district !== undefined) {
      setClauses.push(`district = $${values.length + 1}`);
      values.push(updates.district);
    }
    if (updates.contactName !== undefined) {
      setClauses.push(`contact_name = $${values.length + 1}`);
      values.push(updates.contactName);
    }
    if (updates.contactPhone !== undefined) {
      setClauses.push(`contact_phone = $${values.length + 1}`);
      values.push(updates.contactPhone);
    }
    if (updates.commissionRate !== undefined) {
      setClauses.push(`commission_rate = $${values.length + 1}`);
      values.push(updates.commissionRate);
    }
    if (updates.tags !== undefined) {
      setClauses.push(`tags = $${values.length + 1}`);
      values.push(updates.tags);
    }
    if (updates.cuisines !== undefined) {
      setClauses.push(`cuisines = $${values.length + 1}`);
      values.push(updates.cuisines);
    }
    if (updates.priceRange !== undefined) {
      setClauses.push(`price_range = $${values.length + 1}`);
      values.push(updates.priceRange);
    }
    if (updates.maxConcurrentEvents !== undefined) {
      setClauses.push(`max_concurrent_events = $${values.length + 1}`);
      values.push(updates.maxConcurrentEvents);
    }
    if (updates.isActive !== undefined) {
      setClauses.push(`is_active = $${values.length + 1}`);
      values.push(updates.isActive);
    }
    if (updates.notes !== undefined) {
      setClauses.push(`notes = $${values.length + 1}`);
      values.push(updates.notes);
    }

    if (setClauses.length === 0) {
      return this.getVenue(id);
    }

    values.push(id);
    const query = sql.raw(`UPDATE venues SET ${setClauses.join(', ')} WHERE id = $${values.length} RETURNING *`);
    const result = await db.execute(query);
    return result.rows[0];
  }

  async deleteVenue(id: string): Promise<void> {
    await db.execute(sql`DELETE FROM venues WHERE id = ${id}`);
  }

  // ============ VENUE BOOKINGS ============
  async checkVenueAvailability(venueId: string, bookingDate: Date, bookingTime: string): Promise<boolean> {
    const dateStr = bookingDate.toISOString().split('T')[0];
    
    const result = await db.execute(sql`
      SELECT v.max_concurrent_events,
        COALESCE(COUNT(vb.id), 0)::integer as current_bookings
      FROM venues v
      LEFT JOIN venue_bookings vb ON v.id = vb.venue_id
        AND DATE(vb.booking_date) = ${dateStr}::date
        AND vb.booking_time = ${bookingTime}
        AND vb.status IN ('confirmed', 'completed')
      WHERE v.id = ${venueId}
      GROUP BY v.id, v.max_concurrent_events
    `);

    if (result.rows.length === 0) {
      return false;
    }

    const venue = result.rows[0] as { max_concurrent_events: number; current_bookings: number };
    return venue.current_bookings < venue.max_concurrent_events;
  }

  async createVenueBooking(data: {
    venueId: string;
    eventId: string;
    bookingDate: Date;
    bookingTime: string;
    participantCount: number;
    estimatedRevenue?: number;
  }): Promise<any> {
    const dateStr = data.bookingDate.toISOString().split('T')[0];
    
    const result = await db.execute(sql`
      WITH venue_check AS (
        SELECT v.id, v.max_concurrent_events,
          COALESCE(COUNT(vb.id), 0)::integer as current_bookings
        FROM venues v
        LEFT JOIN venue_bookings vb ON v.id = vb.venue_id
          AND DATE(vb.booking_date) = ${dateStr}::date
          AND vb.booking_time = ${data.bookingTime}
          AND vb.status IN ('confirmed', 'completed')
        WHERE v.id = ${data.venueId}
        GROUP BY v.id, v.max_concurrent_events
        FOR UPDATE
      )
      INSERT INTO venue_bookings (
        venue_id, event_id, booking_date, booking_time,
        participant_count, estimated_revenue, status
      )
      SELECT 
        ${data.venueId}, ${data.eventId}, ${dateStr}::timestamp, ${data.bookingTime},
        ${data.participantCount}, ${data.estimatedRevenue || null}, 'confirmed'
      FROM venue_check
      WHERE current_bookings < max_concurrent_events
      RETURNING *
    `);

    if (result.rows.length === 0) {
      throw new Error('Venue is not available at the requested time');
    }

    return result.rows[0];
  }

  async getVenueBookings(venueId: string): Promise<any[]> {
    const result = await db.execute(sql`
      SELECT vb.*, e.event_type, e.city, e.area
      FROM venue_bookings vb
      LEFT JOIN blind_box_events e ON vb.event_id = e.id
      WHERE vb.venue_id = ${venueId}
      ORDER BY vb.booking_date DESC, vb.booking_time DESC
    `);
    return result.rows;
  }

  async getEventVenueBooking(eventId: string): Promise<any | undefined> {
    const result = await db.execute(sql`
      SELECT vb.*, v.name as venue_name, v.address, v.city, v.district
      FROM venue_bookings vb
      LEFT JOIN venues v ON vb.venue_id = v.id
      WHERE vb.event_id = ${eventId}
      ORDER BY vb.created_at DESC
      LIMIT 1
    `);
    return result.rows[0];
  }

  async cancelVenueBooking(bookingId: string): Promise<any> {
    const result = await db.execute(sql`
      UPDATE venue_bookings
      SET status = 'cancelled', updated_at = NOW()
      WHERE id = ${bookingId}
      RETURNING *
    `);
    return result.rows[0];
  }

  async updateVenueBookingRevenue(bookingId: string, actualRevenue: number): Promise<any> {
    const result = await db.execute(sql`
      UPDATE venue_bookings vb
      SET 
        actual_revenue = ${actualRevenue},
        commission_amount = (
          SELECT ROUND(${actualRevenue} * v.commission_rate / 100.0)
          FROM venues v
          WHERE v.id = vb.venue_id
        ),
        status = 'completed',
        updated_at = NOW()
      WHERE vb.id = ${bookingId}
      RETURNING *
    `);
    return result.rows[0];
  }

  // ============ EVENT TEMPLATES ============
  async getAllEventTemplates(): Promise<any[]> {
    const result = await db.execute(sql`
      SELECT * FROM event_templates
      ORDER BY day_of_week, time_of_day
    `);
    return result.rows;
  }

  async getEventTemplate(id: string): Promise<any> {
    const result = await db.execute(sql`SELECT * FROM event_templates WHERE id = ${id}`);
    return result.rows[0];
  }

  async createEventTemplate(data: any): Promise<any> {
    const result = await db.execute(sql`
      INSERT INTO event_templates (name, event_type, day_of_week, time_of_day, theme, gender_restriction, min_age, max_age, min_participants, max_participants, custom_price, is_active)
      VALUES (${data.name}, ${data.eventType}, ${data.dayOfWeek}, ${data.timeOfDay}, ${data.theme || null}, ${data.genderRestriction || null}, ${data.minAge || null}, ${data.maxAge || null}, ${data.minParticipants || 5}, ${data.maxParticipants || 10}, ${data.customPrice || null}, ${data.isActive !== false})
      RETURNING *
    `);
    return result.rows[0];
  }

  async updateEventTemplate(id: string, updates: any): Promise<any> {
    const setClauses = [];
    const values: any[] = [];
    
    if (updates.name !== undefined) {
      setClauses.push(`name = $${values.length + 1}`);
      values.push(updates.name);
    }
    if (updates.eventType !== undefined) {
      setClauses.push(`event_type = $${values.length + 1}`);
      values.push(updates.eventType);
    }
    if (updates.dayOfWeek !== undefined) {
      setClauses.push(`day_of_week = $${values.length + 1}`);
      values.push(updates.dayOfWeek);
    }
    if (updates.timeOfDay !== undefined) {
      setClauses.push(`time_of_day = $${values.length + 1}`);
      values.push(updates.timeOfDay);
    }
    if (updates.theme !== undefined) {
      setClauses.push(`theme = $${values.length + 1}`);
      values.push(updates.theme);
    }
    if (updates.genderRestriction !== undefined) {
      setClauses.push(`gender_restriction = $${values.length + 1}`);
      values.push(updates.genderRestriction);
    }
    if (updates.minAge !== undefined) {
      setClauses.push(`min_age = $${values.length + 1}`);
      values.push(updates.minAge);
    }
    if (updates.maxAge !== undefined) {
      setClauses.push(`max_age = $${values.length + 1}`);
      values.push(updates.maxAge);
    }
    if (updates.minParticipants !== undefined) {
      setClauses.push(`min_participants = $${values.length + 1}`);
      values.push(updates.minParticipants);
    }
    if (updates.maxParticipants !== undefined) {
      setClauses.push(`max_participants = $${values.length + 1}`);
      values.push(updates.maxParticipants);
    }
    if (updates.customPrice !== undefined) {
      setClauses.push(`custom_price = $${values.length + 1}`);
      values.push(updates.customPrice);
    }
    if (updates.isActive !== undefined) {
      setClauses.push(`is_active = $${values.length + 1}`);
      values.push(updates.isActive);
    }

    if (setClauses.length === 0) {
      return this.getEventTemplate(id);
    }

    values.push(id);
    const query = sql.raw(`UPDATE event_templates SET ${setClauses.join(', ')} WHERE id = $${values.length} RETURNING *`);
    const result = await db.execute(query);
    return result.rows[0];
  }

  async deleteEventTemplate(id: string): Promise<void> {
    await db.execute(sql`DELETE FROM event_templates WHERE id = ${id}`);
  }

  // ============ EVENT MANAGEMENT (Admin view of user events) ============
  async getAllBlindBoxEventsAdmin(): Promise<any[]> {
    const result = await db.execute(sql`
      SELECT 
        e.*,
        u.first_name as creator_first_name,
        u.last_name as creator_last_name,
        u.email as creator_email
      FROM blind_box_events e
      LEFT JOIN users u ON e.user_id = u.id
      ORDER BY e.created_at DESC
    `);
    return result.rows;
  }

  async getBlindBoxEventAdmin(id: string): Promise<any> {
    const result = await db.execute(sql`
      SELECT 
        e.*,
        u.first_name as creator_first_name,
        u.last_name as creator_last_name,
        u.email as creator_email,
        u.phone_number as creator_phone
      FROM blind_box_events e
      LEFT JOIN users u ON e.user_id = u.id
      WHERE e.id = ${id}
    `);
    return result.rows[0];
  }

  async updateBlindBoxEventAdmin(id: string, updates: any): Promise<any> {
    const setClauses = [];
    const values: any[] = [];
    
    if (updates.status !== undefined) {
      setClauses.push(`status = $${values.length + 1}`);
      values.push(updates.status);
    }

    if (setClauses.length === 0) {
      return this.getBlindBoxEventAdmin(id);
    }

    values.push(id);
    const query = sql.raw(`UPDATE blind_box_events SET ${setClauses.join(', ')} WHERE id = $${values.length} RETURNING *`);
    const result = await db.execute(query);
    return result.rows[0];
  }

  // ============ FINANCE MANAGEMENT ============
  async getFinanceStats(): Promise<any> {
    // Total revenue from all payments
    const totalRevenue = await db.execute(sql`
      SELECT COALESCE(SUM(amount), 0)::int as total FROM payments WHERE status = 'completed'
    `);
    
    // Subscription revenue
    const subscriptionRevenue = await db.execute(sql`
      SELECT COALESCE(SUM(amount), 0)::int as total FROM payments 
      WHERE payment_type = 'subscription' AND status = 'completed'
    `);
    
    // Event revenue
    const eventRevenue = await db.execute(sql`
      SELECT COALESCE(SUM(amount), 0)::int as total FROM payments 
      WHERE payment_type = 'event' AND status = 'completed'
    `);
    
    // Total payments count
    const totalPayments = await db.execute(sql`
      SELECT COUNT(*)::int as count FROM payments
    `);

    return {
      totalRevenue: totalRevenue.rows[0].total,
      subscriptionRevenue: subscriptionRevenue.rows[0].total,
      eventRevenue: eventRevenue.rows[0].total,
      totalPayments: totalPayments.rows[0].count,
    };
  }

  async getAllPayments(): Promise<any[]> {
    const result = await db.execute(sql`
      SELECT 
        p.*,
        u.first_name as user_first_name,
        u.last_name as user_last_name,
        u.email as user_email
      FROM payments p
      LEFT JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `);
    return result.rows;
  }

  async getPaymentsByType(paymentType: string): Promise<any[]> {
    const result = await db.execute(sql`
      SELECT 
        p.*,
        u.first_name as user_first_name,
        u.last_name as user_last_name,
        u.email as user_email
      FROM payments p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.payment_type = ${paymentType}
      ORDER BY p.created_at DESC
    `);
    return result.rows;
  }

  async getVenueCommissions(): Promise<any[]> {
    const result = await db.execute(sql`
      SELECT 
        v.id,
        v.name as venue_name,
        v.commission_rate,
        COUNT(vb.id)::int as booking_count,
        COALESCE(SUM(vb.final_amount), 0)::int as total_revenue,
        COALESCE(SUM(vb.commission_amount), 0)::int as total_commission
      FROM venues v
      LEFT JOIN venue_bookings vb ON v.id = vb.venue_id
      GROUP BY v.id, v.name, v.commission_rate
      ORDER BY total_commission DESC
    `);
    return result.rows;
  }

  // ============ MODERATION ============
  async getModerationStats(): Promise<any> {
    const totalReports = await db.execute(sql`
      SELECT COUNT(*)::int as count FROM reports
    `);
    
    const pendingReports = await db.execute(sql`
      SELECT COUNT(*)::int as count FROM reports WHERE status = 'pending'
    `);
    
    const resolvedReports = await db.execute(sql`
      SELECT COUNT(*)::int as count FROM reports WHERE status = 'resolved'
    `);
    
    const bannedUsers = await db.execute(sql`
      SELECT COUNT(*)::int as count FROM users WHERE is_banned = true
    `);

    return {
      totalReports: totalReports.rows[0].count,
      pendingReports: pendingReports.rows[0].count,
      resolvedReports: resolvedReports.rows[0].count,
      bannedUsers: bannedUsers.rows[0].count,
    };
  }

  async getAllReports(): Promise<any[]> {
    const result = await db.execute(sql`
      SELECT 
        r.*,
        u1.first_name as reporter_first_name,
        u1.last_name as reporter_last_name,
        u1.email as reporter_email,
        u2.first_name as reported_first_name,
        u2.last_name as reported_last_name,
        u2.email as reported_email
      FROM reports r
      LEFT JOIN users u1 ON r.reporter_id = u1.id
      LEFT JOIN users u2 ON r.reported_user_id = u2.id
      ORDER BY r.created_at DESC
    `);
    return result.rows;
  }

  async getPendingReports(): Promise<any[]> {
    const result = await db.execute(sql`
      SELECT 
        r.*,
        u1.first_name as reporter_first_name,
        u1.last_name as reporter_last_name,
        u1.email as reporter_email,
        u2.first_name as reported_first_name,
        u2.last_name as reported_last_name,
        u2.email as reported_email
      FROM reports r
      LEFT JOIN users u1 ON r.reporter_id = u1.id
      LEFT JOIN users u2 ON r.reported_user_id = u2.id
      WHERE r.status = 'pending'
      ORDER BY r.created_at DESC
    `);
    return result.rows;
  }

  async updateReportStatus(id: string, status: string, adminNotes?: string): Promise<any> {
    const result = await db.execute(sql`
      UPDATE reports 
      SET status = ${status}, admin_notes = ${adminNotes || null}, resolved_at = ${status === 'resolved' ? new Date() : null}
      WHERE id = ${id}
      RETURNING *
    `);
    return result.rows[0];
  }

  async createModerationLog(data: any): Promise<any> {
    const result = await db.execute(sql`
      INSERT INTO moderation_logs (admin_id, action, target_user_id, reason, notes)
      VALUES (${data.adminId}, ${data.action}, ${data.targetUserId}, ${data.reason || null}, ${data.notes || null})
      RETURNING *
    `);
    return result.rows[0];
  }

  async getModerationLogs(): Promise<any[]> {
    const result = await db.execute(sql`
      SELECT 
        ml.*,
        u1.first_name as admin_first_name,
        u1.last_name as admin_last_name,
        u2.first_name as target_first_name,
        u2.last_name as target_last_name,
        u2.email as target_email
      FROM moderation_logs ml
      LEFT JOIN users u1 ON ml.admin_id = u1.id
      LEFT JOIN users u2 ON ml.target_user_id = u2.id
      ORDER BY ml.created_at DESC
      LIMIT 100
    `);
    return result.rows;
  }

  // ============ DATA INSIGHTS ============
  async getInsightsData(): Promise<any> {
    // Engagement metrics
    const totalUsers = await db.execute(sql`SELECT COUNT(*)::int as count FROM users`);
    const activeUsers = await db.execute(sql`
      SELECT COUNT(DISTINCT user_id)::int as count FROM blind_box_events 
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `);
    const totalEvents = await db.execute(sql`SELECT COUNT(*)::int as count FROM blind_box_events`);
    
    // User growth (last 30 days)
    const userGrowth = await db.execute(sql`
      SELECT DATE(created_at) as date, COUNT(*)::int as count 
      FROM users 
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    // Event trends (last 30 days)
    const eventTrends = await db.execute(sql`
      SELECT DATE(created_at) as date, COUNT(*)::int as count 
      FROM blind_box_events 
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    // Personality distribution
    const personalityDistribution = await db.execute(sql`
      SELECT social_archetype as archetype, COUNT(*)::int as count 
      FROM users 
      WHERE social_archetype IS NOT NULL
      GROUP BY social_archetype
      ORDER BY count DESC
    `);

    const avgEventsPerUser = (totalUsers.rows[0] as any).count > 0 
      ? (totalEvents.rows[0] as any).count / (totalUsers.rows[0] as any).count 
      : 0;

    return {
      engagementMetrics: {
        totalUsers: totalUsers.rows[0].count,
        activeUsers: activeUsers.rows[0].count,
        totalEvents: totalEvents.rows[0].count,
        avgEventsPerUser,
      },
      userGrowth: userGrowth.rows,
      eventTrends: eventTrends.rows,
      personalityDistribution: personalityDistribution.rows,
    };
  }

  // ============ CONTENT MANAGEMENT OPERATIONS ============

  async getAllContents(type?: string): Promise<any[]> {
    if (type) {
      return await db.select().from(contents).where(eq(contents.type, type)).orderBy(desc(contents.priority), desc(contents.createdAt));
    }
    return await db.select().from(contents).orderBy(desc(contents.createdAt));
  }

  async getContent(id: string): Promise<any | undefined> {
    const [content] = await db.select().from(contents).where(eq(contents.id, id));
    return content;
  }

  async createContent(data: InsertContent): Promise<Content> {
    const [content] = await db.insert(contents).values(data).returning();
    return content;
  }

  async updateContent(id: string, updates: Partial<Content>): Promise<Content> {
    const [content] = await db
      .update(contents)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(contents.id, id))
      .returning();
    return content;
  }

  async deleteContent(id: string): Promise<void> {
    await db.delete(contents).where(eq(contents.id, id));
  }

  async getPublishedContents(type: string): Promise<any[]> {
    return await db
      .select()
      .from(contents)
      .where(and(
        eq(contents.type, type),
        eq(contents.status, 'published')
      ))
      .orderBy(desc(contents.priority), desc(contents.publishedAt));
  }

  // ============ MATCHING ALGORITHM OPERATIONS ============
  
  async getUserById(id: string): Promise<User | undefined> {
    // Same as getUser, but explicit name for matching context
    return this.getUser(id);
  }

  async getActiveMatchingConfig(): Promise<any | undefined> {
    const result = await db.execute(sql`
      SELECT * FROM matching_config 
      WHERE is_active = true 
      ORDER BY created_at DESC 
      LIMIT 1
    `);
    return result.rows[0] || undefined;
  }

  async updateMatchingConfig(config: any): Promise<any> {
    // First, deactivate all existing configs
    await db.execute(sql`
      UPDATE matching_config SET is_active = false
    `);

    // Insert new config as active
    const result = await db.execute(sql`
      INSERT INTO matching_config (
        config_name, 
        personality_weight, 
        interests_weight, 
        intent_weight, 
        background_weight, 
        culture_weight,
        min_group_size,
        max_group_size,
        preferred_group_size,
        max_same_archetype_ratio,
        min_chemistry_score,
        is_active,
        notes,
        created_by
      ) VALUES (
        ${config.configName || 'default'},
        ${config.personalityWeight || 30},
        ${config.interestsWeight || 25},
        ${config.intentWeight || 20},
        ${config.backgroundWeight || 15},
        ${config.cultureWeight || 10},
        ${config.minGroupSize || 5},
        ${config.maxGroupSize || 10},
        ${config.preferredGroupSize || 7},
        ${config.maxSameArchetypeRatio || 40},
        ${config.minChemistryScore || 60},
        true,
        ${config.notes || null},
        ${config.createdBy || null}
      )
      RETURNING *
    `);
    return result.rows[0];
  }

  async saveMatchingResult(result: any): Promise<any> {
    // Format userIds as properly escaped PostgreSQL array
    const userIdsArray = result.userIds || [];
    // Each UUID needs to be quoted and escaped
    const userIdsLiteral = `ARRAY[${userIdsArray.map((id: string) => `'${id}'`).join(',')}]::text[]`;
    
    const insertResult = await db.execute(sql`
      INSERT INTO matching_results (
        event_id,
        config_id,
        user_ids,
        user_count,
        groups,
        group_count,
        avg_chemistry_score,
        avg_diversity_score,
        overall_match_quality,
        execution_time_ms,
        is_test_run,
        notes
      ) VALUES (
        ${result.eventId || null},
        ${result.configId || null},
        ${sql.raw(userIdsLiteral)},
        ${result.userCount || 0},
        ${JSON.stringify(result.groups || [])}::jsonb,
        ${result.groupCount || 0},
        ${result.avgChemistryScore || 0},
        ${result.avgDiversityScore || 0},
        ${result.overallMatchQuality || 0},
        ${result.executionTimeMs || 0},
        ${result.isTestRun || false},
        ${result.notes || null}
      )
      RETURNING *
    `);
    return insertResult.rows[0];
  }
}

export const storage = new DatabaseStorage();
