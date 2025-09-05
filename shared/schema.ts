import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { DEFAULT_USER_ID } from "../client/src/lib/constants";

export const vocabularyWords = pgTable("vocabulary_words", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  spanish: text("spanish").notNull(),
  dutch: text("dutch").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  audioUrl: text("audio_url"),
  difficulty: integer("difficulty").notNull().default(1),
});

export const userProgress = pgTable("user_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().default(DEFAULT_USER_ID),
  wordId: varchar("word_id").notNull(),
  timesCorrect: integer("times_correct").notNull().default(0),
  timesIncorrect: integer("times_incorrect").notNull().default(0),
  lastSeen: text("last_seen"),
  mastered: boolean("mastered").notNull().default(false),
});

export const gameSession = pgTable("game_session", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().default(DEFAULT_USER_ID),
  gameType: text("game_type").notNull(),
  score: integer("score").notNull().default(0),
  totalQuestions: integer("total_questions").notNull().default(0),
  correctAnswers: integer("correct_answers").notNull().default(0),
  completedAt: text("completed_at"),
  duration: integer("duration").notNull().default(0),
});

export const spacedRepetitionItems = pgTable("spaced_repetition_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().default(DEFAULT_USER_ID),
  wordId: varchar("word_id").notNull(),
  level: integer("level").notNull().default(0), // 0-6 spaced repetition level
  nextDue: text("next_due").notNull(),
  lastSeen: text("last_seen").notNull(),
  correctStreak: integer("correct_streak").notNull().default(0),
  incorrectCount: integer("incorrect_count").notNull().default(0),
  totalAttempts: integer("total_attempts").notNull().default(0),
});

export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().default(DEFAULT_USER_ID),
  achievementType: text("achievement_type").notNull(),
  category: text("category"),
  unlockedAt: text("unlocked_at").notNull(),
  metadata: jsonb("metadata").default('{}'),
});

export const userStats = pgTable("user_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().default(DEFAULT_USER_ID),
  totalStars: integer("total_stars").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  wordsLearned: integer("words_learned").notNull().default(0),
  masteredWords: integer("mastered_words").notNull().default(0),
  averageAccuracy: integer("average_accuracy").notNull().default(0),
  achievements: jsonb("achievements").default('[]'),
  lastPlayDate: text("last_play_date"),
});

export const insertVocabularyWordSchema = createInsertSchema(vocabularyWords).omit({
  id: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
});

export const insertGameSessionSchema = createInsertSchema(gameSession).omit({
  id: true,
});

export const insertSpacedRepetitionItemSchema = createInsertSchema(spacedRepetitionItems).omit({
  id: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
});

export const insertUserStatsSchema = createInsertSchema(userStats).omit({
  id: true,
});

export type VocabularyWord = typeof vocabularyWords.$inferSelect;
export type InsertVocabularyWord = z.infer<typeof insertVocabularyWordSchema>;
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type GameSession = typeof gameSession.$inferSelect;
export type InsertGameSession = z.infer<typeof insertGameSessionSchema>;
export type SpacedRepetitionItem = typeof spacedRepetitionItems.$inferSelect;
export type InsertSpacedRepetitionItem = z.infer<typeof insertSpacedRepetitionItemSchema>;
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type UserStats = typeof userStats.$inferSelect;
export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;
