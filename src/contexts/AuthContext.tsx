import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
  canSignUp: boolean;
  timeUntilNextSignup: number;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSignupAttempt, setLastSignupAttempt] = useState<number>(0);
  const [timeUntilNextSignup, setTimeUntilNextSignup] = useState<number>(0);
  const SIGNUP_COOLDOWN = 54; // seconds

  useEffect(() => {
    // Try to recover session from storage
    const storedSession = localStorage.getItem('game-finance-auth');
    if (storedSession) {
      try {
        const parsedSession = JSON.parse(storedSession);
        setSession(parsedSession);
        setUser(parsedSession.user);
      } catch (err) {
        console.error('Error parsing stored session:', err);
      }
    }

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Update signup cooldown timer
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastAttempt = Math.floor((now - lastSignupAttempt) / 1000);
      const remainingTime = Math.max(0, SIGNUP_COOLDOWN - timeSinceLastAttempt);
      setTimeUntilNextSignup(remainingTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [lastSignupAttempt]);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const { error } = await supabase.auth.signInWithPassword({ 
        email, 
        password,
        options: {
          persistSession: true
        }
      });
      
      if (error) {
        if (error.message === 'Email not confirmed') {
          throw new Error('Please confirm your email address before signing in. Check your inbox for the confirmation email.');
        }
        if (error.message === 'Invalid login credentials') {
          throw new Error('Invalid email or password. Please try again.');
        }
        throw error;
      }
    } catch (err) {
      console.error('Error signing in:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign in. Please try again.');
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setError(null);
      const now = Date.now();
      const timeSinceLastAttempt = Math.floor((now - lastSignupAttempt) / 1000);
      
      if (timeSinceLastAttempt < SIGNUP_COOLDOWN) {
        throw new Error(`Please wait ${SIGNUP_COOLDOWN - timeSinceLastAttempt} seconds before trying again.`);
      }

      setLastSignupAttempt(now);
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            created_at: new Date().toISOString()
          }
        }
      });
      
      if (error) {
        if (error.message.includes('rate limit')) {
          throw new Error(`Please wait ${SIGNUP_COOLDOWN} seconds before trying again.`);
        }
        throw error;
      }
    } catch (err) {
      console.error('Error signing up:', err);
      setError(err instanceof Error ? err.message : 'Failed to create account. Please try again.');
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear stored session
      localStorage.removeItem('game-finance-auth');
    } catch (err) {
      console.error('Error signing out:', err);
      setError('Failed to sign out. Please try again.');
    }
  };

  const canSignUp = timeUntilNextSignup === 0;

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    error,
    canSignUp,
    timeUntilNextSignup
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};