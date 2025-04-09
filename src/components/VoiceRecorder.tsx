import React, { useEffect, useState, useRef } from 'react';
import { MicIcon, StopCircleIcon, SaveIcon, EditIcon } from 'lucide-react';
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}
interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, transcription: string) => void;
  isRecording: boolean;
  setIsRecording: (isRecording: boolean) => void;
}
export const VoiceRecorder = ({
  onRecordingComplete,
  isRecording,
  setIsRecording
}: VoiceRecorderProps) => {
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcribedText, setTranscribedText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [recognitionActive, setRecognitionActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.onstart = () => {
        setRecognitionActive(true);
        setErrorMessage(null);
      };
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setErrorMessage(`Microphone error: ${event.error}. Please try again.`);
        setRecognitionActive(false);
      };
      recognitionRef.current.onend = () => {
        setRecognitionActive(false);
      };
      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        if (finalTranscript) {
          setTranscribedText(prev => prev + finalTranscript);
        }
      };
    } else {
      setErrorMessage("Your browser doesn't support voice recording. Please try Chrome or Safari.");
    }
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);
  const startRecording = async () => {
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);
      setTranscribedText('');
      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setErrorMessage('Could not access your microphone. Please check your browser permissions.');
    }
  };
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Stop speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };
  const handleSave = () => {
    if (audioChunksRef.current.length > 0) {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: 'audio/wav'
      });
      onRecordingComplete(audioBlob, transcribedText);
    }
  };
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };
  return <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border-2 border-purple-100 p-6 mt-4">
      <div className="flex flex-col items-center">
        {!isRecording && !transcribedText && <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-purple-600 mb-2">
              Continue the Story with Your Voice!
            </h3>
            <p className="text-gray-600">
              Click the microphone and tell us what happens next in your story
            </p>
          </div>}
        {errorMessage && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm w-full">
            {errorMessage}
          </div>}
        {isRecording ? <div className="w-full max-w-md">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-red-500 font-bold">
                  Recording... {formatTime(recordingTime)}
                </span>
              </div>
            </div>
            <div className="flex justify-center mb-4">
              <button onClick={stopRecording} className="w-20 h-20 flex items-center justify-center bg-gray-700 text-white rounded-full hover:bg-gray-800 transition-colors shadow-lg group">
                <StopCircleIcon size={40} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>
            <div className="flex justify-center items-center gap-4">
              <div className="text-purple-400 animate-pulse" size={24} />
              <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 animate-pulse" style={{
              width: `${Math.min(recordingTime, 60) / 60 * 100}%`
            }} />
              </div>
              <div className="text-purple-400 animate-pulse" size={24} />
            </div>
            {recognitionActive && <p className="text-center text-sm text-gray-600 mt-4">
                Speak clearly into your microphone - your words will appear
                below
              </p>}
          </div> : <div className="text-center">
            {!transcribedText && <button onClick={startRecording} disabled={!!errorMessage} className="w-20 h-20 flex items-center justify-center bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group hover:scale-105">
                <MicIcon size={40} className="group-hover:scale-110 transition-transform" />
              </button>}
          </div>}
        {(transcribedText || isEditing) && <div className="w-full mt-6">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-purple-600">
                Your Story Continuation:
              </h4>
              <button onClick={() => setIsEditing(!isEditing)} className="text-purple-600 hover:text-purple-800 flex items-center gap-1">
                <EditIcon size={16} />
                <span className="text-sm">Edit</span>
              </button>
            </div>
            {isEditing ? <textarea value={transcribedText} onChange={e => setTranscribedText(e.target.value)} className="w-full h-40 p-4 border-2 border-purple-100 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-700" placeholder="Edit your story continuation here..." /> : <div className="w-full p-4 bg-white rounded-lg border-2 border-purple-100 min-h-[10rem] text-gray-700">
                {transcribedText}
              </div>}
            <div className="flex justify-center mt-4">
              <button onClick={handleSave} className="flex items-center gap-2 py-3 px-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-lg shadow hover:from-purple-600 hover:to-blue-600 transition-colors">
                <SaveIcon size={20} />
                <span>Add to Story</span>
              </button>
            </div>
          </div>}
      </div>
    </div>;
};