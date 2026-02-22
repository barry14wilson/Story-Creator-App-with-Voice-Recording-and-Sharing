import React, { useState } from 'react';
import { SendIcon } from 'lucide-react';

interface TextInputProps {
  onComplete: (text: string) => void;
}

export const TextInput = ({ onComplete }: TextInputProps) => {
  const [text, setText] = useState('');

  const handleSave = () => {
    if (text.trim()) {
      onComplete(text.trim());
      setText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border-2 border-purple-100 p-6 mt-4">
      <div className="flex flex-col items-center">
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-purple-600 mb-2 font-body">
            Continue Your Story
          </h3>
          <p className="text-gray-600 font-body">
            Type what happens next in your story (press Enter to add)
          </p>
        </div>
        <div className="w-full">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full h-40 p-4 border-2 border-purple-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-purple-700 font-body resize-none"
            placeholder="What happens next in your story...?"
          />
          <div className="flex justify-between items-center mt-3">
            <span className="text-sm text-gray-400 font-body">
              {text.length} characters
            </span>
            <button
              onClick={handleSave}
              disabled={!text.trim()}
              className="flex items-center gap-2 py-3 px-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-xl shadow hover:from-purple-600 hover:to-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-body"
            >
              <SendIcon size={18} />
              <span>Add to Story</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
