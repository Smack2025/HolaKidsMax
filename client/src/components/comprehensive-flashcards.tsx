import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { AudioButton } from "@/components/audio-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/progress-bar";
import { Badge } from "@/components/ui/badge";
import { DifficultyTuner, DifficultySettings } from "@/lib/difficulty-tuner";
import { SpacedRepetition, SpacedItem } from "@/lib/spaced-repetition";
import { audioManager } from "@/lib/audio";
import { apiRequest } from "@/lib/queryClient";
import { SPANISH_VOCABULARY, getRandomWords } from "@/data/spanish-vocabulary";
import type { VocabularyWord } from "@/data/spanish-vocabulary";
import { DEFAULT_USER_ID } from "../lib/constants";

interface FlashcardSessionProps {
  category?: string;
  maxCards?: number;
}

export function ComprehensiveFlashcards({ category, maxCards = 10 }: FlashcardSessionProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionWords, setSessionWords] = useState<VocabularyWord[]>([]);
  const [spacedItems, setSpacedItems] = useState<SpacedItem[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<boolean[]>([]);
  const [difficultySettings, setDifficultySettings] = useState<DifficultySettings>(
    DifficultyTuner.getInitialSettings()
  );
  const [showDutchHint, setShowDutchHint] = useState(false);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const queryClient = useQueryClient();

  const updateProgressMutation = useMutation({
    mutationFn: async (data: { userId: string; wordId: string; correct: boolean }) => {
      return apiRequest("POST", "/api/progress", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stats", DEFAULT_USER_ID] });
    },
  });

  // Initialize session with spaced repetition logic
  useEffect(() => {
    initializeSession();
  }, [category]);

  // Load spaced repetition items from storage
  useEffect(() => {
    const savedItems = localStorage.getItem('spaced_items');
    if (savedItems) {
      try {
        const items = JSON.parse(savedItems);
        const spacedItemObjects = items.map((item: any) => ({
          ...item,
          nextDue: new Date(item.nextDue),
          lastSeen: new Date(item.lastSeen)
        }));
        setSpacedItems(spacedItemObjects);
      } catch (error) {
        console.warn('Failed to load spaced items:', error);
      }
    }
  }, []);

  // Update difficulty based on performance
  useEffect(() => {
    if (recentAttempts.length >= 5) {
      const newSettings = DifficultyTuner.adjustDifficulty(difficultySettings, recentAttempts);
      if (JSON.stringify(newSettings) !== JSON.stringify(difficultySettings)) {
        setDifficultySettings(newSettings);
        DifficultyTuner.saveSettings(newSettings);
      }
    }
  }, [recentAttempts, difficultySettings]);

  const initializeSession = () => {
    let words: VocabularyWord[] = [];
    
    if (category) {
      words = SPANISH_VOCABULARY.filter(word => word.category === category);
    } else {
      // Use spaced repetition to select words
      const existingItems = spacedItems.length > 0 ? spacedItems : 
        SPANISH_VOCABULARY.map(word => SpacedRepetition.createItem(word.id));
      
      const dueItems = SpacedRepetition.nextDue(existingItems, maxCards);
      words = dueItems.map(item => 
        SPANISH_VOCABULARY.find(word => word.id === item.wordId)!
      ).filter(Boolean);
      
      // Fill remaining slots with random words if needed
      if (words.length < maxCards) {
        const usedIds = words.map(w => w.id);
        const randomWords = getRandomWords(maxCards - words.length, usedIds);
        words = [...words, ...randomWords];
      }
    }

    setSessionWords(words.slice(0, maxCards));
    setCurrentCardIndex(0);
    setSessionComplete(false);
  };

  const handleResponse = async (correct: boolean) => {
    const currentWord = sessionWords[currentCardIndex];
    if (!currentWord) return;

    // Update recent attempts for difficulty adjustment
    const newAttempts = [...recentAttempts, correct];
    setRecentAttempts(newAttempts);

    // Update spaced repetition item
    let currentSpacedItem = spacedItems.find(item => item.wordId === currentWord.id);
    if (!currentSpacedItem) {
      currentSpacedItem = SpacedRepetition.createItem(currentWord.id);
    }

    const updatedItem = SpacedRepetition.updateItem(currentSpacedItem, correct);
    const newSpacedItems = spacedItems.filter(item => item.wordId !== currentWord.id);
    newSpacedItems.push(updatedItem);
    setSpacedItems(newSpacedItems);

    // Save to localStorage
    try {
      localStorage.setItem('spaced_items', JSON.stringify(newSpacedItems));
    } catch (error) {
      console.warn('Failed to save spaced items:', error);
    }

    if (correct) {
      setMistakeCount(0);
      setShowDutchHint(false);
      audioManager.playSuccessSound();
    } else {
      const newMistakeCount = mistakeCount + 1;
      setMistakeCount(newMistakeCount);
      
      // Show Dutch hint after 2 mistakes if enabled
      if (newMistakeCount >= 2 && difficultySettings.showDutchOnSecondMistake) {
        setShowDutchHint(true);
      }
      
      audioManager.playErrorSound();
    }

    // Record progress
    updateProgressMutation.mutate({
      userId: DEFAULT_USER_ID,
      wordId: currentWord.id,
      correct
    });

    // Move to next card after delay
    setTimeout(() => {
      if (currentCardIndex < sessionWords.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
        setIsFlipped(false);
        setShowDutchHint(false);
      } else {
        setSessionComplete(true);
      }
    }, 1500);
  };

  const currentWord = sessionWords[currentCardIndex];

  if (sessionComplete) {
    const accuracy = recentAttempts.filter(Boolean).length / recentAttempts.length * 100;
    
    return (
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-br from-coral via-sunny to-mint rounded-3xl p-8 text-white mb-8"
        >
          <h2 className="font-fredoka text-4xl mb-4">¡Sesión Completa!</h2>
          <div className="text-2xl mb-6">
            Precisión: {Math.round(accuracy)}%
          </div>
          
          <div className="flex justify-center space-x-4">
            <Button
              onClick={initializeSession}
              className="bg-white text-coral hover:bg-white/90 font-nunito px-8 py-3 rounded-2xl"
            >
              Nueva Sesión
            </Button>
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="text-white border-white hover:bg-white/10 font-nunito px-8 py-3 rounded-2xl"
            >
              Volver al Menú
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!currentWord) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-coral border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="font-nunito text-sm text-gray-600">
            Tarjeta {currentCardIndex + 1} de {sessionWords.length}
          </span>
          <Badge variant="outline" className="font-nunito">
            {currentWord.category}
          </Badge>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-coral h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentCardIndex + 1) / sessionWords.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Difficulty indicator */}
      {SpacedRepetition.shouldReduceDifficulty(recentAttempts) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-mint/20 border border-mint/30 rounded-lg p-3 mb-6"
        >
          <p className="text-sm text-mint-dark font-nunito">
            💡 Moeilijkheid aangepast - je kunt het!
          </p>
        </motion.div>
      )}

      {/* Dutch hint if enabled */}
      {showDutchHint && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-sunny/20 border border-sunny/30 rounded-lg p-3 mb-6"
        >
          <p className="text-sm text-sunny-dark font-nunito">
            🇳🇱 Nederlands: {currentWord.dutch}
          </p>
        </motion.div>
      )}

      {/* Flashcard */}
      <motion.div
        key={currentCardIndex}
        initial={{ opacity: 0, rotateY: 90 }}
        animate={{ opacity: 1, rotateY: 0 }}
        className="mb-8"
      >
        <Card 
          className="aspect-[4/3] cursor-pointer perspective-1000"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <CardContent className="h-full p-0 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={isFlipped ? 'back' : 'front'}
                initial={{ rotateY: 90 }}
                animate={{ rotateY: 0 }}
                exit={{ rotateY: -90 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 p-6 flex flex-col items-center justify-center backface-hidden"
              >
                {!isFlipped ? (
                  // Front of card - Spanish word
                  <div className="text-center">
                    <div className="text-8xl mb-6">{currentWord.imageUrl}</div>
                    <h2 className={`font-fredoka text-5xl text-coral mb-4 ${
                      DifficultyTuner.getFontSizeClass(difficultySettings)
                    } ${DifficultyTuner.getDyslexiaFriendlyClass(difficultySettings)}`}>
                      {currentWord.spanish.toUpperCase()}
                    </h2>
                    <AudioButton 
                      word={currentWord.spanish} 
                      variant="large"
                      className="mx-auto"
                    />
                    <p className="font-nunito text-gray-600 mt-4">
                      Toca para de Nederlandse vertaling te zien
                    </p>
                  </div>
                ) : (
                  // Back of card - Dutch translation
                  <div className="text-center">
                    <div className="text-6xl mb-6">🇳🇱</div>
                    <h2 className={`font-fredoka text-4xl text-mint mb-6 ${
                      DifficultyTuner.getFontSizeClass(difficultySettings)
                    } ${DifficultyTuner.getDyslexiaFriendlyClass(difficultySettings)}`}>
                      {currentWord.dutch}
                    </h2>
                    
                    <div className="flex justify-center space-x-4">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResponse(true);
                        }}
                        className="bg-success hover:bg-success/90 text-white font-nunito px-8 py-3 rounded-2xl"
                      >
                        ✓ Ik wist het!
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResponse(false);
                        }}
                        className="bg-coral hover:bg-coral/90 text-white font-nunito px-8 py-3 rounded-2xl"
                      >
                        ✗ Nog niet
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* Instructions */}
      <div className="text-center">
        <p className="font-nunito text-gray-600">
          {!isFlipped 
            ? "Klik op de kaart om de Nederlandse betekenis te zien"
            : "Wist je de betekenis al voordat je omgedraaid?"
          }
        </p>
      </div>
    </div>
  );
}