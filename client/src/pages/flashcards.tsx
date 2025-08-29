import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, RotateCcw, Check, X } from "lucide-react";
import { GameLayout } from "@/components/game-layout";
import { AudioButton } from "@/components/audio-button";
import { CharacterCard } from "@/components/character-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getRandomCharacter } from "@/lib/characters";
import { audioManager } from "@/lib/audio";
import { apiRequest } from "@/lib/queryClient";
import { useTranslation } from "@/lib/i18n";
import type { VocabularyWord } from "@shared/schema";

const DEFAULT_USER_ID = "default_user";

export default function Flashcards() {
  const { t } = useTranslation();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [character] = useState(getRandomCharacter());
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const queryClient = useQueryClient();

  const { data: words = [], isLoading } = useQuery<VocabularyWord[]>({
    queryKey: ["/api/vocabulary"],
  });

  const updateProgressMutation = useMutation({
    mutationFn: async (data: { userId: string; wordId: string; correct: boolean }) => {
      return apiRequest("POST", "/api/progress", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stats", DEFAULT_USER_ID] });
      queryClient.invalidateQueries({ queryKey: ["/api/progress", DEFAULT_USER_ID] });
    },
  });

  const currentWord = words[currentWordIndex];

  const handleAnswer = async (correct: boolean) => {
    if (!currentWord) return;
    
    setFeedback(correct ? "correct" : "incorrect");
    
    if (correct) {
      audioManager.playSuccessSound();
    } else {
      audioManager.playErrorSound();
    }

    updateProgressMutation.mutate({
      userId: DEFAULT_USER_ID,
      wordId: currentWord.id,
      correct
    });

    setTimeout(() => {
      setFeedback(null);
      setShowAnswer(false);
      if (currentWordIndex < words.length - 1) {
        setCurrentWordIndex(currentWordIndex + 1);
      } else {
        setCurrentWordIndex(0); // Loop back to beginning
      }
    }, 2000);
  };

  const handleFlipCard = () => {
    setShowAnswer(!showAnswer);
  };

  const handleNext = () => {
    setShowAnswer(false);
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      setCurrentWordIndex(0);
    }
  };

  const handlePrevious = () => {
    setShowAnswer(false);
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1);
    } else {
      setCurrentWordIndex(words.length - 1);
    }
  };

  if (isLoading) {
    return (
      <GameLayout title={t('loading')} color="coral">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-coral border-t-transparent rounded-full"></div>
        </div>
      </GameLayout>
    );
  }

  if (!currentWord) {
    return (
      <GameLayout title="No Words Available" color="coral">
        <div className="text-center">
          <p className="font-nunito text-lg text-gray-600">
            No vocabulary words found. Please try again later.
          </p>
        </div>
      </GameLayout>
    );
  }

  return (
    <GameLayout
      title={t('flashcards.title')}
      subtitle={`${t(`categories.${currentWord.category}`)}`}
      currentQuestion={currentWordIndex + 1}
      totalQuestions={words.length}
      color="coral"
    >
      <div className="max-w-2xl mx-auto">
        {/* Character Encouragement */}
        <motion.div 
          className="flex items-center justify-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-white rounded-2xl p-4 shadow-lg border-2 border-coral/20 flex items-center space-x-4">
            <CharacterCard character={character} size="sm" />
            <div className="font-comic text-friendly-dark">
              <p className="text-sm">{character.catchphrase}</p>
              <p className="text-xs text-gray-600">{t('flashcards.tap_to_reveal')}</p>
            </div>
          </div>
        </motion.div>

        {/* Flashcard */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentWordIndex}
            initial={{ opacity: 0, rotateY: 90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: -90 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <Card 
              className="cursor-pointer min-h-[400px] flex items-center justify-center relative overflow-hidden"
              onClick={handleFlipCard}
            >
              <CardContent className="pt-6 text-center w-full">
                <AnimatePresence mode="wait">
                  {!showAnswer ? (
                    <motion.div
                      key="spanish"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-6"
                    >
                      <h4 className="font-fredoka text-3xl text-friendly-dark mb-4">
                        {t('flashcards.what_does_mean')}
                      </h4>
                      
                      {/* Word Display */}
                      <div className="bg-gradient-to-b from-coral/20 to-sunny/20 rounded-3xl p-8 mb-6 border-4 border-dashed border-coral/30">
                        <div className="text-8xl mb-4">{currentWord.imageUrl}</div>
                        <div className="space-y-4">
                          <h2 className="font-fredoka text-6xl text-coral mb-4">
                            {currentWord.spanish.toUpperCase()}
                          </h2>
                          <AudioButton 
                            word={currentWord.spanish} 
                            variant="large"
                            className="mx-auto"
                          />
                        </div>
                      </div>
                      
                      <div className="text-gray-500 text-sm font-nunito">
                        💡 {t('flashcards.tap_to_reveal')}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="dutch"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-6"
                    >
                      <div className="space-y-4">
                        <div className="text-6xl mb-4">{currentWord.imageUrl}</div>
                        <h2 className="font-fredoka text-4xl text-coral">
                          {currentWord.spanish.toUpperCase()}
                        </h2>
                        <p className="font-nunito text-2xl text-gray-600">{t('flashcards.means')}</p>
                        <h3 className="font-fredoka text-5xl text-mint">
                          {currentWord.dutch.toUpperCase()}
                        </h3>
                        <AudioButton 
                          word={currentWord.spanish} 
                          variant="large"
                          className="mx-auto"
                        />
                      </div>
                      
                      <div className="mt-8">
                        <p className="font-nunito text-lg text-friendly-dark mb-6">
                          {t('flashcards.did_you_know')}
                        </p>
                        
                        <div className="flex justify-center space-x-4">
                          <Button
                            onClick={() => handleAnswer(false)}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-2xl flex items-center space-x-2"
                            disabled={feedback !== null}
                          >
                            <X className="w-5 h-5" />
                            <span>{t('flashcards.not_yet')}</span>
                          </Button>
                          
                          <Button
                            onClick={() => handleAnswer(true)}
                            className="bg-success hover:bg-success/90 text-white font-bold py-3 px-8 rounded-2xl flex items-center space-x-2"
                            disabled={feedback !== null}
                          >
                            <Check className="w-5 h-5" />
                            <span>{t('flashcards.i_knew_it')}</span>
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>

              {/* Feedback Overlay */}
              <AnimatePresence>
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`absolute inset-0 flex items-center justify-center ${
                      feedback === "correct" 
                        ? "bg-success/90" 
                        : "bg-red-500/90"
                    }`}
                  >
                    <div className="text-center text-white">
                      {feedback === "correct" ? (
                        <>
                          <Check className="w-16 h-16 mx-auto mb-4" />
                          <h3 className="font-fredoka text-3xl">{t('flashcards.fantastic')}</h3>
                          <p className="font-nunito text-xl">{t('flashcards.great_job')}</p>
                        </>
                      ) : (
                        <>
                          <RotateCcw className="w-16 h-16 mx-auto mb-4" />
                          <h3 className="font-fredoka text-3xl">{t('flashcards.its_okay')}</h3>
                          <p className="font-nunito text-xl">{t('flashcards.keep_practicing')}</p>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Controls */}
        <div className="flex justify-between items-center">
          <Button
            onClick={handlePrevious}
            variant="outline"
            className="rounded-2xl px-6 py-3"
          >
            Previous
          </Button>
          
          <div className="flex space-x-2">
            {words.slice(0, Math.min(10, words.length)).map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index === currentWordIndex ? "bg-coral" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
          
          <Button
            onClick={handleNext}
            variant="outline"
            className="rounded-2xl px-6 py-3"
          >
            Next
          </Button>
        </div>

        {/* Encouraging Tip */}
        <motion.div 
          className="mt-8 p-4 bg-sunny/20 rounded-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p className="font-nunito text-lg text-friendly-dark flex items-center">
            <Lightbulb className="text-sunny mr-2 w-5 h-5" />
            Tip: Try to say the word out loud before flipping the card!
          </p>
        </motion.div>
      </div>
    </GameLayout>
  );
}
