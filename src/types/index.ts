export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  handicap: number
  role: 'admin' | 'captain' | 'player'
  created_at: string
  updated_at: string
}

export interface Tour {
  id: string
  name: string
  year: number
  start_date: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Course {
  id: string
  name: string
  par: number
  rating: number
  slope: number
  description?: string
  tips?: string
  url?: string
  created_at: string
  updated_at: string
}

export interface ScheduleItem {
  id: string
  tour_id: string
  date: string
  title: string
  course_id?: string
  depart_time?: string
  tee_time?: string
  travel_mins?: number
  pick_up?: string
  link?: string
  created_at: string
  updated_at: string
  course?: Course
}

export interface Team {
  id: string
  tour_id: string
  name: string
  captain_id: string
  created_at: string
  updated_at: string
  captain?: User
  members?: TeamMember[]
}

export interface TeamMember {
  id: string
  team_id: string
  user_id: string
  created_at: string
  user?: User
}

export interface Score {
  id: string
  tour_id: string
  team_id: string
  player_id: string
  course_id: string
  date_played: string
  hole1: number
  hole2: number
  hole3: number
  hole4: number
  hole5: number
  hole6: number
  hole7: number
  hole8: number
  hole9: number
  hole10: number
  hole11: number
  hole12: number
  hole13: number
  hole14: number
  hole15: number
  hole16: number
  hole17: number
  hole18: number
  gross: number
  net: number
  eagles: number
  birdies: number
  three_putts: number
  rings: number
  deleted_at?: string
  created_at: string
  updated_at: string
  player?: User
  course?: Course
  team?: Team
}

export interface Fine {
  id: string
  tour_id: string
  player_id: string
  fine_type: string
  amount: number
  description?: string
  created_at: string
  player?: User
}

export interface FridayVote {
  id: string
  tour_id: string
  player_id: string
  activity_id: string
  created_at: string
  updated_at: string
}

export interface FridayActivity {
  id: string
  name: string
  description?: string
  votes?: number
}

// Golf calculation types
export interface GolfCalculations {
  courseHandicap: number
  netScore: number
  scoreToPar: number
  stablefordPoints: number
}

export interface HoleScore {
  strokes: number
  threePutt: boolean
  ring: boolean
}

export interface ScorecardData {
  playerId: string
  courseId: string
  datePlayed: string
  holes: HoleScore[]
  calculations: GolfCalculations
}

// API response types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  loading: boolean
}

export interface LeaderboardEntry {
  team: Team
  totalGross: number
  totalNet: number
  totalEagles: number
  totalBirdies: number
  totalThreePutts: number
  totalRings: number
  roundsPlayed: number
}

// Form types
export interface AuthFormData {
  email: string
  password: string
  firstName?: string
  lastName?: string
  handicap?: number
}

export interface ProfileFormData {
  first_name: string
  last_name: string
  handicap: number
}

export interface TeamFormData {
  name: string
  captain_id: string
  member_ids: string[]
}

export interface FineFormData {
  player_id: string
  fine_type: string
  amount: number
  description?: string
}
