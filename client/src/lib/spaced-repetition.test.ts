import { describe, test, expect, beforeEach } from 'vitest';
import { SpacedRepetition, SpacedItem } from './spaced-repetition';
import { addDays, subDays } from 'date-fns';

describe('SpacedRepetition', () => {
  let testItem: SpacedItem;

  beforeEach(() => {
    testItem = SpacedRepetition.createItem('test_word_1');
  });

  describe('createItem', () => {
    test('creates a new item with correct defaults', () => {
      const item = SpacedRepetition.createItem('word_123');
      
      expect(item.id).toBe('spaced_word_123');
      expect(item.wordId).toBe('word_123');
      expect(item.level).toBe(0);
      expect(item.correctStreak).toBe(0);
      expect(item.incorrectCount).toBe(0);
      expect(item.totalAttempts).toBe(0);
      expect(item.nextDue).toBeInstanceOf(Date);
      expect(item.lastSeen).toBeInstanceOf(Date);
    });
  });

  describe('updateItem', () => {
    test('advances level on correct answers with good streak', () => {
      // First correct answer
      let updated = SpacedRepetition.updateItem(testItem, true);
      expect(updated.correctStreak).toBe(1);
      expect(updated.level).toBe(0); // Still level 0, need 2 correct
      expect(updated.totalAttempts).toBe(1);

      // Second correct answer - should advance level
      updated = SpacedRepetition.updateItem(updated, true);
      expect(updated.correctStreak).toBe(2);
      expect(updated.level).toBe(1);
      expect(updated.totalAttempts).toBe(2);
    });

    test('sets next due date based on level', () => {
      const now = new Date();
      testItem.level = 3; // 14 day interval
      
      const updated = SpacedRepetition.updateItem(testItem, true);
      const expectedDue = addDays(now, 14);
      
      // Allow for small time differences in test execution
      const timeDiff = Math.abs(updated.nextDue.getTime() - expectedDue.getTime());
      expect(timeDiff).toBeLessThan(1000); // Less than 1 second difference
    });

    test('reduces level and resets streak on incorrect answers', () => {
      testItem.level = 3;
      testItem.correctStreak = 5;
      testItem.incorrectCount = 1; // This will be 2 after update, triggering level reduction
      
      const updated = SpacedRepetition.updateItem(testItem, false);
      
      expect(updated.correctStreak).toBe(0);
      expect(updated.incorrectCount).toBe(2);
      expect(updated.level).toBe(2); // Reduced from 3 to 2
      expect(updated.totalAttempts).toBe(1);
    });

    test('does not reduce level below 0', () => {
      testItem.level = 0;
      testItem.incorrectCount = 1;
      
      const updated = SpacedRepetition.updateItem(testItem, false);
      
      expect(updated.level).toBe(0);
    });

    test('does not advance level beyond maximum', () => {
      testItem.level = 6; // Maximum level
      testItem.correctStreak = 10;
      
      const updated = SpacedRepetition.updateItem(testItem, true);
      
      expect(updated.level).toBe(6);
    });
  });

  describe('nextDue', () => {
    test('returns items that are due for review', () => {
      const yesterday = subDays(new Date(), 1);
      const tomorrow = addDays(new Date(), 1);
      
      const items: SpacedItem[] = [
        { ...testItem, id: 'item1', nextDue: yesterday }, // Due
        { ...testItem, id: 'item2', nextDue: tomorrow }, // Not due
        { ...testItem, id: 'item3', nextDue: yesterday, level: 0 }, // New item, due
      ];
      
      const dueItems = SpacedRepetition.nextDue(items);
      
      expect(dueItems).toHaveLength(2);
      expect(dueItems.map(item => item.id)).toContain('item1');
      expect(dueItems.map(item => item.id)).toContain('item3');
    });

    test('prioritizes by due date and level', () => {
      const yesterday = subDays(new Date(), 1);
      const twoDaysAgo = subDays(new Date(), 2);
      
      const items: SpacedItem[] = [
        { ...testItem, id: 'newer', nextDue: yesterday, level: 2 },
        { ...testItem, id: 'older', nextDue: twoDaysAgo, level: 2 },
        { ...testItem, id: 'new_item', nextDue: yesterday, level: 0 },
      ];
      
      const dueItems = SpacedRepetition.nextDue(items);
      
      // Should be sorted: older (earlier due date), newer, new_item (higher level)
      expect(dueItems[0].id).toBe('older');
      expect(dueItems[1].id).toBe('newer');
      expect(dueItems[2].id).toBe('new_item');
    });

    test('respects maxItems limit', () => {
      const yesterday = subDays(new Date(), 1);
      const items: SpacedItem[] = Array.from({ length: 10 }, (_, i) => ({
        ...testItem,
        id: `item${i}`,
        nextDue: yesterday,
      }));
      
      const dueItems = SpacedRepetition.nextDue(items, 3);
      
      expect(dueItems).toHaveLength(3);
    });

    test('includes new items (level 0) even if not technically due', () => {
      const tomorrow = addDays(new Date(), 1);
      const newItem = { ...testItem, level: 0, nextDue: tomorrow };
      
      const dueItems = SpacedRepetition.nextDue([newItem]);
      
      expect(dueItems).toHaveLength(1);
      expect(dueItems[0].level).toBe(0);
    });
  });

  describe('getStats', () => {
    test('calculates correct statistics', () => {
      const items: SpacedItem[] = [
        { ...testItem, totalAttempts: 10, incorrectCount: 2 }, // 80% accuracy
        { ...testItem, totalAttempts: 5, incorrectCount: 1 }, // 80% accuracy
        { ...testItem, totalAttempts: 0, incorrectCount: 0, level: 5 }, // Mastered
      ];
      
      const recentAttempts = [true, true, false, true, true]; // 80% recent accuracy
      
      const stats = SpacedRepetition.getStats(items, recentAttempts);
      
      expect(stats.totalReviews).toBe(15);
      expect(stats.accuracy).toBe(80); // (12 correct out of 15 total)
      expect(stats.recentAccuracy).toBe(80); // 4 out of 5 recent attempts
      expect(stats.masteredCount).toBe(1); // One item at level 5+
    });

    test('handles empty arrays gracefully', () => {
      const stats = SpacedRepetition.getStats([], []);
      
      expect(stats.totalReviews).toBe(0);
      expect(stats.accuracy).toBe(0);
      expect(stats.recentAccuracy).toBe(0);
      expect(stats.masteredCount).toBe(0);
    });

    test('uses overall accuracy when no recent attempts provided', () => {
      const items: SpacedItem[] = [
        { ...testItem, totalAttempts: 10, incorrectCount: 3 }, // 70% accuracy
      ];
      
      const stats = SpacedRepetition.getStats(items);
      
      expect(stats.accuracy).toBe(70);
      expect(stats.recentAccuracy).toBe(70); // Should match overall accuracy
    });
  });

  describe('shouldReduceDifficulty', () => {
    test('returns true when recent accuracy is below 70%', () => {
      const attempts = [true, false, false, false, true]; // 40% accuracy
      
      expect(SpacedRepetition.shouldReduceDifficulty(attempts)).toBe(true);
    });

    test('returns false when recent accuracy is 70% or above', () => {
      const attempts = [true, true, false, true, true]; // 80% accuracy
      
      expect(SpacedRepetition.shouldReduceDifficulty(attempts)).toBe(false);
    });

    test('returns false when fewer than 5 attempts', () => {
      const attempts = [false, false]; // 0% accuracy but only 2 attempts
      
      expect(SpacedRepetition.shouldReduceDifficulty(attempts)).toBe(false);
    });

    test('only considers last 5 attempts', () => {
      // First 5 are all wrong, last 5 are mostly right
      const attempts = [false, false, false, false, false, true, true, true, true, false]; // Last 5: 80%
      
      expect(SpacedRepetition.shouldReduceDifficulty(attempts)).toBe(false);
    });
  });

  describe('formatNextReview', () => {
    test('returns "Ready now" for past dates', () => {
      const yesterday = subDays(new Date(), 1);
      
      expect(SpacedRepetition.formatNextReview(yesterday)).toBe('Ready now');
    });

    test('formats future dates correctly', () => {
      const nextWeek = addDays(new Date(), 7);
      const formatted = SpacedRepetition.formatNextReview(nextWeek);
      
      expect(formatted).toMatch(/^Due \w{3} \d{1,2}$/); // Format: "Due Jan 15"
    });
  });
});