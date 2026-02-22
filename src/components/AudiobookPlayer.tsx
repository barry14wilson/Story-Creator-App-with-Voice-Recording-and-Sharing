import { useState, useCallback, useEffect, useRef } from 'react';
import {
  PlayIcon,
  PauseIcon,
  SkipForwardIcon,
  SkipBackIcon,
  Volume2Icon,
  VolumeXIcon,
  BookOpenIcon,
  ClockIcon,
  Loader2Icon,
} from 'lucide-react';
import type { Story, StorySegment, DecisionPoint } from '../types';
import {
  ELEVENLABS_ENABLED,
  speakWithWebSpeech,
  stopWebSpeech,
  pauseWebSpeech,
  resumeWebSpeech,
  textToSpeech,
} from '../lib/elevenlabs';

interface AudiobookPlayerProps {
  story: Story;
  onDecisionMade?: (decisionId: string, optionId: string) => void;
}

type PlaybackState = 'idle' | 'playing' | 'paused' | 'loading';

export const AudiobookPlayer = ({ story, onDecisionMade }: AudiobookPlayerProps) => {
  const [playbackState, setPlaybackState] = useState<PlaybackState>('idle');
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showText, setShowText] = useState(true);
  const [activeDecision, setActiveDecision] = useState<DecisionPoint | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const segments = story.segments;
  const currentSegment = segments[currentSegmentIndex];
  const decisionPoints = story.audiobook?.decisionPoints || [];
  const voiceId = story.audiobook?.voiceId || '';

  // Estimate total duration
  const totalWords = segments.reduce((sum, s) => sum + s.text.split(/\s+/).length, 0);
  const estimatedTotalMs = Math.round((totalWords / 150) * 60 * 1000);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopWebSpeech();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsedMs(prev => prev + 1000);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Check for decision points at current segment
  const checkDecisionPoint = useCallback((segIndex: number) => {
    const dp = decisionPoints.find(
      d => d.segmentIndex === segIndex && !d.selectedOptionId
    );
    if (dp) {
      setActiveDecision(dp);
      setPlaybackState('paused');
      stopTimer();
      return true;
    }
    return false;
  }, [decisionPoints, stopTimer]);

  // Play a single segment
  const playSegment = useCallback(async (index: number) => {
    if (index >= segments.length) {
      setPlaybackState('idle');
      stopTimer();
      return;
    }

    const segment = segments[index];
    setCurrentSegmentIndex(index);

    // Skip chapter titles (they start with **)
    if (segment.text.startsWith('**')) {
      // Brief pause then move on
      setTimeout(() => playSegment(index + 1), 1500);
      return;
    }

    // Check for decision point before this segment
    if (checkDecisionPoint(index)) return;

    setPlaybackState('playing');
    startTimer();

    if (ELEVENLABS_ENABLED && voiceId) {
      // ElevenLabs TTS
      setPlaybackState('loading');
      const audioUrl = await textToSpeech(segment.text, voiceId);

      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audio.muted = isMuted;
        audio.onended = () => {
          playSegment(index + 1);
        };
        audio.onerror = () => {
          // Fallback to Web Speech
          playSegmentWithWebSpeech(segment, index);
        };
        setPlaybackState('playing');
        audio.play().catch(() => playSegmentWithWebSpeech(segment, index));
      } else {
        playSegmentWithWebSpeech(segment, index);
      }
    } else {
      playSegmentWithWebSpeech(segment, index);
    }
  }, [segments, voiceId, isMuted, checkDecisionPoint, startTimer, stopTimer]);

  const playSegmentWithWebSpeech = useCallback((segment: StorySegment, index: number) => {
    setPlaybackState('playing');
    const utterance = speakWithWebSpeech(segment.text, {
      rate: 0.9,
      pitch: 1.1,
      onEnd: () => {
        playSegment(index + 1);
      },
    });
    utteranceRef.current = utterance;
  }, [playSegment]);

  // Player controls
  const handlePlay = useCallback(() => {
    if (playbackState === 'paused') {
      if (audioRef.current) {
        audioRef.current.play();
        setPlaybackState('playing');
        startTimer();
      } else {
        resumeWebSpeech();
        setPlaybackState('playing');
        startTimer();
      }
    } else {
      playSegment(currentSegmentIndex);
    }
  }, [playbackState, currentSegmentIndex, playSegment, startTimer]);

  const handlePause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    } else {
      pauseWebSpeech();
    }
    setPlaybackState('paused');
    stopTimer();
  }, [stopTimer]);

  const handleSkipForward = useCallback(() => {
    stopWebSpeech();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    const nextIndex = Math.min(currentSegmentIndex + 1, segments.length - 1);
    playSegment(nextIndex);
  }, [currentSegmentIndex, segments.length, playSegment]);

  const handleSkipBack = useCallback(() => {
    stopWebSpeech();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    const prevIndex = Math.max(currentSegmentIndex - 1, 0);
    playSegment(prevIndex);
  }, [currentSegmentIndex, playSegment]);

  const handleMuteToggle = useCallback(() => {
    setIsMuted(prev => {
      if (audioRef.current) audioRef.current.muted = !prev;
      return !prev;
    });
  }, []);

  const handleDecisionSelect = useCallback((decisionId: string, optionId: string) => {
    setActiveDecision(null);
    onDecisionMade?.(decisionId, optionId);
    // Resume playing from next segment
    playSegment(currentSegmentIndex + 1);
  }, [currentSegmentIndex, onDecisionMade, playSegment]);

  // Format time display
  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const progressPercent = estimatedTotalMs > 0
    ? Math.min(100, (elapsedMs / estimatedTotalMs) * 100)
    : 0;

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Cover & current text */}
      <div className="relative">
        {/* Cover image */}
        <div className="aspect-video bg-gradient-to-br from-purple-600 to-blue-600 relative overflow-hidden">
          {story.coverImageUrl && (
            <img
              src={story.coverImageUrl}
              alt={story.title}
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h3 className="text-lg font-display font-bold">{story.title}</h3>
            <p className="text-sm opacity-80">by {story.authorName}</p>
          </div>
        </div>

        {/* Current text display */}
        {showText && currentSegment && (
          <div className="p-4 bg-amber-50 border-b border-amber-100 max-h-48 overflow-y-auto">
            <p className="text-gray-800 font-body text-sm leading-relaxed">
              {currentSegment.text.startsWith('**')
                ? currentSegment.text.replace(/\*\*/g, '')
                : currentSegment.text}
            </p>
          </div>
        )}
      </div>

      {/* Decision Point UI */}
      {activeDecision && (
        <div className="p-4 bg-purple-50 border-b border-purple-200">
          <h4 className="text-center font-display text-purple-700 font-bold mb-3">
            {activeDecision.prompt}
          </h4>
          <div className="space-y-2">
            {activeDecision.options.map(option => (
              <button
                key={option.id}
                onClick={() => handleDecisionSelect(activeDecision.id, option.id)}
                className="w-full p-3 bg-white rounded-xl border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all text-left"
              >
                <p className="font-semibold text-purple-700 text-sm font-body">
                  {option.label}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{option.summary}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="px-4 pt-3">
        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-1000"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-400">
          <span>{formatTime(elapsedMs)}</span>
          <span>{formatTime(estimatedTotalMs)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 flex items-center justify-center gap-4">
        <button
          onClick={handleSkipBack}
          className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
          disabled={currentSegmentIndex === 0}
        >
          <SkipBackIcon size={20} />
        </button>

        <button
          onClick={playbackState === 'playing' ? handlePause : handlePlay}
          disabled={playbackState === 'loading'}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
        >
          {playbackState === 'loading' ? (
            <Loader2Icon size={24} className="animate-spin" />
          ) : playbackState === 'playing' ? (
            <PauseIcon size={24} />
          ) : (
            <PlayIcon size={24} className="ml-0.5" />
          )}
        </button>

        <button
          onClick={handleSkipForward}
          className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
          disabled={currentSegmentIndex >= segments.length - 1}
        >
          <SkipForwardIcon size={20} />
        </button>
      </div>

      {/* Bottom toolbar */}
      <div className="px-4 pb-4 flex items-center justify-between">
        <button
          onClick={handleMuteToggle}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          {isMuted ? <VolumeXIcon size={16} /> : <Volume2Icon size={16} />}
          {isMuted ? 'Unmute' : 'Mute'}
        </button>

        <button
          onClick={() => setShowText(!showText)}
          className={`flex items-center gap-1 text-xs transition-colors ${
            showText ? 'text-purple-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <BookOpenIcon size={16} />
          {showText ? 'Hide text' : 'Show text'}
        </button>

        <div className="flex items-center gap-1 text-xs text-gray-400">
          <ClockIcon size={14} />
          <span>~{story.estimatedReadMinutes} min</span>
        </div>
      </div>

      {/* Segment indicator */}
      <div className="px-4 pb-3">
        <div className="flex gap-0.5">
          {segments.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 flex-1 rounded-full transition-colors ${
                idx < currentSegmentIndex
                  ? 'bg-purple-400'
                  : idx === currentSegmentIndex
                  ? 'bg-purple-600'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
