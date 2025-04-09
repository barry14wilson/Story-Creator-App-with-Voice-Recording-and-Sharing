import React, { useState } from 'react';
import { PrinterIcon, MailIcon, SaveIcon, MicIcon, TypeIcon } from 'lucide-react';
import { VoiceRecorder } from './VoiceRecorder';
import { TextInput } from './TextInput';
interface StoryDisplayProps {
  storyBeginning: string;
  storyImage: string;
  storyTitle: string;
  onContinueStory: () => void;
  continuation?: string;
}
export const StoryDisplay = ({
  storyBeginning,
  storyImage,
  storyTitle,
  onContinueStory,
  continuation
}: StoryDisplayProps) => {
  const [showInput, setShowInput] = useState(false);
  const [inputMethod, setInputMethod] = useState<'voice' | 'text'>('voice');
  const handleContinueClick = () => {
    setShowInput(true);
    onContinueStory();
  };
  return <div>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-center text-purple-600 mb-4">
          {storyTitle}
        </h2>
        <div className="mb-6 flex justify-center">
          <img src={storyImage} alt="Story characters" className="rounded-lg max-h-64 object-cover shadow-md" />
        </div>
        <div className="mb-6 space-y-4">
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-gray-800 whitespace-pre-line">
              {storyBeginning}
            </p>
          </div>
          {continuation && <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-gray-800 whitespace-pre-line">
                {continuation}
              </p>
            </div>}
        </div>
        {!showInput ? <div className="flex justify-center mb-6">
            <button onClick={handleContinueClick} className="py-3 px-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-lg shadow hover:from-purple-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-all hover:scale-105">
              {continuation ? 'Continue the Story More' : 'Continue the Story'}
            </button>
          </div> : <div className="flex justify-center mb-6 space-x-4">
            <button onClick={() => setInputMethod('voice')} className={`flex items-center gap-2 py-2 px-4 rounded-lg transition-colors ${inputMethod === 'voice' ? 'bg-purple-500 text-white' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}>
              <MicIcon size={20} />
              <span>Voice</span>
            </button>
            <button onClick={() => setInputMethod('text')} className={`flex items-center gap-2 py-2 px-4 rounded-lg transition-colors ${inputMethod === 'text' ? 'bg-purple-500 text-white' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}>
              <TypeIcon size={20} />
              <span>Text</span>
            </button>
          </div>}
        <div className="flex justify-center space-x-4">
          <button className="flex items-center gap-1 py-2 px-4 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
            <SaveIcon size={18} />
            <span>Save</span>
          </button>
          <button className="flex items-center gap-1 py-2 px-4 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors">
            <MailIcon size={18} />
            <span>Share</span>
          </button>
          <button className="flex items-center gap-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <PrinterIcon size={18} />
            <span>Print</span>
          </button>
        </div>
      </div>
      {showInput && (inputMethod === 'voice' ? <VoiceRecorder onRecordingComplete={(blob, text) => {
      console.log('Recording saved:', blob.size);
      onContinueStory();
    }} isRecording={false} setIsRecording={() => {}} /> : <TextInput onComplete={text => {
      console.log('Text saved:', text);
      onContinueStory();
    }} />)}
    </div>;
};