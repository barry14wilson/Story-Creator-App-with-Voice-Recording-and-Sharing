import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import type { UserProfile, Story, DailyUsage, PublicProfile, FollowRequest, FollowStatus } from '../types';

// Firebase configuration - uses environment variables in production
// For development, uses a demo project
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:000000000000:web:000000000000',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// ============================================
// Auth Functions
// ============================================

export async function registerUser(
  email: string,
  password: string,
  displayName: string
): Promise<UserProfile> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });

  const profile: UserProfile = {
    uid: cred.user.uid,
    email,
    displayName,
    tier: 'free',
    createdAt: new Date().toISOString(),
    visibility: 'public',
    isChild: false,
    parentalConsentGranted: false,
  };

  await setDoc(doc(db, 'users', cred.user.uid), profile);
  return profile;
}

export async function loginUser(email: string, password: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function signInWithGoogle(): Promise<UserProfile> {
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  const user = cred.user;

  // Check if profile already exists
  const existingProfile = await getUserProfile(user.uid);
  if (existingProfile) {
    return existingProfile;
  }

  // First-time Google sign-in — create profile
  const profile: UserProfile = {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || 'Story Creator',
    tier: 'free',
    createdAt: new Date().toISOString(),
    avatarUrl: user.photoURL || undefined,
    visibility: 'public',
    isChild: false,
    parentalConsentGranted: false,
  };

  await setDoc(doc(db, 'users', user.uid), profile);
  return profile;
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// ============================================
// User Profile Functions
// ============================================

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (snap.exists()) {
    return snap.data() as UserProfile;
  }
  return null;
}

export async function updateUserProfile(
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> {
  await updateDoc(doc(db, 'users', uid), updates);
}

// ============================================
// Story Functions
// ============================================

export async function saveStory(story: Story): Promise<void> {
  await setDoc(doc(db, 'stories', story.id), {
    ...story,
    updatedAt: new Date().toISOString(),
  });
}

export async function getStory(storyId: string): Promise<Story | null> {
  const snap = await getDoc(doc(db, 'stories', storyId));
  if (snap.exists()) {
    return snap.data() as Story;
  }
  return null;
}

export async function getUserStories(userId: string): Promise<Story[]> {
  const q = query(
    collection(db, 'stories'),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as Story);
}

export async function deleteStory(storyId: string): Promise<void> {
  await deleteDoc(doc(db, 'stories', storyId));
}

export async function getUserStoryCount(userId: string): Promise<number> {
  const q = query(
    collection(db, 'stories'),
    where('userId', '==', userId)
  );
  const snap = await getDocs(q);
  return snap.size;
}

// ============================================
// Daily Usage Tracking
// ============================================

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

function getDailyUsageDocId(userId: string, date: string): string {
  return `${userId}_${date}`;
}

export async function getDailyUsage(userId: string): Promise<DailyUsage> {
  const date = getTodayDateString();
  const docId = getDailyUsageDocId(userId, date);
  const snap = await getDoc(doc(db, 'dailyUsage', docId));
  if (snap.exists()) {
    return snap.data() as DailyUsage;
  }
  return { userId, date, storiesCreated: 0 };
}

export async function incrementDailyUsage(userId: string): Promise<DailyUsage> {
  const date = getTodayDateString();
  const docId = getDailyUsageDocId(userId, date);
  const current = await getDailyUsage(userId);
  const updated: DailyUsage = {
    ...current,
    storiesCreated: current.storiesCreated + 1,
  };
  await setDoc(doc(db, 'dailyUsage', docId), updated);
  return updated;
}

export async function canCreateStory(
  userId: string,
  maxPerDay: number
): Promise<{ allowed: boolean; remaining: number; used: number }> {
  const usage = await getDailyUsage(userId);
  const remaining = Math.max(0, maxPerDay - usage.storiesCreated);
  return {
    allowed: usage.storiesCreated < maxPerDay,
    remaining,
    used: usage.storiesCreated,
  };
}

// ============================================
// Public Stories
// ============================================

export async function getPublicStories(limitCount = 20): Promise<Story[]> {
  const q = query(
    collection(db, 'stories'),
    where('isPublic', '==', true),
    where('isComplete', '==', true),
    orderBy('updatedAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.slice(0, limitCount).map(d => d.data() as Story);
}

// ============================================
// Social / Public Profile Functions
// ============================================

export async function getPublicProfile(userId: string): Promise<PublicProfile | null> {
  const userProfile = await getUserProfile(userId);
  if (!userProfile) return null;

  const storyCount = await getUserStoryCount(userId);

  // Count followers
  const followersQ = query(
    collection(db, 'followers'),
    where('followedUserId', '==', userId),
    where('status', '==', 'accepted')
  );
  const followersSnap = await getDocs(followersQ);

  // Count following
  const followingQ = query(
    collection(db, 'followers'),
    where('followerUserId', '==', userId),
    where('status', '==', 'accepted')
  );
  const followingSnap = await getDocs(followingQ);

  return {
    userId: userProfile.uid,
    displayName: userProfile.displayName,
    avatarUrl: userProfile.avatarUrl,
    bio: userProfile.bio,
    visibility: userProfile.visibility,
    isChild: userProfile.isChild,
    followerCount: followersSnap.size,
    followingCount: followingSnap.size,
    storyCount,
    createdAt: userProfile.createdAt,
  };
}

export async function getUserPublicStories(userId: string): Promise<Story[]> {
  const q = query(
    collection(db, 'stories'),
    where('userId', '==', userId),
    where('isPublic', '==', true),
    where('isComplete', '==', true),
    orderBy('updatedAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as Story);
}

// ============================================
// Follow System
// ============================================

export async function sendFollowRequest(
  fromUserId: string,
  toUserId: string,
  fromDisplayName: string,
  fromAvatarUrl?: string
): Promise<FollowRequest> {
  const id = `${fromUserId}_${toUserId}`;
  const request: FollowRequest = {
    id,
    fromUserId,
    toUserId,
    fromDisplayName,
    fromAvatarUrl,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  await setDoc(doc(db, 'followers', id), {
    ...request,
    followerUserId: fromUserId,
    followedUserId: toUserId,
  });

  return request;
}

export async function respondToFollowRequest(
  requestId: string,
  status: FollowStatus
): Promise<void> {
  await updateDoc(doc(db, 'followers', requestId), {
    status,
    respondedAt: new Date().toISOString(),
  });
}

export async function getFollowRequests(userId: string): Promise<FollowRequest[]> {
  const q = query(
    collection(db, 'followers'),
    where('followedUserId', '==', userId),
    where('status', '==', 'pending')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as FollowRequest);
}

export async function getFollowers(userId: string): Promise<FollowRequest[]> {
  const q = query(
    collection(db, 'followers'),
    where('followedUserId', '==', userId),
    where('status', '==', 'accepted')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as FollowRequest);
}

export async function getFollowing(userId: string): Promise<FollowRequest[]> {
  const q = query(
    collection(db, 'followers'),
    where('followerUserId', '==', userId),
    where('status', '==', 'accepted')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as FollowRequest);
}

export async function getFollowStatus(
  fromUserId: string,
  toUserId: string
): Promise<FollowStatus | null> {
  const id = `${fromUserId}_${toUserId}`;
  const snap = await getDoc(doc(db, 'followers', id));
  if (snap.exists()) {
    return (snap.data() as FollowRequest).status;
  }
  return null;
}

export async function unfollowUser(
  fromUserId: string,
  toUserId: string
): Promise<void> {
  const id = `${fromUserId}_${toUserId}`;
  await deleteDoc(doc(db, 'followers', id));
}
