import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import type { UserProfile } from '../types';
import { onAuthChange, getUserProfile, logoutUser } from '../lib/firebase';

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  setProfile: (profile: UserProfile | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  setProfile: () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const userProfile = await getUserProfile(firebaseUser.uid);
          setProfile(userProfile);
        } catch (err) {
          console.error('Failed to load user profile:', err);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setProfile(null);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        setProfile,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
