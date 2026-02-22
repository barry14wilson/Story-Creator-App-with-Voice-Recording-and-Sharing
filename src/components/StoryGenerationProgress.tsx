import { BookOpenIcon, Loader2Icon, CheckCircleIcon, PenToolIcon, SparklesIcon } from 'lucide-react';
import type { GenerationProgress } from '../lib/storyGenerator';

interface StoryGenerationProgressProps {
  progress: GenerationProgress | null;
}

export const StoryGenerationProgress = ({ progress }: StoryGenerationProgressProps) => {
  if (!progress) return null;

  const phaseIcons = {
    outline: <PenToolIcon size={24} className="text-purple-500" />,
    chapter: <BookOpenIcon size={24} className="text-blue-500" />,
    decision: <SparklesIcon size={24} className="text-amber-500" />,
    complete: <CheckCircleIcon size={24} className="text-green-500" />,
  };

  const phaseColors = {
    outline: 'from-purple-500 to-purple-400',
    chapter: 'from-blue-500 to-blue-400',
    decision: 'from-amber-500 to-amber-400',
    complete: 'from-green-500 to-green-400',
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 text-center">
      <div className="mb-6">
        {progress.phase !== 'complete' ? (
          <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Loader2Icon size={40} className="text-purple-500 animate-spin" />
          </div>
        ) : (
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon size={40} className="text-green-500" />
          </div>
        )}

        <h3 className="text-xl font-display text-gray-800 mb-2">
          {progress.phase === 'complete' ? 'Story Complete!' : 'Creating Your Story...'}
        </h3>
        <p className="text-gray-500 font-body text-sm">{progress.message}</p>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-3 mb-4 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${phaseColors[progress.phase]} transition-all duration-700 ease-out`}
          style={{ width: `${progress.percentComplete}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>{progress.percentComplete}%</span>
        {progress.totalChapters > 0 && (
          <span>
            Chapter {progress.currentChapter} of {progress.totalChapters}
          </span>
        )}
      </div>

      {/* Phase indicators */}
      <div className="flex justify-center gap-4 mt-6">
        {(['outline', 'chapter', 'decision', 'complete'] as const).map(phase => {
          const isActive = progress.phase === phase;
          const isPast =
            ['outline', 'chapter', 'decision', 'complete'].indexOf(progress.phase) >
            ['outline', 'chapter', 'decision', 'complete'].indexOf(phase);

          return (
            <div
              key={phase}
              className={`flex flex-col items-center gap-1 transition-opacity ${
                isActive ? 'opacity-100' : isPast ? 'opacity-60' : 'opacity-30'
              }`}
            >
              {phaseIcons[phase]}
              <span className="text-xs text-gray-500 capitalize font-body">{phase}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
