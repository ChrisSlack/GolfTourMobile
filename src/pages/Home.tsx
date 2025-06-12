import React from 'react'
import { useTour } from '@/contexts/TourContext'
import { useAuth } from '@/contexts/AuthContext'
import { useTourCountdown } from '@/hooks/useTourCountdown'

export default function Home() {
  const { activeTour } = useTour()
  const { user } = useAuth()

  const daysUntilTour = useTourCountdown(activeTour)

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <span role="img" aria-label="golf" className="text-white text-2xl">⛳</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Portugal Golf Tour 2025
          </h1>
          <p className="text-gray-600 mb-8">
            Join your friends for an amazing golf holiday in the Algarve. 
            Sign in to access schedules, scorecards, and more.
          </p>
          <a href="/auth" className="btn btn-primary btn-lg">
            Sign In to Get Started
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="card">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user.first_name}!
          </h1>
          <p className="text-gray-600">
            Ready for another great round in the Algarve?
          </p>
        </div>
      </div>

      {/* Countdown Card */}
      {daysUntilTour && daysUntilTour > 0 && (
        <div className="card bg-primary text-white">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">{daysUntilTour}</div>
            <div className="text-lg">
              {daysUntilTour === 1 ? 'Day' : 'Days'} Until Tour Starts!
            </div>
            {activeTour && (
              <div className="text-sm opacity-90 mt-2">
                {new Date(activeTour.start_date).toLocaleDateString('en-GB', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <a href="/schedule" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center mr-4">
              <span role="img" aria-label="Schedule" className="text-primary text-xl">📅</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Schedule</h3>
              <p className="text-sm text-gray-600">View tour itinerary</p>
            </div>
          </div>
        </a>

        <a href="/scorecard" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-secondary bg-opacity-10 rounded-lg flex items-center justify-center mr-4">
              <span role="img" aria-label="Scorecard" className="text-secondary text-xl">📊</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Scorecard</h3>
              <p className="text-sm text-gray-600">Record your scores</p>
            </div>
          </div>
        </a>

        <a href="/leaderboard" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-accent bg-opacity-10 rounded-lg flex items-center justify-center mr-4">
              <span role="img" aria-label="Leaderboard" className="text-accent text-xl">🏆</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Leaderboard</h3>
              <p className="text-sm text-gray-600">See team standings</p>
            </div>
          </div>
        </a>

        <a href="/teams" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-success bg-opacity-10 rounded-lg flex items-center justify-center mr-4">
              <span role="img" aria-label="Teams" className="text-success text-xl">👥</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Teams</h3>
              <p className="text-sm text-gray-600">View team members</p>
            </div>
          </div>
        </a>

        <a href="/fines" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-warning bg-opacity-10 rounded-lg flex items-center justify-center mr-4">
              <span role="img" aria-label="Fines" className="text-warning text-xl">💰</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Fines</h3>
              <p className="text-sm text-gray-600">Banter & penalties</p>
            </div>
          </div>
        </a>

        <a href="/friday-activities" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-error bg-opacity-10 rounded-lg flex items-center justify-center mr-4">
              <span role="img" aria-label="Friday fun" className="text-error text-xl">🎉</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Friday Fun</h3>
              <p className="text-sm text-gray-600">Vote for activities</p>
            </div>
          </div>
        </a>
      </div>

      {/* Tour Info */}
      {activeTour && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Tour Information</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Tour Name:</span>
              <span className="font-medium">{activeTour.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Year:</span>
              <span className="font-medium">{activeTour.year}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Start Date:</span>
              <span className="font-medium">
                {new Date(activeTour.start_date).toLocaleDateString('en-GB')}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}