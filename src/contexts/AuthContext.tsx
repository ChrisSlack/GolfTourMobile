import React, { createContext, useContext, useEffect, useState } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { User } from '../types'

interface AuthContextType {
  user: User | null
  supabaseUser: SupabaseUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, firstName: string, lastName: string, handicap: number) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<{ error: string | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    let initializationTimeout: NodeJS.Timeout

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...')
        
        // Set a maximum timeout for initialization
        initializationTimeout = setTimeout(() => {
          if (mounted) {
            console.warn('Auth initialization timeout - setting loading to false')
            setLoading(false)
          }
        }, 10000) // 10 second timeout

        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession()

        if (!mounted) return

        console.log('Initial session check:', session?.user?.id, error)
        
        if (error) {
          console.error('Error getting session:', error)
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
        console.error('Auth initialization error:', error)
        if (mounted) {
          setSupabaseUser(null)
          setUser(null)
          setLoading(false)
        }
      } finally {
        if (initializationTimeout) {
          clearTimeout(initializationTimeout)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      
      console.log('Auth state changed:', event, session?.user?.id)
      
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
      if (initializationTimeout) {
        clearTimeout(initializationTimeout)
      }
      subscription.unsubscribe()
    }
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching user profile for:', userId)
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle() // Use maybeSingle instead of single to handle no rows gracefully

      if (error) {
        console.error('Error fetching user profile:', error)
        
        // Handle specific error cases
        if (error.code === 'PGRST116' || error.message?.includes('no rows returned')) {
          console.log('User profile not found - this might be a new user who needs to complete registration')
          setUser(null)
        } else if (error.code === '42P01' || error.message?.includes('does not exist')) {
          console.error('Database table does not exist - database setup required')
          setUser(null)
        } else {
          console.error('Database error:', error)
          setUser(null)
        }
      } else if (data) {
        console.log('User profile fetched successfully:', data)
        setUser(data)
      } else {
        console.log('No user profile found')
        setUser(null)
      }
    } catch (error: any) {
      console.error('Unexpected error fetching user profile:', error)
      setUser(null)
    } finally {
      console.log('Setting loading to false')
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting sign in for:', email)
      setLoading(true)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Sign in error:', error)
        setLoading(false)
        return { error: error.message }
      }

      console.log('Sign in successful:', data.user?.id)
      // Don't set loading here - let the auth state change handle it
      return { error: null }
    } catch (error: any) {
      console.error('Unexpected sign in error:', error)
      setLoading(false)
      return { error: 'An unexpected error occurred' }
    }
  }

  const signUp = async (email: string, password: string, firstName: string, lastName: string, handicap: number) => {
    try {
      console.log('Attempting sign up for:', email)
      setLoading(true)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        console.error('Sign up error:', error)
        setLoading(false)
        throw error
      }

      if (data.user) {
        console.log('Creating user profile for:', data.user.id)
        // Create user profile
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
          console.error('Profile creation error:', profileError)
          // Don't throw error if it's just a table not existing issue
          if (profileError.code !== '42P01') {
            setLoading(false)
            throw profileError
          } else {
            console.warn('Users table does not exist - profile creation skipped')
          }
        } else {
          console.log('User profile created successfully')
        }
      }

      setLoading(false)
      return { error: null }
    } catch (error: any) {
      console.error('Sign up error:', error)
      setLoading(false)
      return { error: error.message || 'An unexpected error occurred' }
    }
  }

  const signOut = async () => {
    console.log('Signing out')
    setLoading(true)
    await supabase.auth.signOut()
    // Loading and user state will be handled by the auth state change
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