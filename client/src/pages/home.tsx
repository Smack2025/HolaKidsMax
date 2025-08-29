import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Star, Trophy, Zap, BookOpen, Brain, Mic, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CharacterCard } from "@/components/character-card";
import { ProgressBar } from "@/components/progress-bar";
import { useTranslation } from "@/lib/i18n";
import { CHARACTERS } from "@/lib/characters";
import { VOCABULARY_CATEGORIES, getCategoryColor } from "@/lib/vocabulary";
import type { UserStats } from "@shared/schema";

const DEFAULT_USER_ID = "default_user";

interface CategoryProgress {
  name: string;
  total: number;
  completed: number;
  words: any[];
}

export default function Home() {
  const { t } = useTranslation();
  
  const { data: stats } = useQuery<UserStats>({
    queryKey: ["/api/stats", DEFAULT_USER_ID],
  });

  const { data: categories } = useQuery<CategoryProgress[]>({
    queryKey: ["/api/categories", DEFAULT_USER_ID],
  });

  const gameModes = [
    {
      id: "flashcards",
      title: "Flashcards",
      description: "Leer nieuwe Spaanse woorden",
      icon: BookOpen,
      color: "coral",
      path: "/flashcards"
    },
    {
      id: "memory",
      title: "Memory Game", 
      description: "Match Spaanse woorden met plaatjes",
      icon: Brain,
      color: "mint",
      path: "/memory-game"
    },
    {
      id: "quiz",
      title: "Quiz",
      description: "Test je Spaanse woordenschat",
      icon: Zap,
      color: "sunny",
      path: "/quiz"
    },
    {
      id: "pronunciation",
      title: "Uitspraak",
      description: "Oefen je Spaanse uitspraak",
      icon: Mic,
      color: "success",
      path: "/pronunciation"
    },
    {
      id: "boss-quiz",
      title: "Boss Quiz",
      description: "Toon je Spaanse meesterschap!",
      icon: Trophy,
      color: "coral",
      path: "/boss-quiz",
      advanced: true
    }
  ];

  const achievements = [
    { id: "first-word", name: "First Word!", icon: Star, unlocked: (stats?.wordsLearned || 0) > 0 },
    { id: "streak-5", name: "5 Day Streak!", icon: Trophy, unlocked: (stats?.currentStreak || 0) >= 5 },
    { id: "quiz-master", name: "Quiz Master!", icon: Zap, unlocked: false },
    { id: "speed-learner", name: "Speed Learner", icon: Users, unlocked: false },
    { id: "spanish-king", name: "Spanish King", icon: Trophy, unlocked: false },
    { id: "perfect-week", name: "Perfect Week", icon: Star, unlocked: false },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Welcome Section with Characters */}
      <motion.section 
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="bg-gradient-to-r from-coral via-sunny to-mint rounded-3xl p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-coral/90 via-sunny/90 to-mint/90"></div>
          
          <div className="relative z-10">
            <h2 className="font-fredoka text-4xl text-white mb-4">¡Bienvenido a tu aventura en español!</h2>
            <p className="font-nunito text-xl text-white/90 mb-6">Een leuke manier om Spaans te leren voor Nederlandse kinderen</p>
            
            {/* Character Showcase */}
            <div className="flex justify-center space-x-6 mb-6">
              {CHARACTERS.map((character, index) => (
                <motion.div
                  key={character.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                >
                  <CharacterCard character={character} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Game Mode Selection */}
      <motion.section 
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="font-fredoka text-3xl text-friendly-dark mb-6 text-center">Kies een spel om te beginnen:</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {gameModes.map((mode, index) => {
            const Icon = mode.icon;
            return (
              <motion.div
                key={mode.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className={`lesson-card border-4 border-${mode.color}/20 hover:border-${mode.color} transition-all cursor-pointer h-full`}>
                  <CardContent className="pt-6">
                    <div className="text-center h-full flex flex-col">
                      <div className={`w-16 h-16 bg-gradient-to-r from-${mode.color} to-sunny rounded-full flex items-center justify-center mx-auto mb-4`}>
                        <Icon className="text-white text-2xl w-8 h-8" />
                      </div>
                      <h4 className="font-fredoka text-xl text-friendly-dark mb-2">{mode.title}</h4>
                      <p className="font-nunito text-gray-600 text-sm mb-4 flex-grow">{mode.description}</p>
                      <Link href={mode.path}>
                        <Button 
                          className={`game-button bg-${mode.color} text-white font-bold py-3 px-6 rounded-2xl transition-transform hover:scale-105 w-full`}
                        >
                          Spelen
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* Progress & Achievements */}
      <motion.section 
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Learning Progress */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-fredoka text-2xl text-friendly-dark mb-6 flex items-center">
                <BookOpen className="text-coral mr-3 w-6 h-6" />
                Je Voortgang
              </h3>
              
              <div className="space-y-4">
                {categories?.map((category) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <span className="font-nunito font-semibold text-friendly-dark capitalize">
                      {t(`categories.${category.name}`)}
                    </span>
                    <div className="flex-1 ml-4">
                      <ProgressBar
                        current={category.completed}
                        total={category.total}
                        color={getCategoryColor(category.name)}
                        size="sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-fredoka text-2xl text-friendly-dark mb-6 flex items-center">
                <Trophy className="text-sunny mr-3 w-6 h-6" />
                {t('achievements')}
              </h3>
              
              <div className="grid grid-cols-3 gap-4">
                {achievements.map((achievement) => {
                  const Icon = achievement.icon;
                  return (
                    <div
                      key={achievement.id}
                      className={`text-center p-3 rounded-2xl border-2 ${
                        achievement.unlocked
                          ? "bg-success/20 border-success"
                          : "bg-gray-100 border-gray-300"
                      }`}
                    >
                      <Icon 
                        className={`w-6 h-6 mx-auto mb-2 ${
                          achievement.unlocked ? "text-success" : "text-gray-400"
                        }`}
                      />
                      <p className={`font-comic text-xs ${
                        achievement.unlocked ? "text-friendly-dark" : "text-gray-400"
                      }`}>
                        {achievement.name}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.section>

      {/* Daily Challenge */}
      <motion.section 
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="bg-gradient-to-r from-mint via-sunny to-coral rounded-3xl p-8 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="font-fredoka text-3xl text-white mb-4">Today's Challenge!</h3>
            <p className="font-nunito text-xl text-white/90 mb-6">
              Learn 5 new animal words to unlock a special surprise!
            </p>
            
            <div className="flex justify-center items-center space-x-6 mb-6">
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full ${
                      i <= 3 ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
              <span className="font-fredoka text-white text-xl">3/5</span>
            </div>
            
            <Link href="/flashcards?category=animals">
              <Button className="game-button bg-white text-coral font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all">
                <Zap className="w-5 h-5 mr-2" />
                Continue Challenge!
              </Button>
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
