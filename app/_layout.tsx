import { useEffect } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import {
  useFonts,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black_Italic,
} from '@expo-google-fonts/nunito'
import {
  NunitoSans_400Regular,
  NunitoSans_600SemiBold,
} from '@expo-google-fonts/nunito-sans'
import { colors } from '../constants/theme'
import { AuthProvider, useAuth } from '../context/AuthContext'

SplashScreen.preventAutoHideAsync()

// ─── Auth guard — redirects based on login state ──────────────────────────────

function AuthGuard() {
  const { user, loading } = useAuth()
  const router   = useRouter()
  const segments = useSegments()

  useEffect(() => {
    if (loading) return
    const inOnboarding = segments[0] === 'onboarding'
    if (!user && !inOnboarding) {
      router.replace('/onboarding')
    } else if (user && inOnboarding) {
      router.replace('/(tabs)')
    }
  }, [user, loading, segments])

  return null
}

// ─── Root layout ──────────────────────────────────────────────────────────────

function RootLayoutInner() {
  const [fontsLoaded] = useFonts({
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black_Italic,
    NunitoSans_400Regular,
    NunitoSans_600SemiBold,
  })
  const { loading: authLoading } = useAuth()

  useEffect(() => {
    if (fontsLoaded && !authLoading) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded, authLoading])

  if (!fontsLoaded) return null

  return (
    <>
      <StatusBar style="light" backgroundColor={colors.bg} />
      <AuthGuard />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
          animation: 'fade_from_bottom',
        }}
      >
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)"     options={{ animation: 'fade' }} />
        <Stack.Screen name="event/[id]" />
        <Stack.Screen name="event/create" />
      </Stack>
    </>
  )
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutInner />
    </AuthProvider>
  )
}
