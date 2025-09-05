import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Star, Trophy, Zap, Check, X } from "lucide-react";
import { GameLayout } from "@/components/game-layout";
import { CharacterCard } from "@/components/character-card";
import { AudioButton } from "@/components/audio-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/progress-bar";
import { useTranslation } from "@/lib/i18n";
import { DifficultyTuner, DifficultySettings } from "@/lib/difficulty-tuner";
import { getRandomCharacter } from "@/lib/characters";
import { audioManager } from "@/lib/audio";
import { apiRequest } from "@/lib/queryClient";
import { SPANISH_VOCABULARY, getRandomWords } from "@/data/spanish-vocabulary";
import type { VocabularyWord } from "@shared/schema";
import { DEFAULT_USER_ID } from "../lib/constants";

interface BossQuizQuestion {
  word: VocabularyWord;
  options: VocabularyWord[];
  correctAnswer: VocabularyWord;
  category: string;
  difficulty: number;
}

interface BossQuizResults {
  score: number;
  totalQuestions: number;
  accuracy: number;
  categoriesComplete: string[];
  starsEarned: number;
  achievements: string[];
}

export default function BossQuiz() {
  const { t } = useTranslation();
  const [questions, setQuestions] = useState<BossQuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [character] = useState(getRandomCharacter());
  const [recentAttempts, setRecentAttempts] = useState<boolean[]>([]);
  const [difficultySettings, setDifficultySettings] = useState<DifficultySettings>(
    DifficultyTuner.getInitialSettings()
  );
  const [showDutchHint, setShowDutchHint] = useState(false);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [results, setResults] = useState<BossQuizResults | null>(null);
  const queryClient = useQueryClient();

  const updateProgressMutation = useMutation({
    mutationFn: async (data: { userId: string; wordId: string; correct: boolean }) => {
      return apiRequest("POST", "/api/progress", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stats", DEFAULT_USER_ID] });
    },
  });

  // Generate boss quiz questions (more challenging)
  useEffect(() => {
    generateBossQuestions();
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

  const generateBossQuestions = () => {
    const numQuestions = 20; // Longer for boss quiz
    const allWords = SPANISH_VOCABULARY;
    
    // Focus on higher difficulty words for boss quiz
    const challengingWords = allWords.filter(word => word.difficulty >= 2);
    const selectedWords = challengingWords
      .sort(() => Math.random() - 0.5)
      .slice(0, numQuestions);

    const bossQuestions: BossQuizQuestion[] = selectedWords.map((word) => {
      // More options for boss quiz
      const maxOptions = Math.max(4, difficultySettings.maxOptions);
      const wrongOptions = allWords
        .filter(w => w.id !== word.id && w.category === word.category)
        .sort(() => Math.random() - 0.5)
        .slice(0, maxOptions - 1);

      const allOptions = [word, ...wrongOptions].sort(() => Math.random() - 0.5);

      return {
        word,
        options: allOptions,
        correctAnswer: word,
        category: word.category,
        difficulty: word.difficulty
      };
    });

    setQuestions(bossQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setGameCompleted(false);
    setResults(null);
  };

  const handleAnswer = async (selectedWord: VocabularyWord) => {
    if (showResult) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedWord.id === currentQuestion.correctAnswer.id;
    
    setSelectedAnswer(selectedWord.id);
    setShowResult(true);

    // Update recent attempts for difficulty adjustment
    const newAttempts = [...recentAttempts, isCorrect];
    setRecentAttempts(newAttempts);

    if (isCorrect) {
      setScore(score + Math.max(1, currentQuestion.difficulty)); // More points for harder words
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
      wordId: currentQuestion.word.id,
      correct: isCorrect
    });

    // Move to next question after delay
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setShowResult(false);
        setShowDutchHint(false);
      } else {
        completeQuiz();
      }
    }, 2000);
  };

  const completeQuiz = () => {
    const accuracy = (score / questions.length) * 100;
    const categoriesComplete = [...new Set(questions.map(q => q.category))];
    
    // Calculate stars based on performance
    let starsEarned = 0;
    if (accuracy >= 95) starsEarned = 3;
    else if (accuracy >= 80) starsEarned = 2;
    else if (accuracy >= 60) starsEarned = 1;

    // Generate achievements
    const achievements: string[] = [];
    if (accuracy === 100) achievements.push('perfect_boss');
    if (accuracy >= 90) achievements.push('boss_master');
    if (starsEarned >= 2) achievements.push('quiz_champion');

    const quizResults: BossQuizResults = {
      score,
      totalQuestions: questions.length,
      accuracy,
      categoriesComplete,
      starsEarned,
      achievements
    };

    setResults(quizResults);
    setGameCompleted(true);
  };

  const currentQuestion = questions[currentQuestionIndex];

  if (!currentQuestion && !gameCompleted) {
    return (
      <GameLayout title="Boss Quiz" color="coral">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-coral border-t-transparent rounded-full"></div>
        </div>
      </GameLayout>
    );
  }

  if (gameCompleted && results) {
    return (
      <GameLayout title="Boss Quiz Voltooid!" color="coral">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-coral via-sunny to-mint rounded-3xl p-8 text-white mb-8"
          >
            <Crown className="w-16 h-16 mx-auto mb-4" />
            <h2 className="font-fredoka text-4xl mb-4">
              {results.accuracy >= 80 ? '¡Eres el Jefe!' : '¡Buen Intento!'}
            </h2>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <div className="text-3xl font-fredoka mb-2">{results.score}</div>
                <div className="text-sm opacity-90">Puntos Totales</div>
              </div>
              <div>
                <div className="text-3xl font-fredoka mb-2">{Math.round(results.accuracy)}%</div>
                <div className="text-sm opacity-90">Precisión</div>
              </div>
            </div>

            <div className="flex justify-center space-x-2 mb-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-8 h-8 ${
                    i < results.starsEarned
                      ? "text-yellow-300 fill-yellow-300"
                      : "text-white/30"
                  }`}
                />
              ))}
            </div>

            {results.achievements.length > 0 && (
              <div className="mb-6">
                <h3 className="font-fredoka text-xl mb-3">¡Logros Desbloqueados!</h3>
                <div className="flex justify-center space-x-4">
                  {results.achievements.map((achievement, index) => (
                    <motion.div
                      key={achievement}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.2 }}
                      className="bg-white/20 rounded-full p-3"
                    >
                      <Trophy className="w-6 h-6" />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          <div className="flex justify-center space-x-4">
            <Button
              onClick={generateBossQuestions}
              className="bg-coral hover:bg-coral/90 text-white font-nunito px-8 py-3 rounded-2xl"
            >
              <Zap className="mr-2 w-5 h-5" />
              Intentar de Nuevo
            </Button>
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="font-nunito px-8 py-3 rounded-2xl"
            >
              Volver al Menú
            </Button>
          </div>
        </div>
      </GameLayout>
    );
  }

  return (
    <GameLayout
      title="Boss Quiz"
      subtitle="¡Demuestra tu dominio del español!"
      currentQuestion={currentQuestionIndex + 1}
      totalQuestions={questions.length}
      color="coral"
    >
      <div className="max-w-2xl mx-auto">
        {/* Progress and Score */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="font-nunito text-sm text-gray-600">Progreso</span>
            <span className="font-nunito text-sm text-gray-600">
              Score: {score}/{questions.length * 3}
            </span>
          </div>
          <ProgressBar
            current={currentQuestionIndex}
            total={questions.length}
            color="coral"
            size="md"
          />
        </div>

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
              <p className="text-xs text-gray-600">
                {difficultySettings.showHints ? "Consejos activados" : "Modo desafío"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="mb-8"
          >
            <Card className="p-6">
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">{currentQuestion.word.imageUrl}</div>
                  <h2 className="font-fredoka text-4xl text-coral mb-4">
                    {currentQuestion.word.spanish.toUpperCase()}
                  </h2>
                  <AudioButton 
                    word={currentQuestion.word.spanish} 
                    variant="large"
                    className="mx-auto mb-4"
                  />
                  <p className={`font-nunito text-xl text-friendly-dark mb-6 ${
                    DifficultyTuner.getFontSizeClass(difficultySettings)
                  } ${DifficultyTuner.getDyslexiaFriendlyClass(difficultySettings)}`}>
                    ¿Qué significa en holandés?
                  </p>

                  {/* Dutch hint if enabled */}
                  {showDutchHint && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-mint/20 border border-mint/30 rounded-lg p-3 mb-6"
                    >
                      <p className="text-sm text-mint-dark">
                        💡 Pista: {currentQuestion.word.dutch}
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Answer Options */}
                <div className="grid grid-cols-1 gap-4">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedAnswer === option.id;
                    const isCorrect = option.id === currentQuestion.correctAnswer.id;
                    const isIncorrect = isSelected && !isCorrect;

                    return (
                      <motion.div
                        key={option.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Button
                          onClick={() => handleAnswer(option)}
                          disabled={showResult}
                          className={`w-full p-4 text-left rounded-2xl border-2 transition-all ${
                            showResult
                              ? isCorrect
                                ? "bg-success/20 border-success text-success-dark"
                                : isIncorrect
                                ? "bg-red-100 border-red-300 text-red-600"
                                : "bg-gray-50 border-gray-200 text-gray-500"
                              : "bg-white border-gray-200 hover:border-coral hover:bg-coral/5"
                          } ${DifficultyTuner.getFontSizeClass(difficultySettings)} ${
                            DifficultyTuner.getDyslexiaFriendlyClass(difficultySettings)
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-nunito font-semibold">
                              {option.dutch}
                            </span>
                            {showResult && isCorrect && (
                              <Check className="w-5 h-5 text-success" />
                            )}
                            {showResult && isIncorrect && (
                              <X className="w-5 h-5 text-red-500" />
                            )}
                          </div>
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </GameLayout>
  );
}