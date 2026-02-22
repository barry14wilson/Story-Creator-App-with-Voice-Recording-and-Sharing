import { useState } from 'react';
import { MicIcon, TypeIcon, BookOpenIcon, SparklesIcon, Loader2Icon, ImageIcon } from 'lucide-react';
import { VoiceRecorder } from './VoiceRecorder';
import { TextInput } from './TextInput';
import type { StorySegment } from '../types';

interface StoryDisplayProps {
  storyTitle: string;
  storyImage: string;
  segments: StorySegment[];
  onAddUserText: (text: string) => void;
  onRobynReads: () => void;
  isGenerating: boolean;
  authorName: string;
}

export const StoryDisplay = ({
  storyTitle,
  storyImage,
  segments,
  onAddUserText,
  onRobynReads,
  isGenerating,
  authorName,
}: StoryDisplayProps) => {
  const [showInput, setShowInput] = useState(false);
  const [inputMethod, setInputMethod] = useState<'voice' | 'text'>('text');

  const handleAddText = (text: string) => {
    onAddUserText(text);
    setShowInput(false);
  };

  return (
    <div className="space-y-6">
      {/* Story Card */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Cover Image */}
        <div className="relative aspect-[16/9]">
          <img
            src={storyImage}
            alt="Story scene"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-2xl md:text-3xl font-display text-white drop-shadow-lg">
              {storyTitle}
            </h2>
            <p className="text-white/80 text-sm font-body mt-1">
              By {authorName}
            </p>
          </div>
        </div>

        {/* Story Segments - PRD: App text = black, User text = purple */}
        <div className="p-6 space-y-4">
          {segments.map((segment) => (
            <div
              key={segment.id}
              className={segment.author === 'ai' ? 'story-segment-ai' : 'story-segment-user'}
            >
              <p className={`whitespace-pre-line font-body leading-relaxed ${
                segment.author === 'ai' ? 'story-text-ai' : 'story-text-user'
              }`}>
                {segment.text}
              </p>

              {/* Illustration thumbnail preview */}
              {segment.illustrationStatus === 'generating' && (
                <div className="mt-3 flex items-center gap-2 text-purple-400">
                  <Loader2Icon size={14} className="animate-spin" />
                  <span className="text-xs font-body">Creating illustration...</span>
                </div>
              )}
              {segment.illustrationUrl && segment.illustrationStatus === 'done' && (
                <div className="mt-3">
                  <div className="inline-flex items-center gap-1.5 text-xs text-purple-500 font-body mb-1.5">
                    <ImageIcon size={12} />
                    <span>
                      {segment.illustrationSize === 'full' ? 'Full-page' : 'Half-page'} illustration
                    </span>
                  </div>
                  <img
                    src={segment.illustrationUrl}
                    alt="Illustration preview"
                    className="max-w-[200px] rounded-lg shadow-md border border-purple-100"
                  />
                </div>
              )}

              <span className={`text-xs mt-2 block ${
                segment.author === 'ai' ? 'text-amber-500' : 'text-purple-400'
              }`}>
                {segment.author === 'ai' ? 'Robyn Reads' : 'You wrote this!'}
              </span>
            </div>
          ))}

          {isGenerating && (
            <div className="story-segment-ai animate-pulse">
              <div className="flex items-center gap-2">
                <SparklesIcon size={16} className="text-amber-500 animate-spin" />
                <span className="text-gray-500 font-body">Robyn is writing...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {!showInput && !isGenerating && (
        <div className="flex flex-col sm:flex-row justify-center gap-3 no-print">
          <button
            onClick={() => setShowInput(true)}
            className="flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold rounded-xl shadow-lg hover:from-purple-600 hover:to-blue-600 transition-all hover:scale-105 font-body"
          >
            <TypeIcon size={20} />
            Continue the Story
          </button>
          <button
            onClick={onRobynReads}
            className="flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-amber-400 to-orange-400 text-white font-bold rounded-xl shadow-lg hover:from-amber-500 hover:to-orange-500 transition-all hover:scale-105 font-body"
          >
            <BookOpenIcon size={20} />
            Robyn Reads
          </button>
        </div>
      )}

      {/* Input Method Toggle + Input */}
      {showInput && (
        <div className="no-print">
          <div className="flex justify-center mb-2 space-x-3">
            <button
              onClick={() => setInputMethod('text')}
              className={`flex items-center gap-2 py-2 px-5 rounded-xl transition-all font-body font-semibold ${
                inputMethod === 'text'
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              }`}
            >
              <TypeIcon size={18} />
              <span>Type</span>
            </button>
            <button
              onClick={() => setInputMethod('voice')}
              className={`flex items-center gap-2 py-2 px-5 rounded-xl transition-all font-body font-semibold ${
                inputMethod === 'voice'
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              }`}
            >
              <MicIcon size={18} />
              <span>Voice</span>
            </button>
            <button
              onClick={() => setShowInput(false)}
              className="py-2 px-4 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors font-body font-semibold"
            >
              Cancel
            </button>
          </div>
          {inputMethod === 'voice' ? (
            <VoiceRecorder onComplete={handleAddText} />
          ) : (
            <TextInput onComplete={handleAddText} />
          )}
        </div>
      )}
    </div>
  );
};
