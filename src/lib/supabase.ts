import { createClient } from '@supabase/supabase-js';

const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : (process?.env || {});

export const supabaseUrl = env.VITE_SUPABASE_URL || 'https://nxjkslmyufwawchoxddi.supabase.co';
export const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54amtzbG15dWZ3YXdjaG94ZGRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxNzgyOTQsImV4cCI6MjEwMzc1NDI5NH0.LdBl9BGtOFGoqX8GHEVfSXsntaweO4K4JhC8qTYzaDY';

export const isSupabaseConfigured = !!(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project-ref') &&
  !supabaseAnonKey.includes('your-anon-public-key')
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
