export interface Job {
  id: number
  title: string
  company: string
  link: string
  created_at: string
}

export interface Application {
  id: number
  user_id: number
  job_id: number
  status: string
  created_at: string
}

export interface RecommendedItem {
  job: Job
  reason?: string
}

export interface RecommendResult {
  list: RecommendedItem[]
  summary?: string
  ai_used?: boolean
}

export interface UserProfile {
  user_id: number
  nickname: string
  avatar: string
  updated_at: string
}

export interface MeResponse {
  profile: UserProfile
  user_id: number
}
