import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!url || !key) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY. Copy .env.example to .env.local, fill both in, and restart the dev server.')
}

/** Browser client. It only ever holds the publishable key; Row Level Security decides what a signed-in user can touch. */
export const supabase = createClient(url, key)