import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupPhoneAuth, isPhoneAuthenticated } from "./phoneAuth";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { updateProfileSchema, updatePersonalitySchema, updateBudgetPreferenceSchema, insertChatMessageSchema, insertEventFeedbackSchema, registerUserSchema, interestsTopicsSchema } from "@shared/schema";

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

  // Registration routes
  app.post('/api/user/register', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const result = registerUserSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      const user = await storage.registerUser(userId, result.data);
      
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
      const sortedRoles = Object.entries(roleScores)
        .sort(([, a], [, b]) => b - a);
      
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
      await storage.markVoiceQuizComplete(userId);
      
      res.json(user);
    } catch (error) {
      console.error("Error updating personality:", error);
      res.status(500).json({ message: "Failed to update personality" });
    }
  });

  app.post('/api/profile/budget', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const result = updateBudgetPreferenceSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      const user = await storage.updateBudgetPreference(userId, result.data);
      
      res.json(user);
    } catch (error) {
      console.error("Error updating budget preference:", error);
      res.status(500).json({ message: "Failed to update budget preference" });
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

  // Chat routes
  app.get('/api/events/:eventId/messages', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const { eventId } = req.params;
      const messages = await storage.getEventMessages(eventId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/events/:eventId/messages', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { eventId } = req.params;
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
      
      // Note: In a real app, you'd update user points here
      // await storage.awardFeedbackPoints(userId, 50);
      
      res.json(feedback);
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
          gender: "Man",
          industry: "科技",
          educationLevel: "Master's",
          hometown: "北京",
          studyLocale: "Overseas",
          seniority: "Mid",
          relationshipStatus: "Single",
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
          gender: "Man",
          industry: "艺术",
          educationLevel: "Bachelor's",
          hometown: "上海",
          studyLocale: "Domestic",
          seniority: "Junior",
          relationshipStatus: "Single",
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
          gender: "Woman",
          industry: "金融",
          educationLevel: "Master's",
          hometown: "香港",
          studyLocale: "Overseas",
          seniority: "Senior",
          relationshipStatus: "Married/Partnered",
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
          gender: "Woman",
          industry: "医疗",
          educationLevel: "Doctorate",
          hometown: "深圳",
          studyLocale: "Both",
          seniority: "Mid",
          relationshipStatus: "Single",
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

  const httpServer = createServer(app);

  return httpServer;
}
