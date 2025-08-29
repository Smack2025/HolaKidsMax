// Content types
export interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
}

// Sample content
export const lessons: Lesson[] = [
  {
    id: 'basics-1',
    title: 'Basic Greetings',
    description: 'Learn how to say hello and introduce yourself',
    content: 'Content for basic greetings lesson',
    difficulty: 'beginner'
  },
  {
    id: 'numbers-1',
    title: 'Numbers 1-10',
    description: 'Learn to count in Spanish',
    content: 'Content for numbers lesson',
    difficulty: 'beginner'
  }
];

export const flashcards: Flashcard[] = [
  {
    id: '1',
    front: '¡Hola!',
    back: 'Hello!',
    category: 'greetings'
  },
  {
    id: '2',
    front: '¡Buenos días!',
    back: 'Good morning!',
    category: 'greetings'
  },
  {
    id: '3',
    front: 'Uno',
    back: 'One',
    category: 'numbers'
  }
];

// Helper functions
export function getLessonById(id: string): Lesson | undefined {
  return lessons.find(lesson => lesson.id === id);
}

export function getFlashcardsByCategory(category: string): Flashcard[] {
  return flashcards.filter(card => card.category === category);
}

export function getAllCategories(): string[] {
  return Array.from(new Set(flashcards.map(card => card.category)));
}
