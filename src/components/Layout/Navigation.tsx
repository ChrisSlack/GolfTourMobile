import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface NavigationProps {
  isOpen: boolean
  onClose: () => void
}

const navigationItems = [
  { name: 'Home', href: '/', icon: '🏠' },
  { name: 'Schedule', href: '/schedule', icon: '📅' },
  { name: 'Courses', href: '/courses', icon: '⛳' },
  { name: 'Teams', href: '/teams', icon: '👥' },
  { name: 'Scorecard', href: '/scorecard', icon: '📊' },
  { name: 'Leaderboard', href: '/leaderboard', icon: '🏆' },
  { name: 'Fines', href: '/fines', icon: '💰' },
  { name: 'Friday Activities', href: '/friday-activities', icon: '🎉' },
]

export default function Navigation({ isOpen, onClose }: NavigationProps) {
  const location = useLocation()
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    onClose()
  }

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4 mb-8">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold">⛳</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Golf Tour</h2>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span role="img" aria-label={item.name} className="mr-3 text-lg">{item.icon}</span>
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            {user ? (
              <div className="flex items-center w-full">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {user.first_name} {user.last_name}
                  </p>
                  <Link
                    to="/profile"
                    className="text-xs text-primary hover:underline"
                  >
                    View profile
                  </Link>
                </div>
                <button
                  onClick={handleSignOut}
                  className="ml-3 text-sm text-gray-600 hover:text-gray-900"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="w-full btn btn-primary text-center"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className={`md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold">⛳</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Golf Tour</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              aria-label="Close menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={`group flex items-center px-2 py-3 text-base font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span role="img" aria-label={item.name} className="mr-4 text-xl">{item.icon}</span>
                  {item.name}
                </Link>
              )
            })}
          </nav>

          <div className="border-t border-gray-200 p-4">
            {user ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-xs text-gray-600">HCP: {user.handicap}</p>
                </div>
                <div className="flex space-x-2">
                  <Link
                    to="/profile"
                    onClick={onClose}
                    className="flex-1 btn btn-outline btn-sm text-center"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex-1 btn btn-ghost btn-sm"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/auth"
                onClick={onClose}
                className="w-full btn btn-primary text-center"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
