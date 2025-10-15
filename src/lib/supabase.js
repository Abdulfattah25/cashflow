import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// Prevent hard crash when env vars are missing in production (e.g., Netlify)
let supabase
if (!isSupabaseConfigured) {
  // Use a Proxy that throws on usage, but won't crash at import-time
  console.error(
    '[Supabase] Missing environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your hosting provider environment.',
  )
  supabase = new Proxy(
    {},
    {
      get() {
        throw new Error(
          'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in environment variables.',
        )
      },
    },
  )
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export { supabase, isSupabaseConfigured }
