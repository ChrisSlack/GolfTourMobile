import React, { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { TourProvider } from './contexts/TourContext'
import Layout from './components/Layout/Layout'
import LoadingSpinner from './components/UI/LoadingSpinner'
import { ErrorBoundary } from './components/ErrorBoundary'

// Lazy load pages for better performance
const Home = React.lazy(() => import('./pages/Home'))
const Schedule = React.lazy(() => import('./pages/Schedule'))
const Courses = React.lazy(() => import('./pages/Courses'))
const Teams = React.lazy(() => import('./pages/Teams'))
const Scorecard = React.lazy(() => import('./pages/Scorecard'))
const Leaderboard = React.lazy(() => import('./pages/Leaderboard'))
const Fines = React.lazy(() => import('./pages/Fines'))
const FridayActivities = React.lazy(() => import('./pages/FridayActivities'))
const Profile = React.lazy(() => import('./pages/Profile'))
const Auth = React.lazy(() => import('./pages/Auth'))

function App() {
  return (
    <AuthProvider>
      <TourProvider>
        <Layout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/scorecard" element={<Scorecard />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/fines" element={<Fines />} />
              <Route path="/friday-activities" element={<FridayActivities />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/auth" element={<Auth />} />
            </Routes>
          </Suspense>
          </ErrorBoundary>
        </Layout>
      </TourProvider>
    </AuthProvider>
  )
}

export default App
