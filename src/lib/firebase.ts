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
import type { UserProfile, Story } from '../types';

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
