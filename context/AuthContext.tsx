import React, {
  createContext, useContext, useEffect, useState, useCallback,
  type ReactNode,
} from 'react'
import { signInAnonymously, signOut as fbSignOut, onAuthStateChanged } from 'firebase/auth'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'
import { auth, isFirebaseConfigured } from '../lib/firebase'
import { createOrUpdateUser } from '../lib/firestore'

// ─── Helpers for web (SecureStore is native-only) ─────────────────────────────

const store = {
  async get(key: string) {
    if (Platform.OS === 'web') return localStorage.getItem(key)
    return SecureStore.getItemAsync(key)
  },
  async set(key: string, value: string) {
    if (Platform.OS === 'web') { localStorage.setItem(key, value); return }
    return SecureStore.setItemAsync(key, value)
  },
  async del(key: string) {
    if (Platform.OS === 'web') { localStorage.removeItem(key); return }
    return SecureStore.deleteItemAsync(key)
  },
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AppUser {
  uid: string
  name: string
  handle: string
  isAnonymous: boolean
}

interface AuthContextValue {
  user: AppUser | null
  /** null = still resolving, false = resolved & not logged in */
  loading: boolean
  signIn: (name: string) => Promise<void>
  signOut: () => Promise<void>
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  // On mount: restore persisted user
  useEffect(() => {
    async function restore() {
      if (isFirebaseConfigured && auth) {
        // Firebase configured → listen to auth state
        const unsub = onAuthStateChanged(auth, async fbUser => {
          if (fbUser) {
            const name   = await store.get('woozin_name') ?? fbUser.displayName ?? 'Utilisateur'
            const handle = await store.get('woozin_handle') ?? '@user'
            setUser({ uid: fbUser.uid, name, handle, isAnonymous: fbUser.isAnonymous })
          } else {
            setUser(null)
          }
          setLoading(false)
        })
        return unsub
      } else {
        // Demo mode — just check SecureStore
        const name   = await store.get('woozin_name')
        const handle = await store.get('woozin_handle')
        if (name) {
          setUser({ uid: 'demo_user', name, handle: handle ?? '@user', isAnonymous: true })
        }
        setLoading(false)
        return () => {}
      }
    }

    let unsub: () => void = () => {}
    restore().then(fn => { unsub = fn })
    return () => unsub()
  }, [])

  const signIn = useCallback(async (name: string) => {
    const handle = '@' + name.toLowerCase().replace(/\s+/g, '')
    await store.set('woozin_name', name)
    await store.set('woozin_handle', handle)

    if (isFirebaseConfigured && auth) {
      const cred = await signInAnonymously(auth)
      await createOrUpdateUser(cred.user.uid, { name, handle })
      setUser({ uid: cred.user.uid, name, handle, isAnonymous: true })
    } else {
      // Demo mode
      setUser({ uid: 'demo_user', name, handle, isAnonymous: true })
    }
  }, [])

  const signOut = useCallback(async () => {
    await store.del('woozin_name')
    await store.del('woozin_handle')
    if (isFirebaseConfigured && auth) {
      await fbSignOut(auth)
    }
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
