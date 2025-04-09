import React, { useState } from 'react';
import { StoryCreator } from '../components/StoryCreator';
import { StoryDisplay } from '../components/StoryDisplay';
import { VoiceRecorder } from '../components/VoiceRecorder';
export const StoryEditor = () => {
  const [storyCreated, setStoryCreated] = useState(false);
  const [storyData, setStoryData] = useState({
    title: '',
    beginning: '',
    image: ''
  });
  const [isRecording, setIsRecording] = useState(false);
  const [continuation, setContinuation] = useState<string>('');
  const handleCreateStory = (data: {
    characterCount: number;
    characters: string[];
    place: string;
    action: string;
  }) => {
    const characterNames = data.characters.join(', ').replace(/, ([^,]*)$/, ' and $1');
    const title = `${data.action} in ${data.place}`;
    const storyBeginning = `Once upon a time, ${characterNames} found themselves in ${data.place}. 
The sun was shining brightly overhead as they prepared for ${data.action}. ${data.characters[0]} looked around excitedly, wondering what adventures awaited them today.
"I can't believe we're finally here!" exclaimed ${data.characters[0] || 'the first character'}.
${data.characters[1] ? `"Yes, it's amazing!" replied ${data.characters[1]}, taking in the sights and sounds of ${data.place}.` : ''}
Little did they know that their ${data.action} would lead them to discover something truly extraordinary...`;
    let imageUrl;
    if (data.place.toLowerCase().includes('forest')) {
      imageUrl = 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
    } else if (data.place.toLowerCase().includes('space') || data.place.toLowerCase().includes('planet')) {
      imageUrl = 'https://images.unsplash.com/photo-1464802686167-b939a6910659?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
    } else if (data.place.toLowerCase().includes('castle') || data.place.toLowerCase().includes('kingdom')) {
      imageUrl = 'https://images.unsplash.com/photo-1533154683836-84ea7a0bc310?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
    } else if (data.place.toLowerCase().includes('ocean') || data.place.toLowerCase().includes('sea')) {
      imageUrl = 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
    } else {
      imageUrl = 'https://images.unsplash.com/photo-1633409361618-c73427e4e206?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
    }
    setStoryData({
      title,
      beginning: storyBeginning,
      image: imageUrl
    });
    setStoryCreated(true);
  };
  const handleContinueStory = () => {
    setIsRecording(true);
  };
  const handleRecordingComplete = (audioBlob: Blob, transcription: string) => {
    setContinuation(prev => prev ? `${prev}\n\n${transcription}` : transcription);
    setIsRecording(false);
  };
  const handleTextComplete = (text: string) => {
    setContinuation(prev => prev ? `${prev}\n\n${text}` : text);
    setIsRecording(false);
  };
  return <div className="max-w-2xl mx-auto">
      {!storyCreated ? <StoryCreator onCreateStory={handleCreateStory} /> : <div className="space-y-8">
          <StoryDisplay storyTitle={storyData.title} storyBeginning={storyData.beginning} storyImage={storyData.image} onContinueStory={handleContinueStory} continuation={continuation} />
          {isRecording && <VoiceRecorder onRecordingComplete={handleRecordingComplete} isRecording={isRecording} setIsRecording={setIsRecording} />}
        </div>}
    </div>;
};