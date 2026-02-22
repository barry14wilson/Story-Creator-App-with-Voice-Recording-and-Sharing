// ============================================
// AI Story Generation Service
// ============================================
// Uses OpenAI-compatible API. Falls back to
// rich template-based generation when no API key.
// ============================================

import type { StoryCreationParams, StorySegment, StoryCharacter, IllustrationSize } from '../types';
import { formatCharacterNames, getSceneFallbackImage, getStoryImage } from '../types';
import { v4 as uuidv4 } from 'uuid';

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';
const API_URL = import.meta.env.VITE_OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';
const MODEL = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini';
const ENABLE_AI_ILLUSTRATIONS = import.meta.env.VITE_ENABLE_AI_ILLUSTRATIONS !== 'false';

function getAgeAppropriateGuidance(age: number): string {
  if (age <= 5) return 'Use very simple words, short sentences, and lots of repetition. Make it silly and fun. No scary content.';
  if (age <= 8) return 'Use simple vocabulary with some interesting words explained in context. Light adventure is okay, but nothing scary. Focus on friendship, kindness, and fun.';
  if (age <= 10) return 'Use age-appropriate vocabulary with some challenge. Adventure and mild tension are fine. Focus on teamwork, bravery, and problem solving.';
  return 'Use rich vocabulary appropriate for pre-teens. Complex plots with twists are okay. Themes of growth, responsibility, and discovery.';
}

async function callAI(prompt: string, systemPrompt: string): Promise<string | null> {
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
        max_tokens: 500,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      console.error('AI API error:', response.status);
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (err) {
    console.error('AI API call failed:', err);
    return null;
  }
}

// ============================================
// Generate Story Beginning
// ============================================

export async function generateStoryBeginning(
  params: StoryCreationParams,
  paragraphs: 1 | 2
): Promise<StorySegment[]> {
  const characterNames = formatCharacterNames(params.characters);
  const ageGuide = getAgeAppropriateGuidance(params.childAge);

  const systemPrompt = `You are Robyn Reads, a magical storyteller who creates wonderful stories for children aged ${params.childAge}. ${ageGuide} Never include violence, death, or inappropriate content. Max age rating is 13. Write ONLY the story text, no titles or headers.`;

  const userPrompt = `Write ${paragraphs === 1 ? 'one paragraph' : 'two paragraphs'} to begin a story about ${characterNames} in ${params.place}. The adventure theme is: ${params.action}. Make it exciting and end with something that invites the child to continue the story. The story should be age-appropriate for a ${params.childAge}-year-old.`;

  const aiText = await callAI(userPrompt, systemPrompt);

  if (aiText) {
    const segments: StorySegment[] = aiText.split('\n\n').filter(p => p.trim()).map(text => ({
      id: uuidv4(),
      text: text.trim(),
      author: 'ai' as const,
      timestamp: new Date().toISOString(),
    }));
    return segments;
  }

  // Fallback: rich template-based generation
  return generateTemplateBeginning(params, paragraphs);
}

function generateTemplateBeginning(
  params: StoryCreationParams,
  paragraphs: 1 | 2
): StorySegment[] {
  const chars = params.characters.filter(c => c.name.trim());
  const characterNames = formatCharacterNames(chars);
  const firstName = chars[0] ? `${chars[0].name} the ${chars[0].type}` : 'our hero';
  const secondName = chars[1] ? `${chars[1].name} the ${chars[1].type}` : undefined;

  const openings = [
    `Once upon a time, in the magical land of ${params.place}, there lived ${characterNames}.`,
    `In a place called ${params.place}, where wonders never ceased, ${characterNames} woke up to a very special day.`,
    `The story begins in ${params.place}, where ${characterNames} had just arrived for the most exciting adventure of their lives.`,
    `Deep within ${params.place}, ${characterNames} stood together, ready for something incredible.`,
  ];

  const middles = [
    `${firstName} looked around with wide eyes, heart racing with excitement. Today was the day they would begin ${params.action.toLowerCase()}.`,
    `"Are you ready for this?" asked ${firstName}, barely able to contain their excitement about ${params.action.toLowerCase()}.`,
    `The air sparkled with magic as ${firstName} took the first step towards ${params.action.toLowerCase()}.`,
  ];

  const dialogues = secondName
    ? [
        `"I can't believe we're actually doing this!" said ${firstName} with a grin.\n"Neither can I!" replied ${secondName}, eyes sparkling with wonder. "This is going to be amazing!"`,
        `${secondName} reached out and took ${firstName}'s hand. "Together?" they asked.\n"Together!" ${firstName} agreed with a determined nod.`,
        `"Look at that!" whispered ${secondName}, pointing ahead.\n${firstName} gasped. "It's even more magical than I imagined!"`,
      ]
    : [
        `"This is going to be the best adventure ever!" ${firstName} said to themselves, feeling braver than they had ever felt before.`,
        `${firstName} took a deep breath. "I can do this," they whispered, stepping forward into the unknown.`,
      ];

  const cliffhangers = [
    `But what ${firstName} didn't know yet was that something extraordinary was about to happen...`,
    `Little did they know, their ${params.action.toLowerCase()} was about to take a very unexpected turn...`,
    `And that's when they heard it — a mysterious sound coming from just beyond the next hill...`,
    `Just then, something caught ${firstName}'s eye — something that would change everything...`,
  ];

  const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  const para1 = `${pick(openings)} ${pick(middles)}\n\n${pick(dialogues)}`;

  if (paragraphs === 1) {
    return [{
      id: uuidv4(),
      text: para1,
      author: 'ai',
      timestamp: new Date().toISOString(),
    }];
  }

  const para2 = pick(cliffhangers);

  return [
    {
      id: uuidv4(),
      text: para1,
      author: 'ai',
      timestamp: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      text: para2,
      author: 'ai',
      timestamp: new Date().toISOString(),
    },
  ];
}

// ============================================
// Continue Story (Robyn Reads button)
// ============================================

export async function generateStoryContinuation(
  params: StoryCreationParams,
  existingStory: string
): Promise<StorySegment> {
  const ageGuide = getAgeAppropriateGuidance(params.childAge);
  const characterNames = formatCharacterNames(params.characters);

  const systemPrompt = `You are Robyn Reads, continuing a story for a ${params.childAge}-year-old. ${ageGuide} Write exactly ONE paragraph to continue the story. Keep the same characters and setting. End in a way that invites the child to continue writing. Write ONLY the story paragraph, nothing else.`;

  const userPrompt = `Continue this story about ${characterNames} in ${params.place} (theme: ${params.action}):\n\n${existingStory}\n\nWrite one paragraph continuing the story.`;

  const aiText = await callAI(userPrompt, systemPrompt);

  if (aiText) {
    return {
      id: uuidv4(),
      text: aiText.trim(),
      author: 'ai',
      timestamp: new Date().toISOString(),
    };
  }

  // Fallback template continuation
  return generateTemplateContinuation(params);
}

function generateTemplateContinuation(params: StoryCreationParams): StorySegment {
  const chars = params.characters.filter(c => c.name.trim());
  const firstName = chars[0] ? `${chars[0].name} the ${chars[0].type}` : 'our hero';
  const secondName = chars[1] ? `${chars[1].name} the ${chars[1].type}` : undefined;

  const continuations = [
    `${firstName} pressed forward through ${params.place}, discovering a hidden path that shimmered with an otherworldly glow. Each step revealed something new and wonderful — sparkling crystals, singing flowers, and tiny creatures that peeked curiously from behind the trees.${secondName ? ` ${secondName} followed close behind, mapping out every twist and turn of their journey.` : ''} What they found at the end of the path made them gasp in amazement...`,

    `Suddenly, a friendly ${params.place.toLowerCase().includes('sea') || params.place.toLowerCase().includes('ocean') ? 'dolphin' : params.place.toLowerCase().includes('space') ? 'alien' : 'woodland creature'} appeared before ${firstName}! It seemed to want them to follow it somewhere important.${secondName ? ` "Should we follow it?" ${secondName} asked nervously. "Absolutely!" ${firstName} replied without hesitation.` : ` ${firstName} didn't hesitate for a second — this was exactly the kind of adventure they had been hoping for!`}`,

    `The ground beneath their feet began to sparkle and glow! ${firstName} looked down in surprise as magical patterns swirled around them.${secondName ? ` ${secondName} reached out to touch one of the glowing patterns and it transformed into a beautiful butterfly made entirely of light.` : ''} Something amazing was happening, and ${firstName} knew this was just the beginning of something truly magical...`,

    `A mysterious map appeared, floating gently through the air right towards ${firstName}! It showed a secret location in ${params.place} that nobody had ever discovered before.${secondName ? ` "Do you see what I see?" whispered ${secondName}, eyes wide with wonder.` : ''} ${firstName} carefully took the map and studied it closely. The adventure was getting more exciting by the minute!`,
  ];

  const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  return {
    id: uuidv4(),
    text: pick(continuations),
    author: 'ai',
    timestamp: new Date().toISOString(),
  };
}

// ============================================
// Generate Story Synopsis
// ============================================

export async function generateSynopsis(
  params: StoryCreationParams,
  fullStoryText: string
): Promise<string> {
  const characterNames = formatCharacterNames(params.characters);

  const systemPrompt = 'Write a short, exciting book synopsis (2-3 sentences) for the back cover of a children\'s book. Make it enticing and age-appropriate.';
  const userPrompt = `Write a synopsis for this story about ${characterNames} in ${params.place}:\n\n${fullStoryText.substring(0, 1000)}`;

  const aiText = await callAI(userPrompt, systemPrompt);

  if (aiText) return aiText;

  // Fallback
  return `Join ${characterNames} on an incredible adventure in ${params.place}! When they set out for ${params.action.toLowerCase()}, they discover that the real magic was inside them all along. A tale of friendship, courage, and wonder that will delight readers of all ages.`;
}

// ============================================
// Illustration Generation (DALL-E 3 + fallback)
// ============================================

/**
 * Call DALL-E 3 API to generate an image.
 * Uses the same API key as text generation.
 */
async function callImageAI(
  prompt: string,
  size: '1024x1024' | '1024x1792' | '1792x1024'
): Promise<string | null> {
  if (!API_KEY || !ENABLE_AI_ILLUSTRATIONS) return null;

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size,
        quality: 'standard',
      }),
    });

    if (!response.ok) {
      console.error('DALL-E API error:', response.status);
      return null;
    }

    const data = await response.json();
    return data.data?.[0]?.url || null;
  } catch (err) {
    console.error('DALL-E API call failed:', err);
    return null;
  }
}

/**
 * Use text AI to extract a concise visual scene description from story text.
 * This intermediate step produces a better DALL-E prompt.
 */
async function extractSceneDescription(
  text: string,
  characters: StoryCharacter[],
  place: string
): Promise<string | null> {
  const charDesc = characters
    .filter(c => c.name.trim())
    .map(c => `${c.name} (a European ${c.type.toLowerCase()})`)
    .join(', ');

  const systemPrompt =
    'You extract a single visual scene from story text. Describe ONLY the visual scene in 1-2 sentences. ' +
    'Focus on: the setting, what the characters look like and are doing, and the mood. ' +
    'Do NOT include dialogue or narrative text. Output ONLY the visual description.';

  const userPrompt =
    `Story text: "${text.substring(0, 500)}"\n` +
    `Characters: ${charDesc}\n` +
    `Setting: ${place}\n\n` +
    `Describe the visual scene in 1-2 sentences.`;

  return callAI(userPrompt, systemPrompt);
}

/**
 * Build a DALL-E prompt with consistent styling for children's book illustrations.
 */
function buildIllustrationPrompt(
  sceneDescription: string,
  age: number,
  characters: StoryCharacter[]
): string {
  const charDesc = characters
    .filter(c => c.name.trim())
    .map(c => `a European child character as a ${c.type.toLowerCase()}`)
    .join(', ');

  const styleGuide = age < 8
    ? 'Bright, colorful, soft watercolor children\'s book illustration style. Cute, rounded characters with big eyes. Very friendly and non-threatening.'
    : age <= 10
    ? 'Vibrant, detailed children\'s book illustration in a warm painterly style. Friendly characters with expressive faces.'
    : 'Rich, atmospheric children\'s book illustration with detailed backgrounds. Semi-realistic style appropriate for pre-teens.';

  return (
    `${styleGuide} Scene: ${sceneDescription}. ` +
    `Characters: ${charDesc}. ` +
    `The characters are European with light skin tones. ` +
    `No text, words, letters, or numbers in the image. ` +
    `Children's book illustration, age-appropriate for ${age}-year-olds.`
  );
}

/**
 * Generate an illustration for a story segment.
 * Attempts DALL-E first, falls back to curated Unsplash images.
 */
export async function generateIllustration(
  segmentText: string,
  characters: StoryCharacter[],
  place: string,
  age: number,
  size: IllustrationSize,
  segmentIndex: number
): Promise<string> {
  // Try AI generation
  if (API_KEY && ENABLE_AI_ILLUSTRATIONS) {
    try {
      const sceneDesc = await extractSceneDescription(segmentText, characters, place);
      if (sceneDesc) {
        const prompt = buildIllustrationPrompt(sceneDesc, age, characters);
        // Full-page = portrait, Half-page = square
        const dalleSize = size === 'full' ? '1024x1792' as const : '1024x1024' as const;
        const imageUrl = await callImageAI(prompt, dalleSize);
        if (imageUrl) return imageUrl;
      }
    } catch (err) {
      console.error('Illustration generation failed, using fallback:', err);
    }
  }

  // Fallback: curated scene-matched Unsplash image
  return getSceneFallbackImage(segmentText, segmentIndex);
}

/**
 * Generate a cover illustration for the story.
 * Attempts DALL-E first, falls back to getStoryImage().
 */
export async function generateCoverIllustration(
  title: string,
  characters: StoryCharacter[],
  place: string,
  age: number
): Promise<string> {
  if (API_KEY && ENABLE_AI_ILLUSTRATIONS) {
    try {
      const charDesc = characters
        .filter(c => c.name.trim())
        .map(c => `a European child character as a ${c.type.toLowerCase()}`)
        .join(', ');

      const styleGuide = age < 8
        ? 'Bright, magical, whimsical children\'s book cover illustration. Soft watercolor style.'
        : 'Beautiful, detailed children\'s book cover illustration. Rich colors and atmospheric lighting.';

      const prompt =
        `${styleGuide} Book cover scene for "${title}" showing ${charDesc} in ${place}. ` +
        `The characters are European with light skin tones. ` +
        `Epic, inviting scene that captures the spirit of adventure and wonder. ` +
        `No text, words, letters, or numbers in the image. ` +
        `Professional children's book cover art, age-appropriate for ${age}-year-olds.`;

      const imageUrl = await callImageAI(prompt, '1024x1792');
      if (imageUrl) return imageUrl;
    } catch (err) {
      console.error('Cover illustration failed, using fallback:', err);
    }
  }

  // Fallback to place-matched Unsplash image
  return getStoryImage(place);
}
