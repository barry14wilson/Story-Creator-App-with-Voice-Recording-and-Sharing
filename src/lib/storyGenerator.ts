// ============================================
// Extended Story Generator for Audiobook-Length Content
// ============================================
// Generates longer stories through a structured multi-pass approach:
// 1. Create an outline with chapter summaries
// 2. Generate each chapter in sequence with rolling context
// 3. Insert decision points for interactive mode
// ============================================

import type {
  StoryCreationParams,
  StorySegment,
  DecisionPoint,
  DecisionOption,
  StoryFormat,
  AudiobookMode,
} from '../types';
import { formatCharacterNames, TIER_LIMITS } from '../types';
import { v4 as uuidv4 } from 'uuid';

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';
const API_URL = import.meta.env.VITE_OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';
const MODEL = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini';

// ============================================
// Types
// ============================================

interface ChapterOutline {
  chapterNumber: number;
  title: string;
  summary: string;
  isDecisionPoint: boolean; // For interactive audiobook mode
}

interface StoryOutline {
  title: string;
  chapters: ChapterOutline[];
  totalChapters: number;
}

export interface GenerationProgress {
  phase: 'outline' | 'chapter' | 'decision' | 'complete';
  currentChapter: number;
  totalChapters: number;
  percentComplete: number;
  message: string;
}

type ProgressCallback = (progress: GenerationProgress) => void;

export interface ExtendedStoryResult {
  segments: StorySegment[];
  decisionPoints: DecisionPoint[];
  title: string;
  estimatedReadMinutes: number;
}

// ============================================
// Helpers
// ============================================

function getAgeAppropriateGuidance(age: number): string {
  if (age <= 5) return 'Use very simple words, short sentences, and lots of repetition. Make it silly and fun. No scary content.';
  if (age <= 8) return 'Use simple vocabulary with some interesting words explained in context. Light adventure is okay, but nothing scary. Focus on friendship, kindness, and fun.';
  if (age <= 10) return 'Use age-appropriate vocabulary with some challenge. Adventure and mild tension are fine. Focus on teamwork, bravery, and problem solving.';
  return 'Use rich vocabulary appropriate for pre-teens. Complex plots with twists are okay. Themes of growth, responsibility, and discovery.';
}

function estimateReadingMinutes(text: string): number {
  const words = text.split(/\s+/).length;
  // Average reading speed for children: ~120 words/min (younger) to ~180 words/min (older)
  // For audiobook narration: ~150 words/min average
  return Math.round(words / 150);
}

function getTargetWordCount(tier: 'free' | 'pro', format: StoryFormat): number {
  if (format !== 'audiobook') return 1500; // Standard stories stay short
  // Audiobook: ~150 words/min narration speed
  const maxMinutes = TIER_LIMITS[tier].maxAudiobookMinutes;
  return maxMinutes * 150; // 3000 for free (20min), 9000 for pro (60min)
}

function getTargetChapterCount(targetWords: number): number {
  // Aim for chapters of ~500-800 words each
  const count = Math.round(targetWords / 650);
  return Math.max(3, Math.min(count, 15)); // 3 to 15 chapters
}

async function callAIExtended(
  prompt: string,
  systemPrompt: string,
  maxTokens = 1000
): Promise<string | null> {
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
// Phase 1: Generate Story Outline
// ============================================

async function generateOutline(
  params: StoryCreationParams,
  targetChapters: number,
  mode: AudiobookMode
): Promise<StoryOutline | null> {
  const characterNames = formatCharacterNames(params.characters);
  const ageGuide = getAgeAppropriateGuidance(params.childAge);

  const interactiveNote = mode === 'interactive'
    ? `Mark 2-3 chapters as "DECISION POINT" where the story reaches a critical moment and the listener should choose what happens next. Format these chapters with [DECISION] tag.`
    : '';

  const systemPrompt = `You are Robyn Reads, planning a ${targetChapters}-chapter children's audiobook for a ${params.childAge}-year-old. ${ageGuide}`;

  const userPrompt = `Create a ${targetChapters}-chapter story outline about ${characterNames} in ${params.place}.
Adventure theme: ${params.action}.

${interactiveNote}

For each chapter, provide:
- Chapter number
- Chapter title
- A 2-sentence summary of what happens

Format as:
Chapter 1: [Title]
Summary: [What happens]

Chapter 2: [Title]
Summary: [What happens]
...and so on.

Create exactly ${targetChapters} chapters with a satisfying story arc (setup, rising action, climax, resolution).`;

  const aiText = await callAIExtended(userPrompt, systemPrompt, 1500);
  if (!aiText) return null;

  // Parse the outline
  const chapters: ChapterOutline[] = [];
  const chapterRegex = /Chapter\s+(\d+):\s*(.+?)[\n\r]+Summary:\s*(.+?)(?=Chapter\s+\d+:|$)/gs;

  let match;
  while ((match = chapterRegex.exec(aiText)) !== null) {
    chapters.push({
      chapterNumber: parseInt(match[1]),
      title: match[2].trim(),
      summary: match[3].trim(),
      isDecisionPoint: match[2].includes('[DECISION]') || match[3].includes('[DECISION]'),
    });
  }

  // If parsing failed, try a simpler approach
  if (chapters.length === 0) {
    const lines = aiText.split('\n').filter(l => l.trim());
    let currentChapter: Partial<ChapterOutline> = {};
    let chapterNum = 0;

    for (const line of lines) {
      const chapterMatch = line.match(/Chapter\s+(\d+):\s*(.+)/i);
      const summaryMatch = line.match(/Summary:\s*(.+)/i);

      if (chapterMatch) {
        if (currentChapter.title && currentChapter.summary) {
          chapters.push(currentChapter as ChapterOutline);
        }
        chapterNum = parseInt(chapterMatch[1]);
        currentChapter = {
          chapterNumber: chapterNum,
          title: chapterMatch[2].trim().replace('[DECISION]', '').trim(),
          isDecisionPoint: chapterMatch[2].includes('[DECISION]'),
        };
      } else if (summaryMatch && currentChapter.chapterNumber) {
        currentChapter.summary = summaryMatch[1].trim().replace('[DECISION]', '').trim();
        currentChapter.isDecisionPoint = currentChapter.isDecisionPoint || summaryMatch[1].includes('[DECISION]');
      }
    }
    // Push the last chapter
    if (currentChapter.title && currentChapter.summary) {
      chapters.push(currentChapter as ChapterOutline);
    }
  }

  if (chapters.length === 0) return null;

  // Generate a story title
  const titlePrompt = `Based on this story about ${characterNames} in ${params.place} (theme: ${params.action}), suggest a single creative story title. Output ONLY the title, nothing else.`;
  const title = await callAIExtended(titlePrompt, 'You suggest creative children\'s book titles.', 50);

  return {
    title: title?.replace(/["']/g, '') || `${params.action} in ${params.place}`,
    chapters,
    totalChapters: chapters.length,
  };
}

// ============================================
// Phase 2: Generate Chapter Content
// ============================================

async function generateChapter(
  params: StoryCreationParams,
  outline: StoryOutline,
  chapterOutline: ChapterOutline,
  previousSummary: string,
  targetWords: number
): Promise<string | null> {
  const characterNames = formatCharacterNames(params.characters);
  const ageGuide = getAgeAppropriateGuidance(params.childAge);

  const contextNote = previousSummary
    ? `\n\nStory so far (summary): ${previousSummary}`
    : '';

  const systemPrompt = `You are Robyn Reads, writing Chapter ${chapterOutline.chapterNumber} of a ${outline.totalChapters}-chapter children's audiobook for a ${params.childAge}-year-old. ${ageGuide} Write engaging, vivid prose with dialogue. Write approximately ${targetWords} words.`;

  const userPrompt = `Story: "${outline.title}" about ${characterNames} in ${params.place}.

Chapter ${chapterOutline.chapterNumber}: ${chapterOutline.title}
What should happen: ${chapterOutline.summary}
${contextNote}

Write this chapter. Include vivid descriptions and dialogue. Make it approximately ${targetWords} words. Write ONLY the chapter text, no titles or headers.`;

  return callAIExtended(userPrompt, systemPrompt, Math.max(800, Math.round(targetWords * 1.5)));
}

// ============================================
// Phase 3: Generate Decision Points
// ============================================

async function generateDecisionPoint(
  params: StoryCreationParams,
  chapterText: string,
  nextChapterSummary: string,
  segmentIndex: number
): Promise<DecisionPoint | null> {
  const characterNames = formatCharacterNames(params.characters);

  const systemPrompt = 'You create story decision points for interactive children\'s audiobooks. Output exactly 3 choices in the specified format.';

  const userPrompt = `The story about ${characterNames} has reached a critical moment. Here's what just happened:

"${chapterText.substring(chapterText.length - 500)}"

The original planned next chapter: ${nextChapterSummary}

Create a decision point with exactly 3 choices the listener can make. Format:

PROMPT: [A question for the listener about what should happen next]
CHOICE 1: [Short label] | [Brief summary of what happens]
CHOICE 2: [Short label] | [Brief summary of what happens]
CHOICE 3: [Short label] | [Brief summary of what happens]`;

  const aiText = await callAIExtended(userPrompt, systemPrompt, 300);
  if (!aiText) return null;

  const promptMatch = aiText.match(/PROMPT:\s*(.+)/i);
  const choiceRegex = /CHOICE\s+\d+:\s*(.+?)\s*\|\s*(.+)/gi;

  const options: DecisionOption[] = [];
  let choiceMatch;
  while ((choiceMatch = choiceRegex.exec(aiText)) !== null) {
    options.push({
      id: uuidv4(),
      label: choiceMatch[1].trim(),
      summary: choiceMatch[2].trim(),
    });
  }

  if (options.length < 2) return null;

  return {
    id: uuidv4(),
    segmentIndex,
    prompt: promptMatch?.[1]?.trim() || 'What should happen next?',
    options,
  };
}

// ============================================
// Main: Generate Full Extended Story
// ============================================

export async function generateExtendedStory(
  params: StoryCreationParams,
  onProgress?: ProgressCallback
): Promise<ExtendedStoryResult> {
  const tier = 'free'; // TODO: pass tier from caller
  const format = params.format || 'standard';
  const mode = params.audiobookMode || 'straight';
  const targetWords = getTargetWordCount(tier, format);
  const targetChapters = getTargetChapterCount(targetWords);
  const wordsPerChapter = Math.round(targetWords / targetChapters);

  // Phase 1: Generate outline
  onProgress?.({
    phase: 'outline',
    currentChapter: 0,
    totalChapters: targetChapters,
    percentComplete: 5,
    message: 'Creating your story outline...',
  });

  const outline = await generateOutline(params, targetChapters, mode);

  if (!outline) {
    // Fall back to a simple outline
    return generateFallbackExtendedStory(params, targetChapters);
  }

  const segments: StorySegment[] = [];
  const decisionPoints: DecisionPoint[] = [];
  let rollingSummary = '';

  // Phase 2: Generate chapters
  for (let i = 0; i < outline.chapters.length; i++) {
    const chapter = outline.chapters[i];
    const progress = 10 + Math.round((i / outline.chapters.length) * 80);

    onProgress?.({
      phase: 'chapter',
      currentChapter: i + 1,
      totalChapters: outline.totalChapters,
      percentComplete: progress,
      message: `Writing Chapter ${i + 1}: ${chapter.title}...`,
    });

    const chapterText = await generateChapter(
      params,
      outline,
      chapter,
      rollingSummary,
      wordsPerChapter
    );

    const text = chapterText || generateFallbackChapter(params, chapter);

    // Add chapter title as a segment
    segments.push({
      id: uuidv4(),
      text: `**Chapter ${chapter.chapterNumber}: ${chapter.title}**`,
      author: 'ai',
      timestamp: new Date().toISOString(),
    });

    // Split chapter text into paragraphs as separate segments
    const paragraphs = text.split('\n\n').filter(p => p.trim());
    for (const para of paragraphs) {
      segments.push({
        id: uuidv4(),
        text: para.trim(),
        author: 'ai',
        timestamp: new Date().toISOString(),
      });
    }

    // Update rolling summary (keep last ~300 words to stay within context limits)
    rollingSummary = `${rollingSummary} Chapter ${chapter.chapterNumber} (${chapter.title}): ${chapter.summary}`.trim();
    if (rollingSummary.split(/\s+/).length > 300) {
      const words = rollingSummary.split(/\s+/);
      rollingSummary = words.slice(words.length - 250).join(' ');
    }

    // Phase 3: Generate decision point if applicable
    if (chapter.isDecisionPoint && mode === 'interactive' && i < outline.chapters.length - 1) {
      onProgress?.({
        phase: 'decision',
        currentChapter: i + 1,
        totalChapters: outline.totalChapters,
        percentComplete: progress + 2,
        message: 'Creating a decision point...',
      });

      const decision = await generateDecisionPoint(
        params,
        text,
        outline.chapters[i + 1].summary,
        segments.length - 1
      );

      if (decision) {
        decisionPoints.push(decision);
      }
    }
  }

  const fullText = segments.map(s => s.text).join(' ');

  onProgress?.({
    phase: 'complete',
    currentChapter: outline.totalChapters,
    totalChapters: outline.totalChapters,
    percentComplete: 100,
    message: 'Story complete!',
  });

  return {
    segments,
    decisionPoints,
    title: outline.title,
    estimatedReadMinutes: estimateReadingMinutes(fullText),
  };
}

// ============================================
// Fallback: Template-based Extended Story
// ============================================

function generateFallbackChapter(
  params: StoryCreationParams,
  chapter: ChapterOutline
): string {
  const chars = params.characters.filter(c => c.name.trim());
  const firstName = chars[0] ? `${chars[0].name} the ${chars[0].type}` : 'our hero';
  const secondName = chars[1] ? `${chars[1].name} the ${chars[1].type}` : undefined;

  const para1 = `The adventure continued as ${firstName} made their way deeper into ${params.place}. ${chapter.summary}`;
  const para2 = secondName
    ? `"What do you think we should do?" asked ${secondName}, looking around with wide eyes.\n\n"I think we need to keep going," ${firstName} replied with determination. "We've come too far to turn back now!"`
    : `${firstName} took a deep breath and steeled their resolve. "I can do this," they whispered, stepping forward with renewed courage.`;
  const para3 = `And so the next part of their ${params.action.toLowerCase()} began, bringing new surprises at every turn.`;

  return `${para1}\n\n${para2}\n\n${para3}`;
}

function generateFallbackExtendedStory(
  params: StoryCreationParams,
  targetChapters: number
): ExtendedStoryResult {
  const chars = params.characters.filter(c => c.name.trim());
  const characterNames = formatCharacterNames(chars);
  const firstName = chars[0] ? `${chars[0].name} the ${chars[0].type}` : 'our hero';
  const secondName = chars[1] ? `${chars[1].name} the ${chars[1].type}` : undefined;

  const segments: StorySegment[] = [];

  // Chapter 1: Introduction
  segments.push({
    id: uuidv4(),
    text: '**Chapter 1: The Beginning**',
    author: 'ai',
    timestamp: new Date().toISOString(),
  });
  segments.push({
    id: uuidv4(),
    text: `Once upon a time, in the magical land of ${params.place}, there lived ${characterNames}. They were about to embark on the most incredible adventure of their lives — ${params.action.toLowerCase()}.`,
    author: 'ai',
    timestamp: new Date().toISOString(),
  });
  segments.push({
    id: uuidv4(),
    text: secondName
      ? `"Are you ready for this?" asked ${firstName} with a grin.\n\n"Born ready!" replied ${secondName}, eyes sparkling with excitement.`
      : `${firstName} felt a surge of excitement. Today was the day everything would change.`,
    author: 'ai',
    timestamp: new Date().toISOString(),
  });

  // Middle chapters
  const middleThemes = [
    'The Discovery', 'The Challenge', 'An Unexpected Friend',
    'The Mystery Deepens', 'A Moment of Doubt', 'The Hidden Path',
    'A Surprising Turn', 'The Test of Courage', 'Gathering Strength',
  ];

  for (let i = 1; i < targetChapters - 1 && i < middleThemes.length + 1; i++) {
    const theme = middleThemes[(i - 1) % middleThemes.length];
    segments.push({
      id: uuidv4(),
      text: `**Chapter ${i + 1}: ${theme}**`,
      author: 'ai',
      timestamp: new Date().toISOString(),
    });
    segments.push({
      id: uuidv4(),
      text: `As ${firstName} ventured further into ${params.place}, they encountered something unexpected. The journey of ${params.action.toLowerCase()} was proving to be full of surprises.`,
      author: 'ai',
      timestamp: new Date().toISOString(),
    });
    segments.push({
      id: uuidv4(),
      text: secondName
        ? `${secondName} noticed something glinting in the distance. "Look over there!" they called out. ${firstName} turned and gasped — it was more wonderful than anything they had imagined.`
        : `${firstName} pressed on with determination, knowing that every step brought them closer to their goal. The path ahead was uncertain, but that only made it more exciting.`,
      author: 'ai',
      timestamp: new Date().toISOString(),
    });
  }

  // Final chapter
  segments.push({
    id: uuidv4(),
    text: `**Chapter ${targetChapters}: The Grand Finale**`,
    author: 'ai',
    timestamp: new Date().toISOString(),
  });
  segments.push({
    id: uuidv4(),
    text: `At last, ${firstName} stood at the end of their incredible journey through ${params.place}. ${params.action} had taught them so much — about bravery, about friendship, and most importantly, about believing in themselves.`,
    author: 'ai',
    timestamp: new Date().toISOString(),
  });
  segments.push({
    id: uuidv4(),
    text: secondName
      ? `${firstName} and ${secondName} looked at each other and smiled. "That was the best adventure ever," they said together. And they knew that no matter what happened next, they would face it side by side.\n\nThe End.`
      : `${firstName} smiled, looking back at how far they'd come. "That was amazing," they whispered. And deep in their heart, they knew this was just the beginning of many more adventures to come.\n\nThe End.`,
    author: 'ai',
    timestamp: new Date().toISOString(),
  });

  const fullText = segments.map(s => s.text).join(' ');

  return {
    segments,
    decisionPoints: [],
    title: `${params.action} in ${params.place}`,
    estimatedReadMinutes: estimateReadingMinutes(fullText),
  };
}
