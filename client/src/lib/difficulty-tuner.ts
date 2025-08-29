export interface DifficultySettings {
  maxOptions: number;
  showHints: boolean;
  showDutchOnSecondMistake: boolean;
  extraTime: boolean;
  fontSize: 'normal' | 'large' | 'extra-large';
  dyslexiaFriendly: boolean;
}

export interface GameSession {
  attempts: boolean[];
  currentStreak: number;
  mistakeCount: number;
  startTime: Date;
  wordId: string;
}

export class DifficultyTuner {
  private static readonly DEFAULT_SETTINGS: DifficultySettings = {
    maxOptions: 4,
    showHints: false,
    showDutchOnSecondMistake: false,
    extraTime: false,
    fontSize: 'normal',
    dyslexiaFriendly: false
  };

  static getInitialSettings(): DifficultySettings {
    const saved = localStorage.getItem('difficulty_settings');
    if (saved) {
      try {
        return { ...this.DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch (error) {
        console.warn('Failed to parse saved difficulty settings:', error);
      }
    }
    return { ...this.DEFAULT_SETTINGS };
  }

  static saveSettings(settings: DifficultySettings): void {
    try {
      localStorage.setItem('difficulty_settings', JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save difficulty settings:', error);
    }
  }

  static adjustDifficulty(
    currentSettings: DifficultySettings,
    recentAttempts: boolean[]
  ): DifficultySettings {
    if (recentAttempts.length < 5) {
      return currentSettings;
    }

    const recent5 = recentAttempts.slice(-5);
    const accuracy = recent5.filter(Boolean).length / 5;

    // If accuracy is below 70%, make it easier
    if (accuracy < 0.7) {
      return {
        ...currentSettings,
        maxOptions: Math.max(2, currentSettings.maxOptions - 1),
        showHints: true,
        extraTime: true
      };
    }

    // If accuracy is above 90% for last 10 attempts, make it harder
    if (recentAttempts.length >= 10) {
      const recent10 = recentAttempts.slice(-10);
      const highAccuracy = recent10.filter(Boolean).length / 10;
      
      if (highAccuracy > 0.9) {
        return {
          ...currentSettings,
          maxOptions: Math.min(6, currentSettings.maxOptions + 1),
          showHints: false,
          extraTime: false
        };
      }
    }

    return currentSettings;
  }

  static shouldShowDutchHint(session: GameSession): boolean {
    return session.mistakeCount >= 2;
  }

  static getTimeLimit(settings: DifficultySettings, baseTime: number): number {
    return settings.extraTime ? baseTime * 1.5 : baseTime;
  }

  static getFontSizeClass(settings: DifficultySettings): string {
    switch (settings.fontSize) {
      case 'large': return 'text-lg';
      case 'extra-large': return 'text-xl';
      default: return 'text-base';
    }
  }

  static getDyslexiaFriendlyClass(settings: DifficultySettings): string {
    return settings.dyslexiaFriendly 
      ? 'font-dyslexic tracking-wide leading-relaxed' 
      : '';
  }

  static createGameSession(wordId: string): GameSession {
    return {
      attempts: [],
      currentStreak: 0,
      mistakeCount: 0,
      startTime: new Date(),
      wordId
    };
  }

  static updateGameSession(
    session: GameSession, 
    correct: boolean
  ): GameSession {
    const newSession = {
      ...session,
      attempts: [...session.attempts, correct]
    };

    if (correct) {
      newSession.currentStreak = session.currentStreak + 1;
    } else {
      newSession.currentStreak = 0;
      newSession.mistakeCount = session.mistakeCount + 1;
    }

    return newSession;
  }
}