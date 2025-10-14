import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { updateProfileSchema, updatePersonalitySchema, updateBudgetPreferenceSchema, insertChatMessageSchema, insertEventFeedbackSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Profile routes
  app.post('/api/profile/setup', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  app.post('/api/profile/personality', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  app.post('/api/profile/budget', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
  app.get('/api/events/joined', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const events = await storage.getUserJoinedEvents(userId);
      res.json(events);
    } catch (error) {
      console.error("Error fetching joined events:", error);
      res.status(500).json({ message: "Failed to fetch joined events" });
    }
  });

  app.get('/api/events/:eventId/participants', isAuthenticated, async (req: any, res) => {
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
  app.get('/api/events/:eventId/messages', isAuthenticated, async (req: any, res) => {
    try {
      const { eventId } = req.params;
      const messages = await storage.getEventMessages(eventId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/events/:eventId/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
  app.get('/api/events/:eventId/feedback', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { eventId } = req.params;
      const feedback = await storage.getUserFeedback(userId, eventId);
      res.json(feedback);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({ message: "Failed to fetch feedback" });
    }
  });

  app.post('/api/events/:eventId/feedback', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { eventId } = req.params;
      const result = insertEventFeedbackSchema.safeParse({
        ...req.body,
        eventId,
      });
      
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      const feedback = await storage.createEventFeedback(userId, result.data);
      res.json(feedback);
    } catch (error) {
      console.error("Error creating feedback:", error);
      res.status(500).json({ message: "Failed to create feedback" });
    }
  });

  // Blind Box Event routes
  app.get('/api/my-events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const events = await storage.getUserBlindBoxEvents(userId);
      res.json(events);
    } catch (error) {
      console.error("Error fetching blind box events:", error);
      res.status(500).json({ message: "Failed to fetch blind box events" });
    }
  });

  app.post('/api/blind-box-events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { date, time, eventType, city, area, budget, acceptNearby, selectedLanguages, selectedTasteIntensity, selectedCuisines } = req.body;
      
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
      });
      
      res.json(event);
    } catch (error) {
      console.error("Error creating blind box event:", error);
      res.status(500).json({ message: "Failed to create blind box event" });
    }
  });

  app.get('/api/blind-box-events/:eventId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  app.post('/api/blind-box-events/:eventId/cancel', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { eventId } = req.params;
      const event = await storage.cancelBlindBoxEvent(eventId, userId);
      res.json(event);
    } catch (error) {
      console.error("Error canceling blind box event:", error);
      res.status(500).json({ message: "Failed to cancel blind box event" });
    }
  });

  // Icebreaker routes
  const icebreakerQuestions = {
    intro: [
      "分享你最近一次让自己骄傲的事",
      "如果用三个词描述你，会是哪三个？",
      "你目前最感兴趣的一件事是什么？",
      "最近在学什么新技能或知识？",
      "你的职业是什么？最喜欢工作中的哪个部分？",
    ],
    interests: [
      "最近沉迷的一项运动或爱好是什么？",
      "有没有最近读过印象深刻的书？",
      "最近在追什么剧或电影？",
      "周末通常怎么度过？",
      "有什么一直想尝试但还没开始的事情？",
    ],
    city_life: [
      "在这座城市最爱的一个小店是哪里？",
      "推荐一个你觉得被低估的城市角落",
      "你最喜欢这个城市的哪个季节？",
      "如果要带朋友游览，会带去哪里？",
      "这个城市让你最惊喜的发现是什么？",
    ],
    dining: [
      "今天最想点的一道菜是什么？",
      "有什么特别的饮食偏好或禁忌吗？",
      "分享一个你难忘的用餐体验",
      "最近发现的好吃的店铺",
      "如果只能选一种菜系吃一辈子，会选什么？",
    ],
    drinks: [
      "最喜欢的一杯酒是什么？背后有故事吗？",
      "今晚想尝试什么特调？",
      "你是更喜欢清爽的还是浓烈的？",
      "有没有特别的品酒经历？",
      "如果用一种饮品代表你的性格，会是什么？",
    ]
  };

  app.get('/api/icebreakers/random', isAuthenticated, async (req: any, res) => {
    try {
      const { topic } = req.query;
      let questions: string[] = [];
      
      if (topic && topic in icebreakerQuestions) {
        questions = icebreakerQuestions[topic as keyof typeof icebreakerQuestions];
      } else {
        // General: mix all questions
        questions = Object.values(icebreakerQuestions).flat();
      }
      
      const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
      res.json({ question: randomQuestion });
    } catch (error) {
      console.error("Error fetching icebreaker:", error);
      res.status(500).json({ message: "Failed to fetch icebreaker question" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
