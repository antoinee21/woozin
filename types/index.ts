import type { Timestamp } from 'firebase/firestore'

export interface User {
  id: string
  name: string
  avatar?: string
  city?: string
  createdAt: Timestamp
  stats: {
    eventsCreated: number
    eventsAttended: number
    eventsConfirmed: number
    totalInvitations: number
    cancellations: number
    avgResponseTimeHours: number
  }
  badges: Badge[]
}

export interface Event {
  id: string
  title: string
  date: Timestamp
  location?: string
  creatorId: string
  maxParticipants: number | null
  deadline: Timestamp
  invitedUserIds: string[]
  createdAt: Timestamp
  status: 'open' | 'full' | 'closed' | 'past'
}

export type ParticipationStatus = 'yes' | 'no' | 'maybe' | 'waitlist' | 'pending'

export interface Participation {
  userId: string
  eventId: string
  status: ParticipationStatus
  respondedAt?: Timestamp
  waitlistPosition?: number
}

export interface Badge {
  id: string
  unlockedAt: Timestamp
}
