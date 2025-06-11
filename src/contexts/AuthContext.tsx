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
        
        // Quick timeout - don't wait too long
        const timeoutId = setTimeout(() => {
          if (mounted) {
            console.warn('Auth initialization timeout - proceeding without user data')
            setLoading(false)
          }
        }, 3000) // Reduced to 3 seconds

        // Get initial session quickly
        const { data: { session }, error } = await supabase.auth.getSession()

        if (!mounted) return

        // Clear timeout since we got a response
        clearTimeout(timeoutId)

        if (error) {
          console.error('Session error:', error)
          setSupabaseUser(null)
          setUser(null)
          setLoading(false)
          return
        }

        setSupabaseUser(session?.user ?? null)
        
        if (session?.user) {
          // Fetch profile without artificial timeout
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
      
      // Direct Supabase query without artificial timeout
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.error('Error fetching user profile:', error)
        
        // Handle specific error cases but don't block the UI
        if (error.code === 'PGRST116' || error.message?.includes('no rows returned')) {
          console.log('User profile not found - user may need to complete registration')
        } else if (error.code === '42P01' || error.message?.includes('does not exist')) {
          console.error('Database table does not exist')
        }
        
        setUser(null)
      } else if (data) {
        console.log('User profile fetched successfully')
        setUser(data)
      } else {
        console.log('No user profile found')
        setUser(null)
      }
    } catch (error: any) {
      console.error('Profile fetch error:', error.message)
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

      console.log('Sign in successful')
      // Auth state change will handle the rest
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
        return { error: error.message }
      }

      if (data.user) {
        console.log('Creating user profile for:', data.user.id)
        // Create user profile without artificial timeout
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
            console.error('Profile creation error:', profileError)
            // Don't fail the whole signup if profile creation fails
            if (profileError.code !== '42P01') {
              console.warn('Profile creation failed but continuing with signup')
            }
          } else {
            console.log('User profile created successfully')
          }
        } catch (profileError) {
          console.warn('Profile creation failed:', profileError)
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