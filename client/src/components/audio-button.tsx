import { useState } from "react";
import { Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { audioManager } from "@/lib/audio";
import { motion } from "framer-motion";

interface AudioButtonProps {
  word: string;
  variant?: "default" | "large";
  className?: string;
}

export function AudioButton({ word, variant = "default", className = "" }: AudioButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = async () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    try {
      await audioManager.playPronunciation(word);
    } catch (error) {
      console.error("Error playing audio:", error);
    } finally {
      // Reset after a delay to give visual feedback
      setTimeout(() => setIsPlaying(false), 1000);
    }
  };

  if (variant === "large") {
    return (
      <motion.button
        className={`flex items-center space-x-3 bg-coral text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all ${className}`}
        onClick={handlePlay}
        disabled={isPlaying}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isPlaying ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <Volume2 className="w-6 h-6" />
        )}
        <span className="font-fredoka text-xl">{word.toUpperCase()}</span>
        {!isPlaying && <span className="text-lg">▶️</span>}
      </motion.button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handlePlay}
      disabled={isPlaying}
      className={`rounded-full ${className}`}
    >
      {isPlaying ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Volume2 className="w-4 h-4" />
      )}
    </Button>
  );
}
