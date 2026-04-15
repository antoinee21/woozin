/**
 * Firestore typed operations.
 * All functions are no-ops (returning null/[]) when Firebase is not configured.
 */
import {
  collection, doc, getDoc, setDoc, updateDoc,
  query, where, orderBy, getDocs,
  onSnapshot, Timestamp, serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from './firebase'

// ─── Data models ──────────────────────────────────────────────────────────────

export interface FSUser {
  uid: string
  name: string
  handle: string
  createdAt: Timestamp
}

export interface FSEvent {
  id: string
  title: string
  date: Timestamp
  deadline: Timestamp
  location?: string
  creatorId: string
  creatorName: string
  maxParticipants: number | null
  inviteeIds: string[]
  createdAt: Timestamp
}

export interface FSRsvp {
  eventId: string
  userId: string
  status: 'yes' | 'no' | 'maybe' | 'waitlist'
  answeredAt: Timestamp
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function createOrUpdateUser(
  uid: string,
  data: { name: string; handle: string }
): Promise<void> {
  if (!db) return
  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, { ...data, uid, createdAt: serverTimestamp() })
  } else {
    await updateDoc(ref, { name: data.name, handle: data.handle })
  }
}

export async function getUser(uid: string): Promise<FSUser | null> {
  if (!db) return null
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? (snap.data() as FSUser) : null
}

// ─── Events ───────────────────────────────────────────────────────────────────

export function subscribeToMyEvents(
  uid: string,
  callback: (events: FSEvent[]) => void
): Unsubscribe {
  if (!db) return () => {}
  // Events where user is creator or invitee
  const q = query(
    collection(db, 'events'),
    where('inviteeIds', 'array-contains', uid),
    orderBy('date', 'asc')
  )
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as FSEvent)))
  })
}

export async function createEvent(
  event: Omit<FSEvent, 'id' | 'createdAt'>
): Promise<string> {
  if (!db) return ''
  const ref = doc(collection(db, 'events'))
  await setDoc(ref, { ...event, createdAt: serverTimestamp() })
  return ref.id
}

// ─── RSVPs ────────────────────────────────────────────────────────────────────

export async function setRsvp(
  eventId: string,
  userId: string,
  status: FSRsvp['status']
): Promise<void> {
  if (!db) return
  const id = `${eventId}_${userId}`
  await setDoc(doc(db, 'rsvps', id), {
    eventId, userId, status,
    answeredAt: serverTimestamp(),
  })
}

export async function getRsvpsForEvent(eventId: string): Promise<FSRsvp[]> {
  if (!db) return []
  const q = query(collection(db, 'rsvps'), where('eventId', '==', eventId))
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data() as FSRsvp)
}

export function subscribeToMyRsvps(
  uid: string,
  callback: (rsvps: FSRsvp[]) => void
): Unsubscribe {
  if (!db) return () => {}
  const q = query(collection(db, 'rsvps'), where('userId', '==', uid))
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => d.data() as FSRsvp))
  })
}
