export interface VocabularyWord {
  id: string;
  spanish: string;
  dutch: string;
  category: string;
  difficulty: 1 | 2 | 3;
  imageUrl: string;
  audioHint?: string;
}

export const SPANISH_VOCABULARY: VocabularyWord[] = [
  // Saludos (Greetings) - 12 words
  { id: 'greet_1', spanish: 'hola', dutch: 'hallo', category: 'saludos', difficulty: 1, imageUrl: '👋' },
  { id: 'greet_2', spanish: 'adiós', dutch: 'dag', category: 'saludos', difficulty: 1, imageUrl: '👋' },
  { id: 'greet_3', spanish: 'buenos días', dutch: 'goedemorgen', category: 'saludos', difficulty: 2, imageUrl: '🌅' },
  { id: 'greet_4', spanish: 'buenas tardes', dutch: 'goedemiddag', category: 'saludos', difficulty: 2, imageUrl: '🌤️' },
  { id: 'greet_5', spanish: 'buenas noches', dutch: 'goedenavond', category: 'saludos', difficulty: 2, imageUrl: '🌙' },
  { id: 'greet_6', spanish: 'gracias', dutch: 'dank je', category: 'saludos', difficulty: 1, imageUrl: '🙏' },
  { id: 'greet_7', spanish: 'por favor', dutch: 'alsjeblieft', category: 'saludos', difficulty: 2, imageUrl: '🤲' },
  { id: 'greet_8', spanish: 'perdón', dutch: 'sorry', category: 'saludos', difficulty: 1, imageUrl: '😅' },
  { id: 'greet_9', spanish: 'disculpe', dutch: 'pardon', category: 'saludos', difficulty: 2, imageUrl: '🙋' },
  { id: 'greet_10', spanish: 'sí', dutch: 'ja', category: 'saludos', difficulty: 1, imageUrl: '✅' },
  { id: 'greet_11', spanish: 'no', dutch: 'nee', category: 'saludos', difficulty: 1, imageUrl: '❌' },
  { id: 'greet_12', spanish: 'hasta luego', dutch: 'tot later', category: 'saludos', difficulty: 2, imageUrl: '👋' },

  // Números (Numbers 1-15) - 15 words
  { id: 'num_1', spanish: 'uno', dutch: 'een', category: 'numeros', difficulty: 1, imageUrl: '1️⃣' },
  { id: 'num_2', spanish: 'dos', dutch: 'twee', category: 'numeros', difficulty: 1, imageUrl: '2️⃣' },
  { id: 'num_3', spanish: 'tres', dutch: 'drie', category: 'numeros', difficulty: 1, imageUrl: '3️⃣' },
  { id: 'num_4', spanish: 'cuatro', dutch: 'vier', category: 'numeros', difficulty: 1, imageUrl: '4️⃣' },
  { id: 'num_5', spanish: 'cinco', dutch: 'vijf', category: 'numeros', difficulty: 1, imageUrl: '5️⃣' },
  { id: 'num_6', spanish: 'seis', dutch: 'zes', category: 'numeros', difficulty: 1, imageUrl: '6️⃣' },
  { id: 'num_7', spanish: 'siete', dutch: 'zeven', category: 'numeros', difficulty: 1, imageUrl: '7️⃣' },
  { id: 'num_8', spanish: 'ocho', dutch: 'acht', category: 'numeros', difficulty: 1, imageUrl: '8️⃣' },
  { id: 'num_9', spanish: 'nueve', dutch: 'negen', category: 'numeros', difficulty: 1, imageUrl: '9️⃣' },
  { id: 'num_10', spanish: 'diez', dutch: 'tien', category: 'numeros', difficulty: 1, imageUrl: '🔟' },
  { id: 'num_11', spanish: 'once', dutch: 'elf', category: 'numeros', difficulty: 2, imageUrl: '1️⃣1️⃣' },
  { id: 'num_12', spanish: 'doce', dutch: 'twaalf', category: 'numeros', difficulty: 2, imageUrl: '1️⃣2️⃣' },
  { id: 'num_13', spanish: 'trece', dutch: 'dertien', category: 'numeros', difficulty: 2, imageUrl: '1️⃣3️⃣' },
  { id: 'num_14', spanish: 'catorce', dutch: 'veertien', category: 'numeros', difficulty: 2, imageUrl: '1️⃣4️⃣' },
  { id: 'num_15', spanish: 'quince', dutch: 'vijftien', category: 'numeros', difficulty: 2, imageUrl: '1️⃣5️⃣' },

  // Animales (Animals) - 15 words
  { id: 'animal_1', spanish: 'gato', dutch: 'kat', category: 'animales', difficulty: 1, imageUrl: '🐱' },
  { id: 'animal_2', spanish: 'perro', dutch: 'hond', category: 'animales', difficulty: 1, imageUrl: '🐶' },
  { id: 'animal_3', spanish: 'pájaro', dutch: 'vogel', category: 'animales', difficulty: 2, imageUrl: '🐦' },
  { id: 'animal_4', spanish: 'pez', dutch: 'vis', category: 'animales', difficulty: 1, imageUrl: '🐟' },
  { id: 'animal_5', spanish: 'caballo', dutch: 'paard', category: 'animales', difficulty: 2, imageUrl: '🐴' },
  { id: 'animal_6', spanish: 'vaca', dutch: 'koe', category: 'animales', difficulty: 1, imageUrl: '🐄' },
  { id: 'animal_7', spanish: 'cerdo', dutch: 'varken', category: 'animales', difficulty: 2, imageUrl: '🐷' },
  { id: 'animal_8', spanish: 'oveja', dutch: 'schaap', category: 'animales', difficulty: 2, imageUrl: '🐑' },
  { id: 'animal_9', spanish: 'conejo', dutch: 'konijn', category: 'animales', difficulty: 2, imageUrl: '🐰' },
  { id: 'animal_10', spanish: 'ratón', dutch: 'muis', category: 'animales', difficulty: 2, imageUrl: '🐭' },
  { id: 'animal_11', spanish: 'león', dutch: 'leeuw', category: 'animales', difficulty: 2, imageUrl: '🦁' },
  { id: 'animal_12', spanish: 'elefante', dutch: 'olifant', category: 'animales', difficulty: 3, imageUrl: '🐘' },
  { id: 'animal_13', spanish: 'mono', dutch: 'aap', category: 'animales', difficulty: 2, imageUrl: '🐒' },
  { id: 'animal_14', spanish: 'oso', dutch: 'beer', category: 'animales', difficulty: 2, imageUrl: '🐻' },
  { id: 'animal_15', spanish: 'mariposa', dutch: 'vlinder', category: 'animales', difficulty: 3, imageUrl: '🦋' },

  // Colores (Colors) - 10 words
  { id: 'color_1', spanish: 'rojo', dutch: 'rood', category: 'colores', difficulty: 1, imageUrl: '🔴' },
  { id: 'color_2', spanish: 'azul', dutch: 'blauw', category: 'colores', difficulty: 1, imageUrl: '🔵' },
  { id: 'color_3', spanish: 'verde', dutch: 'groen', category: 'colores', difficulty: 1, imageUrl: '🟢' },
  { id: 'color_4', spanish: 'amarillo', dutch: 'geel', category: 'colores', difficulty: 1, imageUrl: '🟡' },
  { id: 'color_5', spanish: 'negro', dutch: 'zwart', category: 'colores', difficulty: 1, imageUrl: '⚫' },
  { id: 'color_6', spanish: 'blanco', dutch: 'wit', category: 'colores', difficulty: 1, imageUrl: '⚪' },
  { id: 'color_7', spanish: 'rosa', dutch: 'roze', category: 'colores', difficulty: 1, imageUrl: '🩷' },
  { id: 'color_8', spanish: 'morado', dutch: 'paars', category: 'colores', difficulty: 2, imageUrl: '🟣' },
  { id: 'color_9', spanish: 'naranja', dutch: 'oranje', category: 'colores', difficulty: 2, imageUrl: '🟠' },
  { id: 'color_10', spanish: 'marrón', dutch: 'bruin', category: 'colores', difficulty: 2, imageUrl: '🟤' },

  // Comida (Food) - 12 words
  { id: 'food_1', spanish: 'pan', dutch: 'brood', category: 'comida', difficulty: 1, imageUrl: '🍞' },
  { id: 'food_2', spanish: 'leche', dutch: 'melk', category: 'comida', difficulty: 1, imageUrl: '🥛' },
  { id: 'food_3', spanish: 'agua', dutch: 'water', category: 'comida', difficulty: 1, imageUrl: '💧' },
  { id: 'food_4', spanish: 'manzana', dutch: 'appel', category: 'comida', difficulty: 2, imageUrl: '🍎' },
  { id: 'food_5', spanish: 'plátano', dutch: 'banaan', category: 'comida', difficulty: 2, imageUrl: '🍌' },
  { id: 'food_6', spanish: 'naranja', dutch: 'sinaasappel', category: 'comida', difficulty: 2, imageUrl: '🍊' },
  { id: 'food_7', spanish: 'queso', dutch: 'kaas', category: 'comida', difficulty: 1, imageUrl: '🧀' },
  { id: 'food_8', spanish: 'huevo', dutch: 'ei', category: 'comida', difficulty: 1, imageUrl: '🥚' },
  { id: 'food_9', spanish: 'pollo', dutch: 'kip', category: 'comida', difficulty: 1, imageUrl: '🍗' },
  { id: 'food_10', spanish: 'pescado', dutch: 'vis', category: 'comida', difficulty: 2, imageUrl: '🐟' },
  { id: 'food_11', spanish: 'pizza', dutch: 'pizza', category: 'comida', difficulty: 1, imageUrl: '🍕' },
  { id: 'food_12', spanish: 'chocolate', dutch: 'chocolade', category: 'comida', difficulty: 2, imageUrl: '🍫' }
];

export const VOCABULARY_CATEGORIES = [
  { id: 'saludos', name: 'Saludos', dutch: 'Begroetingen', icon: '👋', color: 'coral' },
  { id: 'numeros', name: 'Números', dutch: 'Getallen', icon: '🔢', color: 'mint' },
  { id: 'animales', name: 'Animales', dutch: 'Dieren', icon: '🐾', color: 'sunny' },
  { id: 'colores', name: 'Colores', dutch: 'Kleuren', icon: '🎨', color: 'success' },
  { id: 'comida', name: 'Comida', dutch: 'Eten', icon: '🍎', color: 'coral' }
];

export function getWordsByCategory(category: string): VocabularyWord[] {
  return SPANISH_VOCABULARY.filter(word => word.category === category);
}

export function getWordsByDifficulty(difficulty: 1 | 2 | 3): VocabularyWord[] {
  return SPANISH_VOCABULARY.filter(word => word.difficulty === difficulty);
}

export function getRandomWords(count: number, excludeIds: string[] = []): VocabularyWord[] {
  const available = SPANISH_VOCABULARY.filter(word => !excludeIds.includes(word.id));
  return available.sort(() => Math.random() - 0.5).slice(0, count);
}

export function getCategoryStats() {
  return VOCABULARY_CATEGORIES.map(category => ({
    ...category,
    total: getWordsByCategory(category.id).length,
    difficulty1: getWordsByCategory(category.id).filter(w => w.difficulty === 1).length,
    difficulty2: getWordsByCategory(category.id).filter(w => w.difficulty === 2).length,
    difficulty3: getWordsByCategory(category.id).filter(w => w.difficulty === 3).length
  }));
}