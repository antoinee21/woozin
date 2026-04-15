import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, initializeAuth, inMemoryPersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { Platform } from 'react-native'

const firebaseConfig = {
  apiKey:            process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain:        process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId:         process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket:     process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId:             process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
}

/** True only when all required env vars are present */
export const isFirebaseConfigured =
  !!firebaseConfig.apiKey &&
  !!firebaseConfig.projectId &&
  !!firebaseConfig.appId

let app: FirebaseApp | null = null

if (isFirebaseConfigured) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
}

// Use inMemoryPersistence on native (no AsyncStorage dep needed)
export const auth = app
  ? Platform.OS === 'web'
    ? getAuth(app)
    : initializeAuth(app, { persistence: inMemoryPersistence })
  : null

export const db = app ? getFirestore(app) : null

export default app
