import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2, Check, RotateCcw, Lightbulb } from "lucide-react";
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

export default function Pronunciation() {
  const { t } = useTranslation();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [spokenText, setSpokenText] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | "listening" | null>(null);
  const [score, setScore] = useState(0);
  const [character] = useState(getRandomCharacter());
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
    },
  });

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'es-ES'; // Spanish
      
      recognitionInstance.onstart = () => {
        setIsListening(true);
        setFeedback("listening");
      };
      
      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        setSpokenText(transcript);
        handleSpeechResult(transcript);
      };
      
      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setFeedback(null);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    }
  }, []);

  const currentWord = words[currentWordIndex];

  const handleSpeechResult = async (transcript: string) => {
    if (!currentWord) return;

    const spokenWord = transcript.toLowerCase().replace(/[.,!?]/g, '');
    const targetWord = currentWord.spanish.toLowerCase();
    
    // Simple similarity check - in a real app, you might use more sophisticated matching
    const isCorrect = spokenWord === targetWord || 
                     spokenWord.includes(targetWord) ||
                     targetWord.includes(spokenWord);

    if (isCorrect) {
      setFeedback("correct");
      setScore(score + 1);
      audioManager.playSuccessSound();
      
      updateProgressMutation.mutate({
        userId: DEFAULT_USER_ID,
        wordId: currentWord.id,
        correct: true
      });
    } else {
      setFeedback("incorrect");
      audioManager.playErrorSound();
      
      updateProgressMutation.mutate({
        userId: DEFAULT_USER_ID,
        wordId: currentWord.id,
        correct: false
      });
    }

    // Auto advance after feedback
    setTimeout(() => {
      setFeedback(null);
      setSpokenText("");
      if (currentWordIndex < words.length - 1) {
        setCurrentWordIndex(currentWordIndex + 1);
      } else {
        setCurrentWordIndex(0); // Loop back
      }
    }, 3000);
  };

  const startListening = () => {
    if (recognition && !isListening) {
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
    }
  };

  const handleNext = () => {
    setFeedback(null);
    setSpokenText("");
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      setCurrentWordIndex(0);
    }
  };

  const handlePrevious = () => {
    setFeedback(null);
    setSpokenText("");
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1);
    } else {
      setCurrentWordIndex(words.length - 1);
    }
  };

  if (isLoading) {
    return (
      <GameLayout title="Loading..." color="success">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-success border-t-transparent rounded-full"></div>
        </div>
      </GameLayout>
    );
  }

  if (!currentWord) {
    return (
      <GameLayout title="No Words Available" color="success">
        <div className="text-center">
          <p className="font-nunito text-lg text-gray-600">
            No vocabulary words found. Please try again later.
          </p>
        </div>
      </GameLayout>
    );
  }

  // Check if speech recognition is supported
  if (!recognition) {
    return (
      <GameLayout title="Pronunciation Practice" color="success">
        <div className="text-center max-w-md mx-auto">
          <div className="text-6xl mb-4">🎤</div>
          <h3 className="font-fredoka text-2xl text-friendly-dark mb-4">
            Speech Recognition Not Available
          </h3>
          <p className="font-nunito text-gray-600 mb-6">
            Sorry! Speech recognition is not supported in your browser. 
            Try using Chrome, Edge, or Safari for the best experience.
          </p>
          <div className="bg-sunny/20 rounded-2xl p-4">
            <p className="font-nunito text-sm text-friendly-dark">
              💡 You can still practice by listening to the pronunciation and repeating out loud!
            </p>
          </div>
        </div>
      </GameLayout>
    );
  }

  return (
    <GameLayout
      title="Say It!"
      subtitle="Practice speaking Spanish words"
      currentQuestion={currentWordIndex + 1}
      totalQuestions={words.length}
      color="success"
    >
      <div className="max-w-2xl mx-auto">
        {/* Character Encouragement */}
        <motion.div 
          className="flex items-center justify-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-white rounded-2xl p-4 shadow-lg border-2 border-success/20 flex items-center space-x-4">
            <CharacterCard character={character} size="sm" />
            <div className="font-comic text-friendly-dark">
              <p className="text-sm">{character.catchphrase}</p>
              <p className="text-xs text-gray-600">Score: {score} correct pronunciations!</p>
            </div>
          </div>
        </motion.div>

        {/* Current Word Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentWordIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <Card className="relative overflow-hidden">
              <CardContent className="pt-6 text-center">
                <h4 className="font-fredoka text-3xl text-friendly-dark mb-6">
                  Try to say this word:
                </h4>
                
                {/* Word Display */}
                <div className="bg-gradient-to-b from-success/20 to-mint/20 rounded-3xl p-8 mb-6 border-4 border-dashed border-success/30">
                  <div className="text-8xl mb-4">{currentWord.imageUrl}</div>
                  <h2 className="font-fredoka text-6xl text-success mb-4">
                    {currentWord.spanish.toUpperCase()}
                  </h2>
                  <p className="font-nunito text-xl text-gray-600 mb-6">
                    ({currentWord.dutch})
                  </p>
                  <AudioButton 
                    word={currentWord.spanish} 
                    variant="large"
                    className="mx-auto bg-success hover:bg-success/90"
                  />
                </div>

                {/* Microphone Controls */}
                <div className="flex flex-col items-center space-y-4 mb-6">
                  <motion.button
                    className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl transition-all ${
                      isListening 
                        ? "bg-red-500 hover:bg-red-600 animate-pulse" 
                        : "bg-success hover:bg-success/90"
                    }`}
                    onClick={isListening ? stopListening : startListening}
                    disabled={feedback !== null && feedback !== "listening"}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                  </motion.button>
                  
                  <p className="font-nunito text-lg text-friendly-dark">
                    {isListening 
                      ? "Listening... Speak now!" 
                      : "Tap to start speaking"
                    }
                  </p>
                  
                  {spokenText && (
                    <div className="bg-gray-100 rounded-xl px-4 py-2">
                      <p className="font-nunito text-sm text-gray-600">
                        You said: "{spokenText}"
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>

              {/* Feedback Overlay */}
              <AnimatePresence>
                {feedback && feedback !== "listening" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`absolute inset-0 flex items-center justify-center ${
                      feedback === "correct" 
                        ? "bg-success/90" 
                        : "bg-coral/90"
                    }`}
                  >
                    <div className="text-center text-white">
                      {feedback === "correct" ? (
                        <>
                          <Check className="w-16 h-16 mx-auto mb-4" />
                          <h3 className="font-fredoka text-3xl">¡Perfecto!</h3>
                          <p className="font-nunito text-xl">Great pronunciation!</p>
                        </>
                      ) : (
                        <>
                          <RotateCcw className="w-16 h-16 mx-auto mb-4" />
                          <h3 className="font-fredoka text-3xl">¡Inténtalo de nuevo!</h3>
                          <p className="font-nunito text-xl">Try again - you've got this!</p>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Listening Indicator */}
              <AnimatePresence>
                {feedback === "listening" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-blue-500/90"
                  >
                    <div className="text-center text-white">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                      >
                        <Mic className="w-16 h-16 mx-auto mb-4" />
                      </motion.div>
                      <h3 className="font-fredoka text-3xl">Listening...</h3>
                      <p className="font-nunito text-xl">Say the word now!</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Controls */}
        <div className="flex justify-between items-center mb-6">
          <Button
            onClick={handlePrevious}
            variant="outline"
            className="rounded-2xl px-6 py-3"
            disabled={isListening}
          >
            Previous
          </Button>
          
          <div className="flex space-x-2">
            {words.slice(0, Math.min(10, words.length)).map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index === currentWordIndex ? "bg-success" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
          
          <Button
            onClick={handleNext}
            variant="outline"
            className="rounded-2xl px-6 py-3"
            disabled={isListening}
          >
            Next
          </Button>
        </div>

        {/* Tips */}
        <motion.div 
          className="p-4 bg-sunny/20 rounded-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p className="font-nunito text-lg text-friendly-dark flex items-start">
            <Lightbulb className="text-sunny mr-2 w-5 h-5 mt-1 flex-shrink-0" />
            <span>
              <strong>Tip:</strong> Listen to the pronunciation first, then speak clearly and slowly. 
              The microphone is listening for Spanish pronunciation!
            </span>
          </p>
        </motion.div>
      </div>
    </GameLayout>
  );
}
