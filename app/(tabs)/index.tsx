import React, { useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { colors, fonts, radius } from '../../constants/theme'
import { EventCard } from '../../components/EventCard'
import { MOCK_EVENTS } from '../../mock/events'

function todayLabel(): string {
  return new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export default function HomeScreen() {
  const router = useRouter()

  const sorted = [...MOCK_EVENTS].sort((a, b) => a.date.getTime() - b.date.getTime())

  const handleEventPress = useCallback(
    (id: string) => {
      router.push(`/event/${id}`)
    },
    [router],
  )

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>woozin</Text>
            <Text style={styles.date}>{todayLabel()}</Text>
          </View>
        </View>

        {/* Events */}
        <Text style={styles.sectionTitle}>Tes events</Text>
        {sorted.map((event) => (
          <EventCard key={event.id} event={event} onPress={handleEventPress} />
        ))}
      </ScrollView>

      {/* CTA — sticky bottom */}
      <View style={styles.ctaWrapper}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push('/event/create')}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>＋ Créer un event</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  logo: {
    color: colors.primary,
    fontFamily: fonts.display,
    fontSize: 34,
    lineHeight: 36,
  },
  date: {
    color: colors.txt2,
    fontFamily: fonts.regular,
    fontSize: 13,
    textTransform: 'capitalize',
  },
  sectionTitle: {
    color: colors.txt,
    fontFamily: fonts.bold,
    fontSize: 20,
    marginBottom: 14,
  },
  ctaWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 12,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  ctaButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  ctaText: {
    color: colors.txt,
    fontFamily: fonts.bold,
    fontSize: 17,
    letterSpacing: 0.3,
  },
})
