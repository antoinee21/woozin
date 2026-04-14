import React, { useState, useCallback, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Pressable,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import Svg, { Circle } from 'react-native-svg'
import { colors, fonts, radius, animation } from '../../constants/theme'
import { Avatar, ParticipationBar } from '../../components/atoms'
import { MOCK_EVENT_DETAILS } from '../../mock/events'

// ─── Countdown helpers ──────────────────────────────────────────────────────

function msRemaining(deadline: Date): number {
  return Math.max(0, deadline.getTime() - Date.now())
}

function formatCountdown(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  if (h > 0) return `${h}h ${m}min`
  return `${m}min`
}

function countdownColor(ms: number): string {
  const hours = ms / (1000 * 60 * 60)
  if (hours < 1) return colors.no
  if (hours < 6) return colors.primary
  return colors.yellow
}

// ─── Countdown Circle ───────────────────────────────────────────────────────

const R = 44
const STROKE = 6
const CIRC = 2 * Math.PI * R
const SIZE = (R + STROKE) * 2

interface CountdownCircleProps {
  deadline: Date
  totalMs: number
}

function CountdownCircle({ deadline, totalMs }: CountdownCircleProps) {
  const [ms, setMs] = useState(() => msRemaining(deadline))

  useEffect(() => {
    const id = setInterval(() => setMs(msRemaining(deadline)), 1000)
    return () => clearInterval(id)
  }, [deadline])

  const progress = totalMs > 0 ? ms / totalMs : 0
  const dash = CIRC * progress
  const gap = CIRC - dash
  const color = countdownColor(ms)

  return (
    <View style={styles.countdownWrapper}>
      <Svg width={SIZE} height={SIZE}>
        {/* Track */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          stroke={colors.divider}
          strokeWidth={STROKE}
          fill="none"
        />
        {/* Progress */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          stroke={color}
          strokeWidth={STROKE}
          fill="none"
          strokeDasharray={`${dash} ${gap}`}
          strokeLinecap="round"
          rotation="-90"
          origin={`${SIZE / 2}, ${SIZE / 2}`}
        />
      </Svg>
      <View style={styles.countdownInner}>
        <Text style={[styles.countdownTime, { color }]}>{formatCountdown(ms)}</Text>
        <Text style={styles.countdownLabel}>restant</Text>
      </View>
    </View>
  )
}

// ─── Vote Button ─────────────────────────────────────────────────────────────

type VoteType = 'yes' | 'maybe' | 'no'

interface VoteButtonProps {
  vote: VoteType
  active: boolean
  onPress: (v: VoteType) => void
}

const VOTE_CONFIG: Record<
  VoteType,
  { label: string; color: string; bg: string; emoji: string }
> = {
  yes: { label: "I'M IN", color: colors.txt, bg: colors.primary, emoji: '✅' },
  maybe: { label: 'MAYBE', color: colors.maybe, bg: 'transparent', emoji: '🤔' },
  no: { label: 'NO', color: colors.no, bg: 'transparent', emoji: '❌' },
}

function VoteButton({ vote, active, onPress }: VoteButtonProps) {
  const config = VOTE_CONFIG[vote]
  const scale = useSharedValue(1)

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePress = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    scale.value = withSequence(
      withTiming(0.94, { duration: 80, easing: Easing.out(Easing.quad) }),
      withSpring(1.02, { damping: 12 }),
      withTiming(1, { duration: 100 }),
    )
    onPress(vote)
  }, [vote, onPress, scale])

  const isYes = vote === 'yes'

  return (
    <Animated.View style={[styles.voteButtonWrap, isYes && styles.voteYesWrap, animStyle]}>
      <TouchableOpacity
        style={[
          styles.voteButton,
          isYes && styles.voteYesButton,
          !isYes && { borderColor: config.color, borderWidth: 1.5 },
          active && !isYes && { backgroundColor: `${config.color}22` },
          active && isYes && styles.voteYesActive,
        ]}
        onPress={handlePress}
        activeOpacity={1}
      >
        <Text style={[styles.voteText, { color: isYes ? colors.txt : config.color }]}>
          {config.label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

// ─── Participant Row ─────────────────────────────────────────────────────────

interface ParticipantRowProps {
  name: string
  status: 'yes' | 'maybe' | 'no' | 'waitlist'
  isWaitlist?: boolean
  position?: number
}

const STATUS_COLOR: Record<string, string> = {
  yes: colors.yes,
  maybe: colors.maybe,
  no: colors.no,
  waitlist: colors.waitlist,
}

function ParticipantRow({ name, status, isWaitlist, position }: ParticipantRowProps) {
  return (
    <View style={styles.participantRow}>
      <Avatar name={name} size={36} statusColor={STATUS_COLOR[status]} />
      <Text style={styles.participantName}>{name}</Text>
      {isWaitlist && position !== undefined && (
        <Text style={[styles.participantStatus, { color: colors.waitlist }]}>
          #{position} waitlist
        </Text>
      )}
      {!isWaitlist && (
        <Text style={[styles.participantStatus, { color: STATUS_COLOR[status] }]}>
          {status === 'yes' ? 'Oui ✓' : status === 'maybe' ? 'Peut-être' : 'Non'}
        </Text>
      )}
    </View>
  )
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const event = MOCK_EVENT_DETAILS[id ?? '1'] ?? MOCK_EVENT_DETAILS['1']

  const [userVote, setUserVote] = useState<VoteType | null>(null)

  const yes = event.participants.filter((p) => p.status === 'yes').length
  const maybe = event.participants.filter((p) => p.status === 'maybe').length
  const no = event.participants.filter((p) => p.status === 'no').length
  const confirmed = yes + (userVote === 'yes' ? 1 : userVote === null ? 0 : 0)
  const max = event.maxParticipants
  const isFull = max !== null && confirmed >= max

  const totalMs =
    event.deadline.getTime() - (event.date.getTime() - 7 * 24 * 60 * 60 * 1000)

  const handleVote = useCallback((v: VoteType) => {
    setUserVote((prev) => (prev === v ? null : v))
  }, [])

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>
            {event.title}
          </Text>
        </View>

        {/* Countdown */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Réponds avant</Text>
          <CountdownCircle deadline={event.deadline} totalMs={totalMs} />
          <Text style={styles.deadlineDate}>
            {event.deadline.toLocaleDateString('fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        {/* Spots */}
        <View style={styles.card}>
          <View style={styles.spotsRow}>
            <View>
              <Text style={styles.spotsCount}>
                {max !== null ? max - yes : '∞'}
              </Text>
              <Text style={styles.spotsLabel}>
                {max !== null
                  ? `restant${max - yes !== 1 ? 's' : ''} sur ${max}`
                  : 'places illimitées'}
              </Text>
            </View>
            {isFull && (
              <View style={styles.fullBadge}>
                <Text style={styles.fullBadgeText}>COMPLET</Text>
              </View>
            )}
          </View>
        </View>

        {/* Participation bar — large */}
        <View style={styles.card}>
          <ParticipationBar yes={yes} maybe={maybe} no={no} height={12} />
          <View style={styles.barLegend}>
            <Text style={[styles.legendItem, { color: colors.yes }]}>
              ● {yes} oui
            </Text>
            <Text style={[styles.legendItem, { color: colors.maybe }]}>
              ● {maybe} peut-être
            </Text>
            <Text style={[styles.legendItem, { color: colors.txt2 }]}>
              ● {no} non
            </Text>
          </View>
        </View>

        {/* Participants */}
        {event.participants.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Participants</Text>
            {event.participants
              .filter((p) => p.status !== 'no')
              .map((p) => (
                <ParticipantRow key={p.id} name={p.name} status={p.status} />
              ))}
            {event.participants.filter((p) => p.status === 'no').map((p) => (
              <ParticipantRow key={p.id} name={p.name} status="no" />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Vote buttons — sticky */}
      <View style={styles.voteBar}>
        <VoteButton vote="no" active={userVote === 'no'} onPress={handleVote} />
        <VoteButton vote="maybe" active={userVote === 'maybe'} onPress={handleVote} />
        <VoteButton vote="yes" active={userVote === 'yes'} onPress={handleVote} />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 110, gap: 12 },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: { color: colors.txt, fontSize: 18 },
  title: {
    flex: 1,
    color: colors.txt,
    fontFamily: fonts.display,
    fontSize: 22,
  },

  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  cardLabel: { color: colors.txt2, fontFamily: fonts.regular, fontSize: 13, marginBottom: 12, textAlign: 'center' },
  cardTitle: { color: colors.txt, fontFamily: fonts.bold, fontSize: 15, marginBottom: 12 },

  // Countdown
  countdownWrapper: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownInner: {
    position: 'absolute',
    alignItems: 'center',
  },
  countdownTime: {
    fontFamily: fonts.bold,
    fontSize: 20,
  },
  countdownLabel: {
    color: colors.txt2,
    fontFamily: fonts.regular,
    fontSize: 11,
  },
  deadlineDate: {
    color: colors.txt2,
    fontFamily: fonts.regular,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
    textTransform: 'capitalize',
  },

  // Spots
  spotsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  spotsCount: { color: colors.primary, fontFamily: fonts.display, fontSize: 48 },
  spotsLabel: { color: colors.txt2, fontFamily: fonts.regular, fontSize: 14 },
  fullBadge: {
    backgroundColor: 'rgba(255, 77, 77, 0.15)',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.no,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  fullBadgeText: { color: colors.no, fontFamily: fonts.bold, fontSize: 13 },

  // Bar legend
  barLegend: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
  legendItem: { fontFamily: fonts.body, fontSize: 13 },

  // Participants
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  participantName: { flex: 1, color: colors.txt, fontFamily: fonts.body, fontSize: 14 },
  participantStatus: { fontFamily: fonts.semibold, fontSize: 12 },

  // Vote bar
  voteBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 28,
    paddingTop: 12,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  voteButtonWrap: { flex: 1 },
  voteYesWrap: { flex: 2 },
  voteButton: {
    paddingVertical: 14,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voteYesButton: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  voteYesActive: {
    backgroundColor: colors.primaryHover,
  },
  voteText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    letterSpacing: 0.5,
  },
})
