import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useTour } from '../../contexts/TourContext'

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth()
  const { activeTour } = useTour()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Mobile menu button */}
        <button
          type="button"
          className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Tour info */}
        <div className="flex-1 md:flex-none">
          <h1 className="text-lg font-semibold text-gray-900">
            {activeTour?.name || 'Golf Tour'}
          </h1>
          {activeTour && (
            <p className="text-sm text-gray-600">{activeTour.year}</p>
          )}
        </div>

        {/* User info */}
        {user && (
          <div className="flex items-center space-x-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-xs text-gray-600">HCP: {user.handicap}</p>
            </div>
            <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
              {user.first_name[0]}{user.last_name[0]}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}