import React, { useState, useRef } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  Animated as RNAnimated,
} from 'react-native'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { colors, fonts, radius } from '../constants/theme'
import { useAuth } from '../context/AuthContext'

export default function OnboardingScreen() {
  const [name, setName]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const { signIn }            = useAuth()
  const router                = useRouter()
  const inputRef              = useRef<TextInput>(null)

  // Button wiggle on empty submit
  const shake = useRef(new RNAnimated.Value(0)).current
  function triggerShake() {
    RNAnimated.sequence([
      RNAnimated.timing(shake, { toValue: 8,  duration: 60, useNativeDriver: true }),
      RNAnimated.timing(shake, { toValue: -8, duration: 60, useNativeDriver: true }),
      RNAnimated.timing(shake, { toValue: 6,  duration: 50, useNativeDriver: true }),
      RNAnimated.timing(shake, { toValue: 0,  duration: 50, useNativeDriver: true }),
    ]).start()
  }

  async function handleContinue() {
    const trimmed = name.trim()
    if (!trimmed) {
      triggerShake()
      setError('Entre ton prénom pour continuer')
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
      return
    }
    if (trimmed.length < 2) {
      triggerShake()
      setError('Prénom trop court')
      return
    }
    setError('')
    setLoading(true)
    try {
      await signIn(trimmed)
      router.replace('/(tabs)')
    } catch (e) {
      setError('Erreur de connexion. Réessaie.')
      setLoading(false)
    }
  }

  const isReady = name.trim().length >= 2

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        {/* Logo */}
        <View style={styles.logoArea}>
          <Text style={styles.logo}>woozin</Text>
          <Text style={styles.tagline}>Fini les "ça dépend" · Réponds, et viens.</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ton prénom</Text>
          <Text style={styles.cardSub}>Juste un prénom — pas de mot de passe, pas de BS.</Text>

          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Lucas, Emma, Théo…"
            placeholderTextColor={colors.txt2}
            value={name}
            onChangeText={t => { setName(t); setError('') }}
            autoFocus
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handleContinue}
            maxLength={32}
            selectionColor={colors.primary}
          />

          {!!error && <Text style={styles.errorText}>{error}</Text>}

          <RNAnimated.View style={{ transform: [{ translateX: shake }] }}>
            <TouchableOpacity
              style={[styles.btn, isReady && styles.btnActive, loading && styles.btnLoading]}
              onPress={handleContinue}
              activeOpacity={0.85}
              disabled={loading}
            >
              <Text style={[styles.btnText, isReady && styles.btnTextActive]}>
                {loading ? 'Connexion…' : "C'est parti  →"}
              </Text>
            </TouchableOpacity>
          </RNAnimated.View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Tes données restent entre toi et tes amis.{'\n'}Pas de pub. Jamais.
        </Text>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 32,
  },

  // Logo
  logoArea: {
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    color: colors.primary,
    fontFamily: fonts.display,
    fontSize: 52,
    letterSpacing: -1,
  },
  tagline: {
    color: colors.txt2,
    fontFamily: fonts.regular,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Card
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.divider,
    padding: 24,
    gap: 16,
  },
  cardTitle: {
    color: colors.txt,
    fontFamily: fonts.bold,
    fontSize: 22,
  },
  cardSub: {
    color: colors.txt2,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    marginTop: -8,
  },

  // Input
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.divider,
    color: colors.txt,
    fontFamily: fonts.semibold,
    fontSize: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  // Error
  errorText: {
    color: colors.no,
    fontFamily: fonts.regular,
    fontSize: 13,
    marginTop: -8,
  },

  // Button
  btn: {
    borderRadius: radius.xl,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.divider,
  },
  btnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  btnLoading: {
    opacity: 0.7,
  },
  btnText: {
    color: colors.txt2,
    fontFamily: fonts.bold,
    fontSize: 17,
    letterSpacing: 0.3,
  },
  btnTextActive: {
    color: colors.txt,
  },

  // Footer
  footer: {
    color: colors.txt2,
    fontFamily: fonts.regular,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    opacity: 0.6,
  },
})
