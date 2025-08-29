import { addDays, isAfter, format } from 'date-fns';

export interface SpacedItem {
  id: string;
  wordId: string;
  level: number; // 0-6 (0 = new, 6 = mastered)
  nextDue: Date;
  lastSeen: Date;
  correctStreak: number;
  incorrectCount: number;
  totalAttempts: number;
}

export interface ReviewStats {
  accuracy: number;
  recentAccuracy: number; // last 5 attempts
  totalReviews: number;
  masteredCount: number;
}

export class SpacedRepetition {
  private static readonly INTERVALS = [1, 3, 7, 14, 30, 90, 180]; // days

  static createItem(wordId: string): SpacedItem {
    return {
      id: `spaced_${wordId}`,
      wordId,
      level: 0,
      nextDue: new Date(),
      lastSeen: new Date(),
      correctStreak: 0,
      incorrectCount: 0,
      totalAttempts: 0
    };
  }

  static updateItem(item: SpacedItem, correct: boolean): SpacedItem {
    const now = new Date();
    
    const updated = {
      ...item,
      lastSeen: now,
      totalAttempts: item.totalAttempts + 1
    };

    if (correct) {
      updated.correctStreak = item.correctStreak + 1;
      
      // Advance level if streak is good
      if (updated.correctStreak >= 2 && item.level < this.INTERVALS.length - 1) {
        updated.level = Math.min(item.level + 1, this.INTERVALS.length - 1);
      }
      
      // Set next review date
      const intervalDays = this.INTERVALS[updated.level];
      updated.nextDue = addDays(now, intervalDays);
      
    } else {
      updated.correctStreak = 0;
      updated.incorrectCount = item.incorrectCount + 1;
      
      // Reduce level on mistakes
      if (updated.incorrectCount % 2 === 0 && item.level > 0) {
        updated.level = Math.max(item.level - 1, 0);
      }
      
      // Review again tomorrow or sooner
      updated.nextDue = addDays(now, Math.max(1, Math.floor(this.INTERVALS[updated.level] / 3)));
    }

    return updated;
  }

  static nextDue(items: SpacedItem[], maxItems: number = 10): SpacedItem[] {
    const now = new Date();
    
    return items
      .filter(item => isAfter(now, item.nextDue) || item.level === 0)
      .sort((a, b) => {
        // Prioritize by due date, then by level (new items first)
        if (a.nextDue.getTime() !== b.nextDue.getTime()) {
          return a.nextDue.getTime() - b.nextDue.getTime();
        }
        return a.level - b.level;
      })
      .slice(0, maxItems);
  }

  static getStats(items: SpacedItem[], recentAttempts: boolean[] = []): ReviewStats {
    const totalReviews = items.reduce((sum, item) => sum + item.totalAttempts, 0);
    const totalCorrect = items.reduce((sum, item) => {
      const correctAttempts = item.totalAttempts - item.incorrectCount;
      return sum + correctAttempts;
    }, 0);

    const accuracy = totalReviews > 0 ? (totalCorrect / totalReviews) * 100 : 0;
    const recentAccuracy = recentAttempts.length > 0 
      ? (recentAttempts.filter(Boolean).length / recentAttempts.length) * 100 
      : accuracy;

    const masteredCount = items.filter(item => item.level >= 5).length;

    return {
      accuracy,
      recentAccuracy,
      totalReviews,
      masteredCount
    };
  }

  static shouldReduceDifficulty(recentAttempts: boolean[]): boolean {
    if (recentAttempts.length < 5) return false;
    
    const recentCorrect = recentAttempts.slice(-5).filter(Boolean).length;
    return (recentCorrect / 5) < 0.7; // Less than 70% accuracy
  }

  static formatNextReview(nextDue: Date): string {
    const now = new Date();
    if (isAfter(now, nextDue)) {
      return 'Ready now';
    }
    return `Due ${format(nextDue, 'MMM d')}`;
  }
}