import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGameSessionSchema } from "@shared/schema";
import { z } from "zod";
import asyncHandler from "./utils/asyncHandler";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all vocabulary words
  app.get(
    "/api/vocabulary",
    asyncHandler(async (_req, res) => {
      const words = await storage.getVocabularyWords();
      res.json(words);
    })
  );

  // Get vocabulary words by category
  app.get(
    "/api/vocabulary/category/:category",
    asyncHandler(async (req, res) => {
      const { category } = req.params;
      const words = await storage.getVocabularyWordsByCategory(category);
      res.json(words);
    })
  );

  // Get user progress
  app.get(
    "/api/progress/:userId",
    asyncHandler(async (req, res) => {
      const { userId } = req.params;
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    })
  );

  // Update user progress
  app.post(
    "/api/progress",
    asyncHandler(async (req, res) => {
      const updateSchema = z.object({
        userId: z.string(),
        wordId: z.string(),
        correct: z.boolean()
      });

      const parsed = updateSchema.safeParse(req.body);
      if (!parsed.success) {
        const error: any = new Error("Invalid request data");
        error.status = 400;
        throw error;
      }

      const { userId, wordId, correct } = parsed.data;
      const progress = await storage.updateUserProgress(userId, wordId, correct);

      // Update user stats
      const stats = await storage.getUserStats(userId);
      const newStars = stats.totalStars + (correct ? 1 : 0);
      const newWordsLearned = progress.mastered
        ? stats.wordsLearned + 1
        : stats.wordsLearned;

      await storage.updateUserStats(userId, {
        totalStars: newStars,
        wordsLearned: newWordsLearned,
        lastPlayDate: new Date().toISOString()
      });

      res.json(progress);
    })
  );

  // Create game session
  app.post(
    "/api/game-session",
    asyncHandler(async (req, res) => {
      const parsed = insertGameSessionSchema.safeParse(req.body);
      if (!parsed.success) {
        const error: any = new Error("Invalid session data");
        error.status = 400;
        throw error;
      }
      const session = await storage.createGameSession(parsed.data);
      res.json(session);
    })
  );

  // Update game session
  app.patch(
    "/api/game-session/:id",
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      const updates = req.body;
      const session = await storage
        .updateGameSession(id, updates)
        .catch(err => {
          (err as any).status = 404;
          throw err;
        });
      res.json(session);
    })
  );

  // Get user stats
  app.get(
    "/api/stats/:userId",
    asyncHandler(async (req, res) => {
      const { userId } = req.params;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    })
  );

  // Get game categories with progress
  app.get(
    "/api/categories/:userId",
    asyncHandler(async (req, res) => {
      const { userId } = req.params;
      const allWords = await storage.getVocabularyWords();
      const userProgress = await storage.getUserProgress(userId);

      const categories = [
        "greetings",
        "numbers_1_10",
        "colors",
        "animals",
        "food",
        "family",
        "body_parts",
        "weather"
      ];
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
    })
  );

  const httpServer = createServer(app);
  return httpServer;
}
