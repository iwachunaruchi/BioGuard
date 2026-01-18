import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://eqsreqmltdnoqjmsjvyc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxc3JlcW1sdGRub3FqbXNqdnljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NDg3MDQsImV4cCI6MjA4NDMyNDcwNH0.QzcGmE5VG6N0mzUGU4u3ftu24CrGq8Qoa63-43D5Rzs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});