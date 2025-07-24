import { SpeechError, SpeechSettings } from '../types';
import { ErrorMessages } from './errorHandler';

export interface SpeechControllerOptions {
  settings?: Partial<SpeechSettings>;
  language?: string;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onSpeechError?: (error: SpeechError, message: string) => void;
}

export class SpeechController {
  private synthesis: SpeechSynthesis;

  private voices: SpeechSynthesisVoice[] = [];
  private settings: SpeechSettings;
  private onSpeechStart?: () => void;
  private onSpeechEnd?: () => void;
  private onSpeechError?: (error: SpeechError, message: string) => void;

  constructor(options: SpeechControllerOptions = {}) {
    // Check if speech synthesis is supported
    if (!('speechSynthesis' in window)) {
      throw new Error(this.getErrorMessage(SpeechError.NOT_SUPPORTED));
    }

    this.synthesis = window.speechSynthesis;
    
    // Default speech settings
    this.settings = {
      rate: 1,
      pitch: 1,
      volume: 1,
      voice: '',
      ...options.settings
    };

    this.onSpeechStart = options.onSpeechStart;
    this.onSpeechEnd = options.onSpeechEnd;
    this.onSpeechError = options.onSpeechError;

    this.initializeVoices();
  }

  private async initializeVoices(): Promise<void> {
    return new Promise((resolve) => {
      const loadVoices = () => {
        this.voices = this.synthesis.getVoices();
        if (this.voices.length > 0) {
          this.selectOptimalVoice();
          resolve();
        }
      };

      // Load voices immediately if available
      loadVoices();

      // Listen for voices changed event (some browsers load voices asynchronously)
      this.synthesis.addEventListener('voiceschanged', loadVoices);
      
      // Fallback timeout
      setTimeout(() => {
        if (this.voices.length === 0) {
          this.handleError(SpeechError.NO_VOICES);
        }
        resolve();
      }, 1000);
    });
  }

  private selectOptimalVoice(): void {
    // Try to find English voice for English text
    const englishVoices = this.voices.filter(voice => 
      voice.lang.startsWith('en') && voice.localService
    );
    
    if (englishVoices.length > 0) {
      this.settings.voice = englishVoices[0].name;
    } else {
      // Fallback to any English voice
      const anyEnglishVoice = this.voices.find(voice => voice.lang.startsWith('en'));
      if (anyEnglishVoice) {
        this.settings.voice = anyEnglishVoice.name;
      }
    }
  }

  private getErrorMessage(error: SpeechError): string {
    return ErrorMessages[error] || '發生未知的語音錯誤';
  }

  private handleError(error: SpeechError): void {
    const message = this.getErrorMessage(error);
    if (this.onSpeechError) {
      this.onSpeechError(error, message);
    }
  }

  public async speak(text: string): Promise<void> {
    if (!text.trim()) {
      return;
    }

    // Stop any current speech
    this.stop();

    return new Promise((resolve, reject) => {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Apply settings
        utterance.rate = this.settings.rate;
        utterance.pitch = this.settings.pitch;
        utterance.volume = this.settings.volume;
        
        // Set voice if available
        if (this.settings.voice) {
          const selectedVoice = this.voices.find(voice => voice.name === this.settings.voice);
          if (selectedVoice) {
            utterance.voice = selectedVoice;
          }
        }

        // Set language for English text
        utterance.lang = 'en-US';

        // Event handlers
        utterance.onstart = () => {
          if (this.onSpeechStart) {
            this.onSpeechStart();
          }
        };

        utterance.onend = () => {
          if (this.onSpeechEnd) {
            this.onSpeechEnd();
          }
          resolve();
        };

        utterance.onerror = (_event) => {
          this.handleError(SpeechError.SYNTHESIS_FAILED);
          reject(new Error(this.getErrorMessage(SpeechError.SYNTHESIS_FAILED)));
        };
        this.synthesis.speak(utterance);

      } catch (error) {
        this.handleError(SpeechError.SYNTHESIS_FAILED);
        reject(error);
      }
    });
  }

  public pause(): void {
    if (this.synthesis.speaking && !this.synthesis.paused) {
      this.synthesis.pause();
    }
  }

  public resume(): void {
    if (this.synthesis.paused) {
      this.synthesis.resume();
    }
  }

  public stop(): void {
    if (this.synthesis.speaking || this.synthesis.pending) {
      this.synthesis.cancel();
    }
  }

  public isSpeaking(): boolean {
    return this.synthesis.speaking;
  }

  public isPaused(): boolean {
    return this.synthesis.paused;
  }

  public updateSettings(newSettings: Partial<SpeechSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    
    // If voice changed, validate it exists
    if (newSettings.voice) {
      const voiceExists = this.voices.some(voice => voice.name === newSettings.voice);
      if (!voiceExists) {
        this.selectOptimalVoice();
      }
    }
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices.filter(voice => voice.lang.startsWith('en'));
  }

  public getCurrentSettings(): SpeechSettings {
    return { ...this.settings };
  }

  public destroy(): void {
    this.stop();
    this.synthesis.removeEventListener('voiceschanged', this.initializeVoices);
  }
}