import { useState, useEffect, useRef, useCallback } from 'react';

// Clean text for natural speech synthesis (strip markdown and code formatting)
export const cleanTextForSpeech = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/```[\s\S]*?```/g, ' [code snippet omitted] ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[Excerpt \d+\]:/gi, '')
    .replace(/#{1,6}\s+/g, '')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/[•\-\*]\s+/g, '. ')
    .replace(/\n+/g, '. ')
    .replace(/\s+/g, ' ')
    .trim();
};

export const useVoiceAssistant = () => {
  // Speech-to-Text State
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  // Text-to-Speech State
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check Speech Recognition support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setSpeechSupported(true);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Start speech recognition listening
  const startListening = useCallback(
    (onTranscript: (text: string) => void) => {
      setMicError(null);
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setMicError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
        return;
      }

      try {
        if (recognitionRef.current) {
          recognitionRef.current.abort();
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript) {
            onTranscript(transcript);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('[SpeechRecognition Error]', event.error);
          if (event.error === 'not-allowed') {
            setMicError('Microphone permission was denied. Please allow microphone access in your browser.');
          } else if (event.error !== 'no-speech') {
            setMicError(`Voice input error: ${event.error}`);
          }
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err: any) {
        console.error('[Voice start error]', err);
        setMicError('Could not start voice recognition.');
        setIsListening(false);
      }
    },
    []
  );

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  // Stop any active speech
  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingId(null);
  }, []);

  // Text-to-Speech speak
  const speak = useCallback(
    (text: string, id: string) => {
      if (!('speechSynthesis' in window)) {
        console.warn('Speech synthesis is not supported in this browser.');
        return;
      }

      window.speechSynthesis.cancel();

      const cleaned = cleanTextForSpeech(text);
      if (!cleaned) return;

      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.lang = 'en-US';

      // Pick high quality natural voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Google') ||
            v.name.includes('Natural') ||
            v.name.includes('Samantha') ||
            v.name.includes('Daniel'))
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        setSpeakingId(id);
      };

      utterance.onend = () => {
        setSpeakingId(null);
      };

      utterance.onerror = () => {
        setSpeakingId(null);
      };

      window.speechSynthesis.speak(utterance);
    },
    []
  );

  // Toggle speak for a specific message
  const toggleSpeak = useCallback(
    (text: string, id: string) => {
      if (speakingId === id) {
        stopSpeaking();
      } else {
        speak(text, id);
      }
    },
    [speakingId, speak, stopSpeaking]
  );

  return {
    isListening,
    speechSupported,
    micError,
    startListening,
    stopListening,
    speakingId,
    speak,
    stopSpeaking,
    toggleSpeak,
  };
};
