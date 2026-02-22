import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon, BookOpenIcon, HeadphonesIcon, UserIcon, Loader2Icon } from 'lucide-react';
import { getPublicStories } from '../lib/firebase';
import type { Story } from '../types';

export const Explore = () => {
  const navigate = useNavigate();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'standard' | 'audiobook'>('all');

  useEffect(() => {
    getPublicStories(50).then(s => {
      setStories(s);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredStories = stories.filter(story => {
    const matchesSearch = searchTerm === '' ||
      story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.authorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || story.format === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-display text-purple-600 mb-2">Explore Stories</h1>
        <p className="text-gray-500 font-body">Discover amazing stories from our community</p>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search stories or authors..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'standard', 'audiobook'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-body font-semibold transition-colors ${
                  filter === f
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? 'All' : f === 'standard' ? 'Books' : 'Audiobooks'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Story Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2Icon size={32} className="animate-spin text-purple-500" />
        </div>
      ) : filteredStories.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
          <BookOpenIcon size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-body">
            {searchTerm ? 'No stories match your search' : 'No public stories yet. Be the first to share!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStories.map(story => (
            <button
              key={story.id}
              onClick={() => navigate(`/story/${story.id}`)}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow text-left"
            >
              {/* Cover */}
              <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-purple-200 to-blue-200">
                {story.coverImageUrl && (
                  <img
                    src={story.coverImageUrl}
                    alt={story.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                {story.format === 'audiobook' && (
                  <div className="absolute top-2 right-2 bg-purple-500 text-white px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                    <HeadphonesIcon size={12} />
                    Audiobook
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-display text-lg text-gray-800 line-clamp-1 mb-1">
                  {story.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <UserIcon size={14} />
                  <span className="font-body">{story.authorName}</span>
                </div>
                {story.synopsis && (
                  <p className="text-xs text-gray-400 font-body mt-2 line-clamp-2">
                    {story.synopsis}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                  <span>Age {story.childAge}+</span>
                  <span>~{story.estimatedReadMinutes} min</span>
                  <span>{story.segments.length} pages</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
