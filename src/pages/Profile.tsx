import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, BookIcon, Trash2Icon, Loader2Icon, CrownIcon, BookOpenIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserStories, deleteStory } from '../lib/firebase';
import type { Story } from '../types';
import { TIER_LIMITS } from '../types';

export const Profile = () => {
  const { user, profile } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tier = profile?.tier || 'free';
  const limit = TIER_LIMITS[tier].maxSavedStories;

  useEffect(() => {
    if (!user) return;

    const loadStories = async () => {
      try {
        const userStories = await getUserStories(user.uid);
        setStories(userStories);
      } catch (err) {
        console.error('Failed to load stories:', err);
        setError('Failed to load your stories. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadStories();
  }, [user]);

  const handleDelete = async (storyId: string) => {
    if (!window.confirm('Are you sure you want to delete this story?')) return;

    try {
      await deleteStory(storyId);
      setStories(prev => prev.filter(s => s.id !== storyId));
    } catch (err) {
      console.error('Failed to delete story:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2Icon size={40} className="animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display text-purple-600 mb-1">
              {profile?.displayName || user?.displayName || 'Author'}'s Stories
            </h1>
            <p className="text-gray-500 font-body">
              {stories.length} of {limit === 999 ? 'unlimited' : limit} stories saved
              {tier === 'free' && (
                <span className="ml-2 text-amber-600 text-sm font-semibold">(Free Plan)</span>
              )}
              {tier === 'pro' && (
                <span className="ml-2 inline-flex items-center gap-1 text-purple-600 text-sm font-semibold">
                  <CrownIcon size={14} /> Pro
                </span>
              )}
            </p>
          </div>
          <Link
            to="/create"
            className="inline-flex items-center gap-2 py-2.5 px-5 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold rounded-xl shadow hover:from-purple-600 hover:to-blue-600 transition-all hover:scale-105 font-body"
          >
            <PlusIcon size={18} />
            <span>Create New Story</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 font-body">
          {error}
        </div>
      )}

      {/* Stories Grid */}
      {stories.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpenIcon size={40} className="text-purple-400" />
          </div>
          <h2 className="text-2xl font-display text-gray-600 mb-3">
            No Stories Yet!
          </h2>
          <p className="text-gray-500 font-body mb-6">
            Your story library is empty. Create your first magical adventure!
          </p>
          <Link
            to="/create"
            className="inline-flex items-center gap-2 py-3 px-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold rounded-xl shadow-lg hover:from-purple-600 hover:to-blue-600 transition-all font-body"
          >
            <PlusIcon size={18} />
            Create Your First Story
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map(story => (
            <div key={story.id} className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-shadow">
              <div className="relative">
                <img
                  src={story.coverImageUrl}
                  alt={story.title}
                  className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                {story.isComplete && (
                  <span className="absolute top-3 right-3 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full font-body">
                    Complete
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-purple-600 mb-1 font-body truncate">
                  {story.title}
                </h3>
                <p className="text-xs text-gray-400 mb-1 font-body">By {story.authorName}</p>
                <p className="text-xs text-gray-400 mb-4 font-body">
                  {new Date(story.updatedAt).toLocaleDateString()}
                </p>
                <div className="flex justify-between items-center">
                  <Link
                    to={`/story/${story.id}`}
                    className="py-2 px-4 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors text-sm flex items-center gap-1 font-body font-semibold"
                  >
                    <BookIcon size={16} />
                    <span>Read</span>
                  </Link>
                  <button
                    onClick={() => handleDelete(story.id)}
                    className="p-2 bg-red-50 text-red-400 rounded-xl hover:bg-red-100 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2Icon size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
