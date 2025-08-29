import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGameSessionSchema, insertUserProgressSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all vocabulary words
  app.get("/api/vocabulary", async (req, res) => {
    try {
      const words = await storage.getVocabularyWords();
      res.json(words);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vocabulary" });
    }
  });

  // Get vocabulary words by category
  app.get("/api/vocabulary/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const words = await storage.getVocabularyWordsByCategory(category);
      res.json(words);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vocabulary by category" });
    }
  });

  // Get user progress
  app.get("/api/progress/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user progress" });
    }
  });

  // Update user progress
  app.post("/api/progress", async (req, res) => {
    try {
      const updateSchema = z.object({
        userId: z.string(),
        wordId: z.string(),
        correct: z.boolean()
      });
      
      const { userId, wordId, correct } = updateSchema.parse(req.body);
      const progress = await storage.updateUserProgress(userId, wordId, correct);
      
      // Update user stats
      const stats = await storage.getUserStats(userId);
      const newStars = stats.totalStars + (correct ? 1 : 0);
      const newWordsLearned = progress.mastered ? stats.wordsLearned + 1 : stats.wordsLearned;
      
      await storage.updateUserStats(userId, {
        totalStars: newStars,
        wordsLearned: newWordsLearned,
        lastPlayDate: new Date().toISOString()
      });
      
      res.json(progress);
    } catch (error) {
      res.status(400).json({ error: "Invalid request data" });
    }
  });

  // Create game session
  app.post("/api/game-session", async (req, res) => {
    try {
      const sessionData = insertGameSessionSchema.parse(req.body);
      const session = await storage.createGameSession(sessionData);
      res.json(session);
    } catch (error) {
      res.status(400).json({ error: "Invalid session data" });
    }
  });

  // Update game session
  app.patch("/api/game-session/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const session = await storage.updateGameSession(id, updates);
      res.json(session);
    } catch (error) {
      res.status(404).json({ error: "Game session not found" });
    }
  });

  // Get user stats
  app.get("/api/stats/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user stats" });
    }
  });

  // Get game categories with progress
  app.get("/api/categories/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const allWords = await storage.getVocabularyWords();
      const userProgress = await storage.getUserProgress(userId);
      
      const categories = ["greetings", "numbers_1_10", "colors", "animals", "food", "family", "body_parts", "weather"];
      const categoryProgress = categories.map(category => {
        const categoryWords = allWords.filter(word => word.category === category);
        const completedWords = categoryWords.filter(word => 
          userProgress.some(p => p.wordId === word.id && p.mastered)
        );
        
        return {
          name: category,
          total: categoryWords.length,
          completed: completedWords.length,
          words: categoryWords
        };
      });
      
      res.json(categoryProgress);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch category progress" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
