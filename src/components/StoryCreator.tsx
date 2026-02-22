import { useState } from 'react';
import { UserPlusIcon, MapPinIcon, ActivityIcon, CalendarIcon, BookOpenIcon, SparklesIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { StoryCreationParams, StoryCharacter } from '../types';
import { CHARACTER_TYPES, QUICK_PLACES, QUICK_ACTIONS, TIER_LIMITS, MIN_AGE, MAX_AGE_RATING, getCharacterImageUrl } from '../types';

interface StoryCreatorProps {
  onCreateStory: (params: StoryCreationParams) => void;
}

const emptyCharacter = (): StoryCharacter => ({ name: '', type: 'Princess' });

export const StoryCreator = ({ onCreateStory }: StoryCreatorProps) => {
  const { profile } = useAuth();
  const tier = profile?.tier || 'free';
  const maxChars = TIER_LIMITS[tier].maxCharacters;

  const [childAge, setChildAge] = useState(7);
  const [characterCount, setCharacterCount] = useState(Math.min(2, maxChars));
  const [characters, setCharacters] = useState<StoryCharacter[]>([emptyCharacter(), emptyCharacter()]);
  const [place, setPlace] = useState('');
  const [action, setAction] = useState('');
  const [introLength, setIntroLength] = useState<1 | 2>(1);
  const [step, setStep] = useState(1);

  const handleCharacterCountChange = (count: number) => {
    const clamped = Math.min(count, maxChars);
    setCharacterCount(clamped);
    if (clamped > characters.length) {
      setCharacters([...characters, ...Array(clamped - characters.length).fill(null).map(() => emptyCharacter())]);
    } else {
      setCharacters(characters.slice(0, clamped));
    }
  };

  const handleCharacterChange = (index: number, field: 'name' | 'type', value: string) => {
    const updated = [...characters];
    updated[index] = { ...updated[index], [field]: value };
    setCharacters(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Generate image URLs for each character before submitting
    const charsWithImages = characters
      .filter(c => c.name.trim())
      .map(c => ({ ...c, imageUrl: getCharacterImageUrl(c) }));

    onCreateStory({
      childAge,
      characterCount,
      characters: charsWithImages,
      place,
      action,
      introLength,
    });
  };

  const canProceedStep1 = childAge >= MIN_AGE && childAge <= MAX_AGE_RATING;
  const canProceedStep2 = characters.slice(0, characterCount).every(c => c.name.trim().length > 0 && c.type.trim().length > 0);
  const canProceedStep3 = place.trim().length > 0 && action.trim().length > 0;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-display text-purple-600 mb-2">
          Create Your Story
        </h2>
        <p className="text-gray-500 font-body">Step {step} of 3</p>
        <div className="flex justify-center gap-2 mt-3">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`h-2 w-16 rounded-full transition-colors ${
                s <= step ? 'bg-purple-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Age & Intro Length */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarIcon size={32} className="text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 font-body mb-2">
                How old are you?
              </h3>
              <p className="text-gray-500 font-body text-sm">
                This helps us make the story perfect for you!
              </p>
            </div>

            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setChildAge(Math.max(MIN_AGE, childAge - 1))}
                className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 font-bold text-xl hover:bg-purple-200 transition-colors"
              >
                -
              </button>
              <div className="text-6xl font-display text-purple-600 w-24 text-center">
                {childAge}
              </div>
              <button
                type="button"
                onClick={() => setChildAge(Math.min(MAX_AGE_RATING, childAge + 1))}
                className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 font-bold text-xl hover:bg-purple-200 transition-colors"
              >
                +
              </button>
            </div>
            <p className="text-center text-sm text-gray-400 font-body">
              Ages {MIN_AGE} to {MAX_AGE_RATING}
            </p>

            <div className="text-center mt-4">
              <h3 className="text-lg font-bold text-gray-800 font-body mb-3">
                How long should the story beginning be?
              </h3>
              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setIntroLength(1)}
                  className={`px-6 py-3 rounded-xl font-body font-semibold transition-all ${
                    introLength === 1
                      ? 'bg-purple-500 text-white shadow-lg scale-105'
                      : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                  }`}
                >
                  1 Paragraph
                </button>
                <button
                  type="button"
                  onClick={() => setIntroLength(2)}
                  className={`px-6 py-3 rounded-xl font-body font-semibold transition-all ${
                    introLength === 2
                      ? 'bg-purple-500 text-white shadow-lg scale-105'
                      : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                  }`}
                >
                  2 Paragraphs
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold rounded-xl shadow hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-body"
            >
              Next: Choose Characters
            </button>
          </div>
        )}

        {/* Step 2: Characters (Name + Type) */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlusIcon size={32} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 font-body mb-1">
                Who's in your story?
              </h3>
              <p className="text-gray-500 font-body text-sm">
                Give each character a name and choose what they are!
              </p>
              {tier === 'free' && maxChars < 5 && (
                <p className="text-xs text-amber-600 font-body mt-1">
                  Free accounts can have up to {maxChars} characters.
                  <span className="font-bold"> Upgrade to Pro for up to 5!</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 font-body">
                How many characters?
              </label>
              <div className="flex gap-2 flex-wrap">
                {Array.from({ length: maxChars }, (_, i) => i + 1).map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleCharacterCountChange(num)}
                    className={`w-12 h-12 rounded-xl font-bold transition-all font-body ${
                      characterCount === num
                        ? 'bg-blue-500 text-white shadow-lg scale-110'
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {characters.slice(0, characterCount).map((character, index) => (
                <div key={index} className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-5 border border-purple-100">
                  <div className="flex items-start gap-4">
                    {/* Character avatar preview */}
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white shadow-md border-2 border-purple-200">
                        {character.name.trim() && character.type ? (
                          <img
                            src={getCharacterImageUrl(character)}
                            alt={`${character.name} the ${character.type}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-purple-300">
                            <UserPlusIcon size={32} />
                          </div>
                        )}
                      </div>
                      {character.name.trim() && character.type && (
                        <p className="text-xs text-center text-purple-500 font-body font-semibold mt-1 truncate max-w-[80px]">
                          {character.name}
                        </p>
                      )}
                    </div>

                    <div className="flex-1 space-y-3">
                      {/* Character name */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1 font-body">
                          Character {index + 1} Name
                        </label>
                        <input
                          type="text"
                          value={character.name}
                          onChange={(e) => handleCharacterChange(index, 'name', e.target.value)}
                          className="block w-full rounded-xl border-gray-300 border p-2.5 text-gray-900 focus:border-purple-500 focus:ring-purple-500 font-body"
                          placeholder="e.g. Zoe, Max, Luna..."
                          required
                        />
                      </div>

                      {/* Character type */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1 font-body">
                          What are they?
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {CHARACTER_TYPES.map(ct => (
                            <button
                              key={ct}
                              type="button"
                              onClick={() => handleCharacterChange(index, 'type', ct)}
                              className={`px-3 py-1 text-sm rounded-full transition-colors font-body ${
                                character.type === ct
                                  ? 'bg-purple-500 text-white shadow'
                                  : 'bg-white text-purple-700 hover:bg-purple-100 border border-purple-200'
                              }`}
                            >
                              {ct}
                            </button>
                          ))}
                        </div>
                        <input
                          type="text"
                          value={CHARACTER_TYPES.includes(character.type) ? '' : character.type}
                          onChange={(e) => handleCharacterChange(index, 'type', e.target.value)}
                          className="mt-2 block w-full rounded-xl border-gray-300 border p-2.5 text-gray-900 focus:border-purple-500 focus:ring-purple-500 font-body text-sm"
                          placeholder="Or type your own: cat, puppy, monster..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors font-body"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={!canProceedStep2}
                className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold rounded-xl shadow hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-body"
              >
                Next: Setting & Theme
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Place & Action */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <SparklesIcon size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 font-body">
                Where & what happens?
              </h3>
            </div>

            {/* Character preview strip */}
            <div className="flex justify-center gap-4 py-2">
              {characters.slice(0, characterCount).filter(c => c.name.trim()).map((char, i) => (
                <div key={i} className="text-center">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-white shadow border-2 border-purple-200 mx-auto">
                    <img src={getCharacterImageUrl(char)} alt={char.name} className="w-full h-full" />
                  </div>
                  <p className="text-xs font-body text-purple-600 font-semibold mt-1">{char.name}</p>
                  <p className="text-[10px] font-body text-gray-400">{char.type}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 font-body">
                Where does your story take place?
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPinIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={place}
                  onChange={(e) => setPlace(e.target.value)}
                  className="pl-10 block w-full rounded-xl border-gray-300 border p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 font-body"
                  placeholder="Choose or type a magical place..."
                  required
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PLACES.map(qp => (
                  <button
                    key={qp}
                    type="button"
                    onClick={() => setPlace(qp)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors font-body ${
                      place === qp
                        ? 'bg-blue-500 text-white'
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                    }`}
                  >
                    {qp}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 font-body">
                What adventure are they having?
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ActivityIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  className="pl-10 block w-full rounded-xl border-gray-300 border p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 font-body"
                  placeholder="Choose or type what happens..."
                  required
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_ACTIONS.map(qa => (
                  <button
                    key={qa}
                    type="button"
                    onClick={() => setAction(qa)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors font-body ${
                      action === qa
                        ? 'bg-green-500 text-white'
                        : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                    }`}
                  >
                    {qa}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors font-body"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!canProceedStep3}
                className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold rounded-xl shadow-lg hover:from-purple-600 hover:to-blue-600 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed font-body flex items-center justify-center gap-2"
              >
                <BookOpenIcon size={20} />
                Create Story!
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
