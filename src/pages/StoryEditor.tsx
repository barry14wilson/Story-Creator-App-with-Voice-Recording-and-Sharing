import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SaveIcon, BookIcon, Loader2Icon, CheckCircleIcon, PlusIcon } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { StoryCreator } from '../components/StoryCreator';
import { StoryDisplay } from '../components/StoryDisplay';
import { useAuth } from '../context/AuthContext';
import { saveStory, getUserStoryCount } from '../lib/firebase';
import {
  generateStoryBeginning,
  generateStoryContinuation,
  generateSynopsis,
  generateIllustration,
  generateCoverIllustration,
} from '../lib/storyAI';
import type { Story, StorySegment, StoryCreationParams } from '../types';
import {
  getStoryImage,
  TIER_LIMITS,
  getIllustrationConfig,
  shouldSegmentHaveIllustration,
} from '../types';

export const StoryEditor = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const tier = profile?.tier || 'free';

  const [storyCreated, setStoryCreated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [storyParams, setStoryParams] = useState<StoryCreationParams | null>(null);
  const [story, setStory] = useState<Story | null>(null);

  // --------------------------------------------------
  // Helper: generate illustration for a segment async
  // Updates story state as each image completes.
  // --------------------------------------------------
  const generateSegmentIllustration = useCallback(
    (segmentId: string, segmentText: string, segmentIndex: number, params: StoryCreationParams) => {
      const config = getIllustrationConfig(params.childAge);

      // Mark segment as generating
      setStory(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          segments: prev.segments.map(s =>
            s.id === segmentId
              ? { ...s, illustrationSize: config.size, illustrationStatus: 'generating' as const }
              : s
          ),
        };
      });

      // Fire-and-forget async generation
      generateIllustration(
        segmentText,
        params.characters,
        params.place,
        params.childAge,
        config.size,
        segmentIndex
      )
        .then(url => {
          setStory(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              segments: prev.segments.map(s =>
                s.id === segmentId
                  ? { ...s, illustrationUrl: url, illustrationStatus: 'done' as const }
                  : s
              ),
            };
          });
        })
        .catch(() => {
          setStory(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              segments: prev.segments.map(s =>
                s.id === segmentId
                  ? { ...s, illustrationStatus: 'failed' as const }
                  : s
              ),
            };
          });
        });
    },
    []
  );

  // --------------------------------------------------
  // Create Story
  // --------------------------------------------------
  const handleCreateStory = useCallback(async (params: StoryCreationParams) => {
    setIsGenerating(true);
    setStoryParams(params);

    try {
      const segments = await generateStoryBeginning(params, params.introLength);
      const title = `${params.action} in ${params.place}`;

      // Start with place-based fallback cover, upgrade async
      const fallbackCover = getStoryImage(params.place);

      const newStory: Story = {
        id: uuidv4(),
        userId: user?.uid || '',
        title,
        synopsis: '',
        coverImageUrl: fallbackCover,
        childAge: params.childAge,
        characters: params.characters,
        place: params.place,
        action: params.action,
        segments,
        authorName: profile?.displayName || user?.displayName || 'Young Author',
        isComplete: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setStory(newStory);
      setStoryCreated(true);

      // --- Async illustration generation ---
      // 1. Cover illustration (non-blocking)
      generateCoverIllustration(title, params.characters, params.place, params.childAge)
        .then(coverUrl => {
          setStory(prev => prev ? { ...prev, coverImageUrl: coverUrl } : prev);
        })
        .catch(() => {/* keep fallback cover */});

      // 2. Segment illustrations based on age rules
      segments.forEach((seg, idx) => {
        if (shouldSegmentHaveIllustration(idx, params.childAge)) {
          generateSegmentIllustration(seg.id, seg.text, idx, params);
        }
      });
    } catch (err) {
      console.error('Failed to generate story:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [user, profile, generateSegmentIllustration]);

  // --------------------------------------------------
  // Add User Text
  // --------------------------------------------------
  const handleAddUserText = useCallback((text: string) => {
    if (!story || !storyParams) return;

    const newSegment: StorySegment = {
      id: uuidv4(),
      text,
      author: 'user',
      timestamp: new Date().toISOString(),
    };

    const newIndex = story.segments.length; // index of the new segment

    setStory(prev => prev ? {
      ...prev,
      segments: [...prev.segments, newSegment],
      updatedAt: new Date().toISOString(),
    } : prev);

    // Check if this segment needs an illustration
    if (shouldSegmentHaveIllustration(newIndex, storyParams.childAge)) {
      generateSegmentIllustration(newSegment.id, text, newIndex, storyParams);
    }
  }, [story, storyParams, generateSegmentIllustration]);

  // --------------------------------------------------
  // Robyn Reads (AI continuation)
  // --------------------------------------------------
  const handleRobynReads = useCallback(async () => {
    if (!story || !storyParams) return;
    setIsGenerating(true);

    try {
      const fullText = story.segments.map(s => s.text).join('\n\n');
      const newSegment = await generateStoryContinuation(storyParams, fullText);
      const newIndex = story.segments.length;

      setStory(prev => prev ? {
        ...prev,
        segments: [...prev.segments, newSegment],
        updatedAt: new Date().toISOString(),
      } : prev);

      // Check if this segment needs an illustration
      if (shouldSegmentHaveIllustration(newIndex, storyParams.childAge)) {
        generateSegmentIllustration(newSegment.id, newSegment.text, newIndex, storyParams);
      }
    } catch (err) {
      console.error('Failed to generate continuation:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [story, storyParams, generateSegmentIllustration]);

  // --------------------------------------------------
  // Save Story
  // --------------------------------------------------
  const handleSaveStory = useCallback(async () => {
    if (!story || !user) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const count = await getUserStoryCount(user.uid);
      const limit = TIER_LIMITS[tier].maxSavedStories;
      if (count >= limit) {
        setSaveError(`You've reached the maximum of ${limit} saved stories for your plan. Upgrade to Pro for unlimited stories!`);
        setIsSaving(false);
        return;
      }

      const fullText = story.segments.map(s => s.text).join('\n\n');
      const synopsis = await generateSynopsis(storyParams!, fullText);

      const storyToSave: Story = {
        ...story,
        synopsis,
        isComplete: true,
      };

      await saveStory(storyToSave);
      setStory(storyToSave);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save story:', err);
      setSaveError('Failed to save story. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [story, user, tier, storyParams]);

  const handleNewStory = () => {
    setStoryCreated(false);
    setStory(null);
    setStoryParams(null);
    setSaveSuccess(false);
    setSaveError(null);
  };

  const handleFinishBook = () => {
    if (story) {
      navigate('/book/' + story.id, { state: { story, storyParams } });
    }
  };

  if (isGenerating && !storyCreated) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="animate-float inline-block mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center shadow-xl">
            <Loader2Icon size={40} className="text-white animate-spin" />
          </div>
        </div>
        <h2 className="text-2xl font-display text-purple-600 mb-2">
          Creating Your Story...
        </h2>
        <p className="text-gray-500 font-body">
          Robyn is writing the beginning of your adventure!
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {!storyCreated ? (
        <StoryCreator onCreateStory={handleCreateStory} />
      ) : story ? (
        <div className="space-y-6">
          <StoryDisplay
            storyTitle={story.title}
            storyImage={story.coverImageUrl}
            segments={story.segments}
            onAddUserText={handleAddUserText}
            onRobynReads={handleRobynReads}
            isGenerating={isGenerating}
            authorName={story.authorName}
          />

          {/* Actions */}
          <div className="bg-white rounded-2xl shadow-lg p-6 no-print">
            {saveError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-body">
                {saveError}
              </div>
            )}
            {saveSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm font-body flex items-center gap-2">
                <CheckCircleIcon size={18} />
                Story saved successfully!
              </div>
            )}
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={handleSaveStory}
                disabled={isSaving}
                className="flex items-center gap-2 py-2.5 px-5 bg-blue-100 text-blue-700 font-semibold rounded-xl hover:bg-blue-200 transition-colors disabled:opacity-50 font-body"
              >
                {isSaving ? <Loader2Icon size={18} className="animate-spin" /> : <SaveIcon size={18} />}
                {isSaving ? 'Saving...' : 'Save Story'}
              </button>
              <button
                onClick={handleFinishBook}
                className="flex items-center gap-2 py-2.5 px-5 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-xl shadow hover:from-purple-600 hover:to-blue-600 transition-colors font-body"
              >
                <BookIcon size={18} />
                Finish Book
              </button>
              <button
                onClick={handleNewStory}
                className="flex items-center gap-2 py-2.5 px-5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors font-body"
              >
                <PlusIcon size={18} />
                New Story
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
