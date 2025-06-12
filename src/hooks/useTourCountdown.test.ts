import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useTourCountdown } from './useTourCountdown'
import { Tour } from '@/types'

const createTour = (startOffsetDays: number): Tour => ({
  id: '1',
  name: 'Test',
  year: 2025,
  start_date: new Date(Date.now() + startOffsetDays * 86400000).toISOString()
}) as Tour

describe('useTourCountdown', () => {
  it('returns nulls when no tour', () => {
    const { result } = renderHook(() => useTourCountdown(null))
    expect(result.current.daysLeft).toBeNull()
    expect(result.current.label).toBeNull()
  })

  it('returns days and label', () => {
    const { result } = renderHook(() => useTourCountdown(createTour(3)))
    expect(result.current.daysLeft).toBe(3)
    expect(result.current.label).toBe('3 days')
  })

  it('handles today case', () => {
    const { result } = renderHook(() => useTourCountdown(createTour(0)))
    expect(result.current.daysLeft).toBe(0)
    expect(result.current.label).toBe('Today!')
  })
})
