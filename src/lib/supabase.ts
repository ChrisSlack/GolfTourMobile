import { createClient } from '@supabase/supabase-js'
import { logger } from '@/utils/logger'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  logger.error('Missing Supabase environment variables:', {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey,
  })
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.',
  )
}

logger.log('Initializing Supabase client with URL:', supabaseUrl)

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Test the connection
supabase.auth.getSession().then(({ data: _data, error }) => {
  if (error) {
    logger.error('Supabase connection error:', error)
  } else {
    logger.log('Supabase connected successfully')
  }
})