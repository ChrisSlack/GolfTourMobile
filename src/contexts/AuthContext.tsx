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

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...')
        
        // Get initial session with timeout
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout')), 10000)
        )

        const { data: { session }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any

        if (!mounted) return

        console.log('Initial session check:', session?.user?.id, error)
        
        if (error) {
          console.error('Error getting session:', error)
          setLoading(false)
          return
        }

        setSupabaseUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
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
      subscription.unsubscribe()
    }
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching user profile for:', userId)
      
      // Add timeout to profile fetch
      const profilePromise = supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 8000)
      )

      const { data, error } = await Promise.race([
        profilePromise,
        timeoutPromise
      ]) as any

      if (error) {
        console.error('Error fetching user profile:', error)
        
        // If user profile doesn't exist, this might be a new user
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
      } else {
        console.log('User profile fetched successfully:', data)
        setUser(data)
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
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Sign in error:', error)
        return { error: error.message }
      }

      console.log('Sign in successful:', data.user?.id)
      // Don't set loading here - let the auth state change handle it
      return { error: null }
    } catch (error: any) {
      console.error('Unexpected sign in error:', error)
      return { error: 'An unexpected error occurred' }
    }
  }

  const signUp = async (email: string, password: string, firstName: string, lastName: string, handicap: number) => {
    try {
      console.log('Attempting sign up for:', email)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        console.error('Sign up error:', error)
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
            throw profileError
          } else {
            console.warn('Users table does not exist - profile creation skipped')
          }
        } else {
          console.log('User profile created successfully')
        }
      }

      return { error: null }
    } catch (error: any) {
      console.error('Sign up error:', error)
      return { error: error.message || 'An unexpected error occurred' }
    }
  }

  const signOut = async () => {
    console.log('Signing out')
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