import { useState } from 'react';
import { MicIcon, StopCircleIcon, SaveIcon, EditIcon } from 'lucide-react';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';

interface VoiceRecorderProps {
  onComplete: (text: string) => void;
}

export const VoiceRecorder = ({ onComplete }: VoiceRecorderProps) => {
  const {
    isRecording,
    recordingTime,
    transcribedText,
    isRecognitionActive,
    errorMessage,
    isSupported,
    startRecording,
    stopRecording,
    setTranscribedText,
    reset,
  } = useVoiceRecorder();

  const [isEditing, setIsEditing] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleSave = () => {
    if (transcribedText.trim()) {
      onComplete(transcribedText.trim());
      reset();
      setIsEditing(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-red-50 rounded-xl border-2 border-red-200 p-6 mt-4 text-center">
        <p className="text-red-600 font-body">
          Your browser doesn't support voice recording. Please use Chrome or Safari.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border-2 border-purple-100 p-6 mt-4">
      <div className="flex flex-col items-center">
        {!isRecording && !transcribedText && (
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-purple-600 mb-2 font-body">
              Continue the Story with Your Voice!
            </h3>
            <p className="text-gray-600 font-body">
              Click the microphone and tell us what happens next
            </p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm w-full font-body">
            {errorMessage}
          </div>
        )}

        {isRecording ? (
          <div className="w-full max-w-md">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-red-500 font-bold font-body">
                  Recording... {formatTime(recordingTime)}
                </span>
              </div>
            </div>
            <div className="flex justify-center mb-4">
              <button
                onClick={stopRecording}
                className="w-20 h-20 flex items-center justify-center bg-gray-700 text-white rounded-full hover:bg-gray-800 transition-colors shadow-lg group"
              >
                <StopCircleIcon size={40} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>
            <div className="flex justify-center items-center gap-4">
              <MicIcon className="text-purple-400 animate-pulse" size={24} />
              <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 animate-pulse transition-all"
                  style={{ width: `${Math.min(recordingTime, 60) / 60 * 100}%` }}
                />
              </div>
              <MicIcon className="text-purple-400 animate-pulse" size={24} />
            </div>
            {isRecognitionActive && (
              <p className="text-center text-sm text-gray-600 mt-4 font-body">
                Speak clearly into your microphone - your words will appear below
              </p>
            )}
          </div>
        ) : (
          <div className="text-center">
            {!transcribedText && (
              <button
                onClick={startRecording}
                disabled={!!errorMessage}
                className="w-20 h-20 flex items-center justify-center bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group hover:scale-105"
              >
                <MicIcon size={40} className="group-hover:scale-110 transition-transform" />
              </button>
            )}
          </div>
        )}

        {(transcribedText || isEditing) && (
          <div className="w-full mt-6">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-purple-600 font-body">
                Your Story Continuation:
              </h4>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-purple-600 hover:text-purple-800 flex items-center gap-1"
              >
                <EditIcon size={16} />
                <span className="text-sm font-body">Edit</span>
              </button>
            </div>
            {isEditing ? (
              <textarea
                value={transcribedText}
                onChange={(e) => setTranscribedText(e.target.value)}
                className="w-full h-40 p-4 border-2 border-purple-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-700 font-body"
                placeholder="Edit your story continuation here..."
              />
            ) : (
              <div className="w-full p-4 bg-white rounded-xl border-2 border-purple-100 min-h-[10rem] text-gray-700 font-body">
                {transcribedText}
              </div>
            )}
            <div className="flex justify-center gap-3 mt-4">
              <button
                onClick={reset}
                className="py-3 px-6 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors font-body"
              >
                Start Over
              </button>
              <button
                onClick={handleSave}
                disabled={!transcribedText.trim()}
                className="flex items-center gap-2 py-3 px-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-xl shadow hover:from-purple-600 hover:to-blue-600 transition-colors disabled:opacity-50 font-body"
              >
                <SaveIcon size={20} />
                <span>Add to Story</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
