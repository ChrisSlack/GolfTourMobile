import React, { createContext, useContext, useEffect, useState } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { User } from '@/types'
import { logger } from '@/utils/logger'

interface AuthContextType {
  user: User | null
  supabaseUser: SupabaseUser | null
  loading: boolean
  signIn: (_email: string, _password: string) => Promise<{ error: string | null }>
  signUp: (
    _email: string,
    _password: string,
    _firstName: string,
    _lastName: string,
    _handicap: number
  ) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  updateProfile: (_data: Partial<User>) => Promise<{ error: string | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        logger.log('Initializing auth...')
        
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession()

        if (!mounted) return

        if (error) {
          logger.error('Session error:', error)
          setSupabaseUser(null)
          setUser(null)
          setLoading(false)
          return
        }

        setSupabaseUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setUser(null)
          setLoading(false)
        }
      } catch (error) {
        logger.error('Auth initialization error:', error)
        if (mounted) {
          setSupabaseUser(null)
          setUser(null)
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      
      logger.log('Auth state changed:', event, session?.user?.id)
      
      setSupabaseUser(session?.user ?? null)
      
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      logger.log('Fetching user profile for:', userId)
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        logger.error('Error fetching user profile:', error)
        
        // Handle specific error cases
        if (error.code === 'PGRST116' || error.message?.includes('no rows returned')) {
          logger.log('User profile not found - user may need to complete registration')
        } else if (error.code === '42P01' || error.message?.includes('does not exist')) {
          logger.error('Database table does not exist - please run migrations')
        }
        
        setUser(null)
      } else if (data) {
        logger.log('User profile fetched successfully:', data)
        setUser(data)
      } else {
        logger.log('No user profile found')
        setUser(null)
      }
    } catch (error: any) {
      logger.error('Profile fetch error:', error.message)
      setUser(null)
    } finally {
      logger.log('Setting loading to false')
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      logger.log('Attempting sign in for:', email)
      setLoading(true)
      
      const { data: _data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        logger.error('Sign in error:', error)
        setLoading(false)
        return { error: error.message }
      }

      logger.log('Sign in successful')
      // Auth state change will handle the rest
      return { error: null }
    } catch (error: any) {
      logger.error('Unexpected sign in error:', error)
      setLoading(false)
      return { error: 'An unexpected error occurred' }
    }
  }

  const signUp = async (email: string, password: string, firstName: string, lastName: string, handicap: number) => {
    try {
      logger.log('Attempting sign up for:', email)
      setLoading(true)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        // Use logger.warn for user already registered errors since this is a handled scenario
        if (error.message.includes('User already registered') || error.message.includes('user_already_exists')) {
          logger.warn('Sign up warning:', error.message)
        } else {
          logger.error('Sign up error:', error)
        }
        setLoading(false)
        return { error: error.message }
      }

      if (data.user) {
        logger.log('Creating user profile for:', data.user.id)
        try {
          const { error: profileError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email,
              first_name: firstName,
              last_name: lastName,
              handicap,
              role: 'player'
            })

          if (profileError) {
            logger.error('Profile creation error:', profileError)
            // Don't fail the whole signup if profile creation fails
            if (profileError.code !== '42P01') {
              logger.warn('Profile creation failed but continuing with signup')
            }
          } else {
            logger.log('User profile created successfully')
          }
        } catch (profileError) {
          logger.warn('Profile creation failed:', profileError)
        }
      }

      setLoading(false)
      return { error: null }
    } catch (error: any) {
      logger.error('Sign up error:', error)
      setLoading(false)
      return { error: error.message || 'An unexpected error occurred' }
    }
  }

  const signOut = async () => {
    logger.log('Signing out')
    setLoading(true)
    await supabase.auth.signOut()
    // Auth state change will handle cleanup
  }

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return { error: 'Not authenticated' }

    try {
      const { error } = await supabase
        .from('users')
        .update(data)
        .eq('id', user.id)

      if (error) throw error

      setUser({ ...user, ...data })
      return { error: null }
    } catch (error: any) {
      return { error: error.message || 'Failed to update profile' }
    }
  }

  const value = {
    user,
    supabaseUser,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}