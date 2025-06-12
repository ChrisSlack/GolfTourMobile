import { useMemo } from 'react'
import { Tour } from '@/types'

export interface Countdown {
  daysLeft: number | null
  label: string | null
}

export function useTourCountdown(tour: Tour | null): Countdown {
  return useMemo(() => {
    if (!tour?.start_date) {
      return { daysLeft: null, label: null }
    }
    const startDate = new Date(tour.start_date)
    const now = new Date()
    const diffTime = startDate.getTime() - now.getTime()
    if (diffTime < 0) {
      return { daysLeft: null, label: null }
    }
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const label = daysLeft === 0 ? 'Today!' : daysLeft === 1 ? '1 day' : `${daysLeft} days`
    return { daysLeft, label }
  }, [tour?.start_date])
}
