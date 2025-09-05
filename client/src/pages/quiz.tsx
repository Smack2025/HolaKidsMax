import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Trophy, Star, RotateCcw } from "lucide-react";
import { GameLayout } from "@/components/game-layout";
import { CharacterCard } from "@/components/character-card";
import { AudioButton } from "@/components/audio-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getRandomCharacter } from "@/lib/characters";
import { audioManager } from "@/lib/audio";
import { apiRequest } from "@/lib/queryClient";
import { useTranslation } from "@/lib/i18n";
import type { VocabularyWord } from "@shared/schema";
import { DEFAULT_USER_ID } from "../lib/constants";

interface QuizQuestion {
  word: VocabularyWord;
  options: VocabularyWord[];
  correctAnswer: VocabularyWord;
}

export default function Quiz() {
  const { t } = useTranslation();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
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

  // Generate quiz questions
  useEffect(() => {
    if (allWords.length >= 4) {
      generateQuestions();
    }
  }, [allWords]);

  const generateQuestions = () => {
    const numQuestions = Math.min(10, allWords.length);
    const selectedWords = allWords
      .sort(() => Math.random() - 0.5)
      .slice(0, numQuestions);

    const quizQuestions: QuizQuestion[] = selectedWords.map((word) => {
      // Get 3 wrong answers from different words
      const wrongAnswers = allWords
        .filter(w => w.id !== word.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      // Create options array with correct answer
      const options = [word, ...wrongAnswers].sort(() => Math.random() - 0.5);

      return {
        word,
        options,
        correctAnswer: word
      };
    });

    setQuestions(quizQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setGameCompleted(false);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = async (optionId: string) => {
    if (selectedAnswer || showResult) return;

    setSelectedAnswer(optionId);
    const isCorrect = optionId === currentQuestion.correctAnswer.id;
    
    if (isCorrect) {
      setScore(score + 1);
      audioManager.playSuccessSound();
    } else {
      audioManager.playErrorSound();
    }

    // Update progress
    updateProgressMutation.mutate({
      userId: DEFAULT_USER_ID,
      wordId: currentQuestion.word.id,
      correct: isCorrect
    });

    setShowResult(true);

    // Auto advance after showing result
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setGameCompleted(true);
      }
    }, 2500);
  };

  const restartQuiz = () => {
    generateQuestions();
  };

  if (isLoading) {
    return (
      <GameLayout title="Loading Quiz..." color="sunny">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-sunny border-t-transparent rounded-full"></div>
        </div>
      </GameLayout>
    );
  }

  if (questions.length === 0) {
    return (
      <GameLayout title="Quiz" color="sunny">
        <div className="text-center">
          <p className="font-nunito text-lg text-gray-600">
            Not enough vocabulary words for a quiz. Please learn more words first!
          </p>
        </div>
      </GameLayout>
    );
  }

  return (
    <GameLayout
      title="Fun Quiz"
      subtitle="Test your Spanish knowledge!"
      currentQuestion={currentQuestionIndex + 1}
      totalQuestions={questions.length}
      color="sunny"
    >
      <div className="max-w-2xl mx-auto">
        {/* Character Encouragement */}
        <motion.div 
          className="flex items-center justify-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-white rounded-2xl p-4 shadow-lg border-2 border-sunny/20 flex items-center space-x-4">
            <CharacterCard character={character} size="sm" />
            <div className="font-comic text-friendly-dark">
              <p className="text-sm">{character.catchphrase}</p>
              <p className="text-xs text-gray-600">
                Score: {score}/{currentQuestionIndex + (showResult ? 1 : 0)}
              </p>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {!gameCompleted ? (
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              {/* Question */}
              <div className="text-center mb-8">
                <h4 className="font-fredoka text-3xl text-friendly-dark mb-6">
                  What does this mean in Dutch?
                </h4>
                
                {/* Question Word */}
                <div className="bg-gradient-to-b from-sunny/20 to-coral/20 rounded-3xl p-8 mb-6 border-4 border-dashed border-sunny/30">
                  <div className="text-6xl mb-4">{currentQuestion.word.imageUrl}</div>
                  <h2 className="font-fredoka text-5xl text-sunny mb-4">
                    {currentQuestion.word.spanish.toUpperCase()}
                  </h2>
                  <AudioButton 
                    word={currentQuestion.word.spanish} 
                    variant="large"
                    className="mx-auto"
                  />
                </div>
              </div>

              {/* Answer Options */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {currentQuestion.options.map((option) => {
                  const isSelected = selectedAnswer === option.id;
                  const isCorrect = option.id === currentQuestion.correctAnswer.id;
                  const isIncorrect = isSelected && !isCorrect;
                  
                  let buttonClass = "bg-white border-4 border-gray-200 hover:border-sunny hover:bg-sunny/10";
                  
                  if (showResult) {
                    if (isCorrect) {
                      buttonClass = "bg-success/20 border-success border-4";
                    } else if (isIncorrect) {
                      buttonClass = "bg-red-500/20 border-red-500 border-4";
                    }
                  } else if (isSelected) {
                    buttonClass = "bg-sunny/20 border-sunny border-4";
                  }

                  return (
                    <motion.button
                      key={option.id}
                      className={`${buttonClass} rounded-2xl p-6 transition-all cursor-pointer disabled:cursor-not-allowed`}
                      onClick={() => handleAnswerSelect(option.id)}
                      disabled={showResult}
                      whileHover={!showResult ? { scale: 1.02 } : {}}
                      whileTap={!showResult ? { scale: 0.98 } : {}}
                    >
                      <div className="flex items-center justify-center space-x-3">
                        <div className="text-3xl">{option.imageUrl}</div>
                        <p className="font-fredoka text-lg text-friendly-dark">
                          {option.dutch.toUpperCase()}
                        </p>
                        {showResult && isCorrect && (
                          <Check className="text-success w-6 h-6" />
                        )}
                        {showResult && isIncorrect && (
                          <X className="text-red-500 w-6 h-6" />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Result Feedback */}
              <AnimatePresence>
                {showResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                  >
                    {selectedAnswer === currentQuestion.correctAnswer.id ? (
                      <div className="bg-success/20 rounded-2xl p-6">
                        <div className="text-4xl mb-2">🎉</div>
                        <h3 className="font-fredoka text-2xl text-success mb-2">¡Correcto!</h3>
                        <p className="font-nunito text-friendly-dark">Excellent work!</p>
                      </div>
                    ) : (
                      <div className="bg-red-500/20 rounded-2xl p-6">
                        <div className="text-4xl mb-2">📚</div>
                        <h3 className="font-fredoka text-2xl text-red-500 mb-2">Not quite!</h3>
                        <p className="font-nunito text-friendly-dark">
                          "{currentQuestion.word.spanish}" means "{currentQuestion.correctAnswer.dutch}"
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            /* Quiz Completed */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="bg-gradient-to-b from-sunny/20 to-coral/20 rounded-3xl p-8 border-4 border-sunny/30">
                <div className="text-8xl mb-6">
                  {score >= questions.length * 0.8 ? "🏆" : score >= questions.length * 0.6 ? "🌟" : "📚"}
                </div>
                
                <h2 className="font-fredoka text-4xl text-friendly-dark mb-4">
                  ¡Quiz Completado!
                </h2>
                
                <div className="flex items-center justify-center space-x-6 mb-6">
                  <div className="flex items-center space-x-2">
                    <Star className="text-sunny w-6 h-6" />
                    <span className="font-nunito text-xl font-bold">
                      Score: {score}/{questions.length}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Trophy className="text-coral w-6 h-6" />
                    <span className="font-nunito text-xl font-bold">
                      {Math.round((score / questions.length) * 100)}%
                    </span>
                  </div>
                </div>

                <p className="font-nunito text-lg text-gray-600 mb-8">
                  {score >= questions.length * 0.8 
                    ? "Outstanding! You're a Spanish superstar!" 
                    : score >= questions.length * 0.6
                    ? "Great job! Keep practicing to improve even more!"
                    : "Good effort! Practice makes perfect!"
                  }
                </p>

                <Button
                  onClick={restartQuiz}
                  className="bg-sunny text-white font-bold py-4 px-8 rounded-2xl flex items-center space-x-2 mx-auto"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Take Quiz Again</span>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameLayout>
  );
}
