import { useState, useEffect } from 'react';
import { Volume2Icon, PlayIcon, Loader2Icon } from 'lucide-react';
import { getAvailableVoices, ELEVENLABS_ENABLED, speakWithWebSpeech, stopWebSpeech } from '../lib/elevenlabs';
import type { ElevenLabsVoice } from '../lib/elevenlabs';

interface VoiceSelectorProps {
  selectedVoiceId: string;
  onSelectVoice: (voiceId: string) => void;
}

export const VoiceSelector = ({ selectedVoiceId, onSelectVoice }: VoiceSelectorProps) => {
  const [voices, setVoices] = useState<ElevenLabsVoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewingId, setPreviewingId] = useState<string | null>(null);

  useEffect(() => {
    getAvailableVoices().then(v => {
      setVoices(v);
      setLoading(false);
      // Select first voice by default if none selected
      if (!selectedVoiceId && v.length > 0) {
        onSelectVoice(v[0].voice_id);
      }
    });
  }, [selectedVoiceId, onSelectVoice]);

  const handlePreview = (voice: ElevenLabsVoice) => {
    if (previewingId === voice.voice_id) {
      stopWebSpeech();
      setPreviewingId(null);
      return;
    }

    setPreviewingId(voice.voice_id);
    const sampleText = 'Once upon a time, in a magical land far away, there lived a brave little hero.';

    if (ELEVENLABS_ENABLED && voice.preview_url) {
      const audio = new Audio(voice.preview_url);
      audio.onended = () => setPreviewingId(null);
      audio.play().catch(() => setPreviewingId(null));
    } else {
      // Web Speech fallback preview
      speakWithWebSpeech(sampleText, {
        onEnd: () => setPreviewingId(null),
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2Icon size={20} className="animate-spin text-purple-500 mr-2" />
        <span className="text-sm text-gray-500">Loading voices...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Volume2Icon size={18} className="text-purple-500" />
        <h4 className="text-sm font-semibold text-gray-700 font-body">
          Choose a Narrator Voice
        </h4>
        {!ELEVENLABS_ENABLED && (
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
            Browser voices
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {voices.map(voice => (
          <button
            key={voice.voice_id}
            type="button"
            onClick={() => onSelectVoice(voice.voice_id)}
            className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
              selectedVoiceId === voice.voice_id
                ? 'bg-purple-100 border-2 border-purple-400 shadow-sm'
                : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
            }`}
          >
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-800 font-body">{voice.name}</p>
              {voice.description && (
                <p className="text-xs text-gray-500 truncate">{voice.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePreview(voice);
              }}
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                previewingId === voice.voice_id
                  ? 'bg-purple-500 text-white'
                  : 'bg-white text-purple-500 hover:bg-purple-50'
              }`}
            >
              <PlayIcon size={14} />
            </button>
          </button>
        ))}
      </div>
    </div>
  );
};
