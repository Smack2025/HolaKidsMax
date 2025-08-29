export const VOCABULARY_CATEGORIES = [
  { id: "greetings", name: "Begroetingen", emoji: "👋", color: "coral" },
  { id: "numbers_1_10", name: "Getallen 1-10", emoji: "🔢", color: "sunny" },
  { id: "colors", name: "Kleuren", emoji: "🌈", color: "mint" },
  { id: "animals", name: "Dieren", emoji: "🐕", color: "success" },
  { id: "food", name: "Eten", emoji: "🍎", color: "coral" },
  { id: "family", name: "Familie", emoji: "👨‍👩‍👧‍👦", color: "mint" },
  { id: "body_parts", name: "Lichaamsdelen", emoji: "👤", color: "sunny" },
  { id: "weather", name: "Weer", emoji: "☀️", color: "success" },
] as const;

export type CategoryColor = "coral" | "mint" | "sunny" | "success";

export const getCategoryColor = (category: string): CategoryColor => {
  const cat = VOCABULARY_CATEGORIES.find(c => c.id === category);
  return cat?.color || "coral";
};

export const getCategoryName = (category: string): string => {
  const cat = VOCABULARY_CATEGORIES.find(c => c.id === category);
  return cat?.name || category;
};

export const getCategoryEmoji = (category: string): string => {
  const cat = VOCABULARY_CATEGORIES.find(c => c.id === category);
  return cat?.emoji || "📚";
};
