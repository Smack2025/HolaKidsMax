export interface Character {
  id: string;
  name: string;
  spanishName: string;
  icon: string;
  color: string;
  personality: string;
  catchphrase: string;
  animation: string;
}

export const CHARACTERS: Character[] = [
  {
    id: "gato-loco",
    name: "Gato Loco",
    spanishName: "El Gato Salvaje",
    icon: "🐱",
    color: "from-coral to-sunny",
    personality: "Wild and energetic, loves to jump around and make funny faces!",
    catchphrase: "¡Miau-ravilloso!",
    animation: "animate-bounce-gentle"
  },
  {
    id: "robo-rico",
    name: "Robo Rico",
    spanishName: "Robot Genial",
    icon: "🤖",
    color: "from-mint to-coral",
    personality: "Super smart robot who beeps and boops while teaching Spanish!",
    catchphrase: "¡Beep-boop-perfecto!",
    animation: "animate-pulse-slow"
  },
  {
    id: "dragon-divertido",
    name: "Dragón Divertido",
    spanishName: "Dragón Alegre",
    icon: "🐉",
    color: "from-sunny to-mint",
    personality: "Friendly dragon who breathes colorful sparkles instead of fire!",
    catchphrase: "¡Fuego-fantástico!",
    animation: "animate-wiggle"
  }
];

export const getRandomCharacter = (): Character => {
  return CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
};

export const getCharacterById = (id: string): Character | undefined => {
  return CHARACTERS.find(char => char.id === id);
};
