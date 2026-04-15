import React, { useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native'
import { colors, fonts, radius, animation } from '../constants/theme'
import { ParticipationBar } from './atoms/ParticipationBar'
import { SpotPill } from './atoms/SpotPill'
import { Badge } from './atoms/Badge'

export type CardActivity = 'low' | 'mid' | 'hot' | 'full'

export interface EventCardData {
  id: string
  title: string
  date: Date
  location?: string
  maxParticipants: number | null
  confirmed: number
  maybe: number
  no: number
  waitlistCount?: number
  userStatus?: 'yes' | 'no' | 'maybe' | 'waitlist' | 'pending'
}

interface EventCardProps {
  event: EventCardData
  onPress?: (id: string) => void
}

function getActivity(confirmed: number, max: number | null): CardActivity {
  if (max === null) return 'low'
  if (confirmed >= max) return 'full'
  const ratio = confirmed / max
  if (ratio >= 0.9) return 'hot'
  if (ratio >= 0.3) return 'mid'
  return 'low'
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const activityBorderColor: Record<CardActivity, string | undefined> = {
  low: undefined,
  mid: 'rgba(255, 90, 60, 0.3)',
  hot: 'rgba(255, 90, 60, 0.5)',
  full: colors.no,
}

export function EventCard({ event, onPress }: EventCardProps) {
  const activity = getActivity(event.confirmed, event.maxParticipants)
  const glowPulse = useRef(new Animated.Value(0)).current

  // Pulsing glow for HOT cards
  useEffect(() => {
    if (activity !== 'hot' && activity !== 'full') return
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(glowPulse, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: false,
        }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [activity, glowPulse])

  const glowOpacity = glowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.15, activity === 'full' ? 0.35 : 0.45],
  })

  const borderColor = activityBorderColor[activity]

  return (
    <Pressable onPress={() => onPress?.(event.id)} style={styles.pressable}>
      <Animated.View
        style={[
          styles.card,
          borderColor ? { borderColor, borderWidth: 1 } : undefined,
          // Outer glow via shadow for hot/full
          activity === 'hot' || activity === 'full'
            ? {
                shadowColor: activity === 'full' ? colors.no : colors.primary,
                shadowOpacity: 0.35,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 0 },
                elevation: 8,
              }
            : undefined,
        ]}
      >
        {/* Inner glow overlay for hot/full */}
        {(activity === 'hot' || activity === 'full') && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.glowOverlay,
              {
                backgroundColor:
                  activity === 'full'
                    ? `rgba(255, 77, 77, 0.07)`
                    : colors.primaryGlow,
                opacity: glowOpacity,
              },
            ]}
          />
        )}

        {/* Top row: title + activity badge */}
        <View style={styles.topRow}>
          <Text style={styles.title} numberOfLines={1}>
            {event.title}
          </Text>
          {activity === 'hot' && (
            <Badge label="Ça chauffe" emoji="🔥" variant="hot" />
          )}
          {activity === 'full' && (
            <Badge label="Complet" variant="full" />
          )}
        </View>

        {/* Date & location */}
        <Text style={styles.meta}>{formatDate(event.date)}</Text>
        {event.location ? (
          <Text style={styles.meta} numberOfLines={1}>
            📍 {event.location}
          </Text>
        ) : null}

        {/* Participation bar */}
        <View style={styles.barWrapper}>
          <ParticipationBar
            yes={event.confirmed}
            maybe={event.maybe}
            no={event.no}
            height={7}
          />
        </View>

        {/* Bottom row: counts + spots pill */}
        <View style={styles.bottomRow}>
          <View style={styles.countsRow}>
            <Text style={[styles.count, { color: colors.yes }]}>
              {event.confirmed} oui
            </Text>
            {event.maybe > 0 && (
              <Text style={[styles.count, { color: colors.maybe }]}>
                · {event.maybe} peut-être
              </Text>
            )}
            {event.no > 0 && (
              <Text style={[styles.count, { color: colors.txt2 }]}>
                · {event.no} non
              </Text>
            )}
          </View>
          <SpotPill
            confirmed={event.confirmed}
            max={event.maxParticipants}
            waitlistCount={event.waitlistCount}
          />
        </View>

        {/* User status indicator */}
        {event.userStatus && event.userStatus !== 'pending' && (
          <View style={styles.userStatusRow}>
            <View
              style={[
                styles.userStatusDot,
                {
                  backgroundColor:
                    event.userStatus === 'yes'
                      ? colors.yes
                      : event.userStatus === 'maybe'
                      ? colors.maybe
                      : event.userStatus === 'waitlist'
                      ? colors.waitlist
                      : colors.no,
                },
              ]}
            />
            <Text style={styles.userStatusText}>
              {event.userStatus === 'yes'
                ? 'Tu y vas'
                : event.userStatus === 'maybe'
                ? 'Peut-être'
                : event.userStatus === 'waitlist'
                ? 'Liste d\'attente'
                : 'Tu n\'y vas pas'}
            </Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  pressable: {
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
    overflow: 'hidden',
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.lg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    flex: 1,
    color: colors.txt,
    fontFamily: fonts.bold,
    fontSize: 17,
    marginRight: 8,
  },
  meta: {
    color: colors.txt2,
    fontFamily: fonts.regular,
    fontSize: 13,
    marginBottom: 2,
  },
  barWrapper: {
    marginTop: 10,
    marginBottom: 10,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    gap: 2,
  },
  count: {
    fontSize: 12,
    fontFamily: fonts.body,
  },
  userStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    gap: 6,
  },
  userStatusDot: {
    width: 7,
    height: 7,
    borderRadius: radius.pill,
  },
  userStatusText: {
    color: colors.txt2,
    fontFamily: fonts.regular,
    fontSize: 12,
  },
})
