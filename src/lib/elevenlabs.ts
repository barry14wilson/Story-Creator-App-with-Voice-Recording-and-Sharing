// ============================================
// ElevenLabs Text-to-Speech Service
// ============================================
// Converts story text to audio using ElevenLabs API.
// Placeholder service — requires VITE_ELEVENLABS_API_KEY.
// Falls back to Web Speech API when no key is configured.
// ============================================

import type { AudioSegment } from '../types';
import { v4 as uuidv4 } from 'uuid';

const API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY || '';
const API_URL = 'https://api.elevenlabs.io/v1';

export const ELEVENLABS_ENABLED = !!API_KEY;

// ============================================
// Voice Types
// ============================================

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  preview_url: string;
  category: string;
  description?: string;
}

// Default voices suitable for children's stories
export const DEFAULT_VOICES: ElevenLabsVoice[] = [
  {
    voice_id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Sarah',
    preview_url: '',
    category: 'narration',
    description: 'Warm, friendly female voice — great for storytelling',
  },
  {
    voice_id: '21m00Tcm4TlvDq8ikWAM',
    name: 'Rachel',
    preview_url: '',
    category: 'narration',
    description: 'Soft, gentle female voice — perfect for younger listeners',
  },
  {
    voice_id: 'pNInz6obpgDQGcFmaJgB',
    name: 'Adam',
    preview_url: '',
    category: 'narration',
    description: 'Clear, engaging male voice — ideal for adventure stories',
  },
  {
    voice_id: 'yoZ06aMxZJJ28mfd3POQ',
    name: 'Sam',
    preview_url: '',
    category: 'narration',
    description: 'Energetic, expressive voice — great for exciting tales',
  },
];

// ============================================
// API Functions
// ============================================

/**
 * Fetch available voices from ElevenLabs API.
 * Falls back to DEFAULT_VOICES if API key not configured.
 */
export async function getAvailableVoices(): Promise<ElevenLabsVoice[]> {
  if (!API_KEY) return DEFAULT_VOICES;

  try {
    const response = await fetch(`${API_URL}/voices`, {
      headers: {
        'xi-api-key': API_KEY,
      },
    });

    if (!response.ok) {
      console.error('ElevenLabs voices API error:', response.status);
      return DEFAULT_VOICES;
    }

    const data = await response.json();
    return data.voices || DEFAULT_VOICES;
  } catch (err) {
    console.error('Failed to fetch ElevenLabs voices:', err);
    return DEFAULT_VOICES;
  }
}

/**
 * Convert text to speech using ElevenLabs API.
 * Returns a blob URL for the generated audio.
 */
export async function textToSpeech(
  text: string,
  voiceId: string,
  options?: {
    stability?: number;
    similarityBoost?: number;
    style?: number;
  }
): Promise<string | null> {
  if (!API_KEY) {
    console.warn('ElevenLabs API key not configured. Using Web Speech fallback.');
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: options?.stability ?? 0.5,
          similarity_boost: options?.similarityBoost ?? 0.75,
          style: options?.style ?? 0.5,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      console.error('ElevenLabs TTS error:', response.status);
      return null;
    }

    const audioBlob = await response.blob();
    return URL.createObjectURL(audioBlob);
  } catch (err) {
    console.error('ElevenLabs TTS failed:', err);
    return null;
  }
}

/**
 * Generate audio for a story segment using ElevenLabs.
 * Falls back to Web Speech API if unavailable.
 */
export async function generateAudioSegment(
  segmentId: string,
  text: string,
  voiceId: string
): Promise<AudioSegment> {
  const audioUrl = await textToSpeech(text, voiceId);

  if (audioUrl) {
    // Estimate duration based on word count (~150 words/min)
    const words = text.split(/\s+/).length;
    const durationMs = Math.round((words / 150) * 60 * 1000);

    return {
      id: uuidv4(),
      storySegmentId: segmentId,
      audioUrl,
      durationMs,
      status: 'done',
    };
  }

  // Return a pending segment (will use Web Speech fallback in player)
  return {
    id: uuidv4(),
    storySegmentId: segmentId,
    audioUrl: '',
    durationMs: 0,
    status: 'failed',
  };
}

/**
 * Generate audio for all story segments.
 * Returns an array of AudioSegments with progress callback.
 */
export async function generateAllAudio(
  segments: { id: string; text: string }[],
  voiceId: string,
  onProgress?: (current: number, total: number) => void
): Promise<AudioSegment[]> {
  const audioSegments: AudioSegment[] = [];

  for (let i = 0; i < segments.length; i++) {
    onProgress?.(i + 1, segments.length);

    // Skip chapter title segments (they start with **)
    if (segments[i].text.startsWith('**')) {
      audioSegments.push({
        id: uuidv4(),
        storySegmentId: segments[i].id,
        audioUrl: '',
        durationMs: 1000, // Brief pause for chapter titles
        status: 'done',
      });
      continue;
    }

    const audioSeg = await generateAudioSegment(
      segments[i].id,
      segments[i].text,
      voiceId
    );
    audioSegments.push(audioSeg);
  }

  return audioSegments;
}

// ============================================
// Web Speech API Fallback
// ============================================

/**
 * Speak text using the browser's built-in Web Speech API.
 * Used as a fallback when ElevenLabs is not configured.
 */
export function speakWithWebSpeech(
  text: string,
  options?: {
    rate?: number;
    pitch?: number;
    voiceIndex?: number;
    onEnd?: () => void;
    onBoundary?: (charIndex: number) => void;
  }
): SpeechSynthesisUtterance | null {
  if (!window.speechSynthesis) {
    console.warn('Web Speech API not supported');
    return null;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = options?.rate ?? 0.9; // Slightly slower for children
  utterance.pitch = options?.pitch ?? 1.1; // Slightly higher for friendliness

  // Select voice
  const voices = window.speechSynthesis.getVoices();
  if (options?.voiceIndex !== undefined && voices[options.voiceIndex]) {
    utterance.voice = voices[options.voiceIndex];
  } else {
    // Try to find a good English voice
    const englishVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Female'))
      || voices.find(v => v.lang.startsWith('en'));
    if (englishVoice) utterance.voice = englishVoice;
  }

  if (options?.onEnd) utterance.onend = options.onEnd;
  if (options?.onBoundary) {
    utterance.onboundary = (event) => {
      options.onBoundary!(event.charIndex);
    };
  }

  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopWebSpeech(): void {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export function pauseWebSpeech(): void {
  if (window.speechSynthesis) {
    window.speechSynthesis.pause();
  }
}

export function resumeWebSpeech(): void {
  if (window.speechSynthesis) {
    window.speechSynthesis.resume();
  }
}
