// ============================================
// Interactive Story Hook
// ============================================
// Manages the state for interactive audiobook mode,
// handling decision points and branching narratives.
// ============================================

import { useState, useCallback } from 'react';
import type { Story, StorySegment, StoryCreationParams } from '../types';
import { v4 as uuidv4 } from 'uuid';

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';
const API_URL = import.meta.env.VITE_OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';
const MODEL = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini';

interface UseInteractiveStoryReturn {
  handleDecision: (decisionId: string, optionId: string) => Promise<void>;
  isGeneratingBranch: boolean;
  decisionHistory: Array<{ decisionId: string; optionId: string; optionLabel: string }>;
}

async function callAI(prompt: string, systemPrompt: string, maxTokens = 800): Promise<string | null> {
  if (!API_KEY) return null;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        max_tokens: maxTokens,
        temperature: 0.8,
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
}

export function useInteractiveStory(
  story: Story | null,
  storyParams: StoryCreationParams | null,
  onStoryUpdate: (updatedStory: Story) => void
): UseInteractiveStoryReturn {
  const [isGeneratingBranch, setIsGeneratingBranch] = useState(false);
  const [decisionHistory, setDecisionHistory] = useState<
    Array<{ decisionId: string; optionId: string; optionLabel: string }>
  >([]);

  const handleDecision = useCallback(async (decisionId: string, optionId: string) => {
    if (!story || !storyParams || !story.audiobook) return;

    const decision = story.audiobook.decisionPoints.find(dp => dp.id === decisionId);
    if (!decision) return;

    const selectedOption = decision.options.find(o => o.id === optionId);
    if (!selectedOption) return;

    setIsGeneratingBranch(true);

    // Record the decision
    setDecisionHistory(prev => [
      ...prev,
      { decisionId, optionId, optionLabel: selectedOption.label },
    ]);

    // Update the decision point as selected
    const updatedDecisionPoints = story.audiobook.decisionPoints.map(dp =>
      dp.id === decisionId ? { ...dp, selectedOptionId: optionId } : dp
    );

    // Generate continuation based on the selected option
    const recentText = story.segments
      .slice(Math.max(0, decision.segmentIndex - 3), decision.segmentIndex + 1)
      .map(s => s.text)
      .join('\n\n');

    const systemPrompt = `You are Robyn Reads, continuing an interactive audiobook for a ${storyParams.childAge}-year-old. The listener has just made a choice about what happens next. Write 2-3 paragraphs continuing the story based on their choice. Make it exciting and engaging.`;

    const userPrompt = `Story so far:\n${recentText}\n\nThe listener chose: "${selectedOption.label}" - ${selectedOption.summary}\n\nWrite 2-3 paragraphs continuing the story based on this choice. Write ONLY the story text.`;

    let newSegments: StorySegment[] = [];

    const aiText = await callAI(userPrompt, systemPrompt);

    if (aiText) {
      newSegments = aiText
        .split('\n\n')
        .filter(p => p.trim())
        .map(text => ({
          id: uuidv4(),
          text: text.trim(),
          author: 'ai' as const,
          timestamp: new Date().toISOString(),
        }));
    } else {
      // Fallback continuation
      const chars = storyParams.characters.filter(c => c.name.trim());
      const firstName = chars[0] ? `${chars[0].name} the ${chars[0].type}` : 'our hero';

      newSegments = [{
        id: uuidv4(),
        text: `${firstName} made their choice — ${selectedOption.label.toLowerCase()}. ${selectedOption.summary} The adventure took an exciting new turn as they pressed forward with determination.`,
        author: 'ai',
        timestamp: new Date().toISOString(),
      }];
    }

    // Insert new segments after the decision point
    const updatedSegments = [...story.segments];
    const insertIndex = decision.segmentIndex + 1;
    updatedSegments.splice(insertIndex, 0, ...newSegments);

    // Update segment indices for subsequent decision points
    const adjustedDecisionPoints = updatedDecisionPoints.map(dp => {
      if (dp.segmentIndex > decision.segmentIndex) {
        return { ...dp, segmentIndex: dp.segmentIndex + newSegments.length };
      }
      return dp;
    });

    const updatedStory: Story = {
      ...story,
      segments: updatedSegments,
      audiobook: {
        ...story.audiobook,
        decisionPoints: adjustedDecisionPoints,
      },
      updatedAt: new Date().toISOString(),
    };

    onStoryUpdate(updatedStory);
    setIsGeneratingBranch(false);
  }, [story, storyParams, onStoryUpdate]);

  return {
    handleDecision,
    isGeneratingBranch,
    decisionHistory,
  };
}
