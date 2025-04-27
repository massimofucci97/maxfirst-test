import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false, // Changed to false to prevent unnecessary URL parsing
    storage: window.localStorage, // Explicitly use window.localStorage
    storageKey: 'game-finance-auth'
  }
});

// Initialize session
const initializeAuth = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      window.localStorage.setItem('game-finance-auth', JSON.stringify(session));
    }
  } catch (error) {
    console.error('Error initializing auth:', error);
  }
};

// Set up auth state change listener
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    // Store the session
    window.localStorage.setItem('game-finance-auth', JSON.stringify(session));
  } else if (event === 'SIGNED_OUT') {
    // Clear the session
    window.localStorage.removeItem('game-finance-auth');
  }
});

// Initialize auth on load
initializeAuth();