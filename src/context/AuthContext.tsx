import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  User,
  isFirebaseConfigured
} from '../lib/firebase';
import { UserPersona } from '../types';

export interface AuthUserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  provider: 'firebase-google' | 'firebase-email' | 'local';
}

interface AuthContextType {
  user: AuthUserProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUserProfile | null>(() => {
    const saved = localStorage.getItem('skillbank_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth && isFirebaseConfigured) {
      try {
        const unsubscribe = onAuthStateChanged(auth, (fbUser: User | null) => {
          if (fbUser) {
            const profile: AuthUserProfile = {
              uid: fbUser.uid,
              email: fbUser.email,
              displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Community Member',
              photoURL: fbUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${fbUser.uid}`,
              provider: fbUser.providerData[0]?.providerId === 'google.com' ? 'firebase-google' : 'firebase-email',
            };
            setUser(profile);
            localStorage.setItem('skillbank_auth_user', JSON.stringify(profile));
          } else {
            // Check if there was a local session
            const saved = localStorage.getItem('skillbank_auth_user');
            if (saved) {
              try {
                const parsed = JSON.parse(saved);
                if (parsed.provider === 'local') {
                  setUser(parsed);
                } else {
                  setUser(null);
                  localStorage.removeItem('skillbank_auth_user');
                }
              } catch {
                setUser(null);
              }
            } else {
              setUser(null);
            }
          }
          setLoading(false);
        });
        return () => unsubscribe();
      } catch (e) {
        console.warn('Auth state listener fallback:', e);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const loginWithGoogle = async () => {
    if (auth && isFirebaseConfigured) {
      try {
        const res = await signInWithPopup(auth, googleProvider);
        if (res.user) {
          const profile: AuthUserProfile = {
            uid: res.user.uid,
            email: res.user.email,
            displayName: res.user.displayName || 'Google Member',
            photoURL: res.user.photoURL,
            provider: 'firebase-google',
          };
          setUser(profile);
          localStorage.setItem('skillbank_auth_user', JSON.stringify(profile));
          return;
        }
      } catch (err: any) {
        console.warn('Firebase popup error, using direct profile creation:', err);
        throw err;
      }
    } else {
      // Fallback guest profile
      const demoProfile: AuthUserProfile = {
        uid: 'user_google_demo_' + Date.now(),
        email: 'member@gmail.com',
        displayName: 'Google Member',
        photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
        provider: 'local',
      };
      setUser(demoProfile);
      localStorage.setItem('skillbank_auth_user', JSON.stringify(demoProfile));
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    if (auth && isFirebaseConfigured) {
      try {
        const res = await signInWithEmailAndPassword(auth, email, pass);
        if (res.user) {
          const profile: AuthUserProfile = {
            uid: res.user.uid,
            email: res.user.email,
            displayName: res.user.displayName || email.split('@')[0],
            photoURL: res.user.photoURL,
            provider: 'firebase-email',
          };
          setUser(profile);
          localStorage.setItem('skillbank_auth_user', JSON.stringify(profile));
          return;
        }
      } catch (err: any) {
        console.warn('Firebase email login error:', err);
        throw err;
      }
    } else {
      const demoProfile: AuthUserProfile = {
        uid: 'user_email_' + Date.now(),
        email: email,
        displayName: email.split('@')[0],
        photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
        provider: 'local',
      };
      setUser(demoProfile);
      localStorage.setItem('skillbank_auth_user', JSON.stringify(demoProfile));
    }
  };

  const registerWithEmail = async (name: string, email: string, pass: string) => {
    if (auth && isFirebaseConfigured) {
      try {
        const res = await createUserWithEmailAndPassword(auth, email, pass);
        if (res.user) {
          await updateProfile(res.user, { displayName: name });
          const profile: AuthUserProfile = {
            uid: res.user.uid,
            email: res.user.email,
            displayName: name,
            photoURL: null,
            provider: 'firebase-email',
          };
          setUser(profile);
          localStorage.setItem('skillbank_auth_user', JSON.stringify(profile));
          return;
        }
      } catch (err: any) {
        console.warn('Firebase registration error:', err);
        throw err;
      }
    } else {
      const demoProfile: AuthUserProfile = {
        uid: 'user_' + Date.now(),
        email: email,
        displayName: name,
        photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
        provider: 'local',
      };
      setUser(demoProfile);
      localStorage.setItem('skillbank_auth_user', JSON.stringify(demoProfile));
    }
  };

  const logout = async () => {
    if (auth && isFirebaseConfigured) {
      try {
        await signOut(auth);
      } catch (e) {
        console.warn('Firebase signOut notice:', e);
      }
    }
    setUser(null);
    localStorage.removeItem('skillbank_auth_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
