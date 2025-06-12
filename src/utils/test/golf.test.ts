import { describe, it, expect } from 'vitest'
import {
  calculateCourseHandicap,
  calculateNetScore,
  calculateScoreToPar,
  calculateStablefordPoints,
  calculateGolfMetrics,
  calculateRoundTotals,
  countAchievements,
  isValidHandicap,
  isValidHoleScore,
  formatScoreDisplay
} from '@/utils/golf'

describe('Golf Calculations', () => {
  describe('calculateCourseHandicap', () => {
    it('should calculate course handicap correctly', () => {
      // Example: 18 handicap, slope 113, rating 72, par 72
      expect(calculateCourseHandicap(18, 113, 72, 72)).toBe(18)
      
      // Example: 10 handicap, slope 130, rating 73.5, par 72
      expect(calculateCourseHandicap(10, 130, 73.5, 72)).toBe(13)
      
      // Example: 5 handicap, slope 120, rating 71, par 72
      expect(calculateCourseHandicap(5, 120, 71, 72)).toBe(4)
    })
  })

  describe('calculateNetScore', () => {
    it('should calculate net score with minimum of 1', () => {
      expect(calculateNetScore(90, 18)).toBe(72)
      expect(calculateNetScore(80, 10)).toBe(70)
      expect(calculateNetScore(65, 18)).toBe(47)
      
      // Test minimum of 1
      expect(calculateNetScore(70, 80)).toBe(1)
    })
  })

  describe('calculateScoreToPar', () => {
    it('should calculate score to par correctly', () => {
      expect(calculateScoreToPar(72, 72)).toBe(0)  // Even par
      expect(calculateScoreToPar(70, 72)).toBe(-2) // 2 under
      expect(calculateScoreToPar(75, 72)).toBe(3)  // 3 over
    })
  })

  describe('calculateStablefordPoints', () => {
    it('should calculate Stableford points correctly', () => {
      expect(calculateStablefordPoints(2, 4)).toBe(4) // Eagle (-2)
      expect(calculateStablefordPoints(3, 4)).toBe(3) // Birdie (-1)
      expect(calculateStablefordPoints(4, 4)).toBe(2) // Par (0)
      expect(calculateStablefordPoints(5, 4)).toBe(1) // Bogey (+1)
      expect(calculateStablefordPoints(6, 4)).toBe(0) // Double bogey (+2)
      expect(calculateStablefordPoints(1, 4)).toBe(5) // Hole in one (-3)
    })
  })

  describe('calculateRoundTotals', () => {
    it('should calculate front nine, back nine, and total', () => {
      const holes = [4, 3, 5, 4, 4, 3, 5, 4, 4, 4, 3, 5, 4, 4, 3, 5, 4, 4]
      const result = calculateRoundTotals(holes)
      
      expect(result.frontNine).toBe(36)
      expect(result.backNine).toBe(36)
      expect(result.total).toBe(72)
    })

    it('should throw error for invalid hole count', () => {
      expect(() => calculateRoundTotals([4, 3, 5])).toThrow('Must provide exactly 18 hole scores')
    })
  })

  describe('countAchievements', () => {
    it('should count eagles, birdies, pars, and bogeys', () => {
      const holes = [2, 3, 4, 5, 4, 3, 4, 4, 4, 4, 3, 4, 5, 4, 3, 4, 4, 4] // Mix of scores
      const pars = [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4]   // All par 4s
      
      const result = countAchievements(holes, pars)
      
      expect(result.eagles).toBe(1)  // One eagle (2 on par 4)
      expect(result.birdies).toBe(4) // Four birdies (3 on par 4)
      expect(result.pars).toBe(11)   // Eleven pars
      expect(result.bogeys).toBe(2)  // Two bogeys (5 on par 4)
    })
  })

  describe('validation functions', () => {
    it('should validate handicap correctly', () => {
      expect(isValidHandicap(0)).toBe(true)
      expect(isValidHandicap(18)).toBe(true)
      expect(isValidHandicap(54)).toBe(true)
      expect(isValidHandicap(-1)).toBe(false)
      expect(isValidHandicap(55)).toBe(false)
    })

    it('should validate hole score correctly', () => {
      expect(isValidHoleScore(1)).toBe(true)
      expect(isValidHoleScore(8)).toBe(true)
      expect(isValidHoleScore(15)).toBe(true)
      expect(isValidHoleScore(0)).toBe(false)
      expect(isValidHoleScore(16)).toBe(false)
    })
  })

  describe('formatScoreDisplay', () => {
    it('should format score display with correct styling', () => {
      expect(formatScoreDisplay(2, 4)).toEqual({
        display: '2',
        className: 'text-success font-bold'
      })
      
      expect(formatScoreDisplay(3, 4)).toEqual({
        display: '3',
        className: 'text-primary font-semibold'
      })
      
      expect(formatScoreDisplay(4, 4)).toEqual({
        display: '4',
        className: 'text-gray-900'
      })
      
      expect(formatScoreDisplay(5, 4)).toEqual({
        display: '5',
        className: 'text-warning'
      })
      
      expect(formatScoreDisplay(6, 4)).toEqual({
        display: '6',
        className: 'text-error font-semibold'
      })
    })
  })

  describe('calculateGolfMetrics integration', () => {
    it('should calculate all metrics correctly', () => {
      const courseInfo = { par: 72, rating: 72, slope: 113 }
      const result = calculateGolfMetrics(90, 18, courseInfo)
      
      expect(result.courseHandicap).toBe(18)
      expect(result.netScore).toBe(72)
      expect(result.scoreToPar).toBe(18)
      expect(result.stablefordPoints).toBe(36) // 18 holes × 2 points (net par)
    })
  })
})