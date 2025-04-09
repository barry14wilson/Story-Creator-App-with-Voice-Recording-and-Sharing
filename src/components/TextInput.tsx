import React, { useState } from 'react';
import { SaveIcon } from 'lucide-react';
interface TextInputProps {
  onComplete: (text: string) => void;
}
export const TextInput = ({
  onComplete
}: TextInputProps) => {
  const [text, setText] = useState('');
  const handleSave = () => {
    if (text.trim()) {
      onComplete(text);
      setText('');
    }
  };
  return <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border-2 border-purple-100 p-6 mt-4">
      <div className="flex flex-col items-center">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-purple-600 mb-2">
            Continue Your Story
          </h3>
          <p className="text-gray-600">Type what happens next in your story</p>
        </div>
        <div className="w-full">
          <textarea value={text} onChange={e => setText(e.target.value)} className="w-full h-40 p-4 border-2 border-purple-100 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-700" placeholder="Continue your story here..." />
          <div className="flex justify-center mt-4">
            <button onClick={handleSave} disabled={!text.trim()} className="flex items-center gap-2 py-3 px-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-lg shadow hover:from-purple-600 hover:to-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <SaveIcon size={20} />
              <span>Add to Story</span>
            </button>
          </div>
        </div>
      </div>
    </div>;
};