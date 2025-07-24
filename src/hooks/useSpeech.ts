import { useCallback, useEffect, useRef, useState } from 'react';
import { SpeechController, SpeechControllerOptions } from '../utils/SpeechController';
import { SpeechError, SpeechSettings } from '../types';
import { globalErrorHandler } from '../utils/errorHandler';

export interface UseSpeechOptions extends Omit<SpeechControllerOptions, 'onSpeechStart' | 'onSpeechEnd' | 'onSpeechError'> {
  autoInitialize?: boolean;
}

export interface UseSpeechReturn {
  speak: (text: string) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  isSpeaking: boolean;
  isPaused: boolean;
  isLoading: boolean;
  error: string | null;
  updateSettings: (settings: Partial<SpeechSettings>) => void;
  availableVoices: SpeechSynthesisVoice[];
  currentSettings: SpeechSettings | null;
}

export const useSpeech = (options: UseSpeechOptions = {}): UseSpeechReturn => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentSettings, setCurrentSettings] = useState<SpeechSettings | null>(null);
  
  const speechControllerRef = useRef<SpeechController | null>(null);
  const { autoInitialize = true, ...controllerOptions } = options;

  const initializeSpeechController = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const controller = new SpeechController({
        ...controllerOptions,
        onSpeechStart: () => {
          setIsSpeaking(true);
          setIsPaused(false);
        },
        onSpeechEnd: () => {
          setIsSpeaking(false);
          setIsPaused(false);
        },
        onSpeechError: (errorType: SpeechError, message: string) => {
          const errorInfo = globalErrorHandler.handleSpeechError(errorType, message);
          setError(errorInfo.message);
          setIsSpeaking(false);
          setIsPaused(false);
        }
      });

      // Wait for voices to load
      await new Promise(resolve => setTimeout(resolve, 100));
      
      speechControllerRef.current = controller;
      setAvailableVoices(controller.getAvailableVoices());
      setCurrentSettings(controller.getCurrentSettings());
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize speech');
    } finally {
      setIsLoading(false);
    }
  }, [controllerOptions]);

  useEffect(() => {
    if (autoInitialize) {
      initializeSpeechController();
    }

    return () => {
      if (speechControllerRef.current) {
        speechControllerRef.current.destroy();
      }
    };
  }, [autoInitialize, initializeSpeechController]);

  const speak = useCallback(async (text: string) => {
    if (!speechControllerRef.current) {
      if (!autoInitialize) {
        await initializeSpeechController();
      } else {
        throw new Error('Speech controller not initialized');
      }
    }

    try {
      setError(null);
      await speechControllerRef.current!.speak(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Speech failed');
      throw err;
    }
  }, [autoInitialize, initializeSpeechController]);

  const pause = useCallback(() => {
    if (speechControllerRef.current) {
      speechControllerRef.current.pause();
      setIsPaused(true);
    }
  }, []);

  const resume = useCallback(() => {
    if (speechControllerRef.current) {
      speechControllerRef.current.resume();
      setIsPaused(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (speechControllerRef.current) {
      speechControllerRef.current.stop();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, []);

  const updateSettings = useCallback((newSettings: Partial<SpeechSettings>) => {
    if (speechControllerRef.current) {
      speechControllerRef.current.updateSettings(newSettings);
      setCurrentSettings(speechControllerRef.current.getCurrentSettings());
    }
  }, []);

  return {
    speak,
    pause,
    resume,
    stop,
    isSpeaking,
    isPaused,
    isLoading,
    error,
    updateSettings,
    availableVoices,
    currentSettings
  };
};