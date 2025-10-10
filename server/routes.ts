import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { updateProfileSchema, updatePersonalitySchema } from "@shared/schema";

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

  const httpServer = createServer(app);

  return httpServer;
}
