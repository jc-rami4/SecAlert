import { createClient } from '@supabase/supabase-js'

// Gets the supabase data from it's server

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)