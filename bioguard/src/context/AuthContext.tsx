import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { supabase } from '../config/supabase';
import { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = React.useRef<{ inFlight: boolean; lastUserId?: string }>({ inFlight: false, lastUserId: undefined });
  const mountedRef = React.useRef(true);

  useEffect(() => {
    checkUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (!mountedRef.current) return;
        if (session) {
          setSession(session);
          if (!fetchingRef.current.inFlight || fetchingRef.current.lastUserId !== session.user.id) {
            fetchingRef.current.inFlight = true;
            fetchingRef.current.lastUserId = session.user.id;
            await fetchUserProfile(session.user.id);
            fetchingRef.current.inFlight = false;
          }
        } else {
          setSession(null);
          setUser(null);
        }
      } catch (e: any) {
        const msg = String(e?.message || '');
        if (!msg.toLowerCase().includes('abort')) {
          console.error('Error fetching user profile:', e);
        }
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background') {
        supabase.auth.signOut().catch(() => {});
      }
    });
    return () => sub.remove();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSession(session);
        if (!fetchingRef.current.inFlight || fetchingRef.current.lastUserId !== session.user.id) {
          fetchingRef.current.inFlight = true;
          fetchingRef.current.lastUserId = session.user.id;
          await fetchUserProfile(session.user.id);
          fetchingRef.current.inFlight = false;
        }
      }
    } catch (error) {
      const msg = String((error as any)?.message || '');
      if (!msg.toLowerCase().includes('abort')) {
        console.error('Error checking user:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      if (data) setUser(data);
      else setUser(null);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (data.user) {
        await fetchUserProfile(data.user.id);
      }
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      if (data.user) {
        // Crear perfil de usuario con rol 'visitor'
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              full_name: fullName,
              role: 'visitor',
            },
          ]);

        if (profileError) throw profileError;
        await fetchUserProfile(data.user.id);
      }
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    error,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
