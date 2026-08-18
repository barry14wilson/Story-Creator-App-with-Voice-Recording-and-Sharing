import { useEffect, useState } from 'react';
import { useLocation, useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, PrinterIcon, BookOpenIcon, ImageIcon, Loader2Icon } from 'lucide-react';
import type { Story } from '../types';
import { formatCharacterNames, getCharacterImageUrl } from '../types';
import { getStory } from '../lib/firebase';

export const BookView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { story: stateStory } = (location.state || {}) as {
    story?: Story;
  };

  const [story, setStory] = useState<Story | null>(stateStory ?? null);
  const [loading, setLoading] = useState(!stateStory);

  // When opened via a direct link / page refresh there is no router state,
  // so load the saved book from Firebase by its id.
  useEffect(() => {
    if (stateStory || !id) return;
    let active = true;
    setLoading(true);
    getStory(id)
      .then(fetched => {
        if (active) setStory(fetched);
      })
      .catch(err => {
        console.error('Failed to load book:', err);
        if (active) setStory(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, stateStory]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <Loader2Icon size={40} className="animate-spin text-purple-500 mx-auto" />
        <p className="text-gray-500 font-body mt-4">Opening your book...</p>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <BookOpenIcon size={40} className="text-purple-400" />
        </div>
        <h2 className="text-2xl font-display text-gray-600 mb-3">No book to display</h2>
        <p className="text-gray-500 font-body mb-6">Create a story first to view it as a book.</p>
        <Link
          to="/create"
          className="inline-flex items-center gap-2 py-3 px-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold rounded-xl shadow font-body"
        >
          Create a Story
        </Link>
      </div>
    );
  }

  const characterNames = formatCharacterNames(story.characters);
  const synopsis = story.synopsis || `Join ${characterNames} on an incredible adventure in ${story.place}!`;
  const isYoungReader = story.childAge < 8;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800 mb-6 font-body font-semibold no-print"
      >
        <ArrowLeftIcon size={18} />
        Back to Editor
      </button>

      {/* FRONT COVER */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 book-page-break">
        <div className="relative aspect-[3/4]">
          <img
            src={story.coverImageUrl}
            alt="Book cover"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
          <div className="absolute bottom-0 left-0 right-0 p-8 text-center">
            <h1 className="text-4xl md:text-5xl font-display text-white drop-shadow-lg mb-4">
              {story.title}
            </h1>

            {/* Character avatars on cover */}
            <div className="flex justify-center gap-3 mb-4">
              {story.characters.map((char, i) => (
                <div key={i} className="text-center">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-white/90 shadow-lg border-2 border-yellow-300 mx-auto">
                    <img
                      src={char.imageUrl || getCharacterImageUrl(char)}
                      alt={`${char.name} the ${char.type}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs text-yellow-200 font-body font-semibold mt-1 drop-shadow">
                    {char.name}
                  </p>
                </div>
              ))}
            </div>

            <div className="w-20 h-0.5 bg-white/50 mx-auto mb-4" />
            <p className="text-xl text-white/90 font-body">
              Written and Illustrated by
            </p>
            <p className="text-2xl font-display text-yellow-300 mt-1">
              {story.authorName}
            </p>
          </div>
        </div>
      </div>

      {/* CHARACTER PAGE */}
      <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-8 book-page-break">
        <h2 className="text-2xl font-display text-purple-600 text-center mb-8">Meet the Characters</h2>
        <div className="flex flex-wrap justify-center gap-8">
          {story.characters.map((char, i) => (
            <div key={i} className="text-center">
              <div className="w-28 h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-50 to-blue-50 shadow-lg border-2 border-purple-200 mx-auto mb-3">
                <img
                  src={char.imageUrl || getCharacterImageUrl(char)}
                  alt={`${char.name} the ${char.type}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="font-display text-purple-600 text-lg">{char.name}</p>
              <p className="text-sm text-gray-500 font-body">the {char.type}</p>
            </div>
          ))}
        </div>
      </div>

      {/* STORY CONTENT WITH ILLUSTRATIONS */}
      <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-8">
        <div className="max-w-prose mx-auto space-y-8">
          {story.segments.map((segment) => {
            const hasIllustration = segment.illustrationUrl || segment.illustrationStatus === 'generating';
            const isFull = segment.illustrationSize === 'full';
            const isGeneratingImg = segment.illustrationStatus === 'generating';

            return (
              <div key={segment.id} className="illustration-block">
                {/* Full-page illustration (under 8): image fills the page */}
                {hasIllustration && isFull && (
                  <div className="-mx-8 md:-mx-12 mb-6 book-illustration-break">
                    {isGeneratingImg ? (
                      <div className="w-full aspect-[3/4] bg-gradient-to-br from-purple-50 to-blue-50 flex flex-col items-center justify-center gap-3">
                        <Loader2Icon size={40} className="text-purple-400 animate-spin" />
                        <p className="text-sm text-purple-400 font-body">Creating illustration...</p>
                      </div>
                    ) : segment.illustrationUrl ? (
                      <img
                        src={segment.illustrationUrl}
                        alt="Story illustration"
                        className="w-full object-cover"
                        style={{ minHeight: '400px' }}
                      />
                    ) : null}
                  </div>
                )}

                {/* Half-page illustration (8+): full-width image above text, half the page height */}
                {hasIllustration && !isFull ? (
                  <div className="illustration-block-half">
                    <div className="-mx-8 md:-mx-12 mb-4">
                      {isGeneratingImg ? (
                        <div className="w-full aspect-[16/9] bg-gradient-to-br from-purple-50 to-blue-50 flex flex-col items-center justify-center gap-2">
                          <Loader2Icon size={28} className="text-purple-400 animate-spin" />
                          <p className="text-xs text-purple-400 font-body">Creating illustration...</p>
                        </div>
                      ) : segment.illustrationUrl ? (
                        <img
                          src={segment.illustrationUrl}
                          alt="Story illustration"
                          className="w-full object-cover"
                          style={{ maxHeight: '350px' }}
                        />
                      ) : null}
                    </div>
                    <p
                      className={`whitespace-pre-line font-body leading-loose ${
                        isYoungReader ? 'text-xl' : 'text-lg'
                      } ${segment.author === 'ai' ? 'text-gray-800' : 'text-purple-700'}`}
                    >
                      {segment.text}
                    </p>
                  </div>
                ) : (
                  /* No illustration OR full-page (text below image) */
                  <p
                    className={`whitespace-pre-line font-body leading-loose ${
                      isYoungReader ? 'text-xl' : 'text-lg'
                    } ${segment.author === 'ai' ? 'text-gray-800' : 'text-purple-700'}`}
                  >
                    {segment.text}
                  </p>
                )}
              </div>
            );
          })}

          <div className="text-center pt-8">
            <p className="text-2xl font-display text-purple-600">The End</p>
          </div>
        </div>
      </div>

      {/* BACK COVER */}
      <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-xl p-8 md:p-12 text-white mb-8 book-page-break">
        <div className="max-w-prose mx-auto text-center">
          <h2 className="text-2xl font-display mb-6">About This Book</h2>
          <p className="font-body text-white/90 leading-relaxed text-lg italic mb-8">
            "{synopsis}"
          </p>

          {/* Character avatars on back cover */}
          <div className="flex justify-center gap-4 mb-6">
            {story.characters.map((char, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-white/20 shadow border-2 border-white/30 mx-auto">
                  <img
                    src={char.imageUrl || getCharacterImageUrl(char)}
                    alt={char.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs text-white/80 font-body mt-1">{char.name}</p>
              </div>
            ))}
          </div>

          <div className="w-16 h-0.5 bg-white/30 mx-auto mb-6" />
          <p className="font-body text-white/70 text-sm">
            Featuring: {characterNames}
          </p>
          <p className="font-body text-white/70 text-sm mt-1">
            Set in: {story.place}
          </p>
          <p className="font-body text-white/70 text-sm mt-1">
            Age: {story.childAge}+
          </p>

          {/* Illustration count badge */}
          {story.segments.some(s => s.illustrationUrl) && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <ImageIcon size={14} className="text-white/60" />
              <p className="font-body text-white/60 text-xs">
                {story.segments.filter(s => s.illustrationUrl).length} illustrations
              </p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-white/20">
            <p className="font-display text-yellow-300 text-xl">Robyn Reads</p>
            <p className="font-body text-white/60 text-xs mt-1">
              Created with love and imagination
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap justify-center gap-3 no-print mb-8">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 py-3 px-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold rounded-xl shadow-lg hover:from-purple-600 hover:to-blue-600 transition-all font-body"
        >
          <PrinterIcon size={18} />
          Print Book
        </button>
        <Link
          to="/profile"
          className="flex items-center gap-2 py-3 px-6 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors font-body"
        >
          <BookOpenIcon size={18} />
          My Stories
        </Link>
      </div>
    </div>
  );
};
