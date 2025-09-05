import { 
  type VocabularyWord, 
  type InsertVocabularyWord,
  type UserProgress,
  type InsertUserProgress,
  type GameSession,
  type InsertGameSession,
  type UserStats,
  type InsertUserStats
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Vocabulary methods
  getVocabularyWords(): Promise<VocabularyWord[]>;
  getVocabularyWordsByCategory(category: string): Promise<VocabularyWord[]>;
  getVocabularyWord(id: string): Promise<VocabularyWord | undefined>;
  createVocabularyWord(word: InsertVocabularyWord): Promise<VocabularyWord>;
  
  // User progress methods
  getUserProgress(userId: string): Promise<UserProgress[]>;
  getUserProgressForWord(userId: string, wordId: string): Promise<UserProgress | undefined>;
  updateUserProgress(userId: string, wordId: string, correct: boolean): Promise<UserProgress>;
  
  // Game session methods
  createGameSession(session: InsertGameSession): Promise<GameSession>;
  getGameSessions(userId: string): Promise<GameSession[]>;
  updateGameSession(id: string, updates: Partial<GameSession>): Promise<GameSession>;
  
  // User stats methods
  getUserStats(userId: string): Promise<UserStats>;
  updateUserStats(userId: string, updates: Partial<UserStats>): Promise<UserStats>;
}

export class MemStorage implements IStorage {
  private vocabularyWords: Map<string, VocabularyWord>;
  private userProgress: Map<string, UserProgress>;
  private gameSessions: Map<string, GameSession>;
  private userStats: Map<string, UserStats>;

  constructor() {
    this.vocabularyWords = new Map();
    this.userProgress = new Map();
    this.gameSessions = new Map();
    this.userStats = new Map();
    
    // Initialize with sample vocabulary
    this.initializeVocabulary();
  }

  private async initializeVocabulary() {
    try {
      // Load vocabulary from JSON file
      const fs = await import('fs');
      const path = await import('path');
      const vocabPath = path.resolve(__dirname, '../client/src/data/spanish_vocab.json');
      const vocabData = JSON.parse(fs.readFileSync(vocabPath, 'utf8'));
      
      // Process each theme and its vocabulary items
      for (const theme of vocabData.themes) {
        for (const item of theme.items) {
          const word: InsertVocabularyWord = {
            spanish: item.es,
            dutch: item.nl,
            category: theme.id,
            imageUrl: item.img,
            audioUrl: item.audio,
            difficulty: this.getDifficultyLevel(item.es, item.type)
          };
          
          await this.createVocabularyWord(word);
        }
      }
    } catch (error) {
      console.error('Failed to load vocabulary data, using fallback:', error);
      // Fallback to basic vocabulary if file loading fails
      this.loadFallbackVocabulary();
    }
  }

  private getDifficultyLevel(spanish: string, type: string): number {
    if (type === 'phrase') return 3;
    if (spanish.length <= 4) return 1;
    if (spanish.length <= 7) return 2;
    return 3;
  }

  private async loadFallbackVocabulary() {
    const fallbackWords: InsertVocabularyWord[] = [
      { spanish: "hola", dutch: "hallo", category: "greetings", imageUrl: "👋", difficulty: 1 },
      { spanish: "adiós", dutch: "doei", category: "greetings", imageUrl: "👋", difficulty: 1 },
      { spanish: "perro", dutch: "hond", category: "animals", imageUrl: "🐕", difficulty: 1 },
      { spanish: "gato", dutch: "kat", category: "animals", imageUrl: "🐱", difficulty: 1 },
      { spanish: "rojo", dutch: "rood", category: "colors", imageUrl: "🔴", difficulty: 1 },
      { spanish: "azul", dutch: "blauw", category: "colors", imageUrl: "🔵", difficulty: 1 },
    ];

    for (const word of fallbackWords) {
      await this.createVocabularyWord(word);
    }
  }

  async getVocabularyWords(): Promise<VocabularyWord[]> {
    return Array.from(this.vocabularyWords.values());
  }

  async getVocabularyWordsByCategory(category: string): Promise<VocabularyWord[]> {
    return Array.from(this.vocabularyWords.values()).filter(word => word.category === category);
  }

  async getVocabularyWord(id: string): Promise<VocabularyWord | undefined> {
    return this.vocabularyWords.get(id);
  }

  async createVocabularyWord(insertWord: InsertVocabularyWord): Promise<VocabularyWord> {
    const id = randomUUID();
    const word: VocabularyWord = { 
      ...insertWord, 
      id,
      imageUrl: insertWord.imageUrl || null,
      audioUrl: insertWord.audioUrl || null,
      difficulty: insertWord.difficulty || 1
    };
    this.vocabularyWords.set(id, word);
    return word;
  }

  async getUserProgress(userId: string): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values()).filter(progress => progress.userId === userId);
  }

  async getUserProgressForWord(userId: string, wordId: string): Promise<UserProgress | undefined> {
    return Array.from(this.userProgress.values()).find(
      progress => progress.userId === userId && progress.wordId === wordId
    );
  }

  async updateUserProgress(userId: string, wordId: string, correct: boolean): Promise<UserProgress> {
    const existing = await this.getUserProgressForWord(userId, wordId);
    
    let progress: UserProgress;
    if (existing) {
      progress = {
        ...existing,
        timesCorrect: existing.timesCorrect + (correct ? 1 : 0),
        timesIncorrect: existing.timesIncorrect + (correct ? 0 : 1),
        lastSeen: new Date().toISOString(),
        mastered: existing.timesCorrect + (correct ? 1 : 0) >= 3
      };
      this.userProgress.set(existing.id, progress);
    } else {
      const id = randomUUID();
      progress = {
        id,
        userId,
        wordId,
        timesCorrect: correct ? 1 : 0,
        timesIncorrect: correct ? 0 : 1,
        lastSeen: new Date().toISOString(),
        mastered: false
      };
      this.userProgress.set(id, progress);
    }
    
    return progress;
  }

  async createGameSession(insertSession: InsertGameSession): Promise<GameSession> {
    const id = randomUUID();
    const session: GameSession = { 
      ...insertSession, 
      id,
      duration: insertSession.duration || 0,
      userId: insertSession.userId || "default_user",
      score: insertSession.score || 0,
      totalQuestions: insertSession.totalQuestions || 0,
      correctAnswers: insertSession.correctAnswers || 0,
      completedAt: insertSession.completedAt || null
    };
    this.gameSessions.set(id, session);
    return session;
  }

  async getGameSessions(userId: string): Promise<GameSession[]> {
    return Array.from(this.gameSessions.values()).filter(session => session.userId === userId);
  }

  async updateGameSession(id: string, updates: Partial<GameSession>): Promise<GameSession> {
    const existing = this.gameSessions.get(id);
    if (!existing) {
      throw new Error("Game session not found");
    }
    
    const updated = { ...existing, ...updates };
    this.gameSessions.set(id, updated);
    return updated;
  }

  async getUserStats(userId: string): Promise<UserStats> {
    const existing = Array.from(this.userStats.values()).find(stats => stats.userId === userId);
    
    if (existing) {
      return existing;
    }
    
    // Create default stats for new user
    const id = randomUUID();
    const defaultStats: UserStats = {
      id,
      userId,
      totalStars: 0,
      currentStreak: 0,
      longestStreak: 0,
      wordsLearned: 0,
      achievements: [],
      lastPlayDate: new Date().toISOString()
    };
    
    this.userStats.set(id, defaultStats);
    return defaultStats;
  }

  async updateUserStats(userId: string, updates: Partial<UserStats>): Promise<UserStats> {
    const existing = await this.getUserStats(userId);
    const updated = { ...existing, ...updates };
    this.userStats.set(existing.id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
