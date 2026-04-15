/**
 * Events data hook.
 * - Firebase configured → real-time Firestore subscription
 * - Demo mode → returns MOCK_EVENTS, supports local state mutations
 */
import { useState, useEffect, useCallback } from 'react'
import { Timestamp } from 'firebase/firestore'
import { isFirebaseConfigured } from '../lib/firebase'
import { subscribeToMyEvents, type FSEvent } from '../lib/firestore'
import { MOCK_EVENTS, MOCK_EVENT_DETAILS } from '../mock/events'
import { useAuth } from '../context/AuthContext'
import type { EventCardData } from '../components/EventCard'

function fsEventToCardData(e: FSEvent, myRsvpStatus?: EventCardData['userStatus']): EventCardData {
  return {
    id: e.id,
    title: e.title,
    date: e.date instanceof Timestamp ? e.date.toDate() : new Date(e.date as any),
    location: e.location,
    maxParticipants: e.maxParticipants,
    confirmed: 0,
    maybe: 0,
    no: 0,
    waitlistCount: 0,
    userStatus: myRsvpStatus ?? 'pending',
  }
}

export function useEvents() {
  const { user } = useAuth()
  const [events, setEvents] = useState<EventCardData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setEvents([])
      setLoading(false)
      return
    }

    if (isFirebaseConfigured) {
      setLoading(true)
      const unsub = subscribeToMyEvents(user.uid, fsEvents => {
        setEvents(fsEvents.map(e => fsEventToCardData(e)))
        setLoading(false)
      })
      return unsub
    } else {
      // Demo mode
      setEvents(MOCK_EVENTS)
      setLoading(false)
    }
  }, [user])

  /** Optimistically update RSVP status in demo mode */
  const updateRsvp = useCallback((eventId: string, status: EventCardData['userStatus']) => {
    if (!isFirebaseConfigured) {
      setEvents(prev =>
        prev.map(e => e.id === eventId ? { ...e, userStatus: status } : e)
      )
    }
  }, [])

  return { events, loading, updateRsvp }
}
