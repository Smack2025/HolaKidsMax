import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Star, Settings, Home, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import type { UserStats } from "@shared/schema";
import { DEFAULT_USER_ID } from "../lib/constants";

export function Navigation() {
  const [location] = useLocation();
  const { t } = useTranslation();
  
  const { data: stats } = useQuery<UserStats>({
    queryKey: ["/api/stats", DEFAULT_USER_ID],
    refetchInterval: false,
  });

  return (
    <nav className="bg-white shadow-lg rounded-b-3xl px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center space-x-3 cursor-pointer">
            <div className="w-12 h-12 bg-gradient-to-r from-coral to-sunny rounded-full flex items-center justify-center">
              <BookOpen className="text-white text-xl" />
            </div>
            <h1 className="font-fredoka text-2xl text-friendly-dark">{t('title')}</h1>
          </div>
        </Link>
        
        <div className="flex items-center space-x-4">
          {/* Progress Display */}
          <div className="bg-mint/20 rounded-full px-4 py-2 flex items-center space-x-2">
            <Star className="text-sunny w-5 h-5" />
            <span className="font-nunito font-bold text-friendly-dark">
              {stats?.totalStars || 0}
            </span>
          </div>
          
          {/* Navigation Links */}
          <Link href="/">
            <Button 
              variant={location === "/" ? "default" : "ghost"} 
              size="sm"
              className="rounded-full"
            >
              <Home className="w-4 h-4 mr-2" />
              {t('home')}
            </Button>
          </Link>
          
          {/* Settings Button */}
          <Button 
            variant="ghost" 
            size="sm"
            className="w-10 h-10 p-0 rounded-full bg-gray-100 hover:bg-gray-200"
          >
            <Settings className="w-4 h-4 text-friendly-dark" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
