import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Star, Trophy } from "lucide-react";
import { GameLayout } from "@/components/game-layout";
import { CharacterCard } from "@/components/character-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getRandomCharacter } from "@/lib/characters";
import { audioManager } from "@/lib/audio";
import { apiRequest } from "@/lib/queryClient";
import { useTranslation } from "@/lib/i18n";
import type { VocabularyWord } from "@shared/schema";

const DEFAULT_USER_ID = "default_user";

interface MemoryCard {
  id: string;
  content: string;
  type: "spanish" | "image";
  wordId: string;
  matched: boolean;
  flipped: boolean;
}

export default function MemoryGame() {
  const { t } = useTranslation();
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [matches, setMatches] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [character] = useState(getRandomCharacter());
  const queryClient = useQueryClient();

  const { data: allWords = [], isLoading } = useQuery<VocabularyWord[]>({
    queryKey: ["/api/vocabulary"],
  });

  const updateProgressMutation = useMutation({
    mutationFn: async (data: { userId: string; wordId: string; correct: boolean }) => {
      return apiRequest("POST", "/api/progress", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stats", DEFAULT_USER_ID] });
    },
  });

  // Initialize game with 6 random words
  useEffect(() => {
    if (allWords.length > 0) {
      initializeGame();
    }
  }, [allWords]);

  const initializeGame = () => {
    const gameWords = allWords
      .sort(() => Math.random() - 0.5)
      .slice(0, 6);

    const gameCards: MemoryCard[] = [];
    
    gameWords.forEach((word) => {
      // Spanish word card
      gameCards.push({
        id: `spanish-${word.id}`,
        content: word.spanish,
        type: "spanish",
        wordId: word.id,
        matched: false,
        flipped: false
      });
      
      // Image card
      gameCards.push({
        id: `image-${word.id}`,
        content: word.imageUrl || "❓",
        type: "image", 
        wordId: word.id,
        matched: false,
        flipped: false
      });
    });

    setCards(gameCards.sort(() => Math.random() - 0.5));
    setFlippedCards([]);
    setMatches(0);
    setAttempts(0);
    setGameCompleted(false);
  };

  const handleCardClick = (cardId: string) => {
    if (flippedCards.length >= 2) return;
    if (flippedCards.includes(cardId)) return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.matched) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    // Update card to show flipped state
    setCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, flipped: true } : c
    ));

    if (newFlippedCards.length === 2) {
      setAttempts(attempts + 1);
      
      const [firstCardId, secondCardId] = newFlippedCards;
      const firstCard = cards.find(c => c.id === firstCardId);
      const secondCard = cards.find(c => c.id === secondCardId);

      if (firstCard && secondCard && firstCard.wordId === secondCard.wordId) {
        // Match found!
        audioManager.playSuccessSound();
        
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.wordId === firstCard.wordId 
              ? { ...c, matched: true, flipped: true }
              : c
          ));
          setMatches(matches + 1);
          setFlippedCards([]);

          // Update progress for matched word
          updateProgressMutation.mutate({
            userId: DEFAULT_USER_ID,
            wordId: firstCard.wordId,
            correct: true
          });

          // Check if game is completed
          if (matches + 1 === 6) {
            setGameCompleted(true);
          }
        }, 1000);
      } else {
        // No match
        audioManager.playErrorSound();
        
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            newFlippedCards.includes(c.id) 
              ? { ...c, flipped: false }
              : c
          ));
          setFlippedCards([]);
        }, 1500);
      }
    }
  };

  const resetGame = () => {
    initializeGame();
  };

  if (isLoading) {
    return (
      <GameLayout title="Loading Memory Game..." color="mint">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-mint border-t-transparent rounded-full"></div>
        </div>
      </GameLayout>
    );
  }

  return (
    <GameLayout
      title="Memory Game"
      subtitle="Match Spanish words with their pictures!"
      color="mint"
    >
      <div className="max-w-4xl mx-auto">
        {/* Character Encouragement */}
        <motion.div 
          className="flex items-center justify-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-white rounded-2xl p-4 shadow-lg border-2 border-mint/20 flex items-center space-x-4">
            <CharacterCard character={character} size="sm" />
            <div className="font-comic text-friendly-dark">
              <p className="text-sm">{character.catchphrase}</p>
              <p className="text-xs text-gray-600">
                Find all the matching pairs! Matches: {matches}/6 | Attempts: {attempts}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Game Board */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {cards.map((card) => (
            <motion.div
              key={card.id}
              whileHover={{ scale: card.matched ? 1 : 1.05 }}
              whileTap={{ scale: card.matched ? 1 : 0.95 }}
            >
              <Card 
                className={`aspect-square cursor-pointer transition-all ${
                  card.matched 
                    ? "bg-success/20 border-success border-2" 
                    : "hover:shadow-lg"
                } ${
                  flippedCards.includes(card.id) || card.matched
                    ? ""
                    : "bg-gradient-to-br from-mint/30 to-sunny/30"
                }`}
                onClick={() => handleCardClick(card.id)}
              >
                <CardContent className="p-4 flex items-center justify-center h-full">
                  <AnimatePresence mode="wait">
                    {(card.flipped || card.matched) ? (
                      <motion.div
                        key="front"
                        initial={{ rotateY: 90, opacity: 0 }}
                        animate={{ rotateY: 0, opacity: 1 }}
                        exit={{ rotateY: 90, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-center"
                      >
                        {card.type === "image" ? (
                          <div className="text-6xl">{card.content}</div>
                        ) : (
                          <div className="font-fredoka text-xl text-coral">
                            {card.content.toUpperCase()}
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="back"
                        initial={{ rotateY: 0, opacity: 1 }}
                        animate={{ rotateY: 0, opacity: 1 }}
                        exit={{ rotateY: 90, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-center"
                      >
                        <div className="w-16 h-16 bg-gradient-to-br from-mint to-coral rounded-full flex items-center justify-center">
                          <span className="text-white text-2xl">?</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Game Stats */}
        <div className="flex justify-center items-center space-x-8 mb-6">
          <div className="flex items-center space-x-2">
            <Star className="text-sunny w-5 h-5" />
            <span className="font-nunito font-bold">Matches: {matches}/6</span>
          </div>
          <div className="flex items-center space-x-2">
            <Trophy className="text-coral w-5 h-5" />
            <span className="font-nunito font-bold">Attempts: {attempts}</span>
          </div>
        </div>

        {/* Reset Button */}
        <div className="flex justify-center mb-6">
          <Button
            onClick={resetGame}
            variant="outline"
            className="rounded-2xl px-6 py-3 flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>New Game</span>
          </Button>
        </div>

        {/* Game Completed Modal */}
        <AnimatePresence>
          {gameCompleted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white rounded-3xl p-8 text-center max-w-md mx-4"
              >
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="font-fredoka text-3xl text-friendly-dark mb-4">
                  ¡Fantástico!
                </h3>
                <p className="font-nunito text-lg text-gray-600 mb-6">
                  You found all {matches} pairs in {attempts} attempts!
                </p>
                <div className="space-y-3">
                  <Button
                    onClick={resetGame}
                    className="bg-mint text-white font-bold py-3 px-8 rounded-2xl w-full"
                  >
                    Play Again
                  </Button>
                  <Button
                    onClick={() => setGameCompleted(false)}
                    variant="outline"
                    className="rounded-2xl py-3 px-8 w-full"
                  >
                    Close
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameLayout>
  );
}
