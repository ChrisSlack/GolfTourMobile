import React, { createContext, useContext, useEffect, useState } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { User } from '@/types'
import { logger } from '@/utils/logger'

interface AuthContextType {
  user: User | null
  supabaseUser: SupabaseUser | null
  loading: boolean
  signIn: (_email: string, _password: string) => Promise<{ error: unknown | null }>
  signUp: (
    _email: string,
    _password: string,
    _firstName: string,
    _lastName: string,
    _handicap: number
  ) => Promise<{ error: unknown | null }>
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
        logger.log('Initializing auth...', { component: 'AuthContext' })
        
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession()

        if (!mounted) return

        if (error) {
          logger.error('Session error', { component: 'AuthContext', error })
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
        logger.error('Auth initialization error', { component: 'AuthContext', error })
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
      
      logger.log('Auth state changed', {
        component: 'AuthContext',
        event,
        userId: session?.user?.id
      })
      
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
      logger.log('Fetching user profile', {
        component: 'AuthContext',
        userId
      })
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        logger.error('Error fetching user profile', {
          component: 'AuthContext',
          error
        })
        
        // Handle specific error cases
        if (error.code === 'PGRST116' || error.message?.includes('no rows returned')) {
          logger.log('User profile not found - user may need to complete registration', {
            component: 'AuthContext'
          })
        } else if (error.code === '42P01' || error.message?.includes('does not exist')) {
          logger.error('Database table does not exist - please run migrations', {
            component: 'AuthContext'
          })
        }
        
        setUser(null)
      } else if (data) {
        logger.log('User profile fetched successfully', {
          component: 'AuthContext',
          data
        })
        setUser(data)
      } else {
        logger.log('No user profile found', { component: 'AuthContext' })
        setUser(null)
      }
    } catch (error: any) {
      logger.error('Profile fetch error', { component: 'AuthContext', error: error.message })
      setUser(null)
    } finally {
      logger.log('Setting loading to false', { component: 'AuthContext' })
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      logger.log('Attempting sign in', { component: 'AuthContext', email })
      setLoading(true)
      
      const { data: _data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        logger.error('Sign in error', { component: 'AuthContext', error })
        setLoading(false)
        return { error }
      }

      logger.log('Sign in successful', { component: 'AuthContext' })
      // Auth state change will handle the rest
      return { error: null }
    } catch (error: any) {
      logger.error('Unexpected sign in error', { component: 'AuthContext', error })
      setLoading(false)
      return { error }
    }
  }

  const signUp = async (email: string, password: string, firstName: string, lastName: string, handicap: number) => {
    try {
      logger.log('Attempting sign up', { component: 'AuthContext', email })
      setLoading(true)

      const { data: exists } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single()
      if (exists) {
        setLoading(false)
        return { error: new Error('User already registered') }
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        // Use logger.warn for user already registered errors since this is a handled scenario
        if (error.message.includes('User already registered') || error.message.includes('user_already_exists')) {
          logger.warn('Sign up warning', { component: 'AuthContext', message: error.message })
        } else {
          logger.error('Sign up error', { component: 'AuthContext', error })
        }
        setLoading(false)
        return { error }
      }

      if (data.user) {
        logger.log('Creating user profile', { component: 'AuthContext', userId: data.user.id })
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
            logger.error('Profile creation error', { component: 'AuthContext', error: profileError })
            // Don't fail the whole signup if profile creation fails
            if (profileError.code !== '42P01') {
              logger.warn('Profile creation failed but continuing with signup', { component: 'AuthContext' })
            }
          } else {
            logger.log('User profile created successfully', { component: 'AuthContext' })
          }
        } catch (profileError) {
          logger.warn('Profile creation failed', { component: 'AuthContext', error: profileError })
        }
      }

      setLoading(false)
      return { error: null }
    } catch (error: any) {
      logger.error('Sign up error', { component: 'AuthContext', error })
      setLoading(false)
      return { error }
    }
  }

  const signOut = async () => {
    logger.log('Signing out', { component: 'AuthContext' })
    setLoading(true)
    try {
      await supabase.auth.signOut()
    } catch (error: any) {
      logger.error('Sign out error', { component: 'AuthContext', error })
    } finally {
      setLoading(false)
    }
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
