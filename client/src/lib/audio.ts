interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: ((ev: Event) => void) | null;
  onresult: ((ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((ev: Event) => void) | null;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

interface TTSOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

interface SpeechOptions {
  lang?: string;
  timeout?: number;
  continuous?: boolean;
}

export class AudioManager {
  private audioContext: AudioContext | null = null;
  private isInitialized = false;
  private isMuted: boolean = false;
  private classroomMode: boolean = false;

  constructor() {
    this.checkClassroomMode();
  }

  private checkClassroomMode() {
    const urlParams = new URLSearchParams(window.location.search);
    this.classroomMode = urlParams.get('mode') === 'class';
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext!)();
      this.isInitialized = true;
    } catch (error) {
      console.warn("Web Audio API not supported:", error);
    }
  }

  // Enhanced Text-to-Speech with fallbacks
  async speak(text: string, options: TTSOptions = {}): Promise<void> {
    if (this.isMuted) return;

    const {
      lang = 'es-ES',
      rate = this.classroomMode ? 0.7 : 0.8,
      pitch = 1.2,
      volume = this.classroomMode ? 0.6 : 0.8
    } = options;

    return new Promise((resolve, reject) => {
      try {
        if ('speechSynthesis' in window) {
          speechSynthesis.cancel();

          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = lang;
          utterance.rate = rate;
          utterance.pitch = pitch;
          utterance.volume = volume;

          utterance.onend = () => resolve();
          utterance.onerror = (event) => {
            console.warn('TTS error:', event.error);
            this.fallbackSpeak(text).then(resolve).catch(reject);
          };

          const voices = speechSynthesis.getVoices();
          const spanishVoice = voices.find(voice => 
            voice.lang.startsWith('es') || voice.lang.includes('ES')
          );
          
          if (spanishVoice) {
            utterance.voice = spanishVoice;
          }

          speechSynthesis.speak(utterance);

          setTimeout(() => {
            if (speechSynthesis.speaking) {
              speechSynthesis.cancel();
              this.fallbackSpeak(text).then(resolve).catch(reject);
            }
          }, 5000);

        } else {
          this.fallbackSpeak(text).then(resolve).catch(reject);
        }
      } catch (error) {
        console.warn('Speech synthesis failed:', error);
        this.fallbackSpeak(text).then(resolve).catch(reject);
      }
    });
  }

  private async fallbackSpeak(text: string): Promise<void> {
    try {
      if (!this.audioContext) await this.initialize();
      if (!this.audioContext) return;

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
      
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.2);
      
      return new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.warn('Fallback audio failed:', error);
    }
  }

  // Speech Recognition with robust error handling
  async listen(options: SpeechOptions = {}): Promise<string> {
    const {
      lang = 'es-ES',
      timeout = 5000,
      continuous = false
    } = options;

    return new Promise((resolve, reject) => {
      try {
        const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognitionClass) {
          reject(new Error('Speech recognition not supported'));
          return;
        }
        const recognition = new SpeechRecognitionClass();

        recognition.continuous = continuous;
        recognition.interimResults = false;
        recognition.lang = lang;
        recognition.maxAlternatives = 1;

        let timeoutId: NodeJS.Timeout;

        const cleanup = () => {
          if (timeoutId) clearTimeout(timeoutId);
          try {
            recognition.stop();
          } catch (e) {
            // Ignore cleanup errors
          }
        };

        recognition.onstart = () => {
          timeoutId = setTimeout(() => {
            cleanup();
            reject(new Error('Speech recognition timeout'));
          }, timeout);
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          cleanup();
          const result = event.results[0][0].transcript;
          resolve(result.toLowerCase().trim());
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          cleanup();
          reject(new Error(`Speech recognition error: ${event.error}`));
        };

        recognition.onend = () => {
          cleanup();
        };

        recognition.start();

      } catch (error) {
        reject(new Error(`Failed to initialize speech recognition: ${error}`));
      }
    });
  }

  async playPronunciation(word: string): Promise<void> {
    return this.speak(word);
  }

  async playSuccessSound(): Promise<void> {
    if (this.isMuted || this.classroomMode) return;
    if (!this.audioContext) await this.initialize();
    if (!this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(523.25, this.audioContext.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, this.audioContext.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, this.audioContext.currentTime + 0.2); // G5
      
      const volume = this.classroomMode ? 0.1 : 0.3;
      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.5);
    } catch (error) {
      console.warn("Could not play success sound:", error);
    }
  }

  async playErrorSound(): Promise<void> {
    if (this.isMuted || this.classroomMode) return;
    if (!this.audioContext) await this.initialize();
    if (!this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(220, this.audioContext.currentTime); // A3
      oscillator.frequency.setValueAtTime(196, this.audioContext.currentTime + 0.2); // G3
      
      const volume = this.classroomMode ? 0.1 : 0.2;
      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.4);
    } catch (error) {
      console.warn("Could not play error sound:", error);
    }
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      speechSynthesis.cancel();
    }
  }

  isMutedState(): boolean {
    return this.isMuted;
  }

  isClassroomMode(): boolean {
    return this.classroomMode;
  }
}

export const audioManager = new AudioManager();
