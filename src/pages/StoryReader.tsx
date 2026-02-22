import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon, Loader2Icon, PrinterIcon, BookOpenIcon } from 'lucide-react';
import { getStory } from '../lib/firebase';
import type { Story } from '../types';

export const StoryReader = () => {
  const { id } = useParams<{ id: string }>();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadStory = async () => {
      try {
        const storyData = await getStory(id);
        if (storyData) {
          setStory(storyData);
        } else {
          setError('Story not found.');
        }
      } catch (err) {
        console.error('Failed to load story:', err);
        setError('Failed to load this story. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadStory();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2Icon size={40} className="animate-spin text-purple-500" />
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <BookOpenIcon size={40} className="text-purple-400" />
        </div>
        <h2 className="text-2xl font-display text-gray-600 mb-3">
          {error || 'Story not found'}
        </h2>
        <Link
          to="/profile"
          className="inline-flex items-center gap-2 py-3 px-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold rounded-xl shadow font-body"
        >
          <ArrowLeftIcon size={18} />
          Back to My Stories
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back button */}
      <Link
        to="/profile"
        className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800 mb-6 font-body font-semibold no-print"
      >
        <ArrowLeftIcon size={18} />
        Back to My Stories
      </Link>

      {/* Book display */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Cover */}
        <div className="relative">
          <img
            src={story.coverImageUrl}
            alt="Story cover"
            className="w-full h-48 md:h-72 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-6 right-6">
            <h1 className="text-3xl md:text-4xl font-display text-white drop-shadow-lg mb-1">
              {story.title}
            </h1>
            <p className="text-white/80 font-body">
              Written and illustrated by {story.authorName}
            </p>
          </div>
        </div>

        {/* Synopsis */}
        {story.synopsis && (
          <div className="px-6 py-4 bg-purple-50 border-b border-purple-100">
            <p className="text-purple-700 italic font-body text-sm">
              {story.synopsis}
            </p>
          </div>
        )}

        {/* Story Content */}
        <div className="p-6 space-y-4">
          {story.segments.map((segment) => (
            <div
              key={segment.id}
              className={segment.author === 'ai' ? 'story-segment-ai' : 'story-segment-user'}
            >
              <p className={`whitespace-pre-line font-body leading-relaxed ${
                segment.author === 'ai' ? 'story-text-ai' : 'story-text-user'
              }`}>
                {segment.text}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t text-center">
          <p className="text-sm text-gray-500 font-body">
            <span className="font-display text-purple-600">The End</span>
          </p>
          <p className="text-xs text-gray-400 font-body mt-1">
            Created with Robyn Reads
          </p>
        </div>
      </div>

      {/* Print button */}
      <div className="flex justify-center mt-6 no-print">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 py-2.5 px-5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors font-body"
        >
          <PrinterIcon size={18} />
          Print Story
        </button>
      </div>
    </div>
  );
};
