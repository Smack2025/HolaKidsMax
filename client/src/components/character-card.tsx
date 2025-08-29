import { motion } from "framer-motion";
import type { Character } from "@/lib/characters";

interface CharacterCardProps {
  character: Character;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

export function CharacterCard({ character, size = "md", onClick }: CharacterCardProps) {
  const sizeClasses = {
    sm: "w-16 h-20 p-2",
    md: "w-24 h-28 p-4", 
    lg: "w-32 h-36 p-6"
  };

  const iconSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl"
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-xs",
    lg: "text-sm"
  };

  return (
    <motion.div
      className={`character-card bg-white rounded-2xl ${sizeClasses[size]} flex flex-col items-center justify-center shadow-lg cursor-pointer`}
      whileHover={{ y: -5, scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <motion.div
        className={`w-12 h-12 bg-gradient-to-r ${character.color} rounded-full flex items-center justify-center mb-2 ${character.animation}`}
      >
        <span className={`${iconSizes[size]}`}>{character.icon}</span>
      </motion.div>
      <span className={`font-comic ${textSizes[size]} text-friendly-dark font-bold text-center leading-tight`}>
        {character.name}
      </span>
    </motion.div>
  );
}
