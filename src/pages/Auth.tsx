import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Navigate } from 'react-router-dom'

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    handicap: 18
  })

  const { user, signIn, signUp, loading: authLoading } = useAuth()

  // Reset loading state when auth loading changes
  useEffect(() => {
    if (!authLoading && loading) {
      setLoading(false)
    }
  }, [authLoading, loading])

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />
  }

  // Show loading if auth is still initializing
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-gray-300 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let result
      if (isSignUp) {
        console.log('Submitting sign up form')
        result = await signUp(
          formData.email,
          formData.password,
          formData.firstName,
          formData.lastName,
          formData.handicap
        )
      } else {
        console.log('Submitting sign in form')
        result = await signIn(formData.email, formData.password)
      }

      if (result.error) {
        console.error('Auth error:', result.error)
        // Provide user-friendly error messages
        if (result.error.includes('User already registered') || result.error.includes('user_already_exists')) {
          setError('This email is already registered. Please sign in instead.')
        } else if (result.error.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials and try again.')
        } else if (result.error.includes('Email not confirmed')) {
          setError('Please check your email and click the confirmation link before signing in.')
        } else {
          setError(result.error)
        }
        setLoading(false)
      } else {
        console.log('Auth successful, should redirect soon')
        // Success - keep loading true until redirect happens
        // The auth context will handle the redirect
      }
    } catch (err) {
      console.error('Unexpected auth error:', err)
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-2xl">⛳</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {isSignUp ? 'Join the Tour' : 'Welcome Back'}
          </h2>
          <p className="mt-2 text-gray-600">
            {isSignUp 
              ? 'Create your account to join the Portugal Golf Tour 2025'
              : 'Sign in to your account to access the tour'
            }
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-error bg-opacity-10 border border-error text-error px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {isSignUp && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="firstName" className="form-label">
                      First Name
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      className="form-input"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName" className="form-label">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      className="form-input"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="handicap" className="form-label">
                    Handicap Index
                  </label>
                  <input
                    id="handicap"
                    name="handicap"
                    type="number"
                    min="0"
                    max="54"
                    step="0.1"
                    required
                    className="form-input"
                    value={formData.handicap}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                  <p className="form-help">
                    Enter your current handicap index (0-54)
                  </p>
                </div>
              </>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="form-input"
                value={formData.email}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                required
                className="form-input"
                value={formData.password}
                onChange={handleInputChange}
                disabled={loading}
              />
              {isSignUp && (
                <p className="form-help">
                  Password must be at least 6 characters long
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary btn-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </div>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              className="text-primary hover:underline"
              disabled={loading}
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
                setLoading(false)
                setFormData({
                  email: '',
                  password: '',
                  firstName: '',
                  lastName: '',
                  handicap: 18
                })
              }}
            >
              {isSignUp 
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}