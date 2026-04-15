/**
 * RSVP hook — handles voting on an event.
 * Firebase mode: writes to Firestore rsvps collection.
 * Demo mode: in-memory only (parent can persist via useEvents.updateRsvp).
 */
import { useState, useCallback } from 'react'
import * as Haptics from 'expo-haptics'
import { isFirebaseConfigured } from '../lib/firebase'
import { setRsvp } from '../lib/firestore'
import { useAuth } from '../context/AuthContext'

type VoteStatus = 'yes' | 'no' | 'maybe' | 'waitlist' | 'pending'

export function useRsvp(eventId: string, initialStatus: VoteStatus = 'pending') {
  const { user } = useAuth()
  const [status, setStatus] = useState<VoteStatus>(initialStatus)
  const [saving, setSaving] = useState(false)

  const vote = useCallback(async (newStatus: 'yes' | 'no' | 'maybe') => {
    if (!user || saving) return
    const prev = status
    setStatus(newStatus)
    setSaving(true)

    try {
      if (isFirebaseConfigured) {
        await setRsvp(eventId, user.uid, newStatus)
      }
      // Haptic feedback
      if (newStatus === 'yes') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      } else {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      }
    } catch (e) {
      setStatus(prev)
      console.warn('RSVP failed:', e)
    } finally {
      setSaving(false)
    }
  }, [user, eventId, status, saving])

  return { status, vote, saving }
}
