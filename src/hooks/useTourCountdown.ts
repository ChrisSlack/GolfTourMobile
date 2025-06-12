import { useMemo } from 'react'
import { Tour } from '@/types'

export function useTourCountdown(tour: Tour | null) {
  return useMemo(() => {
    if (!tour?.start_date) return null
    const startDate = new Date(tour.start_date)
    const now = new Date()
    const diffTime = startDate.getTime() - now.getTime()
    if (diffTime <= 0) return null
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }, [tour?.start_date])
}
