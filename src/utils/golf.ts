/**
 * Golf calculation utilities following USGA standards
 */

export interface CourseInfo {
  par: number
  rating: number
  slope: number
}

export interface GolfCalculations {
  courseHandicap: number
  netScore: number
  scoreToPar: number
  stablefordPoints: number
}

/**
 * Calculate course handicap using USGA formula
 */
export function calculateCourseHandicap(
  handicapIndex: number,
  slopeRating: number,
  courseRating: number,
  par: number
): number {
  return Math.round(handicapIndex * (slopeRating / 113) + (courseRating - par))
}

/**
 * Calculate net score (minimum of 1)
 */
export function calculateNetScore(grossScore: number, courseHandicap: number): number {
  return Math.max(1, grossScore - courseHandicap)
}

/**
 * Calculate score to par (negative = under par)
 */
export function calculateScoreToPar(grossScore: number, par: number): number {
  return grossScore - par
}

/**
 * Calculate Stableford points based on net score relative to par
 */
export function calculateStablefordPoints(netScore: number, holePar: number): number {
  const netToPar = netScore - holePar
  
  if (netToPar <= -3) return 5      // Eagle or better
  if (netToPar === -2) return 4     // Eagle
  if (netToPar === -1) return 3     // Birdie
  if (netToPar === 0) return 2      // Par
  if (netToPar === 1) return 1      // Bogey
  return 0                          // Double bogey or worse
}

/**
 * Calculate all golf metrics for a round
 */
export function calculateGolfMetrics(
  grossScore: number,
  handicapIndex: number,
  courseInfo: CourseInfo
): GolfCalculations {
  const courseHandicap = calculateCourseHandicap(
    handicapIndex,
    courseInfo.slope,
    courseInfo.rating,
    courseInfo.par
  )
  
  const netScore = calculateNetScore(grossScore, courseHandicap)
  const scoreToPar = calculateScoreToPar(grossScore, courseInfo.par)
  
  // For 18-hole Stableford, we'd need hole-by-hole data
  // This is a simplified calculation assuming even distribution
  const avgHolePar = courseInfo.par / 18
  const avgNetPerHole = netScore / 18
  const stablefordPoints = Math.round(
    18 * calculateStablefordPoints(avgNetPerHole, avgHolePar)
  )
  
  return {
    courseHandicap,
    netScore,
    scoreToPar,
    stablefordPoints
  }
}

/**
 * Calculate totals for front nine, back nine, and total
 */
export function calculateRoundTotals(holes: number[]): {
  frontNine: number
  backNine: number
  total: number
} {
  if (holes.length !== 18) {
    throw new Error('Must provide exactly 18 hole scores')
  }
  
  const frontNine = holes.slice(0, 9).reduce((sum, score) => sum + score, 0)
  const backNine = holes.slice(9, 18).reduce((sum, score) => sum + score, 0)
  const total = frontNine + backNine
  
  return { frontNine, backNine, total }
}

/**
 * Count special achievements in a round
 */
export function countAchievements(holes: number[], coursePars: number[]): {
  eagles: number
  birdies: number
  pars: number
  bogeys: number
} {
  if (holes.length !== 18 || coursePars.length !== 18) {
    throw new Error('Must provide exactly 18 hole scores and pars')
  }
  
  let eagles = 0
  let birdies = 0
  let pars = 0
  let bogeys = 0
  
  for (let i = 0; i < 18; i++) {
    const scoreToPar = holes[i] - coursePars[i]
    
    if (scoreToPar <= -2) eagles++
    else if (scoreToPar === -1) birdies++
    else if (scoreToPar === 0) pars++
    else if (scoreToPar === 1) bogeys++
  }
  
  return { eagles, birdies, pars, bogeys }
}

/**
 * Validate handicap index (typically 0-54 for most systems)
 */
export function isValidHandicap(handicap: number): boolean {
  return handicap >= 0 && handicap <= 54
}

/**
 * Validate golf score for a hole (typically 1-15)
 */
export function isValidHoleScore(score: number): boolean {
  return score >= 1 && score <= 15
}

/**
 * Format score display with appropriate styling context
 */
export function formatScoreDisplay(score: number, par: number): {
  display: string
  className: string
} {
  const toPar = score - par
  
  if (toPar <= -2) {
    return { display: score.toString(), className: 'text-success font-bold' }
  } else if (toPar === -1) {
    return { display: score.toString(), className: 'text-primary font-semibold' }
  } else if (toPar === 0) {
    return { display: score.toString(), className: 'text-gray-900' }
  } else if (toPar === 1) {
    return { display: score.toString(), className: 'text-warning' }
  } else {
    return { display: score.toString(), className: 'text-error font-semibold' }
  }
}
