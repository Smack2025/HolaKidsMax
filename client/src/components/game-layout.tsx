import { ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "./progress-bar";
import { useLocation } from "wouter";

interface GameLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  currentQuestion?: number;
  totalQuestions?: number;
  onBack?: () => void;
  color?: "coral" | "mint" | "sunny" | "success";
}

export function GameLayout({
  children,
  title,
  subtitle,
  currentQuestion,
  totalQuestions,
  onBack,
  color = "coral"
}: GameLayoutProps) {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      setLocation("/");
    }
  };

  const colorClasses = {
    coral: "from-coral to-sunny",
    mint: "from-mint to-coral",
    sunny: "from-sunny to-mint",
    success: "from-success to-mint"
  };

  return (
    <div className="min-h-screen bg-soft-white">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl border-4 border-gray-100 overflow-hidden max-w-6xl mx-auto mt-8"
      >
        {/* Game Header */}
        <div className={`bg-gradient-to-r ${colorClasses[color]} p-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="w-12 h-12 bg-white/20 rounded-full p-0 hover:bg-white/30"
              >
                <ArrowLeft className="text-white w-5 h-5" />
              </Button>
              <div>
                <h3 className="font-fredoka text-2xl text-white">{title}</h3>
                {subtitle && (
                  <p className="font-nunito text-white/90">{subtitle}</p>
                )}
              </div>
            </div>
            
            {/* Progress Bar */}
            {currentQuestion && totalQuestions && (
              <div className="flex items-center space-x-3">
                <div className="w-32 h-3 bg-white/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white rounded-full transition-all duration-300"
                    style={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
                  />
                </div>
                <span className="font-nunito font-bold text-white">
                  {currentQuestion}/{totalQuestions}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Game Content */}
        <div className="p-8">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
