import { describe, expect, it } from 'vitest';
import { storage } from './storage';

// Wait for asynchronous vocabulary initialization
async function waitForInit() {
  // give initializeVocabulary time to populate map
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe('storage.getCategories', () => {
  it('returns unique vocabulary categories', async () => {
    await waitForInit();
    const categories = await storage.getCategories();
    expect(categories.length).toBeGreaterThan(0);
    const unique = new Set(categories);
    expect(unique.size).toBe(categories.length);
    expect(categories).toContain('greetings');
  });
});
