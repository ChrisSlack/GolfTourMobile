import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Tour } from '@/types'
import { logger } from '@/utils/logger'

interface TourContextType {
  activeTour: Tour | null
  loading: boolean
  refreshTour: () => Promise<void>
}

const TourContext = createContext<TourContextType | undefined>(undefined)

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [activeTour, setActiveTour] = useState<Tour | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchActiveTour = async () => {
    try {
      const { data, error } = await supabase
        .from('tours')
        .select('*')
        .eq('is_active', true)
        .limit(1)

      if (error) {
        throw error
      }

      if (data && data.length > 0) {
        setActiveTour(data[0])
      } else {
        setActiveTour(null)
      }
    } catch (error) {
      logger.error('Error fetching active tour:', error)
      setActiveTour(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActiveTour()
  }, [])

  const refreshTour = async () => {
    setLoading(true)
    await fetchActiveTour()
  }

  const value = {
    activeTour,
    loading,
    refreshTour,
  }

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>
}

export function useTour() {
  const context = useContext(TourContext)
  if (context === undefined) {
    throw new Error('useTour must be used within a TourProvider')
  }
  return context
}