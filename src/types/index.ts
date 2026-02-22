// ============================================
// Shared TypeScript Types for Robyn Reads
// ============================================

export type UserTier = 'free' | 'pro';
export type StoryFormat = 'standard' | 'audiobook';
export type AudiobookMode = 'interactive' | 'straight';
export type ProfileVisibility = 'public' | 'private';
export type FollowStatus = 'pending' | 'accepted' | 'declined';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  tier: UserTier;
  createdAt: string;
  deliveryAddress?: DeliveryAddress;
  avatarUrl?: string;
  bio?: string;
  visibility: ProfileVisibility;
  isChild: boolean;
  parentalConsentGranted: boolean;
  parentEmail?: string;
}

export interface DeliveryAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  postcode: string;
  country: string;
}

// ============================================
// Audiobook Types
// ============================================

export interface DecisionOption {
  id: string;
  label: string;
  summary: string;
}

export interface DecisionPoint {
  id: string;
  segmentIndex: number;
  prompt: string;
  options: DecisionOption[];
  selectedOptionId?: string;
}

export interface AudioSegment {
  id: string;
  storySegmentId: string;
  audioUrl: string;
  durationMs: number;
  status: 'pending' | 'generating' | 'done' | 'failed';
}

export interface AudiobookData {
  mode: AudiobookMode;
  voiceId: string;
  audioSegments: AudioSegment[];
  totalDurationMs: number;
  decisionPoints: DecisionPoint[];
  isComplete: boolean;
}

// ============================================
// Social / Profile Types
// ============================================

export interface PublicProfile {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  visibility: ProfileVisibility;
  isChild: boolean;
  followerCount: number;
  followingCount: number;
  storyCount: number;
  createdAt: string;
}

export interface FollowRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromDisplayName: string;
  fromAvatarUrl?: string;
  status: FollowStatus;
  createdAt: string;
  respondedAt?: string;
}

// ============================================
// Daily Usage Tracking
// ============================================

export interface DailyUsage {
  userId: string;
  date: string; // YYYY-MM-DD
  storiesCreated: number;
}

export type IllustrationSize = 'full' | 'half';
export type IllustrationStatus = 'pending' | 'generating' | 'done' | 'failed';

export interface StorySegment {
  id: string;
  text: string;
  author: 'ai' | 'user';
  timestamp: string;
  illustrationUrl?: string;
  illustrationSize?: IllustrationSize;
  illustrationStatus?: IllustrationStatus;
}

// ============================================
// Age-based illustration configuration
// ============================================
export interface IllustrationConfig {
  size: IllustrationSize;
  frequency: number; // illustrate every Nth segment
}

export function getIllustrationConfig(age: number): IllustrationConfig {
  if (age < 8) return { size: 'full', frequency: 2 };
  if (age <= 10) return { size: 'half', frequency: 2 };
  return { size: 'half', frequency: 3 };
}

/**
 * Determine whether a segment at a given index should have an illustration.
 * Index is 0-based; the first segment (index 0) always gets one.
 */
export function shouldSegmentHaveIllustration(index: number, age: number): boolean {
  if (index === 0) return true; // first segment always illustrated
  const { frequency } = getIllustrationConfig(age);
  return (index + 1) % frequency === 0;
}

export interface Story {
  id: string;
  userId: string;
  title: string;
  synopsis: string;
  coverImageUrl: string;
  childAge: number;
  characters: StoryCharacter[];
  place: string;
  action: string;
  segments: StorySegment[];
  authorName: string;
  isComplete: boolean;
  createdAt: string;
  updatedAt: string;
  format: StoryFormat;
  audiobook?: AudiobookData;
  isPublic: boolean;
  estimatedReadMinutes: number;
}

export interface StoryCharacter {
  name: string;
  type: string;
  imageUrl?: string;
}

export interface StoryCreationParams {
  childAge: number;
  characterCount: number;
  characters: StoryCharacter[];
  place: string;
  action: string;
  introLength: 1 | 2;
  format: StoryFormat;
  audiobookMode?: AudiobookMode;
}

// Constants
export const TIER_LIMITS = {
  free: {
    maxCharacters: 2,
    maxSavedStories: 3,
    canPrint: false,
    storyLengthLabel: 'Standard',
    maxStoryMinutes: 20,
    maxStoriesPerDay: 1,
    maxAudiobookMinutes: 20,
  },
  pro: {
    maxCharacters: 5,
    maxSavedStories: 999,
    canPrint: true,
    storyLengthLabel: 'Extended',
    maxStoryMinutes: 60,
    maxStoriesPerDay: 3,
    maxAudiobookMinutes: 60,
  },
} as const;

export const MAX_AGE_RATING = 13;
export const MIN_AGE = 3;

export const CHARACTER_TYPES = [
  'Princess', 'Knight', 'Dragon', 'Wizard',
  'Fairy', 'Pirate', 'Mermaid', 'Unicorn',
  'Robot', 'Astronaut', 'Dinosaur', 'Superhero',
  'Elf', 'Detective', 'Witch', 'Explorer',
];

export const QUICK_PLACES = [
  'Enchanted Forest', 'Magical Kingdom', "Dragon's Mountain",
  'Crystal Cave', 'Rainbow Castle', "Mermaid's Lagoon",
  'Cloud City', 'Fairy Garden', 'Outer Space',
  'Under the Sea', 'Candy Land', 'Dinosaur Island',
];

export const QUICK_ACTIONS = [
  'Going on an Adventure', 'Finding a Treasure',
  'Saving the Kingdom', 'Making New Friends',
  'Learning Magic', 'Solving a Mystery',
  'Having a Party', 'Breaking a Spell',
  'Building Something Amazing', 'Exploring a New World',
];

// SVG cartoon scene generator - creates colourful illustrated scenes
function createCartoonSVG(
  bgGradient: [string, string],
  elements: string,
  groundColor?: string
): string {
  const ground = groundColor
    ? `<ellipse cx="400" cy="750" rx="500" ry="100" fill="${groundColor}" opacity="0.6"/>`
    : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:${bgGradient[0]}"/>
        <stop offset="100%" style="stop-color:${bgGradient[1]}"/>
      </linearGradient>
    </defs>
    <rect width="800" height="800" fill="url(#bg)"/>
    ${ground}
    ${elements}
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const CARTOON_FOREST = createCartoonSVG(['#87CEEB', '#228B22'], `
  <circle cx="120" cy="100" r="50" fill="#fff" opacity="0.8"/>
  <circle cx="160" cy="110" r="40" fill="#fff" opacity="0.7"/>
  <circle cx="600" cy="80" r="35" fill="#fff" opacity="0.6"/>
  <circle cx="650" cy="90" r="45" fill="#fff" opacity="0.7"/>
  <polygon points="200,350 250,150 300,350" fill="#2d5a27"/>
  <polygon points="220,400 270,220 320,400" fill="#3a7a33"/>
  <rect x="255" y="350" width="30" height="80" fill="#8B4513"/>
  <polygon points="450,300 520,100 590,300" fill="#1a4d1a"/>
  <polygon points="470,380 540,180 610,380" fill="#2d6b2d"/>
  <rect x="505" y="300" width="30" height="100" fill="#8B4513"/>
  <polygon points="80,400 130,230 180,400" fill="#2d5a27"/>
  <rect x="115" y="360" width="25" height="70" fill="#6B3410"/>
  <polygon points="650,380 710,200 770,380" fill="#3a7a33"/>
  <rect x="695" y="340" width="25" height="70" fill="#8B4513"/>
  <circle cx="300" cy="550" r="15" fill="#FF6B6B"/>
  <circle cx="500" cy="580" r="12" fill="#FFD93D"/>
  <circle cx="150" cy="600" r="14" fill="#FF69B4"/>
  <circle cx="650" cy="560" r="13" fill="#FF6B6B"/>
  <circle cx="400" cy="610" r="10" fill="#9B59B6"/>
`, '#4a8c3f');

const CARTOON_SPACE = createCartoonSVG(['#0a0a2e', '#1a0a3e'], `
  <circle cx="100" cy="100" r="3" fill="#fff"/>
  <circle cx="300" cy="50" r="2" fill="#fff"/>
  <circle cx="500" cy="120" r="4" fill="#fff"/>
  <circle cx="700" cy="80" r="3" fill="#fff"/>
  <circle cx="200" cy="200" r="2" fill="#fff"/>
  <circle cx="600" cy="250" r="3" fill="#fff"/>
  <circle cx="150" cy="350" r="2" fill="#fff"/>
  <circle cx="680" cy="400" r="4" fill="#fff"/>
  <circle cx="50" cy="500" r="3" fill="#fff"/>
  <circle cx="750" cy="550" r="2" fill="#fff"/>
  <circle cx="400" cy="400" r="80" fill="#FFD700"/>
  <circle cx="400" cy="400" r="70" fill="#FFA500"/>
  <circle cx="380" cy="380" r="15" fill="#FF8C00" opacity="0.5"/>
  <circle cx="420" cy="420" r="10" fill="#FF8C00" opacity="0.4"/>
  <circle cx="200" cy="300" r="35" fill="#6C63FF"/>
  <ellipse cx="200" cy="300" rx="55" ry="8" fill="#9B8FFF" opacity="0.5"/>
  <circle cx="600" cy="500" r="45" fill="#FF6B6B"/>
  <circle cx="590" cy="490" r="10" fill="#FF4444" opacity="0.5"/>
  <path d="M350,600 L370,550 L400,620 L430,540 L450,600" stroke="#00BFFF" stroke-width="3" fill="none"/>
`);

const CARTOON_CASTLE = createCartoonSVG(['#87CEEB', '#E8D5B7'], `
  <circle cx="650" cy="100" r="60" fill="#FFD700" opacity="0.8"/>
  <rect x="250" y="300" width="300" height="350" fill="#D4A574" rx="5"/>
  <rect x="200" y="250" width="100" height="400" fill="#C19660"/>
  <rect x="500" y="250" width="100" height="400" fill="#C19660"/>
  <polygon points="200,250 250,150 300,250" fill="#8B0000"/>
  <polygon points="500,250 550,150 600,250" fill="#8B0000"/>
  <polygon points="300,300 400,180 500,300" fill="#A00000"/>
  <rect x="350" y="450" width="100" height="200" fill="#8B4513" rx="50 50 0 0"/>
  <circle cx="430" cy="550" r="8" fill="#FFD700"/>
  <rect x="310" y="350" width="50" height="60" fill="#87CEEB" rx="25 25 0 0"/>
  <rect x="440" y="350" width="50" height="60" fill="#87CEEB" rx="25 25 0 0"/>
  <polygon points="330,350 335,330 340,350" fill="#D4A574"/>
  <polygon points="460,350 465,330 470,350" fill="#D4A574"/>
  <path d="M100,620 Q200,580 300,620 Q400,660 500,620 Q600,580 700,620 L700,700 L100,700 Z" fill="#4CAF50"/>
`, '#4CAF50');

const CARTOON_OCEAN = createCartoonSVG(['#87CEEB', '#006994'], `
  <circle cx="650" cy="80" r="50" fill="#FFD700" opacity="0.8"/>
  <circle cx="100" cy="100" r="40" fill="#fff" opacity="0.7"/>
  <circle cx="140" cy="110" r="35" fill="#fff" opacity="0.6"/>
  <path d="M0,350 Q100,300 200,350 Q300,400 400,350 Q500,300 600,350 Q700,400 800,350 L800,800 L0,800 Z" fill="#0077B6"/>
  <path d="M0,400 Q100,360 200,400 Q300,440 400,400 Q500,360 600,400 Q700,440 800,400 L800,800 L0,800 Z" fill="#005F8A" opacity="0.7"/>
  <path d="M0,500 Q100,470 200,500 Q300,530 400,500 Q500,470 600,500 Q700,530 800,500 L800,800 L0,800 Z" fill="#004466" opacity="0.5"/>
  <ellipse cx="350" cy="550" rx="50" ry="25" fill="#FF6B6B"/>
  <circle cx="330" cy="540" r="5" fill="#fff"/>
  <circle cx="325" cy="540" r="2" fill="#333"/>
  <path d="M370,540 Q380,535 385,545" stroke="#FF6B6B" stroke-width="3" fill="none"/>
  <ellipse cx="550" cy="480" rx="35" ry="18" fill="#FFD93D"/>
  <circle cx="535" cy="473" r="4" fill="#fff"/>
  <circle cx="532" cy="473" r="2" fill="#333"/>
  <path d="M250,650 Q280,620 310,650 Q330,670 350,650" stroke="#00CED1" stroke-width="3" fill="none"/>
`);

const CARTOON_CAVE = createCartoonSVG(['#2C1810', '#4A3728'], `
  <path d="M0,100 Q200,0 400,80 Q600,160 800,100 L800,0 L0,0 Z" fill="#1a0f08"/>
  <path d="M0,800 Q150,650 300,700 Q450,750 600,680 Q700,650 800,700 L800,800 L0,800 Z" fill="#1a0f08"/>
  <polygon points="100,0 120,200 80,200" fill="#3d2817"/>
  <polygon points="300,0 320,150 280,150" fill="#2C1810"/>
  <polygon points="600,0 620,180 580,180" fill="#3d2817"/>
  <polygon points="200,800 220,600 180,600" fill="#2C1810"/>
  <polygon points="500,800 520,650 480,650" fill="#3d2817"/>
  <circle cx="250" cy="400" r="20" fill="#9B59B6" opacity="0.8"/>
  <circle cx="250" cy="400" r="10" fill="#D4A5FF" opacity="0.6"/>
  <circle cx="500" cy="350" r="25" fill="#00CED1" opacity="0.7"/>
  <circle cx="500" cy="350" r="12" fill="#7FDBDB" opacity="0.5"/>
  <circle cx="380" cy="500" r="15" fill="#FF69B4" opacity="0.6"/>
  <circle cx="380" cy="500" r="7" fill="#FFB6D9" opacity="0.5"/>
  <circle cx="600" cy="450" r="18" fill="#FFD700" opacity="0.7"/>
  <circle cx="600" cy="450" r="8" fill="#FFE44D" opacity="0.5"/>
`);

const CARTOON_MOUNTAIN = createCartoonSVG(['#87CEEB', '#B0D4F1'], `
  <circle cx="650" cy="100" r="50" fill="#FFD700" opacity="0.8"/>
  <polygon points="100,600 250,200 400,600" fill="#7B8794"/>
  <polygon points="300,600 500,150 700,600" fill="#8E99A4"/>
  <polygon points="500,600 650,250 800,600" fill="#6B7680"/>
  <polygon points="200,250 250,200 300,250" fill="#fff"/>
  <polygon points="440,200 500,150 560,200" fill="#fff"/>
  <polygon points="610,300 650,250 690,300" fill="#fff"/>
  <circle cx="100" cy="80" r="40" fill="#fff" opacity="0.7"/>
  <circle cx="150" cy="90" r="35" fill="#fff" opacity="0.6"/>
  <path d="M0,550 Q200,500 400,550 Q600,600 800,550 L800,800 L0,800 Z" fill="#4CAF50"/>
  <circle cx="200" cy="520" r="8" fill="#FF6B6B"/>
  <circle cx="350" cy="540" r="6" fill="#FFD93D"/>
  <circle cx="600" cy="530" r="7" fill="#FF69B4"/>
`);

const CARTOON_GARDEN = createCartoonSVG(['#87CEEB', '#90EE90'], `
  <circle cx="150" cy="100" r="50" fill="#FFD700" opacity="0.8"/>
  <path d="M0,450 Q200,400 400,450 Q600,500 800,450 L800,800 L0,800 Z" fill="#4CAF50"/>
  <circle cx="150" cy="400" r="25" fill="#FF69B4"/>
  <circle cx="150" cy="400" r="12" fill="#FFD700"/>
  <rect x="147" y="400" width="6" height="80" fill="#228B22"/>
  <circle cx="300" cy="380" r="30" fill="#FF6B6B"/>
  <circle cx="300" cy="380" r="15" fill="#FFD93D"/>
  <rect x="297" y="380" width="6" height="90" fill="#228B22"/>
  <circle cx="500" cy="410" r="22" fill="#9B59B6"/>
  <circle cx="500" cy="410" r="10" fill="#FFD700"/>
  <rect x="497" y="410" width="6" height="70" fill="#228B22"/>
  <circle cx="650" cy="390" r="28" fill="#FF69B4"/>
  <circle cx="650" cy="390" r="14" fill="#FFA500"/>
  <rect x="647" y="390" width="6" height="85" fill="#228B22"/>
  <path d="M400,300 Q410,280 420,300 Q430,280 440,300" stroke="#FF69B4" stroke-width="3" fill="#FF69B4" opacity="0.6"/>
  <path d="M550,280 Q560,260 570,280 Q580,260 590,280" stroke="#9B59B6" stroke-width="3" fill="#9B59B6" opacity="0.6"/>
  <ellipse cx="400" cy="550" rx="60" ry="8" fill="#3a8a3a" opacity="0.4"/>
`);

const CARTOON_CANDY = createCartoonSVG(['#FFB6C1', '#FF69B4'], `
  <circle cx="200" cy="200" r="60" fill="#FF4500"/>
  <path d="M200,200 L200,140 A60,60 0 0,1 252,170 Z" fill="#fff" opacity="0.3"/>
  <path d="M200,200 L252,230 A60,60 0 0,1 200,260 Z" fill="#fff" opacity="0.3"/>
  <rect x="195" y="260" width="10" height="80" fill="#fff" rx="5"/>
  <circle cx="550" cy="300" r="50" fill="#9B59B6"/>
  <circle cx="550" cy="300" r="30" fill="#D4A5FF"/>
  <circle cx="550" cy="300" r="15" fill="#E8D5FF"/>
  <rect x="545" y="350" width="10" height="70" fill="#fff" rx="5"/>
  <rect x="300" y="400" width="200" height="100" fill="#FFD700" rx="20"/>
  <rect x="310" y="410" width="40" height="30" fill="#FF6B6B" rx="5"/>
  <rect x="360" y="410" width="40" height="30" fill="#4CAF50" rx="5"/>
  <rect x="410" y="410" width="40" height="30" fill="#2196F3" rx="5"/>
  <rect x="310" y="460" width="40" height="30" fill="#FF69B4" rx="5"/>
  <rect x="360" y="460" width="40" height="30" fill="#FFA500" rx="5"/>
  <rect x="410" y="460" width="40" height="30" fill="#9B59B6" rx="5"/>
  <circle cx="100" cy="500" r="40" fill="#4CAF50"/>
  <circle cx="100" cy="500" r="25" fill="#66BB6A"/>
  <circle cx="100" cy="500" r="12" fill="#81C784"/>
  <circle cx="650" cy="450" r="35" fill="#2196F3"/>
  <circle cx="650" cy="450" r="20" fill="#64B5F6"/>
`, '#FFB6C1');

const CARTOON_DEFAULT = createCartoonSVG(['#667eea', '#764ba2'], `
  <circle cx="400" cy="250" r="100" fill="#FFD700" opacity="0.3"/>
  <circle cx="400" cy="250" r="70" fill="#FFD700" opacity="0.4"/>
  <circle cx="400" cy="250" r="40" fill="#FFD700" opacity="0.6"/>
  <path d="M200,500 Q300,420 400,500 Q500,580 600,500" stroke="#fff" stroke-width="3" fill="none" opacity="0.5"/>
  <path d="M150,550 Q300,470 450,550 Q600,630 750,550" stroke="#fff" stroke-width="2" fill="none" opacity="0.3"/>
  <circle cx="200" cy="350" r="15" fill="#FF69B4" opacity="0.6"/>
  <circle cx="600" cy="380" r="12" fill="#00CED1" opacity="0.6"/>
  <circle cx="350" cy="600" r="18" fill="#FFD93D" opacity="0.5"/>
  <circle cx="550" cy="300" r="10" fill="#FF6B6B" opacity="0.7"/>
  <polygon points="400,150 410,180 440,180 415,200 425,230 400,210 375,230 385,200 360,180 390,180" fill="#FFD700" opacity="0.8"/>
`);

export const STORY_IMAGES: Record<string, string> = {
  forest: CARTOON_FOREST,
  space: CARTOON_SPACE,
  castle: CARTOON_CASTLE,
  ocean: CARTOON_OCEAN,
  cave: CARTOON_CAVE,
  mountain: CARTOON_MOUNTAIN,
  garden: CARTOON_GARDEN,
  candy: CARTOON_CANDY,
  default: CARTOON_DEFAULT,
};

export function getStoryImage(place: string): string {
  const lower = place.toLowerCase();
  for (const [key, url] of Object.entries(STORY_IMAGES)) {
    if (key !== 'default' && lower.includes(key)) {
      return url;
    }
  }
  // Extended matching
  if (lower.includes('kingdom') || lower.includes('rainbow')) return STORY_IMAGES.castle;
  if (lower.includes('lagoon') || lower.includes('sea') || lower.includes('mermaid')) return STORY_IMAGES.ocean;
  if (lower.includes('cloud') || lower.includes('sky') || lower.includes('planet')) return STORY_IMAGES.space;
  if (lower.includes('enchanted') || lower.includes('wood')) return STORY_IMAGES.forest;
  if (lower.includes('fairy') || lower.includes('flower')) return STORY_IMAGES.garden;
  if (lower.includes('dragon')) return STORY_IMAGES.mountain;
  if (lower.includes('crystal')) return STORY_IMAGES.cave;
  if (lower.includes('candy') || lower.includes('sweet')) return STORY_IMAGES.candy;
  return STORY_IMAGES.default;
}

export function formatCharacterNames(characters: StoryCharacter[]): string {
  const labels = characters
    .filter(c => c.name.trim())
    .map(c => `${c.name} the ${c.type}`);
  if (labels.length === 0) return '';
  if (labels.length === 1) return labels[0];
  return labels.slice(0, -1).join(', ') + ' and ' + labels[labels.length - 1];
}

// Generate a cartoon character illustration URL using DiceBear API
// Returns an age-appropriate, fun cartoon avatar based on character type
export function getCharacterImageUrl(character: StoryCharacter): string {
  const seed = `${character.name}-${character.type}`.toLowerCase().replace(/\s+/g, '-');
  // Use DiceBear's "adventurer" style for kid-friendly cartoon characters
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}

// ============================================
// Scene Fallback Images (cartoon SVG illustrations)
// ============================================
// Each category has 2 variations for variety

const createSceneSVG = (bg1: string, bg2: string, scene: string): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">
    <defs><linearGradient id="sbg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${bg1}"/><stop offset="100%" style="stop-color:${bg2}"/>
    </linearGradient></defs>
    <rect width="800" height="800" fill="url(#sbg)"/>${scene}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

export const SCENE_FALLBACK_IMAGES: Record<string, string[]> = {
  adventure: [
    createSceneSVG('#FFB347', '#FF6B35', `
      <path d="M0,500 Q200,400 400,480 Q600,560 800,450 L800,800 L0,800Z" fill="#4CAF50"/>
      <polygon points="300,200 350,80 400,200" fill="#FFD700"/><polygon points="340,120 350,80 360,120 370,100 380,130" fill="#FF6B35"/>
      <rect x="345" y="200" width="10" height="60" fill="#8B4513"/>
      <circle cx="200" cy="350" r="40" fill="#FF6B6B" opacity="0.6"/><circle cx="600" cy="300" r="35" fill="#9B59B6" opacity="0.5"/>
      <path d="M100,450 L250,350 L400,420 L550,330 L700,400" stroke="#FFD700" stroke-width="4" fill="none" stroke-dasharray="10,5"/>
    `),
    createSceneSVG('#667eea', '#764ba2', `
      <circle cx="400" cy="300" r="120" fill="#FFD700" opacity="0.2"/>
      <path d="M0,550 Q200,480 400,550 Q600,620 800,520 L800,800 L0,800Z" fill="#2d8a4e"/>
      <path d="M200,500 L300,350 L400,500" stroke="#FFD700" stroke-width="4" fill="none"/>
      <circle cx="300" cy="350" r="15" fill="#FF6B6B"/><circle cx="500" cy="400" r="20" fill="#00CED1" opacity="0.7"/>
      <polygon points="600,400 620,350 640,400 630,370 650,380" fill="#FFD700"/>
    `),
  ],
  friendship: [
    createSceneSVG('#FFE4E1', '#FFB6C1', `
      <path d="M0,500 Q400,400 800,500 L800,800 L0,800Z" fill="#90EE90"/>
      <circle cx="300" cy="380" r="35" fill="#FF69B4"/><circle cx="300" cy="350" r="28" fill="#FFB6C1"/>
      <circle cx="288" cy="343" r="4" fill="#333"/><circle cx="312" cy="343" r="4" fill="#333"/>
      <path d="M293,358 Q300,365 307,358" stroke="#333" stroke-width="2" fill="none"/>
      <circle cx="500" cy="380" r="35" fill="#87CEEB"/><circle cx="500" cy="350" r="28" fill="#B0E0E6"/>
      <circle cx="488" cy="343" r="4" fill="#333"/><circle cx="512" cy="343" r="4" fill="#333"/>
      <path d="M493,358 Q500,365 507,358" stroke="#333" stroke-width="2" fill="none"/>
      <path d="M335,370 Q400,340 465,370" stroke="#FF69B4" stroke-width="3" fill="none"/>
      <path d="M380,280 L400,260 L420,280 Q400,310 380,280Z" fill="#FF6B6B"/>
    `),
    createSceneSVG('#E8D5B7', '#FFE4C4', `
      <path d="M0,480 Q400,420 800,480 L800,800 L0,800Z" fill="#7EC87E"/>
      <circle cx="250" cy="400" r="30" fill="#FFD93D"/><circle cx="250" cy="370" r="24" fill="#FFE680"/>
      <circle cx="240" cy="365" r="3" fill="#333"/><circle cx="260" cy="365" r="3" fill="#333"/>
      <circle cx="400" cy="390" r="30" fill="#FF9999"/><circle cx="400" cy="360" r="24" fill="#FFCCCC"/>
      <circle cx="390" cy="355" r="3" fill="#333"/><circle cx="410" cy="355" r="3" fill="#333"/>
      <circle cx="550" cy="400" r="30" fill="#99CCFF"/><circle cx="550" cy="370" r="24" fill="#CCE5FF"/>
      <circle cx="540" cy="365" r="3" fill="#333"/><circle cx="560" cy="365" r="3" fill="#333"/>
      <circle cx="150" cy="120" r="50" fill="#FFD700" opacity="0.8"/>
    `),
  ],
  magic: [
    createSceneSVG('#1a0533', '#4a1a7a', `
      <circle cx="200" cy="300" r="80" fill="#9B59B6" opacity="0.3"/>
      <circle cx="200" cy="300" r="50" fill="#D4A5FF" opacity="0.3"/>
      <polygon points="400,150 410,180 440,185 415,205 425,235 400,215 375,235 385,205 360,185 390,180" fill="#FFD700"/>
      <polygon points="200,400 207,420 228,420 211,433 218,453 200,440 182,453 189,433 172,420 193,420" fill="#FFD700" opacity="0.7"/>
      <polygon points="600,350 607,370 628,370 611,383 618,403 600,390 582,403 589,383 572,370 593,370" fill="#FFD700" opacity="0.6"/>
      <circle cx="300" cy="500" r="10" fill="#FF69B4" opacity="0.8"/>
      <circle cx="500" cy="250" r="8" fill="#00CED1" opacity="0.7"/>
      <circle cx="150" cy="450" r="6" fill="#FFD93D" opacity="0.6"/>
      <circle cx="650" cy="500" r="12" fill="#FF6B6B" opacity="0.7"/>
      <path d="M350,550 Q400,500 450,550 Q500,500 550,550" stroke="#D4A5FF" stroke-width="2" fill="none" opacity="0.5"/>
      <rect x="385" y="350" width="30" height="120" fill="#8B4513" rx="3"/>
      <polygon points="400,250 440,350 360,350" fill="#FFD700" opacity="0.8"/>
    `),
    createSceneSVG('#0d1b2a', '#1b2838', `
      <circle cx="400" cy="300" r="90" fill="#9B59B6" opacity="0.2"/>
      <circle cx="400" cy="300" r="60" fill="#D4A5FF" opacity="0.2"/>
      <polygon points="400,100 412,140 452,145 420,170 432,210 400,185 368,210 380,170 348,145 388,140" fill="#FFD700"/>
      <polygon points="150,350 157,370 178,370 161,383 168,403 150,390 132,403 139,383 122,370 143,370" fill="#FFD700" opacity="0.7"/>
      <polygon points="650,300 657,320 678,320 661,333 668,353 650,340 632,353 639,333 622,320 643,320" fill="#FFD700" opacity="0.6"/>
      <circle cx="250" cy="500" r="12" fill="#FF69B4" opacity="0.7"/>
      <circle cx="550" cy="200" r="10" fill="#00CED1" opacity="0.6"/>
      <circle cx="100" cy="400" r="8" fill="#FFD93D" opacity="0.5"/>
      <circle cx="700" cy="450" r="14" fill="#FF6B6B" opacity="0.6"/>
      <path d="M300,500 Q350,450 400,500 Q450,450 500,500 Q550,450 600,500" stroke="#D4A5FF" stroke-width="2" fill="none" opacity="0.4"/>
      <rect x="380" y="300" width="40" height="150" fill="#8B4513" rx="3"/>
      <circle cx="400" cy="280" r="30" fill="#FFD700" opacity="0.7"/>
    `),
  ],
  forest: [CARTOON_FOREST, createSceneSVG('#4a7c3f', '#2d5a27', `
    <polygon points="100,500 170,250 240,500" fill="#1a5c1a"/>
    <polygon points="300,480 400,200 500,480" fill="#2d7a2d"/>
    <polygon points="550,500 630,280 710,500" fill="#1a5c1a"/>
    <rect x="160" y="450" width="20" height="80" fill="#6B3410"/>
    <rect x="390" y="430" width="20" height="80" fill="#8B4513"/>
    <rect x="620" y="450" width="20" height="80" fill="#6B3410"/>
    <circle cx="200" cy="600" r="20" fill="#FF6B6B"/>
    <circle cx="450" cy="620" r="15" fill="#FFD93D"/>
    <circle cx="600" cy="610" r="18" fill="#FF69B4"/>
    <ellipse cx="350" cy="650" rx="30" ry="10" fill="#228B22" opacity="0.5"/>
    <circle cx="100" cy="100" r="40" fill="#fff" opacity="0.7"/>
    <circle cx="140" cy="110" r="35" fill="#fff" opacity="0.6"/>
  `)],
  ocean: [CARTOON_OCEAN, createSceneSVG('#00BFFF', '#001f3f', `
    <path d="M0,300 Q200,250 400,300 Q600,350 800,280 L800,800 L0,800Z" fill="#0077B6"/>
    <path d="M0,380 Q200,340 400,380 Q600,420 800,360 L800,800 L0,800Z" fill="#005F8A" opacity="0.8"/>
    <ellipse cx="300" cy="450" rx="60" ry="30" fill="#FF6B6B"/>
    <circle cx="275" cy="440" r="6" fill="#fff"/><circle cx="271" cy="440" r="3" fill="#333"/>
    <path d="M330,440 Q340,430 350,445" stroke="#FF6B6B" stroke-width="3" fill="none"/>
    <circle cx="550" cy="550" r="30" fill="#FFD93D" opacity="0.6"/>
    <path d="M520,545 L540,530 L560,545 L580,530" stroke="#FFD93D" stroke-width="2" fill="none"/>
    <circle cx="150" cy="500" r="20" fill="#00CED1" opacity="0.4"/>
    <circle cx="650" cy="400" r="25" fill="#9B59B6" opacity="0.3"/>
    <path d="M200,600 Q250,570 300,600 Q350,630 400,600" stroke="#fff" stroke-width="2" fill="none" opacity="0.4"/>
  `)],
  castle: [CARTOON_CASTLE, createSceneSVG('#FFB6C1', '#FF69B4', `
    <rect x="300" y="250" width="200" height="300" fill="#FFE4E1" rx="5"/>
    <rect x="250" y="200" width="80" height="350" fill="#FFD1DC"/>
    <rect x="470" y="200" width="80" height="350" fill="#FFD1DC"/>
    <polygon points="250,200 290,120 330,200" fill="#FF69B4"/>
    <polygon points="470,200 510,120 550,200" fill="#FF69B4"/>
    <polygon points="350,250 400,150 450,250" fill="#FF1493"/>
    <rect x="370" y="400" width="60" height="150" fill="#DDA0DD" rx="30 30 0 0"/>
    <circle cx="420" cy="480" r="6" fill="#FFD700"/>
    <rect x="330" y="300" width="40" height="50" fill="#87CEEB" rx="20 20 0 0"/>
    <rect x="430" y="300" width="40" height="50" fill="#87CEEB" rx="20 20 0 0"/>
    <path d="M0,520 Q200,480 400,520 Q600,560 800,520 L800,800 L0,800Z" fill="#90EE90"/>
    <circle cx="100" cy="490" r="10" fill="#FF69B4"/>
    <circle cx="700" cy="500" r="12" fill="#FF6B6B"/>
  `)],
  space: [CARTOON_SPACE, createSceneSVG('#0a0025', '#1a0a4e', `
    <circle cx="100" cy="80" r="2" fill="#fff"/><circle cx="250" cy="150" r="3" fill="#fff"/>
    <circle cx="400" cy="50" r="2" fill="#fff"/><circle cx="550" cy="130" r="4" fill="#fff"/>
    <circle cx="700" cy="70" r="3" fill="#fff"/><circle cx="350" cy="250" r="2" fill="#fff"/>
    <circle cx="650" cy="300" r="3" fill="#fff"/>
    <circle cx="300" cy="400" r="60" fill="#FF6B6B"/>
    <circle cx="280" cy="380" r="15" fill="#FF4444" opacity="0.4"/>
    <circle cx="320" cy="410" r="10" fill="#FF8888" opacity="0.3"/>
    <circle cx="550" cy="300" r="40" fill="#4FC3F7"/>
    <ellipse cx="550" cy="300" rx="60" ry="8" fill="#81D4FA" opacity="0.5"/>
    <circle cx="150" cy="550" r="25" fill="#FFD700"/>
    <circle cx="140" cy="540" r="8" fill="#FFA000" opacity="0.5"/>
    <path d="M650,500 L670,460 L690,500 L680,480 L700,490" stroke="#FF69B4" stroke-width="3" fill="none"/>
  `)],
  garden: [CARTOON_GARDEN, createSceneSVG('#E8F5E9', '#81C784', `
    <path d="M0,400 Q400,350 800,400 L800,800 L0,800Z" fill="#66BB6A"/>
    <circle cx="150" cy="350" r="30" fill="#E91E63"/><circle cx="150" cy="350" r="15" fill="#FFD700"/>
    <rect x="147" y="350" width="6" height="100" fill="#2E7D32"/>
    <circle cx="350" cy="330" r="35" fill="#9C27B0"/><circle cx="350" cy="330" r="18" fill="#FFD93D"/>
    <rect x="347" y="330" width="6" height="110" fill="#2E7D32"/>
    <circle cx="550" cy="360" r="28" fill="#2196F3"/><circle cx="550" cy="360" r="14" fill="#fff"/>
    <rect x="547" y="360" width="6" height="90" fill="#2E7D32"/>
    <circle cx="700" cy="340" r="25" fill="#FF5722"/><circle cx="700" cy="340" r="12" fill="#FFD700"/>
    <rect x="697" y="340" width="6" height="95" fill="#2E7D32"/>
    <path d="M250,280 Q260,260 270,280" fill="#FF69B4" opacity="0.6"/>
    <path d="M450,270 Q460,250 470,270" fill="#9B59B6" opacity="0.6"/>
    <circle cx="600" cy="100" r="50" fill="#FFD700" opacity="0.7"/>
  `)],
  village: [
    createSceneSVG('#87CEEB', '#B0D4F1', `
      <path d="M0,450 Q400,400 800,450 L800,800 L0,800Z" fill="#7EC87E"/>
      <rect x="100" y="350" width="120" height="100" fill="#FF6B6B" rx="5"/>
      <polygon points="100,350 160,280 220,350" fill="#CC4444"/>
      <rect x="140" y="380" width="40" height="70" fill="#8B4513"/>
      <rect x="350" y="320" width="140" height="130" fill="#FFD93D" rx="5"/>
      <polygon points="350,320 420,240 490,320" fill="#FFA500"/>
      <rect x="395" y="360" width="50" height="90" fill="#8B4513"/>
      <rect x="360" y="350" width="30" height="30" fill="#87CEEB"/>
      <rect x="450" y="350" width="30" height="30" fill="#87CEEB"/>
      <rect x="600" y="360" width="100" height="90" fill="#9B59B6" rx="5"/>
      <polygon points="600,360 650,300 700,360" fill="#7B2D8E"/>
      <rect x="630" y="390" width="40" height="60" fill="#8B4513"/>
      <circle cx="650" cy="80" r="45" fill="#FFD700" opacity="0.8"/>
    `),
    createSceneSVG('#FFE4C4', '#DEB887', `
      <path d="M0,480 Q400,430 800,480 L800,800 L0,800Z" fill="#8FBC8F"/>
      <rect x="150" y="350" width="100" height="130" fill="#DEB887" rx="5"/>
      <polygon points="150,350 200,280 250,350" fill="#CD853F"/>
      <rect x="180" y="400" width="40" height="80" fill="#6B3410"/>
      <rect x="400" y="330" width="120" height="150" fill="#F5DEB3" rx="5"/>
      <polygon points="400,330 460,260 520,330" fill="#D2B48C"/>
      <rect x="440" y="380" width="40" height="100" fill="#6B3410"/>
      <circle cx="200" cy="80" r="45" fill="#FFD700" opacity="0.8"/>
      <circle cx="600" cy="100" r="35" fill="#fff" opacity="0.7"/>
    `),
  ],
  mountain: [CARTOON_MOUNTAIN, createSceneSVG('#B0D4F1', '#87CEEB', `
    <polygon points="0,600 200,200 400,600" fill="#8E99A4"/>
    <polygon points="200,600 450,100 700,600" fill="#7B8794"/>
    <polygon points="500,600 700,250 900,600" fill="#6B7680"/>
    <polygon points="150,250 200,200 250,250" fill="#fff"/>
    <polygon points="400,150 450,100 500,150" fill="#fff"/>
    <polygon points="660,300 700,250 740,300" fill="#fff"/>
    <path d="M0,550 Q200,500 400,550 Q600,600 800,550 L800,800 L0,800Z" fill="#4CAF50"/>
    <circle cx="150" cy="520" r="10" fill="#FF6B6B"/>
    <circle cx="400" cy="540" r="8" fill="#FFD93D"/>
    <circle cx="650" cy="80" r="45" fill="#FFD700" opacity="0.8"/>
  `)],
  cave: [CARTOON_CAVE, createSceneSVG('#1a0f08', '#3d2817', `
    <path d="M0,0 Q200,100 400,50 Q600,0 800,80 L800,200 Q600,150 400,200 Q200,250 0,180 Z" fill="#0d0705"/>
    <path d="M0,800 Q200,650 400,720 Q600,780 800,680 L800,800 Z" fill="#0d0705"/>
    <polygon points="150,0 170,250 130,250" fill="#2C1810"/>
    <polygon points="400,0 420,200 380,200" fill="#1a0f08"/>
    <polygon points="650,0 670,180 630,180" fill="#2C1810"/>
    <circle cx="300" cy="400" r="25" fill="#FF69B4" opacity="0.6"/>
    <circle cx="300" cy="400" r="12" fill="#FFB6D9" opacity="0.4"/>
    <circle cx="550" cy="450" r="30" fill="#00CED1" opacity="0.5"/>
    <circle cx="550" cy="450" r="15" fill="#7FDBDB" opacity="0.3"/>
    <circle cx="200" cy="550" r="20" fill="#FFD700" opacity="0.6"/>
    <circle cx="200" cy="550" r="10" fill="#FFE44D" opacity="0.4"/>
    <circle cx="650" cy="380" r="18" fill="#9B59B6" opacity="0.5"/>
  `)],
  treasure: [
    createSceneSVG('#FFD700', '#FF8C00', `
      <path d="M0,500 Q400,450 800,500 L800,800 L0,800Z" fill="#DEB887"/>
      <rect x="300" y="350" width="200" height="120" fill="#8B4513" rx="10"/>
      <rect x="310" y="340" width="180" height="20" fill="#A0522D" rx="5"/>
      <rect x="380" y="340" width="40" height="130" fill="#DAA520" rx="3"/>
      <circle cx="400" cy="410" r="15" fill="#FFD700"/>
      <circle cx="400" cy="410" r="8" fill="#FFA500"/>
      <circle cx="350" cy="390" r="8" fill="#FFD700" opacity="0.8"/>
      <circle cx="450" cy="395" r="10" fill="#FFD700" opacity="0.7"/>
      <circle cx="370" cy="430" r="7" fill="#FFD700" opacity="0.9"/>
      <circle cx="430" cy="425" r="9" fill="#FFD700" opacity="0.8"/>
      <polygon points="250,300 260,280 270,300 280,285 290,305" fill="#FFD700" opacity="0.6"/>
      <polygon points="500,280 510,260 520,280 530,265 540,285" fill="#FFD700" opacity="0.5"/>
    `),
    createSceneSVG('#006994', '#004466', `
      <path d="M0,400 Q200,350 400,400 Q600,450 800,380 L800,800 L0,800Z" fill="#0077B6"/>
      <path d="M200,500 Q300,450 400,500 Q500,550 600,500" stroke="#FFD700" stroke-width="3" fill="none" stroke-dasharray="10,5"/>
      <rect x="350" y="450" width="100" height="70" fill="#8B4513" rx="5"/>
      <circle cx="400" cy="485" r="12" fill="#FFD700"/>
      <polygon points="100,350 150,200 200,350" fill="#DEB887"/>
      <polygon points="600,300 650,180 700,300" fill="#DEB887"/>
      <circle cx="150" cy="200" r="15" fill="#FF6B6B"/>
      <circle cx="650" cy="180" r="12" fill="#FFD93D"/>
      <path d="M50,150 L100,100 L150,150 L130,120 L160,135" stroke="#000" stroke-width="3" fill="none"/>
    `),
  ],
};

/**
 * Pick a scene-appropriate fallback image from curated Unsplash images.
 * Uses keyword matching on the segment text to find the best category.
 */
export function getSceneFallbackImage(text: string, segmentIndex: number): string {
  const lower = text.toLowerCase();
  const keywords: Record<string, string[]> = {
    ocean: ['ocean', 'sea', 'water', 'swim', 'beach', 'wave', 'mermaid', 'lagoon', 'fish', 'dolphin'],
    forest: ['forest', 'tree', 'wood', 'leaf', 'enchanted', 'nature', 'animal'],
    castle: ['castle', 'kingdom', 'throne', 'royal', 'palace', 'princess', 'prince', 'knight'],
    space: ['space', 'star', 'planet', 'moon', 'rocket', 'astronaut', 'galaxy', 'cloud', 'sky'],
    garden: ['garden', 'flower', 'fairy', 'butterfly', 'bloom', 'petal'],
    mountain: ['mountain', 'dragon', 'climb', 'peak', 'volcano', 'dinosaur'],
    cave: ['cave', 'crystal', 'underground', 'tunnel', 'gem', 'dark'],
    treasure: ['treasure', 'gold', 'map', 'chest', 'pirate', 'jewel'],
    village: ['village', 'town', 'house', 'shop', 'market'],
    friendship: ['friend', 'together', 'hug', 'smile', 'laugh', 'play', 'team'],
    magic: ['magic', 'spell', 'wizard', 'wand', 'potion', 'glow', 'sparkle', 'witch'],
    adventure: ['adventure', 'quest', 'journey', 'explore', 'discover', 'brave', 'hero'],
  };

  // Find the best-matching category
  let bestCategory = 'adventure';
  let bestScore = 0;
  for (const [category, words] of Object.entries(keywords)) {
    const score = words.filter(w => lower.includes(w)).length;
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  const images = SCENE_FALLBACK_IMAGES[bestCategory] || SCENE_FALLBACK_IMAGES.adventure;
  return images[segmentIndex % images.length];
}
