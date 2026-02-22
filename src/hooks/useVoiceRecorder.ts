import { useEffect, useState, useRef, useCallback } from 'react';
interface UseVoiceRecorderReturn {
  isRecording: boolean;
  recordingTime: number;
  transcribedText: string;
  isRecognitionActive: boolean;
  errorMessage: string | null;
  isSupported: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  setTranscribedText: (text: string) => void;
  reset: () => void;
}

export function useVoiceRecorder(): UseVoiceRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcribedText, setTranscribedText] = useState('');
  const [isRecognitionActive, setIsRecognitionActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      setIsSupported(false);
      setErrorMessage("Your browser doesn't support voice recording. Please try Chrome or Safari.");
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecognitionActive(true);
      setErrorMessage(null);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'aborted') {
        setErrorMessage(`Microphone error: ${event.error}. Please try again.`);
      }
      setIsRecognitionActive(false);
    };

    recognition.onend = () => {
      setIsRecognitionActive(false);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        }
      }
      if (finalTranscript) {
        setTranscribedText(prev => prev + finalTranscript);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  const startRecording = useCallback(async () => {
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setRecordingTime(0);
      setTranscribedText('');

      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {
          // Recognition may already be running
        }
      }

      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setErrorMessage('Could not access your microphone. Please check your browser permissions.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // May already be stopped
        }
      }

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const reset = useCallback(() => {
    stopRecording();
    setTranscribedText('');
    setRecordingTime(0);
    setErrorMessage(null);
    audioChunksRef.current = [];
  }, [stopRecording]);

  return {
    isRecording,
    recordingTime,
    transcribedText,
    isRecognitionActive: isRecognitionActive,
    errorMessage,
    isSupported,
    startRecording,
    stopRecording,
    setTranscribedText,
    reset,
  };
}
