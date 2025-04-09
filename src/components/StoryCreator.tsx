import React, { useState } from 'react';
import { UserPlusIcon, MapPinIcon, ActivityIcon } from 'lucide-react';
interface StoryCreatorProps {
  onCreateStory: (storyData: {
    characterCount: number;
    characters: string[];
    place: string;
    action: string;
  }) => void;
}
const QUICK_CHARACTERS = ['Princess', 'Knight', 'Dragon', 'Wizard', 'Fairy', 'Pirate', 'Mermaid', 'Unicorn'];
const QUICK_PLACES = ['Enchanted Forest', 'Magical Kingdom', "Dragon's Mountain", 'Crystal Cave', 'Rainbow Castle', "Mermaid's Lagoon", 'Cloud City', 'Fairy Garden'];
const QUICK_ACTIONS = ['Going on an Adventure', 'Finding a Treasure', 'Saving the Kingdom', 'Making New Friends', 'Learning Magic', 'Solving a Mystery', 'Having a Party', 'Breaking a Spell'];
export const StoryCreator = ({
  onCreateStory
}: StoryCreatorProps) => {
  const [characterCount, setCharacterCount] = useState(2);
  const [characters, setCharacters] = useState<string[]>(['', '']);
  const [place, setPlace] = useState('');
  const [action, setAction] = useState('');
  const handleCharacterCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const count = parseInt(e.target.value);
    setCharacterCount(count);
    if (count > characters.length) {
      setCharacters([...characters, ...Array(count - characters.length).fill('')]);
    } else {
      setCharacters(characters.slice(0, count));
    }
  };
  const handleCharacterNameChange = (index: number, name: string) => {
    const newCharacters = [...characters];
    newCharacters[index] = name;
    setCharacters(newCharacters);
  };
  const handleQuickCharacterSelect = (character: string, index: number) => {
    handleCharacterNameChange(index, character);
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateStory({
      characterCount,
      characters,
      place,
      action
    });
  };
  return <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-center text-purple-600 mb-6">
        Create Your Story
      </h2>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How many characters are in your story?
          </label>
          <select value={characterCount} onChange={handleCharacterCountChange} className="block w-full rounded-lg border-gray-300 border p-2.5 text-gray-900 focus:border-purple-500 focus:ring-purple-500">
            {[1, 2, 3, 4, 5].map(num => <option key={num} value={num}>
                {num}
              </option>)}
          </select>
        </div>
        <div className="space-y-6">
          <label className="block text-sm font-medium text-gray-700">
            Who are your characters?
          </label>
          {characters.map((character, index) => <div key={index} className="space-y-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserPlusIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input type="text" value={character} onChange={e => handleCharacterNameChange(index, e.target.value)} className="pl-10 block w-full rounded-lg border-gray-300 border p-2.5 text-gray-900 focus:border-purple-500 focus:ring-purple-500" placeholder={`Character ${index + 1} name`} required />
              </div>
              <div className="flex flex-wrap gap-2">
                {QUICK_CHARACTERS.map(quickCharacter => <button key={quickCharacter} type="button" onClick={() => handleQuickCharacterSelect(quickCharacter, index)} className="px-3 py-1 text-sm bg-purple-50 text-purple-700 rounded-full hover:bg-purple-100 transition-colors border border-purple-200">
                    {quickCharacter}
                  </button>)}
              </div>
            </div>)}
        </div>
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Where does your story take place?
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPinIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input type="text" value={place} onChange={e => setPlace(e.target.value)} className="pl-10 block w-full rounded-lg border-gray-300 border p-2.5 text-gray-900 focus:border-purple-500 focus:ring-purple-500" placeholder="Choose or type a magical place..." required />
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_PLACES.map(quickPlace => <button key={quickPlace} type="button" onClick={() => setPlace(quickPlace)} className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors border border-blue-200">
                {quickPlace}
              </button>)}
          </div>
        </div>
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What's happening in your story?
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <ActivityIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input type="text" value={action} onChange={e => setAction(e.target.value)} className="pl-10 block w-full rounded-lg border-gray-300 border p-2.5 text-gray-900 focus:border-purple-500 focus:ring-purple-500" placeholder="Choose or type what happens..." required />
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_ACTIONS.map(quickAction => <button key={quickAction} type="button" onClick={() => setAction(quickAction)} className="px-3 py-1 text-sm bg-green-50 text-green-700 rounded-full hover:bg-green-100 transition-colors border border-green-200">
                {quickAction}
              </button>)}
          </div>
        </div>
        <button type="submit" className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-lg shadow hover:from-purple-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-colors">
          Create Story Beginning
        </button>
      </form>
    </div>;
};