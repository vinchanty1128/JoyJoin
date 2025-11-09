import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupPhoneAuth, isPhoneAuthenticated } from "./phoneAuth";
import { paymentService } from "./paymentService";
import { subscriptionService } from "./subscriptionService";
import { venueMatchingService } from "./venueMatchingService";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { updateProfileSchema, updateFullProfileSchema, updatePersonalitySchema, insertChatMessageSchema, insertDirectMessageSchema, insertEventFeedbackSchema, registerUserSchema, interestsTopicsSchema, events, eventAttendance, chatMessages, users, directMessageThreads, directMessages } from "@shared/schema";
import { db } from "./db";
import { eq, or, and } from "drizzle-orm";

// Role mapping based on question responses
const roleMapping: Record<string, Record<string, string>> = {
  "1": { "A": "火花塞", "B": "连接者", "C": "连接者", "D": "氛围组" },
  "2": { "A": "探索者", "B": "挑战者", "C": "故事家", "D": "肯定者" },
  "3": { "A": "故事家", "B": "探索者", "C": "连接者", "D": "氛围组" },
  "4": { "A": "挑战者", "B": "协调者", "C": "连接者", "D": "氛围组" },
  "5": { "A": "挑战者", "B": "协调者", "C": "故事家", "D": "肯定者" },
  "6": { "A": "探索者", "B": "挑战者", "C": "故事家", "D": "肯定者" },
  "7": { "A": "探索者", "B": "火花塞", "C": "故事家", "D": "协调者" },
  "8": { "A": "探索者", "B": "协调者", "C": "连接者", "D": "火花塞" },
  "9": { "A": "协调者", "B": "协调者", "C": "连接者", "D": "连接者" },
  "10": { "A": "探索者", "B": "氛围组", "C": "连接者", "D": "挑战者" },
};

function calculateRoleScores(responses: Record<number, any>): Record<string, number> {
  const scores: Record<string, number> = {
    "火花塞": 0,
    "探索者": 0,
    "故事家": 0,
    "挑战者": 0,
    "连接者": 0,
    "协调者": 0,
    "氛围组": 0,
    "肯定者": 0,
  };

  Object.entries(responses).forEach(([questionId, answer]) => {
    if (answer.type === "single") {
      const role = roleMapping[questionId]?.[answer.value];
      if (role) {
        scores[role] = (scores[role] || 0) + 2;
      }
    } else if (answer.type === "dual") {
      const mostLikeRole = roleMapping[questionId]?.[answer.mostLike];
      const secondLikeRole = roleMapping[questionId]?.[answer.secondLike];
      if (mostLikeRole) {
        scores[mostLikeRole] = (scores[mostLikeRole] || 0) + 2;
      }
      if (secondLikeRole) {
        scores[secondLikeRole] = (scores[secondLikeRole] || 0) + 1;
      }
    }
  });

  return scores;
}

function determineSubtype(primaryRole: string, responses: Record<number, any>): string {
  // Simplified subtype logic - in production, this would be more sophisticated
  const subtypes: Record<string, string[]> = {
    "火花塞": ["联想家", "提问者"],
    "探索者": ["专家型", "考证派"],
    "故事家": ["情感共鸣者", "经历叙述者"],
    "挑战者": ["逻辑型", "视角型"],
    "连接者": ["观察者", "牵线者"],
    "协调者": ["共识推动者", "流程维护者"],
    "氛围组": ["幽默破冰者", "积极呼应者"],
    "肯定者": ["赞美者", "鼓励者"],
  };

  const roleSubtypes = subtypes[primaryRole] || [];
  return roleSubtypes[0] || "";
}

function calculateTraitScores(primaryRole: string, secondaryRole: string | null): {
  affinityScore: number;
  opennessScore: number;
  conscientiousnessScore: number;
  emotionalStabilityScore: number;
  extraversionScore: number;
  positivityScore: number;
} {
  // Base trait profiles for each role (0-10 scale)
  const roleTraits: Record<string, any> = {
    "火花塞": { affinity: 7, openness: 9, conscientiousness: 5, emotionalStability: 7, extraversion: 9, positivity: 8 },
    "探索者": { affinity: 6, openness: 9, conscientiousness: 8, emotionalStability: 7, extraversion: 6, positivity: 7 },
    "故事家": { affinity: 9, openness: 7, conscientiousness: 6, emotionalStability: 6, extraversion: 8, positivity: 7 },
    "挑战者": { affinity: 5, openness: 9, conscientiousness: 8, emotionalStability: 8, extraversion: 7, positivity: 6 },
    "连接者": { affinity: 10, openness: 7, conscientiousness: 7, emotionalStability: 8, extraversion: 6, positivity: 8 },
    "协调者": { affinity: 7, openness: 6, conscientiousness: 9, emotionalStability: 9, extraversion: 7, positivity: 7 },
    "氛围组": { affinity: 8, openness: 7, conscientiousness: 6, emotionalStability: 7, extraversion: 10, positivity: 10 },
    "肯定者": { affinity: 10, openness: 6, conscientiousness: 7, emotionalStability: 8, extraversion: 7, positivity: 10 },
  };

  const primary = roleTraits[primaryRole] || roleTraits["连接者"];
  const secondary = secondaryRole ? roleTraits[secondaryRole] : null;

  // Blend primary and secondary (70% primary, 30% secondary)
  const blend = (p: number, s: number | null) => {
    if (s === null) return p;
    return Math.round(p * 0.7 + s * 0.3);
  };

  return {
    affinityScore: blend(primary.affinity, secondary?.affinity || null),
    opennessScore: blend(primary.openness, secondary?.openness || null),
    conscientiousnessScore: blend(primary.conscientiousness, secondary?.conscientiousness || null),
    emotionalStabilityScore: blend(primary.emotionalStability, secondary?.emotionalStability || null),
    extraversionScore: blend(primary.extraversion, secondary?.extraversion || null),
    positivityScore: blend(primary.positivity, secondary?.positivity || null),
  };
}

function generateInsights(primaryRole: string, secondaryRole: string | null): {
  strengths: string;
  challenges: string;
  idealFriendTypes: string[];
} {
  const insights: Record<string, any> = {
    "火花塞": {
      strengths: "你擅长打开话题、带动气氛，思维活跃，能快速将不同领域的想法联系起来，为聚会注入创意和活力。",
      challenges: "有时可能会跳跃太快，让他人难以跟上；需要注意倾听和给予他人发言空间。",
      idealFriendTypes: ["协调者", "连接者", "探索者"],
    },
    "探索者": {
      strengths: "你善于深入挖掘话题，提供专业见解和细节信息，能将对话引向更有深度的方向。",
      challenges: "可能过于专注细节，有时需要平衡深度与趣味性；注意不要让讨论过于学术化。",
      idealFriendTypes: ["火花塞", "故事家", "协调者"],
    },
    "故事家": {
      strengths: "你擅长通过个人经历和情感共鸣连接他人，能让抽象话题变得生动具体，创造温暖的氛围。",
      challenges: "有时可能过于感性，需要平衡情感表达与理性分析；注意时间管理，避免故事过长。",
      idealFriendTypes: ["探索者", "肯定者", "连接者"],
    },
    "挑战者": {
      strengths: "你善于批判性思考，能发现问题盲点，提出新颖视角，推动群体进行更深入的思考。",
      challenges: "可能显得过于挑剔或对抗性；需要注意表达方式，确保建设性而非破坏性。",
      idealFriendTypes: ["协调者", "连接者", "探索者"],
    },
    "连接者": {
      strengths: "你善于观察和理解他人，能照顾到每个人的感受，促进群体和谐，帮助边缘化的人融入。",
      challenges: "有时可能过于关注他人而忽视自己的需求；需要平衡倾听与表达。",
      idealFriendTypes: ["火花塞", "挑战者", "氛围组"],
    },
    "协调者": {
      strengths: "你擅长管理讨论节奏，化解冲突，推动群体达成共识，确保对话有方向和产出。",
      challenges: "可能过于追求效率而忽视过程中的乐趣；有时需要允许一些「混乱」和自由发挥。",
      idealFriendTypes: ["火花塞", "挑战者", "故事家"],
    },
    "氛围组": {
      strengths: "你善于活跃气氛，用幽默化解尴尬，为聚会带来欢乐和轻松感，让每个人都感到舒适。",
      challenges: "可能过于追求表面的欢乐而回避深层话题；需要平衡娱乐性与实质性。",
      idealFriendTypes: ["探索者", "协调者", "连接者"],
    },
    "肯定者": {
      strengths: "你善于发现和赞美他人的优点，提供情绪价值，创造包容和支持的环境，让害羞的人也能发声。",
      challenges: "可能过于避免冲突而缺乏自己的立场；需要在肯定他人的同时也表达真实想法。",
      idealFriendTypes: ["挑战者", "火花塞", "故事家"],
    },
  };

  return insights[primaryRole] || insights["连接者"];
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  app.use(session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
      sameSite: 'lax',
    },
  }));

  // Phone auth setup
  setupPhoneAuth(app);

  // Auth routes
  app.get('/api/auth/user', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post('/api/auth/logout', async (req: any, res) => {
    try {
      req.session.destroy((err: any) => {
        if (err) {
          console.error("Error destroying session:", err);
          return res.status(500).json({ message: "Failed to logout" });
        }
        res.clearCookie('connect.sid');
        res.json({ message: "Logged out successfully" });
      });
    } catch (error) {
      console.error("Error during logout:", error);
      res.status(500).json({ message: "Failed to logout" });
    }
  });

  // Profile stats endpoint
  app.get('/api/profile/stats', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      
      // Calculate events completed: count completed events the user attended
      const completedEventsResult = await db
        .select({ count: eventAttendance.id })
        .from(eventAttendance)
        .innerJoin(events, eq(eventAttendance.eventId, events.id))
        .where(
          and(
            eq(eventAttendance.userId, userId),
            eq(events.status, 'completed')
          )
        );
      
      const eventsCompleted = completedEventsResult.length || 0;
      
      // Calculate connections made: count direct message threads where user is participant
      const connectionsResult = await db
        .select({ count: directMessageThreads.id })
        .from(directMessageThreads)
        .where(
          or(
            eq(directMessageThreads.user1Id, userId),
            eq(directMessageThreads.user2Id, userId)
          )
        );
      
      const connectionsMade = connectionsResult.length || 0;
      
      res.json({
        eventsCompleted,
        connectionsMade,
      });
    } catch (error) {
      console.error("Error fetching profile stats:", error);
      res.status(500).json({ message: "Failed to fetch profile stats" });
    }
  });

  // Registration routes
  app.post('/api/user/register', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      console.log("[Backend] Received registration data:", req.body);
      const result = registerUserSchema.safeParse(req.body);
      
      if (!result.success) {
        console.error("[Backend] Validation failed:", result.error);
        return res.status(400).json({ error: result.error });
      }

      console.log("[Backend] Validated data:", result.data);
      const user = await storage.registerUser(userId, result.data);
      console.log("[Backend] User updated successfully:", { id: user.id, displayName: user.displayName, gender: user.gender, birthdate: user.birthdate });
      
      res.json(user);
    } catch (error: any) {
      console.error("Error registering user:", error);
      // Return detailed error message for debugging
      const errorMessage = error?.message || "Failed to register user";
      res.status(500).json({ 
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined 
      });
    }
  });

  // Personality test routes
  app.post('/api/personality-test/submit', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { responses } = req.body;

      // Calculate role scores
      const roleScores = calculateRoleScores(responses);
      
      // Determine primary and secondary roles
      // Sort by score DESC, then by role name ASC for stability when scores are equal
      const sortedRoles = Object.entries(roleScores)
        .sort(([roleA, scoreA], [roleB, scoreB]) => {
          if (scoreB !== scoreA) return scoreB - scoreA;  // Higher score first
          return roleA.localeCompare(roleB);  // Stable sort by name when scores equal
        });
      
      const primaryRole = sortedRoles[0][0];
      const primaryRoleScore = sortedRoles[0][1];
      const secondaryRole = sortedRoles[1]?.[0] || null;
      const secondaryRoleScore = sortedRoles[1]?.[1] || 0;

      // Determine subtype (simplified - based on highest scoring items)
      const roleSubtype = determineSubtype(primaryRole, responses);

      // Calculate six-dimensional trait scores
      const traitScores = calculateTraitScores(primaryRole, secondaryRole);

      // Generate insights
      const insights = generateInsights(primaryRole, secondaryRole);

      // Save responses and result
      await storage.saveTestResponses(userId, responses);
      const roleResult = await storage.saveRoleResult(userId, {
        userId,
        primaryRole,
        primaryRoleScore,
        secondaryRole,
        secondaryRoleScore,
        roleSubtype,
        roleScores,
        ...traitScores,
        ...insights,
        testVersion: 1,
      });

      // Mark personality test as complete
      await storage.markPersonalityTestComplete(userId);

      res.json(roleResult);
    } catch (error) {
      console.error("Error submitting personality test:", error);
      res.status(500).json({ message: "Failed to submit personality test" });
    }
  });

  app.get('/api/personality-test/results', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const result = await storage.getRoleResult(userId);
      
      if (!result) {
        return res.status(404).json({ message: "No test results found" });
      }

      res.json(result);
    } catch (error) {
      console.error("Error fetching test results:", error);
      res.status(500).json({ message: "Failed to fetch test results" });
    }
  });

  // Get personality type distribution stats
  app.get('/api/personality-test/stats', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const stats = await storage.getPersonalityDistribution();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching personality stats:", error);
      res.status(500).json({ message: "Failed to fetch personality stats" });
    }
  });

  // Profile routes
  app.post('/api/profile/setup', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const result = updateProfileSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      const user = await storage.updateProfile(userId, result.data);
      await storage.markProfileSetupComplete(userId);
      
      res.json(user);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.post('/api/user/interests-topics', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const result = interestsTopicsSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      const user = await storage.updateInterestsTopics(userId, result.data);
      
      res.json(user);
    } catch (error) {
      console.error("Error updating interests and topics:", error);
      res.status(500).json({ message: "Failed to update interests and topics" });
    }
  });

  app.post('/api/profile/personality', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const result = updatePersonalitySchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      const user = await storage.updatePersonality(userId, result.data);
      
      res.json(user);
    } catch (error) {
      console.error("Error updating personality:", error);
      res.status(500).json({ message: "Failed to update personality" });
    }
  });

  // Update full profile (for editing in profile page)
  app.patch('/api/profile', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const result = updateFullProfileSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      const user = await storage.updateFullProfile(userId, result.data);
      
      res.json(user);
    } catch (error) {
      console.error("Error updating full profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Event routes
  app.get('/api/events/joined', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const events = await storage.getUserJoinedEvents(userId);
      res.json(events);
    } catch (error) {
      console.error("Error fetching joined events:", error);
      res.status(500).json({ message: "Failed to fetch joined events" });
    }
  });

  app.get('/api/events/:eventId/participants', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const { eventId } = req.params;
      const participants = await storage.getEventParticipants(eventId);
      res.json(participants);
    } catch (error) {
      console.error("Error fetching event participants:", error);
      res.status(500).json({ message: "Failed to fetch event participants" });
    }
  });

  // Chat routes (group chat opens 24 hours before event)
  app.get('/api/events/:eventId/messages', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { eventId } = req.params;
      
      // Try to get event from events table first (for demo/regular events)
      const [event] = await db.select().from(events).where(eq(events.id, eventId));
      
      // If not found in events table, try blindBoxEvents table
      let eventDateTime = event?.dateTime;
      if (!event) {
        const blindBoxEvent = await storage.getBlindBoxEventById(eventId, userId);
        if (!blindBoxEvent) {
          return res.status(404).json({ message: "Event not found" });
        }
        eventDateTime = blindBoxEvent.dateTime;
      }

      // Check if group chat is open (24 hours before event OR event has passed)
      const now = new Date();
      const eventTime = new Date(eventDateTime);
      const hoursUntilEvent = (eventTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      // Chat unlocks 24 hours before event, and remains accessible after event completes
      const chatUnlocked = hoursUntilEvent <= 24;

      if (!chatUnlocked) {
        return res.json({
          chatUnlocked: false,
          hoursUntilUnlock: Math.max(0, hoursUntilEvent - 24),
          messages: [],
        });
      }

      const messages = await storage.getEventMessages(eventId);
      res.json({
        chatUnlocked: true,
        hoursUntilUnlock: 0,
        messages,
      });
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/events/:eventId/messages', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { eventId } = req.params;
      
      // Try to get event from events table first (for demo/regular events)
      const [event] = await db.select().from(events).where(eq(events.id, eventId));
      
      // If not found in events table, try blindBoxEvents table
      let eventDateTime = event?.dateTime;
      if (!event) {
        const blindBoxEvent = await storage.getBlindBoxEventById(eventId, userId);
        if (!blindBoxEvent) {
          return res.status(404).json({ message: "Event not found" });
        }
        eventDateTime = blindBoxEvent.dateTime;
      }

      // Check if group chat is open (24 hours before event OR event has passed)
      const now = new Date();
      const eventTime = new Date(eventDateTime);
      const hoursUntilEvent = (eventTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      // Chat unlocks 24 hours before event, and remains accessible after event completes
      const chatUnlocked = hoursUntilEvent <= 24;

      if (!chatUnlocked) {
        return res.status(403).json({ 
          message: "群聊将在活动开始前24小时开放",
          hoursUntilUnlock: Math.max(0, hoursUntilEvent - 24),
        });
      }

      const result = insertChatMessageSchema.safeParse({
        ...req.body,
        eventId,
      });
      
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      const message = await storage.createChatMessage(userId, result.data);
      res.json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  // Direct message routes (1-on-1 chats unlocked via mutual matching)
  app.get('/api/direct-messages', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const threads = await storage.getUserDirectMessageThreads(userId);
      res.json(threads);
    } catch (error) {
      console.error("Error fetching direct message threads:", error);
      res.status(500).json({ message: "Failed to fetch direct message threads" });
    }
  });

  app.get('/api/direct-messages/:threadId', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const { threadId } = req.params;
      const messages = await storage.getThreadMessages(threadId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching thread messages:", error);
      res.status(500).json({ message: "Failed to fetch thread messages" });
    }
  });

  app.post('/api/direct-messages/:threadId', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { threadId } = req.params;
      const result = insertDirectMessageSchema.safeParse({
        ...req.body,
        threadId,
      });
      
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      const message = await storage.sendDirectMessage(userId, result.data);
      res.json(message);
    } catch (error) {
      console.error("Error sending direct message:", error);
      res.status(500).json({ message: "Failed to send direct message" });
    }
  });

  // Feedback routes
  app.get('/api/my-feedbacks', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const feedbacks = await storage.getUserAllFeedbacks(userId);
      res.json(feedbacks);
    } catch (error) {
      console.error("Error fetching all feedbacks:", error);
      res.status(500).json({ message: "Failed to fetch feedbacks" });
    }
  });

  app.get('/api/events/:eventId/feedback', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { eventId } = req.params;
      const feedback = await storage.getUserFeedback(userId, eventId);
      res.json(feedback);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({ message: "Failed to fetch feedback" });
    }
  });

  app.post('/api/events/:eventId/feedback', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { eventId } = req.params;
      const result = insertEventFeedbackSchema.safeParse({
        ...req.body,
        eventId,
      });
      
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      // Award points for completing feedback
      const feedback = await storage.createEventFeedback(userId, result.data);
      
      // Check for mutual matches if user has new connections
      const mutualMatches: string[] = [];
      if (feedback.hasNewConnections && feedback.connections && feedback.connections.length > 0) {
        // Get all feedbacks for this event to check for mutual matches
        const eventFeedbacks = await storage.getEventFeedbacks(eventId);
        
        for (const selectedUserId of feedback.connections) {
          // Find the feedback from the selected user
          const otherUserFeedback = eventFeedbacks.find(f => f.userId === selectedUserId);
          
          // Check if they also selected the current user
          if (otherUserFeedback?.hasNewConnections && 
              otherUserFeedback.connections && 
              otherUserFeedback.connections.includes(userId)) {
            mutualMatches.push(selectedUserId);
            
            // Create direct message thread if it doesn't exist
            const existingThread = await storage.findDirectMessageThread(userId, selectedUserId, eventId);
            if (!existingThread) {
              await storage.createDirectMessageThread({
                user1Id: userId,
                user2Id: selectedUserId,
                eventId: eventId,
              });
              
              // Send mutual match notifications to both users
              await storage.createNotification({
                userId: userId,
                category: 'chat',
                type: 'mutual_match',
                title: '🎉 双向匹配成功',
                message: `你和另一位参与者互相选择，现在可以开始私聊了！`,
                relatedResourceId: eventId,
              });
              
              await storage.createNotification({
                userId: selectedUserId,
                category: 'chat',
                type: 'mutual_match',
                title: '🎉 双向匹配成功',
                message: `你和另一位参与者互相选择，现在可以开始私聊了！`,
                relatedResourceId: eventId,
              });
            }
          }
        }
      }
      
      // Note: In a real app, you'd update user points here
      // await storage.awardFeedbackPoints(userId, 50);
      
      res.json({ ...feedback, mutualMatches });
    } catch (error) {
      console.error("Error creating feedback:", error);
      res.status(500).json({ message: "Failed to create feedback" });
    }
  });

  // Deep feedback route (optional extension)
  app.post('/api/events/:eventId/feedback/deep', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { eventId } = req.params;
      
      // Get existing feedback
      const existingFeedback = await storage.getUserFeedback(userId, eventId);
      
      if (!existingFeedback) {
        return res.status(404).json({ message: "Basic feedback not found. Please complete basic feedback first." });
      }

      // Update with deep feedback data
      const deepFeedbackData = {
        hasDeepFeedback: true,
        matchPointValidation: req.body.matchPointValidation,
        additionalMatchPoints: req.body.additionalMatchPoints,
        conversationBalance: req.body.conversationBalance,
        conversationComfort: req.body.conversationComfort,
        conversationNotes: req.body.conversationNotes,
        futurePreferences: req.body.futurePreferences,
        futurePreferencesOther: req.body.futurePreferencesOther,
        deepFeedbackCompletedAt: new Date(),
      };

      const updatedFeedback = await storage.updateEventFeedbackDeep(userId, eventId, deepFeedbackData);
      res.json(updatedFeedback);
    } catch (error) {
      console.error("Error updating deep feedback:", error);
      res.status(500).json({ message: "Failed to update deep feedback" });
    }
  });

  // 🎯 DEMO: Seed demonstration events
  app.post('/api/demo/seed-events', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { db } = await import("./db");
      const { blindBoxEvents } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");
      
      // Check if user already has demo events
      const existingEvents = await db.select().from(blindBoxEvents).where(eq(blindBoxEvents.userId, userId));
      const hasMatchedDemo = existingEvents.some(e => e.status === 'matched' && e.restaurantName?.includes('Sushi'));
      const hasCompletedDemo = existingEvents.some(e => e.status === 'completed' && e.restaurantName?.includes('Tap House'));
      
      if (hasMatchedDemo && hasCompletedDemo) {
        console.log("✅ Demo events already exist for user:", userId);
        return res.json({ message: "Demo events already exist" });
      }
      
      // Create a matched event (tomorrow evening)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(19, 0, 0, 0);
      
      const matchedEvent = await db.insert(blindBoxEvents).values({
        userId,
        title: "周四 19:00 · 饭局",
        eventType: "饭局",
        city: "香港",
        district: "中环",
        dateTime: tomorrow,
        budgetTier: "150-250",
        selectedLanguages: ["粤语", "普通话"],
        selectedCuisines: ["日本料理", "粤菜"],
        acceptNearby: true,
        status: "matched",
        progress: 100,
        currentParticipants: 5,
        totalParticipants: 5,
        maleCount: 2,
        femaleCount: 3,
        restaurantName: "鮨一 Sushi Ichi",
        restaurantAddress: "中环云咸街28号",
        cuisineTags: ["日本料理", "寿司"],
        matchedAttendees: [
          { 
            userId: "demo-1", 
            displayName: "小美", 
            archetype: "社交达人", 
            topInterests: ["美食", "旅行", "艺术"], 
            age: 27, 
            birthdate: "1998-05-15", 
            industry: "科技", 
            gender: "Woman",
            educationLevel: "Master's",
            studyLocale: "Overseas",
            seniority: "Mid",
            relationshipStatus: "Single",
            fieldOfStudy: "计算机科学",
            hometownRegionCity: "上海",
            languagesComfort: ["普通话 (Mandarin)", "English", "粤语 (Cantonese)"],
            ageVisible: true,
            educationVisible: true,
            industryVisible: true
          },
          { 
            userId: "demo-2", 
            displayName: "阿强", 
            archetype: "探索者", 
            topInterests: ["美食", "摄影", "旅行"], 
            age: 30, 
            birthdate: "1995-03-20", 
            industry: "设计",
            gender: "Man",
            educationLevel: "Bachelor's",
            studyLocale: "Domestic",
            seniority: "Senior",
            relationshipStatus: "Single",
            fieldOfStudy: "设计",
            hometownRegionCity: "广州",
            languagesComfort: ["粤语 (Cantonese)", "普通话 (Mandarin)"],
            ageVisible: true,
            educationVisible: true,
            industryVisible: true
          },
          { 
            userId: "demo-3", 
            displayName: "Lisa", 
            archetype: "连接者", 
            topInterests: ["美食", "艺术", "音乐"], 
            age: 28, 
            birthdate: "1997-07-10", 
            industry: "金融",
            gender: "Woman",
            educationLevel: "Master's",
            studyLocale: "Both",
            seniority: "Mid",
            relationshipStatus: "Married/Partnered",
            fieldOfStudy: "金融学",
            hometownRegionCity: "香港",
            languagesComfort: ["English", "粤语 (Cantonese)", "普通话 (Mandarin)"],
            ageVisible: true,
            educationVisible: true,
            industryVisible: true
          },
          { 
            userId: "demo-4", 
            displayName: "David", 
            archetype: "创意家", 
            topInterests: ["美食", "音乐", "电影"], 
            age: 32, 
            birthdate: "1993-11-05", 
            industry: "媒体",
            gender: "Man",
            educationLevel: "Master's",
            studyLocale: "Overseas",
            seniority: "Senior",
            relationshipStatus: "Single",
            fieldOfStudy: "传媒",
            hometownRegionCity: "北京",
            languagesComfort: ["普通话 (Mandarin)", "English"],
            ageVisible: true,
            educationVisible: true,
            industryVisible: true
          }
        ],
        matchExplanation: "这桌是日料爱好者的聚会！大家都对精致料理和文化交流充满热情，年龄相近，话题契合度高。"
      }).returning();
      
      // Create a completed event (last week)
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      lastWeek.setHours(20, 0, 0, 0);
      
      const completedEvent = await db.insert(blindBoxEvents).values({
        userId,
        title: "周三 20:00 · 酒局",
        eventType: "酒局",
        city: "深圳",
        district: "南山区",
        dateTime: lastWeek,
        budgetTier: "200-300",
        selectedLanguages: ["普通话", "英语"],
        selectedCuisines: ["西餐", "酒吧"],
        acceptNearby: false,
        status: "completed",
        progress: 100,
        currentParticipants: 6,
        totalParticipants: 6,
        maleCount: 3,
        femaleCount: 3,
        restaurantName: "The Tap House 精酿酒吧",
        restaurantAddress: "南山区海德三道1186号",
        cuisineTags: ["酒吧", "西餐"],
        matchedAttendees: [
          { 
            userId: "demo-5", 
            displayName: "Sarah", 
            archetype: "氛围组", 
            topInterests: ["音乐", "社交", "美食"], 
            age: 29, 
            birthdate: "1996-04-12", 
            industry: "创业",
            gender: "Woman",
            educationLevel: "Bachelor's",
            studyLocale: "Overseas",
            seniority: "Founder",
            relationshipStatus: "Single",
            fieldOfStudy: "市场营销",
            hometownRegionCity: "深圳",
            languagesComfort: ["普通话 (Mandarin)", "English"],
            ageVisible: true,
            educationVisible: true,
            industryVisible: true
          },
          { 
            userId: "demo-6", 
            displayName: "Alex", 
            archetype: "火花塞", 
            topInterests: ["创业", "科技", "阅读"], 
            age: 31, 
            birthdate: "1994-09-08", 
            industry: "互联网",
            gender: "Man",
            educationLevel: "Master's",
            studyLocale: "Both",
            seniority: "Senior",
            relationshipStatus: "Single",
            fieldOfStudy: "软件工程",
            hometownRegionCity: "杭州",
            languagesComfort: ["普通话 (Mandarin)", "English"],
            ageVisible: true,
            educationVisible: true,
            industryVisible: true
          },
          { 
            userId: "demo-7", 
            displayName: "小红", 
            archetype: "故事家", 
            topInterests: ["旅行", "摄影", "美食"], 
            age: 28, 
            birthdate: "1997-02-18", 
            industry: "市场",
            gender: "Woman",
            educationLevel: "Bachelor's",
            studyLocale: "Domestic",
            seniority: "Mid",
            relationshipStatus: "Single",
            fieldOfStudy: "市场营销",
            hometownRegionCity: "成都",
            languagesComfort: ["普通话 (Mandarin)"],
            ageVisible: true,
            educationVisible: true,
            industryVisible: true
          },
          { 
            userId: "demo-8", 
            displayName: "Tom", 
            archetype: "探索者", 
            topInterests: ["音乐", "电影", "旅行"], 
            age: 30, 
            birthdate: "1995-07-22", 
            industry: "设计",
            gender: "Man",
            educationLevel: "Bachelor's",
            studyLocale: "Overseas",
            seniority: "Mid",
            relationshipStatus: "Married/Partnered",
            fieldOfStudy: "视觉设计",
            hometownRegionCity: "香港",
            languagesComfort: ["English", "粤语 (Cantonese)"],
            ageVisible: true,
            educationVisible: true,
            industryVisible: true
          },
          { 
            userId: "demo-9", 
            displayName: "Emma", 
            archetype: "连接者", 
            topInterests: ["艺术", "文化", "咖啡"], 
            age: 27, 
            birthdate: "1998-01-30", 
            industry: "咨询",
            gender: "Woman",
            educationLevel: "Master's",
            studyLocale: "Both",
            seniority: "Junior",
            relationshipStatus: "Single",
            fieldOfStudy: "管理咨询",
            hometownRegionCity: "上海",
            languagesComfort: ["普通话 (Mandarin)", "English"],
            ageVisible: true,
            educationVisible: true,
            industryVisible: true
          }
        ],
        matchExplanation: "这是一场创意人的深夜聚会！精酿啤酒配上有趣的灵魂，大家都喜欢分享故事和创意想法。"
      }).returning();
      
      console.log("✅ Demo events created:", { matched: matchedEvent[0].id, completed: completedEvent[0].id });
      
      res.json({ 
        message: "Demo events created successfully",
        events: {
          matched: matchedEvent[0],
          completed: completedEvent[0]
        }
      });
    } catch (error) {
      console.error("Error seeding demo events:", error);
      res.status(500).json({ message: "Failed to seed demo events" });
    }
  });

  // Blind Box Event routes
  app.get('/api/my-events', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const events = await storage.getUserBlindBoxEvents(userId);
      res.json(events);
    } catch (error) {
      console.error("Error fetching blind box events:", error);
      res.status(500).json({ message: "Failed to fetch blind box events" });
    }
  });

  app.post('/api/blind-box-events', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { date, time, eventType, city, area, budget, acceptNearby, selectedLanguages, selectedTasteIntensity, selectedCuisines, inviteFriends, friendsCount } = req.body;
      
      if (!date || !time || !eventType || !area || !budget || budget.length === 0) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const event = await storage.createBlindBoxEvent(userId, {
        date,
        time,
        eventType,
        city: city || "深圳",
        area,
        budget,
        acceptNearby,
        selectedLanguages,
        selectedTasteIntensity,
        selectedCuisines,
        inviteFriends,
        friendsCount,
      });
      
      res.json(event);
    } catch (error) {
      console.error("Error creating blind box event:", error);
      res.status(500).json({ message: "Failed to create blind box event" });
    }
  });

  app.get('/api/blind-box-events/:eventId', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { eventId } = req.params;
      const event = await storage.getBlindBoxEventById(eventId, userId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(event);
    } catch (error) {
      console.error("Error fetching blind box event:", error);
      res.status(500).json({ message: "Failed to fetch blind box event" });
    }
  });

  app.patch('/api/blind-box-events/:eventId', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { eventId } = req.params;
      const { budget, acceptNearby, selectedLanguages, selectedTasteIntensity, selectedCuisines } = req.body;
      
      const event = await storage.updateBlindBoxEventPreferences(eventId, userId, {
        budget,
        acceptNearby,
        selectedLanguages,
        selectedTasteIntensity,
        selectedCuisines,
      });
      
      res.json(event);
    } catch (error) {
      console.error("Error updating blind box event:", error);
      res.status(500).json({ message: "Failed to update blind box event" });
    }
  });

  app.post('/api/blind-box-events/:eventId/cancel', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { eventId } = req.params;
      const event = await storage.cancelBlindBoxEvent(eventId, userId);
      res.json(event);
    } catch (error) {
      console.error("Error canceling blind box event:", error);
      res.status(500).json({ message: "Failed to cancel blind box event" });
    }
  });

  // Demo endpoint to set match data for testing
  app.post('/api/blind-box-events/:eventId/set-demo-match', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { eventId } = req.params;
      
      // Demo matched attendees data with rich hidden attributes for interesting connections
      const demoMatchedAttendees = [
        {
          userId: "demo1",
          displayName: "Alex",
          archetype: "探索者",
          topInterests: ["film_entertainment", "travel_exploration", "photography"],
          age: 29,
          birthdate: "1996-03-15",
          gender: "Man",
          industry: "科技",
          educationLevel: "Master's",
          fieldOfStudy: "计算机科学",
          hometownRegionCity: "北京",
          studyLocale: "Overseas",
          seniority: "Mid",
          relationshipStatus: "Single",
          languagesComfort: ["普通话 (Mandarin)", "English"],
          ageVisible: true,
          industryVisible: true,
          educationVisible: true
        },
        {
          userId: "demo2",
          displayName: "小明",
          archetype: "讲故事的人",
          topInterests: ["food_dining", "music_concerts", "travel_exploration"],
          age: 27,
          birthdate: "1998-07-20",
          gender: "Man",
          industry: "艺术",
          educationLevel: "Bachelor's",
          fieldOfStudy: "视觉艺术",
          hometownRegionCity: "上海",
          studyLocale: "Domestic",
          seniority: "Junior",
          relationshipStatus: "Single",
          languagesComfort: ["普通话 (Mandarin)"],
          ageVisible: true,
          industryVisible: true,
          educationVisible: true
        },
        {
          userId: "demo3",
          displayName: "Sarah",
          archetype: "智者",
          topInterests: ["reading_books", "film_entertainment", "coffee_tea"],
          age: 32,
          birthdate: "1993-05-10",
          gender: "Woman",
          industry: "金融",
          educationLevel: "Master's",
          fieldOfStudy: "金融工程",
          hometownRegionCity: "香港",
          studyLocale: "Overseas",
          seniority: "Senior",
          relationshipStatus: "Married/Partnered",
          languagesComfort: ["English", "粤语 (Cantonese)", "普通话 (Mandarin)"],
          ageVisible: true,
          industryVisible: true,
          educationVisible: true
        },
        {
          userId: "demo4",
          displayName: "李华",
          archetype: "发光体",
          topInterests: ["fitness_health", "travel_exploration", "outdoor_activities"],
          age: 28,
          birthdate: "1997-09-25",
          gender: "Woman",
          industry: "医疗",
          educationLevel: "Doctorate",
          fieldOfStudy: "临床医学",
          hometownRegionCity: "深圳",
          studyLocale: "Both",
          seniority: "Mid",
          relationshipStatus: "Single",
          languagesComfort: ["普通话 (Mandarin)", "English"],
          ageVisible: true,
          industryVisible: true,
          educationVisible: true
        }
      ];
      
      const demoExplanation = "这桌聚集了对电影、旅行充满热情的朋友。我们平衡了探索者的好奇探索与讲故事的人的生动叙事，确保对话既热烈又有深度。";
      
      const event = await storage.setBlindBoxEventMatchData(eventId, userId, {
        matchedAttendees: demoMatchedAttendees,
        matchExplanation: demoExplanation
      });
      
      res.json(event);
    } catch (error) {
      console.error("Error setting demo match data:", error);
      res.status(500).json({ message: "Failed to set demo match data" });
    }
  });

  // Icebreaker routes - Multi-layered questions for deeper connection
  const icebreakerQuestions = {
    // Layer 1: Simple & Lighthearted - Easy entry points
    lighthearted: [
      "今天什么事让你微笑了？",
      "本周最好的消息是什么？",
      "最近吃过最奇怪的一道菜是什么？",
      "如果可以从日常生活中去掉一件事，你会选什么？为什么？",
      "如果能立刻学会一项技能，你想学什么？",
      "周末最喜欢做的一件小事是什么？",
      "最近什么事让你觉得很治愈？",
      "你的「快乐按钮」是什么？做什么事能让你立刻开心起来？",
    ],
    
    // Layer 2: Passions & Hobbies - Discovering interests
    passions: [
      "你对什么充满热情？为什么？",
      "有什么爱好或活动是你真正享受的？它吸引你的地方是什么？",
      "最近沉迷的一项运动或爱好是什么？",
      "有什么一直想尝试但还没开始的事情？",
      "如果有一整天自由时间，你会怎么度过？",
      "你会推荐别人尝试什么爱好或体验？",
      "什么事情会让你完全忘记时间？",
    ],
    
    // Layer 3: Travel & Adventures - Shared experiences
    travel: [
      "最难忘的一次旅行经历是什么？",
      "如果可以立刻去任何地方旅行，你会去哪里？",
      "旅行中遇到过什么意外的惊喜？",
      "你更喜欢计划好的行程，还是随性探索？",
      "有什么地方去了之后改变了你的想法？",
      "推荐一个你觉得被低估的旅行目的地",
      "下一个最想去的地方是哪里？为什么？",
    ],
    
    // Layer 4: Art & Creativity - Cultural connections
    creativity: [
      "最近有什么艺术作品或表演让你印象深刻？",
      "你会用什么方式表达创意？（音乐、绘画、写作等）",
      "有没有特别喜欢的艺术家或创作者？",
      "如果可以掌握一门艺术，你会选什么？",
      "最近在读什么书或在看什么剧？",
      "有什么电影或音乐改变了你的看法？",
      "你觉得什么样的创作最能打动人心？",
    ],
    
    // Layer 5: Innovation & Technology - Future thinking
    innovation: [
      "你觉得什么技术会改变我们的未来？",
      "有什么新科技产品让你觉得很酷？",
      "如果能发明一样东西解决生活中的问题，你会发明什么？",
      "你对AI有什么看法？它会如何影响我们的生活？",
      "最让你期待的未来趋势是什么？",
      "科技让生活更好了，还是更复杂了？",
    ],
    
    // Layer 6: Deeper Personal - Building trust
    personal: [
      "今晚你对这次聚会有什么期待？",
      "猜猜看，大家都是做什么工作的？",
      "如果明年要实现一个重要目标，会是什么？为什么？",
      "有什么经历塑造了现在的你？",
      "如果要教一门课，你会教什么？",
      "你觉得自己在哪方面成长了很多？",
      "最近学到的最重要的一课是什么？",
      "如果可以给5年前的自己一个建议，会说什么？",
    ],
    
    // Layer 7: Values & Beliefs - Deep connection
    values: [
      "有什么信念或价值观对你很重要？它如何影响你的选择？",
      "你觉得人类的发展方向是在进步还是倒退？为什么？",
      "什么样的事情会让你觉得很有意义？",
      "你觉得什么品质在人身上最可贵？",
      "有什么原则是你一直坚持的？",
      "你希望为这个世界留下什么？",
      "对你来说，成功意味着什么？",
    ],
    
    // Context-specific: Dining & Local
    dining: [
      "今天最想点的一道菜是什么？",
      "有什么特别的饮食偏好或禁忌吗？",
      "分享一个你难忘的用餐体验",
      "最近发现的好吃的店铺",
      "如果只能选一种菜系吃一辈子，会选什么？",
    ],
    
    city_life: [
      "在这座城市最爱的一个小店是哪里？",
      "推荐一个你觉得被低估的城市角落",
      "你最喜欢这个城市的哪个季节？",
      "如果要带朋友游览，会带去哪里？",
      "这个城市让你最惊喜的发现是什么？",
    ],
  };

  // Category labels for UI display
  const categoryLabels: Record<string, { name: string, color: string }> = {
    lighthearted: { name: "轻松愉快", color: "green" },
    passions: { name: "兴趣爱好", color: "blue" },
    travel: { name: "旅行探险", color: "purple" },
    creativity: { name: "艺术创意", color: "pink" },
    innovation: { name: "创新科技", color: "cyan" },
    personal: { name: "个人成长", color: "orange" },
    values: { name: "共同价值观", color: "red" },
    dining: { name: "美食话题", color: "yellow" },
    city_life: { name: "城市生活", color: "teal" },
  };

  app.get('/api/icebreakers/random', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const { topic } = req.query;
      let selectedCategory: string;
      let questions: string[];
      
      if (topic && topic in icebreakerQuestions) {
        selectedCategory = topic;
        questions = icebreakerQuestions[topic as keyof typeof icebreakerQuestions];
      } else {
        // General: randomly select a category
        const categories = Object.keys(icebreakerQuestions);
        selectedCategory = categories[Math.floor(Math.random() * categories.length)];
        questions = icebreakerQuestions[selectedCategory as keyof typeof icebreakerQuestions];
      }
      
      const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
      const categoryInfo = categoryLabels[selectedCategory] || { name: "破冰问题", color: "gray" };
      
      res.json({ 
        question: randomQuestion,
        category: categoryInfo.name,
        categoryColor: categoryInfo.color
      });
    } catch (error) {
      console.error("Error fetching icebreaker:", error);
      res.status(500).json({ message: "Failed to fetch icebreaker question" });
    }
  });

  // Notification endpoints
  app.get('/api/notifications/counts', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const counts = await storage.getNotificationCounts(userId);
      res.json(counts);
    } catch (error) {
      console.error("Error fetching notification counts:", error);
      res.status(500).json({ message: "Failed to fetch notification counts" });
    }
  });

  app.post('/api/notifications/mark-read', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { category } = req.body;
      if (!category || !['discover', 'activities', 'chat'].includes(category)) {
        return res.status(400).json({ message: "Invalid category" });
      }

      await storage.markNotificationsAsRead(userId, category);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      res.status(500).json({ message: "Failed to mark notifications as read" });
    }
  });

  // Create notification
  app.post('/api/notifications', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { category, type, title, message, relatedResourceId } = req.body;
      
      if (!category || !type || !title) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      await storage.createNotification({
        userId,
        category,
        type,
        title,
        message,
        relatedResourceId,
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error creating notification:", error);
      res.status(500).json({ message: "Failed to create notification" });
    }
  });

  // Demo: Create sample chat data
  app.post('/api/chats/seed-demo', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      console.log(`[SEED-DEMO] Starting demo data creation for user: ${userId}`);

      // Create demo users with different archetypes and complete profiles
      const [demoUser1] = await db.insert(users).values({
        displayName: '小明',
        archetype: '火花塞',
        hasCompletedProfileSetup: true,
        hasCompletedPersonalityTest: true,
        hasCompletedInterestsTopics: true,
        gender: 'Man',
        age: 28,
        educationLevel: "Master's",
        industry: '科技',
        relationshipStatus: 'Single',
        interestsTop: ['科技', '创业', '咖啡', '产品'],
        interestsRankedTop3: ['科技', '创业', '咖啡'],
        topicsHappy: ['AI发展', '产品设计', '创业故事'],
        languagesComfort: ['粤语', '普通话', '英语'],
        eventsAttended: 5,
        matchesMade: 8,
      }).returning();

      const [demoUser2] = await db.insert(users).values({
        displayName: '小红',
        archetype: '连接者',
        hasCompletedProfileSetup: true,
        hasCompletedPersonalityTest: true,
        hasCompletedInterestsTopics: true,
        gender: 'Woman',
        age: 26,
        educationLevel: "Bachelor's",
        industry: '设计',
        relationshipStatus: 'In a relationship',
        interestsTop: ['设计', '艺术', '旅行', '摄影'],
        interestsRankedTop3: ['设计', '艺术', '旅行'],
        topicsHappy: ['UI/UX设计', '摄影', '文化交流'],
        languagesComfort: ['粤语', '普通话'],
        eventsAttended: 12,
        matchesMade: 15,
      }).returning();

      const [demoUser3] = await db.insert(users).values({
        displayName: '阿杰',
        archetype: '探索者',
        hasCompletedProfileSetup: true,
        hasCompletedPersonalityTest: true,
        hasCompletedInterestsTopics: true,
        gender: 'Man',
        age: 30,
        educationLevel: "Doctorate",
        industry: '金融',
        relationshipStatus: 'Single',
        interestsTop: ['投资', '徒步', '读书', '历史'],
        interestsRankedTop3: ['投资', '徒步', '读书'],
        topicsHappy: ['股市分析', '户外运动', '历史'],
        languagesComfort: ['粤语', '普通话', '英语'],
        eventsAttended: 8,
        matchesMade: 10,
      }).returning();

      // Create demo events with different unlock states
      const now = new Date();
      
      // Event 1: Unlocked (event is in 12 hours - within 24h window)
      const in12Hours = new Date(now.getTime() + 12 * 60 * 60 * 1000);
      
      const [event1] = await db.insert(events).values({
        title: '今晚聚餐 · 港式茶餐厅',
        description: '饭局 · ¥100-200',
        dateTime: in12Hours,
        location: '中环翠华餐厅',
        area: '中环',
        price: null,
        maxAttendees: 6,
        currentAttendees: 4,
        hostId: userId,
        status: 'upcoming',
      }).returning();

      // Add current user and demo users to event 1
      await db.insert(eventAttendance).values([
        {
          eventId: event1.id,
          userId,
          status: 'confirmed',
        },
        {
          eventId: event1.id,
          userId: demoUser1.id,
          status: 'confirmed',
        },
        {
          eventId: event1.id,
          userId: demoUser2.id,
          status: 'confirmed',
        },
        {
          eventId: event1.id,
          userId: demoUser3.id,
          status: 'confirmed',
        },
      ]);

      // Create demo messages for event 1 with different users
      const demoMessages = [
        { message: '大家好！很期待明天的聚会 👋', userId: demoUser1.id },
        { message: '我也是！有人知道这家店的招牌菜是什么吗？', userId: demoUser2.id },
        { message: '听说他们的菠萝包和奶茶超赞！', userId: demoUser3.id },
      ];

      for (const msg of demoMessages) {
        await db.insert(chatMessages).values({
          eventId: event1.id,
          userId: msg.userId,
          message: msg.message,
        });
      }

      // Event 2: Locked (event is in 3 days)
      const in3Days = new Date(now);
      in3Days.setDate(in3Days.getDate() + 3);
      in3Days.setHours(14, 0, 0, 0);
      
      const [event2] = await db.insert(events).values({
        title: '周日下午茶 · 咖啡厅',
        description: '咖啡 · ¥≤100',
        dateTime: in3Days,
        location: '尖沙咀 % Arabica',
        area: '尖沙咀',
        price: null,
        maxAttendees: 5,
        currentAttendees: 3,
        hostId: userId,
        status: 'upcoming',
      }).returning();

      await db.insert(eventAttendance).values({
        eventId: event2.id,
        userId,
        status: 'confirmed',
      });

      // Event 3: Past event (2 hours ago)
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
      
      const [event3] = await db.insert(events).values({
        title: '刚结束的桌游局',
        description: '玩乐 · ¥200-300',
        dateTime: twoHoursAgo,
        location: '铜锣湾 Game On',
        area: '铜锣湾',
        price: null,
        maxAttendees: 6,
        currentAttendees: 5,
        hostId: userId,
        status: 'completed',
      }).returning();

      await db.insert(eventAttendance).values({
        eventId: event3.id,
        userId,
        status: 'confirmed',
      });

      // Create demo messages for past event with different users
      const pastMessages = [
        { message: '今天玩得太开心了！', userId: demoUser2.id },
        { message: '狼人杀太刺激了哈哈', userId: demoUser1.id },
        { message: '下次还要一起玩！', userId: demoUser3.id },
      ];

      for (const msg of pastMessages) {
        await db.insert(chatMessages).values({
          eventId: event3.id,
          userId: msg.userId,
          message: msg.message,
        });
      }

      // Also add demo users as event attendees
      await db.insert(eventAttendance).values([
        { eventId: event3.id, userId: demoUser1.id, status: 'confirmed' },
        { eventId: event3.id, userId: demoUser2.id, status: 'confirmed' },
        { eventId: event3.id, userId: demoUser3.id, status: 'confirmed' },
      ]);

      // Create direct message threads (private 1-1 chats)
      console.log(`[SEED-DEMO] Creating direct message thread 1: ${userId} <-> ${demoUser1.id}`);
      // Thread 1: Current user with demoUser1 (小明-火花塞)
      const [thread1] = await db.insert(directMessageThreads).values({
        user1Id: userId,
        user2Id: demoUser1.id,
        eventId: event3.id, // They matched at the past event
        lastMessageAt: new Date(now.getTime() - 30 * 60 * 1000), // 30 mins ago
      }).returning();
      console.log(`[SEED-DEMO] Thread 1 created with ID: ${thread1.id}`);

      // Messages in thread 1
      const thread1Messages = [
        { senderId: demoUser1.id, message: '今天玩得很开心！我们可以加个好友吗？', createdAt: new Date(now.getTime() - 60 * 60 * 1000) },
        { senderId: userId, message: '当然可以！我也觉得今天很有趣', createdAt: new Date(now.getTime() - 55 * 60 * 1000) },
        { senderId: demoUser1.id, message: '下次有类似的活动记得叫我！', createdAt: new Date(now.getTime() - 30 * 60 * 1000) },
      ];

      for (const msg of thread1Messages) {
        await db.insert(directMessages).values({
          threadId: thread1.id,
          senderId: msg.senderId,
          message: msg.message,
          createdAt: msg.createdAt,
        });
      }

      // Thread 2: Current user with demoUser2 (小红-连接者)
      console.log(`[SEED-DEMO] Creating direct message thread 2: ${userId} <-> ${demoUser2.id}`);
      const [thread2] = await db.insert(directMessageThreads).values({
        user1Id: userId,
        user2Id: demoUser2.id,
        eventId: event3.id,
        lastMessageAt: new Date(now.getTime() - 10 * 60 * 1000), // 10 mins ago
      }).returning();
      console.log(`[SEED-DEMO] Thread 2 created with ID: ${thread2.id}`);

      // Messages in thread 2
      const thread2Messages = [
        { senderId: demoUser2.id, message: '嗨！刚才的狼人杀你玩得真棒', createdAt: new Date(now.getTime() - 45 * 60 * 1000) },
        { senderId: userId, message: '谢谢！你也很厉害呀', createdAt: new Date(now.getTime() - 40 * 60 * 1000) },
        { senderId: demoUser2.id, message: '我们下周还有个咖啡聚会，要来吗？', createdAt: new Date(now.getTime() - 35 * 60 * 1000) },
        { senderId: userId, message: '好啊！具体什么时间？', createdAt: new Date(now.getTime() - 10 * 60 * 1000) },
      ];

      for (const msg of thread2Messages) {
        await db.insert(directMessages).values({
          threadId: thread2.id,
          senderId: msg.senderId,
          message: msg.message,
          createdAt: msg.createdAt,
        });
      }

      console.log(`[SEED-DEMO] Demo data creation completed successfully for user: ${userId}`);
      res.json({ 
        success: true, 
        message: 'Demo chat data created (including 2 private chats)',
        events: [
          { title: event1.title, status: 'unlocked', dateTime: event1.dateTime },
          { title: event2.title, status: 'locked', dateTime: event2.dateTime },
          { title: event3.title, status: 'past', dateTime: event3.dateTime },
        ],
        privateChats: [
          { with: '小明 (火花塞)', messages: 3, threadId: thread1.id },
          { with: '小红 (连接者)', messages: 4, threadId: thread2.id },
        ]
      });
    } catch (error) {
      console.error("[SEED-DEMO] Error creating demo chat data:", error);
      res.status(500).json({ message: "Failed to create demo chat data", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Demo: Create sample notifications
  app.post('/api/notifications/seed-demo', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Create discover notifications
      await storage.createNotification({
        userId,
        category: 'discover',
        type: 'new_activity',
        title: '新活动推荐',
        message: '发现了一个超适合你的周末咖啡聚会',
      });

      // Create activities notifications
      await storage.createNotification({
        userId,
        category: 'activities',
        type: 'match_success',
        title: '匹配成功',
        message: '你的周末轰趴活动已成功匹配4位小伙伴',
      });

      await storage.createNotification({
        userId,
        category: 'activities',
        type: 'activity_reminder',
        title: '活动提醒',
        message: '距离「周末轰趴」开始还有2小时',
      });

      await storage.createNotification({
        userId,
        category: 'activities',
        type: 'feedback_reminder',
        title: '反馈提醒',
        message: '「周末轰趴」已结束，快来分享你的感受吧',
      });

      // Create chat notifications
      await storage.createNotification({
        userId,
        category: 'chat',
        type: 'new_message',
        title: '新消息',
        message: 'Alex 在群聊中@了你',
      });

      await storage.createNotification({
        userId,
        category: 'chat',
        type: 'new_message',
        title: '新消息',
        message: '周末轰趴群聊有6条新消息',
      });

      res.json({ success: true, message: 'Demo notifications created' });
    } catch (error) {
      console.error("Error creating demo notifications:", error);
      res.status(500).json({ message: "Failed to create demo notifications" });
    }
  });

  // ============ ADMIN MIDDLEWARE ============
  
  async function requireAdmin(req: Request, res: any, next: any) {
    const session = req.session as any;
    if (!session?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const user = await storage.getUser(session.userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Forbidden - Admin access required" });
      }
      
      next();
    } catch (error) {
      console.error("Error checking admin status:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // ============ ADMIN API ROUTES ============

  // Dashboard Statistics
  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      
      // Calculate stats
      const totalUsers = allUsers.length;
      const subscribedUsers = 0; // TODO: Count from subscriptions table
      const newUsersThisWeek = 0; // TODO: Count users created in last 7 days
      const userGrowth = 0; // TODO: Calculate growth percentage
      
      // Count events (for now using blindBoxEvents)
      const allBlindBoxEvents = await storage.getAllBlindBoxEvents();
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const eventsThisMonth = allBlindBoxEvents.filter((event: any) => {
        const eventDate = new Date(event.createdAt || '');
        return eventDate >= thisMonth;
      }).length;
      
      // Revenue stats (placeholder)
      const monthlyRevenue = 0; // TODO: Calculate from payments table
      
      // Personality distribution
      const personalityDistribution = allUsers.reduce((acc: Record<string, number>, user: any) => {
        if (user.primaryRole) {
          acc[user.primaryRole] = (acc[user.primaryRole] || 0) + 1;
        }
        return acc;
      }, {});

      res.json({
        totalUsers,
        subscribedUsers,
        eventsThisMonth,
        monthlyRevenue,
        newUsersThisWeek,
        userGrowth,
        personalityDistribution,
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // User Management - Get all users with filters
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const { search, filter } = req.query;
      let users = await storage.getAllUsers();

      // Apply search filter
      if (search && typeof search === "string") {
        const searchLower = search.toLowerCase();
        users = users.filter((user: any) => 
          user.firstName?.toLowerCase().includes(searchLower) ||
          user.lastName?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          user.phoneNumber?.includes(search)
        );
      }

      // Apply status filter
      if (filter === "banned") {
        users = users.filter((user: any) => user.isBanned);
      } else if (filter === "subscribed") {
        // TODO: Filter by subscription status when subscriptions table is implemented
        users = [];
      } else if (filter === "non-subscribed") {
        // TODO: Filter by non-subscription status
        users = users;
      }

      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // User Management - Get user details
  app.get("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get user's events
      const events = await storage.getUserBlindBoxEvents(req.params.id);
      
      res.json({
        ...user,
        events,
        subscriptions: [], // TODO: Get from subscriptions table
        payments: [], // TODO: Get from payments table
      });
    } catch (error) {
      console.error("Error fetching user details:", error);
      res.status(500).json({ message: "Failed to fetch user details" });
    }
  });

  // User Management - Ban user
  app.patch("/api/admin/users/:id/ban", requireAdmin, async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const updatedUser = await storage.updateUser(req.params.id, { isBanned: true });
      
      // TODO: Log moderation action
      res.json(updatedUser);
    } catch (error) {
      console.error("Error banning user:", error);
      res.status(500).json({ message: "Failed to ban user" });
    }
  });

  // User Management - Unban user
  app.patch("/api/admin/users/:id/unban", requireAdmin, async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const updatedUser = await storage.updateUser(req.params.id, { isBanned: false });
      
      // TODO: Log moderation action
      res.json(updatedUser);
    } catch (error) {
      console.error("Error unbanning user:", error);
      res.status(500).json({ message: "Failed to unban user" });
    }
  });

  // Subscription Management - Get all subscriptions
  app.get("/api/admin/subscriptions", requireAdmin, async (req, res) => {
    try {
      const { filter } = req.query;
      let subscriptions;
      
      if (filter === "active") {
        subscriptions = await storage.getActiveSubscriptions();
      } else {
        subscriptions = await storage.getAllSubscriptions();
      }

      res.json(subscriptions);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      res.status(500).json({ message: "Failed to fetch subscriptions" });
    }
  });

  // Subscription Management - Create subscription
  app.post("/api/admin/subscriptions", requireAdmin, async (req, res) => {
    try {
      const { userId, planType, durationMonths } = req.body;
      
      if (!userId || !planType || !durationMonths) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + durationMonths);

      const subscription = await storage.createSubscription({
        userId,
        planType,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        isActive: true,
        autoRenew: false,
      });

      res.json(subscription);
    } catch (error) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });

  // Subscription Management - Update subscription
  app.patch("/api/admin/subscriptions/:id", requireAdmin, async (req, res) => {
    try {
      const { isActive, autoRenew, endDate } = req.body;
      
      const subscription = await storage.updateSubscription(req.params.id, {
        isActive,
        autoRenew,
        endDate,
      });

      res.json(subscription);
    } catch (error) {
      console.error("Error updating subscription:", error);
      res.status(500).json({ message: "Failed to update subscription" });
    }
  });

  // Coupon Management - Get all coupons
  app.get("/api/admin/coupons", requireAdmin, async (req, res) => {
    try {
      const coupons = await storage.getAllCoupons();
      res.json(coupons);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      res.status(500).json({ message: "Failed to fetch coupons" });
    }
  });

  // Coupon Management - Get coupon details
  app.get("/api/admin/coupons/:id", requireAdmin, async (req, res) => {
    try {
      const coupon = await storage.getCoupon(req.params.id);
      if (!coupon) {
        return res.status(404).json({ message: "Coupon not found" });
      }
      res.json(coupon);
    } catch (error) {
      console.error("Error fetching coupon:", error);
      res.status(500).json({ message: "Failed to fetch coupon" });
    }
  });

  // Coupon Management - Get coupon usage stats
  app.get("/api/admin/coupons/:id/usage", requireAdmin, async (req, res) => {
    try {
      const usage = await storage.getCouponUsageStats(req.params.id);
      res.json(usage);
    } catch (error) {
      console.error("Error fetching coupon usage:", error);
      res.status(500).json({ message: "Failed to fetch coupon usage" });
    }
  });

  // Coupon Management - Create coupon
  app.post("/api/admin/coupons", requireAdmin, async (req, res) => {
    try {
      const { code, discountType, discountValue, validFrom, validUntil, maxUses } = req.body;
      
      if (!code || !discountType || !discountValue) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const coupon = await storage.createCoupon({
        code: code.toUpperCase(),
        discountType,
        discountValue,
        validFrom: validFrom || new Date().toISOString(),
        validUntil: validUntil || null,
        maxUses: maxUses || null,
        isActive: true,
      });

      res.json(coupon);
    } catch (error) {
      console.error("Error creating coupon:", error);
      res.status(500).json({ message: "Failed to create coupon" });
    }
  });

  // Coupon Management - Update coupon
  app.patch("/api/admin/coupons/:id", requireAdmin, async (req, res) => {
    try {
      const coupon = await storage.updateCoupon(req.params.id, req.body);
      res.json(coupon);
    } catch (error) {
      console.error("Error updating coupon:", error);
      res.status(500).json({ message: "Failed to update coupon" });
    }
  });

  // Venue Management - Get all venues
  app.get("/api/admin/venues", requireAdmin, async (req, res) => {
    try {
      const venues = await storage.getAllVenues();
      res.json(venues);
    } catch (error) {
      console.error("Error fetching venues:", error);
      res.status(500).json({ message: "Failed to fetch venues" });
    }
  });

  // Venue Management - Get venue details
  app.get("/api/admin/venues/:id", requireAdmin, async (req, res) => {
    try {
      const venue = await storage.getVenue(req.params.id);
      if (!venue) {
        return res.status(404).json({ message: "Venue not found" });
      }
      res.json(venue);
    } catch (error) {
      console.error("Error fetching venue:", error);
      res.status(500).json({ message: "Failed to fetch venue" });
    }
  });

  // Venue Management - Create venue
  app.post("/api/admin/venues", requireAdmin, async (req, res) => {
    try {
      const { name, type, address, city, district, contactName, contactPhone, commissionRate, tags, cuisines, priceRange, maxConcurrentEvents, notes } = req.body;
      
      if (!name || !type || !address || !city || !district) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const venue = await storage.createVenue({
        name,
        type,
        address,
        city,
        district,
        contactName: contactName || null,
        contactPhone: contactPhone || null,
        commissionRate: commissionRate || 20,
        tags: tags || [],
        cuisines: cuisines || [],
        priceRange: priceRange || null,
        maxConcurrentEvents: maxConcurrentEvents || 1,
        isActive: true,
        notes: notes || null,
      });

      res.json(venue);
    } catch (error) {
      console.error("Error creating venue:", error);
      res.status(500).json({ message: "Failed to create venue" });
    }
  });

  // Venue Management - Update venue
  app.patch("/api/admin/venues/:id", requireAdmin, async (req, res) => {
    try {
      const venue = await storage.updateVenue(req.params.id, req.body);
      res.json(venue);
    } catch (error) {
      console.error("Error updating venue:", error);
      res.status(500).json({ message: "Failed to update venue" });
    }
  });

  // Venue Management - Delete venue
  app.delete("/api/admin/venues/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteVenue(req.params.id);
      res.json({ message: "Venue deleted successfully" });
    } catch (error) {
      console.error("Error deleting venue:", error);
      res.status(500).json({ message: "Failed to delete venue" });
    }
  });

  // Event Templates - Get all templates
  app.get("/api/admin/event-templates", requireAdmin, async (req, res) => {
    try {
      const templates = await storage.getAllEventTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching event templates:", error);
      res.status(500).json({ message: "Failed to fetch event templates" });
    }
  });

  // Event Templates - Create template
  app.post("/api/admin/event-templates", requireAdmin, async (req, res) => {
    try {
      const { name, eventType, dayOfWeek, timeOfDay, theme, genderRestriction, minAge, maxAge, minParticipants, maxParticipants, customPrice } = req.body;
      
      if (!name || !eventType || dayOfWeek === undefined || !timeOfDay) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const template = await storage.createEventTemplate({
        name,
        eventType,
        dayOfWeek,
        timeOfDay,
        theme: theme || null,
        genderRestriction: genderRestriction || null,
        minAge: minAge || null,
        maxAge: maxAge || null,
        minParticipants: minParticipants || 5,
        maxParticipants: maxParticipants || 10,
        customPrice: customPrice || null,
        isActive: true,
      });

      res.json(template);
    } catch (error) {
      console.error("Error creating event template:", error);
      res.status(500).json({ message: "Failed to create event template" });
    }
  });

  // Event Templates - Update template
  app.patch("/api/admin/event-templates/:id", requireAdmin, async (req, res) => {
    try {
      const template = await storage.updateEventTemplate(req.params.id, req.body);
      res.json(template);
    } catch (error) {
      console.error("Error updating event template:", error);
      res.status(500).json({ message: "Failed to update event template" });
    }
  });

  // Event Templates - Delete template
  app.delete("/api/admin/event-templates/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteEventTemplate(req.params.id);
      res.json({ message: "Event template deleted successfully" });
    } catch (error) {
      console.error("Error deleting event template:", error);
      res.status(500).json({ message: "Failed to delete event template" });
    }
  });

  // Event Management - Get all events (admin view)
  app.get("/api/admin/events", requireAdmin, async (req, res) => {
    try {
      const events = await storage.getAllBlindBoxEventsAdmin();
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  // Event Management - Get event details (admin view)
  app.get("/api/admin/events/:id", requireAdmin, async (req, res) => {
    try {
      const event = await storage.getBlindBoxEventAdmin(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  // Event Management - Update event status
  app.patch("/api/admin/events/:id", requireAdmin, async (req, res) => {
    try {
      const event = await storage.updateBlindBoxEventAdmin(req.params.id, req.body);
      res.json(event);
    } catch (error) {
      console.error("Error updating event:", error);
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  // Finance - Get statistics
  app.get("/api/admin/finance/stats", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getFinanceStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching finance stats:", error);
      res.status(500).json({ message: "Failed to fetch finance stats" });
    }
  });

  // Finance - Get all payments
  app.get("/api/admin/finance/payments", requireAdmin, async (req, res) => {
    try {
      const { type } = req.query;
      const payments = type 
        ? await storage.getPaymentsByType(type as string)
        : await storage.getAllPayments();
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  // Finance - Get venue commissions
  app.get("/api/admin/finance/commissions", requireAdmin, async (req, res) => {
    try {
      const commissions = await storage.getVenueCommissions();
      res.json(commissions);
    } catch (error) {
      console.error("Error fetching commissions:", error);
      res.status(500).json({ message: "Failed to fetch commissions" });
    }
  });

  // Moderation - Get statistics
  app.get("/api/admin/moderation/stats", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getModerationStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching moderation stats:", error);
      res.status(500).json({ message: "Failed to fetch moderation stats" });
    }
  });

  // Moderation - Get all reports
  app.get("/api/admin/moderation/reports", requireAdmin, async (req, res) => {
    try {
      const { status } = req.query;
      const reports = status === 'pending' 
        ? await storage.getPendingReports()
        : await storage.getAllReports();
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  // Moderation - Update report status
  app.patch("/api/admin/moderation/reports/:id", requireAdmin, async (req, res) => {
    try {
      const { status, adminNotes } = req.body;
      const report = await storage.updateReportStatus(req.params.id, status, adminNotes);
      res.json(report);
    } catch (error) {
      console.error("Error updating report:", error);
      res.status(500).json({ message: "Failed to update report" });
    }
  });

  // Moderation - Create moderation log
  app.post("/api/admin/moderation/logs", requireAdmin, async (req, res) => {
    try {
      const session = req.session as any;
      const log = await storage.createModerationLog({
        adminId: session.userId,
        action: req.body.action,
        targetUserId: req.body.targetUserId,
        reason: req.body.reason,
        notes: req.body.notes,
      });
      res.json(log);
    } catch (error) {
      console.error("Error creating moderation log:", error);
      res.status(500).json({ message: "Failed to create moderation log" });
    }
  });

  // Moderation - Get moderation logs
  app.get("/api/admin/moderation/logs", requireAdmin, async (req, res) => {
    try {
      const logs = await storage.getModerationLogs();
      res.json(logs);
    } catch (error) {
      console.error("Error fetching moderation logs:", error);
      res.status(500).json({ message: "Failed to fetch moderation logs" });
    }
  });

  // Data Insights - Get analytics data
  app.get("/api/admin/insights", requireAdmin, async (req, res) => {
    try {
      const insights = await storage.getInsightsData();
      res.json(insights);
    } catch (error) {
      console.error("Error fetching insights:", error);
      res.status(500).json({ message: "Failed to fetch insights" });
    }
  });

  // ============ SUBSCRIPTION MANAGEMENT ============
  
  // Get current user's subscription status
  app.get("/api/subscription/status", isPhoneAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const status = await subscriptionService.getUserSubscriptionStatus(userId);
      res.json(status);
    } catch (error) {
      console.error("Error fetching subscription status:", error);
      res.status(500).json({ message: "Failed to fetch subscription status" });
    }
  });
  
  // Create subscription renewal (returns payment details)
  app.post("/api/subscription/renew", isPhoneAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { planType, couponCode } = req.body;
      
      if (!planType || !["monthly", "quarterly"].includes(planType)) {
        return res.status(400).json({ message: "Invalid plan type" });
      }
      
      // Create pending subscription
      const renewalData = await subscriptionService.renewSubscription(userId, planType);
      
      // Create payment for the renewal
      let couponId: string | undefined;
      if (couponCode) {
        const coupons = await storage.getAllCoupons();
        const coupon = coupons.find(c => c.code === couponCode && c.isActive);
        if (coupon) {
          couponId = coupon.id;
        }
      }
      
      const paymentResult = await paymentService.createPayment({
        userId,
        paymentType: "subscription",
        relatedId: renewalData.subscriptionId,
        originalAmount: renewalData.amount,
        couponId,
      });
      
      res.json({
        subscription: renewalData,
        payment: paymentResult,
      });
    } catch (error) {
      console.error("Error renewing subscription:", error);
      res.status(500).json({ message: "Failed to renew subscription" });
    }
  });
  
  // Cancel subscription
  app.post("/api/subscription/cancel", isPhoneAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const subscription = await storage.getUserSubscription(userId);
      if (!subscription) {
        return res.status(404).json({ message: "No active subscription found" });
      }
      
      await subscriptionService.cancelSubscription(subscription.id, req.body.reason);
      res.json({ message: "Subscription cancelled" });
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      res.status(500).json({ message: "Failed to cancel subscription" });
    }
  });

  // ============ PAYMENT & WEBHOOKS ============
  
  // Create payment order for subscription
  app.post("/api/payments/create", isPhoneAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { paymentType, relatedId, originalAmount, couponCode } = req.body;
      
      // Validate coupon if provided
      let couponId: string | undefined;
      if (couponCode) {
        const coupons = await storage.getAllCoupons();
        const coupon = coupons.find(c => c.code === couponCode && c.isActive);
        if (coupon) {
          couponId = coupon.id;
        }
      }
      
      const paymentResult = await paymentService.createPayment({
        userId,
        paymentType,
        relatedId,
        originalAmount,
        couponId,
      });
      
      res.json(paymentResult);
    } catch (error) {
      console.error("Error creating payment:", error);
      res.status(500).json({ message: "Failed to create payment" });
    }
  });
  
  // WeChat Pay webhook - receives payment status updates
  app.post("/api/webhooks/wechat-pay", async (req, res) => {
    try {
      await paymentService.handleWebhook(req.body);
      res.json({ code: "SUCCESS", message: "OK" });
    } catch (error) {
      console.error("Error processing WeChat Pay webhook:", error);
      res.status(500).json({ code: "FAIL", message: "Internal server error" });
    }
  });
  
  // Query payment status
  app.get("/api/payments/:wechatOrderId/status", isPhoneAuthenticated, async (req, res) => {
    try {
      const { wechatOrderId } = req.params;
      const status = await paymentService.queryPaymentStatus(wechatOrderId);
      res.json({ status });
    } catch (error) {
      console.error("Error querying payment status:", error);
      res.status(500).json({ message: "Failed to query payment status" });
    }
  });
  
  // Admin - Get all payments
  app.get("/api/admin/payments", requireAdmin, async (req, res) => {
    try {
      const payments = await storage.getAllPayments();
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });
  
  // Admin - Create refund
  app.post("/api/admin/payments/:paymentId/refund", requireAdmin, async (req, res) => {
    try {
      const { paymentId } = req.params;
      const { reason } = req.body;
      await paymentService.createRefund(paymentId, reason);
      res.json({ message: "Refund initiated" });
    } catch (error) {
      console.error("Error creating refund:", error);
      res.status(500).json({ message: "Failed to create refund" });
    }
  });

  // ============ VENUE MATCHING ============
  
  // Find matching venues for event criteria
  app.post("/api/venues/match", isPhoneAuthenticated, async (req, res) => {
    try {
      const { eventType, theme, participantCount, preferredDistrict, preferredCity, cuisinePreferences, priceRange } = req.body;
      
      if (!eventType || !participantCount) {
        return res.status(400).json({ message: "eventType and participantCount are required" });
      }
      
      const matches = await venueMatchingService.findMatchingVenues({
        eventType,
        theme,
        participantCount,
        preferredDistrict,
        preferredCity,
        cuisinePreferences,
        priceRange,
      });
      
      res.json({ venues: matches });
    } catch (error) {
      console.error("Error matching venues:", error);
      res.status(500).json({ message: "Failed to match venues" });
    }
  });
  
  // Get best venue for event
  app.post("/api/venues/select-best", isPhoneAuthenticated, async (req, res) => {
    try {
      const { eventType, theme, participantCount, preferredDistrict, preferredCity, cuisinePreferences, priceRange } = req.body;
      
      if (!eventType || !participantCount) {
        return res.status(400).json({ message: "eventType and participantCount are required" });
      }
      
      const bestMatch = await venueMatchingService.selectBestVenue({
        eventType,
        theme,
        participantCount,
        preferredDistrict,
        preferredCity,
        cuisinePreferences,
        priceRange,
      });
      
      if (!bestMatch) {
        return res.status(404).json({ message: "No suitable venue found" });
      }
      
      res.json(bestMatch);
    } catch (error) {
      console.error("Error selecting venue:", error);
      res.status(500).json({ message: "Failed to select venue" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
