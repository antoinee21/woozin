import React, { useState, useCallback, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
  withDelay,
  Easing,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import Svg, { Circle } from 'react-native-svg'
import { colors, fonts, radius } from '../../constants/theme'
import { Avatar, ParticipationBar } from '../../components/atoms'
import { MOCK_EVENT_DETAILS } from '../../mock/events'

// ─── Countdown helpers ────────────────────────────────────────────────────────

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

// ─── Countdown Circle ─────────────────────────────────────────────────────────

const R = 44, STROKE = 6, CIRC = 2 * Math.PI * R, SIZE = (R + STROKE) * 2

function CountdownCircle({ deadline, totalMs }: { deadline: Date; totalMs: number }) {
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
        <Circle cx={SIZE/2} cy={SIZE/2} r={R} stroke={colors.divider} strokeWidth={STROKE} fill="none" />
        <Circle cx={SIZE/2} cy={SIZE/2} r={R} stroke={color} strokeWidth={STROKE} fill="none"
          strokeDasharray={`${dash} ${gap}`} strokeLinecap="round"
          rotation="-90" origin={`${SIZE/2}, ${SIZE/2}`} />
      </Svg>
      <View style={styles.countdownInner}>
        <Text style={[styles.countdownTime, { color }]}>{formatCountdown(ms)}</Text>
        <Text style={styles.countdownLabel}>restant</Text>
      </View>
    </View>
  )
}

// ─── Particle ────────────────────────────────────────────────────────────────

const BURST_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315]
const BURST_COLORS = [
  colors.primary, colors.primaryHover,
  colors.yellow,  colors.pink,
  colors.primary, colors.primaryHover,
  colors.yellow,  colors.pink,
]

function Particle({ angle, color, trigger }: { angle: number; color: string; trigger: number }) {
  const rad = (angle * Math.PI) / 180
  const dist = 42 + (angle % 60) / 3 // slight variation per angle

  const tx = useSharedValue(0)
  const ty = useSharedValue(0)
  const opacity = useSharedValue(0)
  const scale = useSharedValue(0)

  useEffect(() => {
    if (trigger === 0) return
    // reset
    tx.value = 0; ty.value = 0; opacity.value = 0; scale.value = 0
    // launch
    opacity.value = withSequence(
      withTiming(1,   { duration: 30 }),
      withTiming(1,   { duration: 130 }),
      withTiming(0,   { duration: 260 }),
    )
    scale.value = withSequence(
      withSpring(1.3, { damping: 7, stiffness: 350 }),
      withDelay(100, withTiming(0, { duration: 200 })),
    )
    tx.value = withSpring(Math.cos(rad) * dist, { damping: 9, stiffness: 90 })
    ty.value = withSpring(Math.sin(rad) * dist, { damping: 9, stiffness: 90 })
  }, [trigger]) // eslint-disable-line react-hooks/exhaustive-deps

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: scale.value }],
    opacity: opacity.value,
  }))

  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: color }, style]}
    />
  )
}

// ─── I'M IN Button ────────────────────────────────────────────────────────────

function ImInButton({ active, onPress }: { active: boolean; onPress: () => void }) {
  const scale       = useSharedValue(1)
  const glowScale   = useSharedValue(1)
  const glowOpacity = useSharedValue(0)
  const checkOpacity = useSharedValue(0)
  const [particleTrigger, setParticleTrigger] = useState(0)

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))
  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: glowOpacity.value,
  }))
  const checkStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
    transform: [{ scale: checkOpacity.value }],
  }))

  const handlePress = useCallback(async () => {
    if (!active) {
      // ── Becoming IN — full celebration ──────────────────────────────────
      // 1. Haptics (triple, building)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 90)
      setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success), 190)

      // 2. Button bounce: squeeze → big overshoot → settle
      scale.value = withSequence(
        withTiming(0.87, { duration: 90,  easing: Easing.out(Easing.quad) }),
        withSpring(1.12, { damping: 5,    stiffness: 280 }),
        withSpring(1.00, { damping: 14,   stiffness: 180 }),
      )

      // 3. Glow ring explosion
      glowScale.value   = 1
      glowOpacity.value = 0.85
      glowScale.value   = withTiming(1.65, { duration: 420, easing: Easing.out(Easing.quad) })
      glowOpacity.value = withTiming(0,    { duration: 420 })

      // 4. Checkmark fade-in
      checkOpacity.value = withSpring(1, { damping: 10, stiffness: 200 })

      // 5. Particles
      setParticleTrigger(t => t + 1)

    } else {
      // ── Leaving IN — subtle reverse ──────────────────────────────────────
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      scale.value = withSequence(
        withTiming(0.96, { duration: 80 }),
        withSpring(1.0,  { damping: 12 }),
      )
      checkOpacity.value = withTiming(0, { duration: 120 })
    }

    onPress()
  }, [active, onPress, scale, glowScale, glowOpacity, checkOpacity])

  return (
    <View style={styles.imInOuter}>
      {/* Particle burst — centred over button */}
      <View style={styles.particleContainer} pointerEvents="none">
        {BURST_ANGLES.map((angle, i) => (
          <Particle key={angle} angle={angle} color={BURST_COLORS[i]} trigger={particleTrigger} />
        ))}
      </View>

      {/* Expanding glow ring */}
      <Animated.View pointerEvents="none" style={[styles.glowRing, glowStyle]} />

      {/* The button itself */}
      <Animated.View style={[styles.imInAnimWrapper, buttonStyle]}>
        <TouchableOpacity
          style={[styles.imInButton, active && styles.imInButtonActive]}
          onPress={handlePress}
          activeOpacity={1}
        >
          <View style={styles.imInRow}>
            <Animated.Text style={[styles.imInCheck, checkStyle]}>✓ </Animated.Text>
            <Text style={styles.imInLabel}>I'M IN</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  )
}

// ─── MAYBE / NO button ────────────────────────────────────────────────────────

function SmallVoteButton({ label, color, active, onPress }: {
  label: string; color: string; active: boolean; onPress: () => void
}) {
  const scale = useSharedValue(1)
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  const handlePress = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    scale.value = withSequence(
      withTiming(0.93, { duration: 70 }),
      withSpring(1.0,  { damping: 12 }),
    )
    onPress()
  }, [onPress, scale])

  return (
    <Animated.View style={[styles.smallBtnWrap, animStyle]}>
      <TouchableOpacity
        style={[styles.smallBtn, { borderColor: color }, active && { backgroundColor: `${color}22` }]}
        onPress={handlePress}
        activeOpacity={1}
      >
        <Text style={[styles.smallBtnText, { color }]}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

// ─── Who Was Really In ────────────────────────────────────────────────────────

type ReallyInState = 'idle' | 'checking' | 'done'

function WhoWasReallyIn({ yesParticipants }: { yesParticipants: Array<{ id: string; name: string }> }) {
  const [state, setState] = useState<ReallyInState>('idle')
  const [present, setPresent] = useState<Set<string>>(new Set(yesParticipants.map(p => p.id)))

  const toggle = useCallback(async (id: string) => {
    await Haptics.selectionAsync()
    setPresent(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  }, [])

  const ghosts = yesParticipants.filter(p => !present.has(p.id))
  const presentList = yesParticipants.filter(p => present.has(p.id))

  if (state === 'idle') {
    return (
      <TouchableOpacity style={styles.reallyInButton} onPress={() => setState('checking')} activeOpacity={0.85}>
        <Text style={styles.reallyInButtonText}>👀  Who was really in ?</Text>
      </TouchableOpacity>
    )
  }

  if (state === 'done') {
    return (
      <View style={styles.reallyInResult}>
        <View style={styles.reallyInResultRow}>
          <View style={[styles.resultPill, { backgroundColor: `${colors.yes}22`, borderColor: colors.yes }]}>
            <Text style={[styles.resultPillText, { color: colors.yes }]}>✓ {presentList.length} présent{presentList.length > 1 ? 's' : ''}</Text>
          </View>
          <View style={[styles.resultPill, { backgroundColor: `${colors.no}22`, borderColor: colors.no }]}>
            <Text style={[styles.resultPillText, { color: colors.no }]}>👻 {ghosts.length} faux plan{ghosts.length > 1 ? 's' : ''}</Text>
          </View>
        </View>
        {ghosts.length > 0 ? (
          <View style={styles.ghostList}>
            {ghosts.map(p => (
              <View key={p.id} style={styles.ghostRow}>
                <Avatar name={p.name} size={30} />
                <Text style={styles.ghostName}>{p.name}</Text>
                <Text style={styles.ghostLabel}>👻 Faux plan</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.perfectText}>🏆 Tout le monde était là. Rare.</Text>
        )}
      </View>
    )
  }

  return (
    <View style={styles.reallyInChecker}>
      <Text style={styles.reallyInCheckerTitle}>Qui était vraiment là ?</Text>
      <Text style={styles.reallyInCheckerSub}>Coche ceux qui sont venus</Text>
      <View style={styles.checkerList}>
        {yesParticipants.map(p => {
          const here = present.has(p.id)
          return (
            <TouchableOpacity key={p.id}
              style={[styles.checkerRow, here && styles.checkerRowPresent]}
              onPress={() => toggle(p.id)} activeOpacity={0.7}
            >
              <Avatar name={p.name} size={36} statusColor={here ? colors.yes : colors.divider} />
              <Text style={[styles.checkerName, !here && styles.checkerNameGhost]}>{p.name}</Text>
              {!here && <Text style={styles.ghostEmoji}>👻</Text>}
              <View style={[styles.checkbox, here && styles.checkboxChecked]}>
                {here && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </TouchableOpacity>
          )
        })}
      </View>
      <TouchableOpacity style={styles.validateBtn} onPress={async () => {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        setState('done')
      }} activeOpacity={0.85}>
        <Text style={styles.validateBtnText}>Valider · {present.size} présents</Text>
      </TouchableOpacity>
    </View>
  )
}

// ─── Participant Row ──────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  yes: colors.yes, maybe: colors.maybe, no: colors.no, waitlist: colors.waitlist,
}
function ParticipantRow({ name, status }: { name: string; status: string }) {
  return (
    <View style={styles.participantRow}>
      <Avatar name={name} size={36} statusColor={STATUS_COLOR[status]} />
      <Text style={styles.participantName}>{name}</Text>
      <Text style={[styles.participantStatus, { color: STATUS_COLOR[status] }]}>
        {status === 'yes' ? 'Oui ✓' : status === 'maybe' ? 'Peut-être' : 'Non'}
      </Text>
    </View>
  )
}

// ─── Reactions ───────────────────────────────────────────────────────────────

const REACTION_LIST = ['🔥', '😂', '❤️', '👀', '🎉'] as const
type Emoji = typeof REACTION_LIST[number]

// Mock initial counts per event
const MOCK_REACTIONS: Record<Emoji, number> = {
  '🔥': 4, '😂': 2, '❤️': 6, '👀': 1, '🎉': 3,
}

function ReactionPill({
  emoji, count, active, onPress,
}: { emoji: Emoji; count: number; active: boolean; onPress: () => void }) {
  const scale = useSharedValue(1)

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  function handlePress() {
    scale.value = withSequence(
      withSpring(active ? 0.85 : 1.35, { damping: 5, stiffness: 400 }),
      withSpring(1, { damping: 8 }),
    )
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onPress()
  }

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <Animated.View style={[
        styles.reactionPill,
        active && styles.reactionPillActive,
        animStyle,
      ]}>
        <Text style={styles.reactionEmoji}>{emoji}</Text>
        {count > 0 && (
          <Text style={[styles.reactionCount, active && styles.reactionCountActive]}>
            {count}
          </Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  )
}

function ReactionsBar() {
  const [counts, setCounts]   = useState<Record<Emoji, number>>({ ...MOCK_REACTIONS })
  const [mine, setMine]       = useState<Set<Emoji>>(new Set())

  function toggle(emoji: Emoji) {
    const isActive = mine.has(emoji)
    setMine(prev => {
      const next = new Set(prev)
      isActive ? next.delete(emoji) : next.add(emoji)
      return next
    })
    setCounts(prev => ({
      ...prev,
      [emoji]: prev[emoji] + (isActive ? -1 : 1),
    }))
  }

  return (
    <View style={styles.reactionsRow}>
      {REACTION_LIST.map(emoji => (
        <ReactionPill
          key={emoji}
          emoji={emoji}
          count={counts[emoji]}
          active={mine.has(emoji)}
          onPress={() => toggle(emoji)}
        />
      ))}
    </View>
  )
}

// ─── Animated spots counter ───────────────────────────────────────────────────

function SpotsCounter({ value, max }: { value: number; max: number | null }) {
  const bump = useSharedValue(1)
  const prevValue = React.useRef(value)

  useEffect(() => {
    if (prevValue.current !== value) {
      prevValue.current = value
      bump.value = withSequence(
        withSpring(1.25, { damping: 6, stiffness: 300 }),
        withSpring(1.0,  { damping: 10 }),
      )
    }
  }, [value, bump])

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: bump.value }] }))

  return (
    <View style={styles.spotsRow}>
      <View>
        <Animated.Text style={[styles.spotsCount, animStyle]}>
          {max !== null ? max - value : '∞'}
        </Animated.Text>
        <Text style={styles.spotsLabel}>
          {max !== null ? `restant${max - value !== 1 ? 's' : ''} sur ${max}` : 'places illimitées'}
        </Text>
      </View>
      {max !== null && value >= max && (
        <View style={styles.fullBadge}>
          <Text style={styles.fullBadgeText}>COMPLET</Text>
        </View>
      )}
    </View>
  )
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const event = MOCK_EVENT_DETAILS[id ?? '6'] ?? MOCK_EVENT_DETAILS['6']

  type VoteType = 'yes' | 'maybe' | 'no'
  const [userVote, setUserVote] = useState<VoteType | null>(null)

  const handleVote = useCallback((v: VoteType) => {
    setUserVote(prev => prev === v ? null : v)
  }, [])

  const isPast  = event.date.getTime() <= Date.now()
  const baseYes = event.participants.filter(p => p.status === 'yes').length
  const maybe   = event.participants.filter(p => p.status === 'maybe').length
  const no      = event.participants.filter(p => p.status === 'no').length
  const yes     = baseYes + (userVote === 'yes' ? 1 : 0)
  const max     = event.maxParticipants
  const totalMs = event.deadline.getTime() - (event.date.getTime() - 7 * 24 * 60 * 60 * 1000)
  const yesParticipants = event.participants.filter(p => p.status === 'yes')

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>{event.title}</Text>
          {isPast && <View style={styles.pastBadge}><Text style={styles.pastBadgeText}>Passé</Text></View>}
        </View>

        {/* Countdown */}
        {!isPast && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Réponds avant</Text>
            <CountdownCircle deadline={event.deadline} totalMs={totalMs} />
            <Text style={styles.deadlineDate}>
              {event.deadline.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        )}

        {/* Spots */}
        <View style={styles.card}>
          <SpotsCounter value={yes} max={max} />
        </View>

        {/* Participation bar */}
        <View style={styles.card}>
          <ParticipationBar yes={yes} maybe={maybe} no={no} height={12} />
          <View style={styles.barLegend}>
            <Text style={[styles.legendItem, { color: colors.yes }]}>● {yes} oui</Text>
            <Text style={[styles.legendItem, { color: colors.maybe }]}>● {maybe} peut-être</Text>
            <Text style={[styles.legendItem, { color: colors.txt2 }]}>● {no} non</Text>
          </View>
        </View>

        {/* Reactions */}
        <ReactionsBar />

        {/* Who was really in */}
        {isPast && <WhoWasReallyIn yesParticipants={yesParticipants} />}

        {/* Participants */}
        {event.participants.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Participants</Text>
            {event.participants.filter(p => p.status !== 'no').map(p => (
              <ParticipantRow key={p.id} name={p.name} status={p.status} />
            ))}
            {event.participants.filter(p => p.status === 'no').map(p => (
              <ParticipantRow key={p.id} name={p.name} status="no" />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Vote bar */}
      {!isPast && (
        <View style={styles.voteBar}>
          <ImInButton active={userVote === 'yes'} onPress={() => handleVote('yes')} />
          <View style={styles.secondaryRow}>
            <SmallVoteButton
              label="🤔  Peut-être" color={colors.maybe}
              active={userVote === 'maybe'} onPress={() => handleVote('maybe')}
            />
            <SmallVoteButton
              label="✕  Je viens pas" color={colors.no}
              active={userVote === 'no'} onPress={() => handleVote('no')}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.bg },
  scroll:  { flex: 1 },
  content: { padding: 16, paddingBottom: 140, gap: 12 },

  headerRow:    { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 12 },
  backBtn:      { width: 36, height: 36, borderRadius: radius.pill, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  backArrow:    { color: colors.txt, fontSize: 18 },
  title:        { flex: 1, color: colors.txt, fontFamily: fonts.display, fontSize: 22 },
  pastBadge:    { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider },
  pastBadgeText:{ color: colors.txt2, fontFamily: fonts.semibold, fontSize: 12 },

  card:      { backgroundColor: colors.card, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: colors.divider },
  cardLabel: { color: colors.txt2, fontFamily: fonts.regular, fontSize: 13, marginBottom: 12, textAlign: 'center' },
  cardTitle: { color: colors.txt, fontFamily: fonts.bold, fontSize: 15, marginBottom: 12 },

  countdownWrapper: { alignSelf: 'center', alignItems: 'center', justifyContent: 'center' },
  countdownInner:   { position: 'absolute', alignItems: 'center' },
  countdownTime:    { fontFamily: fonts.bold, fontSize: 20 },
  countdownLabel:   { color: colors.txt2, fontFamily: fonts.regular, fontSize: 11 },
  deadlineDate:     { color: colors.txt2, fontFamily: fonts.regular, fontSize: 12, textAlign: 'center', marginTop: 10, textTransform: 'capitalize' },

  spotsRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  spotsCount:    { color: colors.primary, fontFamily: fonts.display, fontSize: 48 },
  spotsLabel:    { color: colors.txt2, fontFamily: fonts.regular, fontSize: 14 },
  fullBadge:     { backgroundColor: 'rgba(255,77,77,0.15)', borderRadius: radius.pill, borderWidth: 1, borderColor: colors.no, paddingHorizontal: 12, paddingVertical: 6 },
  fullBadgeText: { color: colors.no, fontFamily: fonts.bold, fontSize: 13 },

  barLegend:  { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
  legendItem: { fontFamily: fonts.body, fontSize: 13 },

  // Reactions
  reactionsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 4,
    flexWrap: 'wrap',
  },
  reactionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.divider,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  reactionPillActive: {
    backgroundColor: 'rgba(255,90,60,0.12)',
    borderColor: colors.primary,
  },
  reactionEmoji: { fontSize: 18 },
  reactionCount: {
    color: colors.txt2,
    fontFamily: fonts.semibold,
    fontSize: 13,
  },
  reactionCountActive: { color: colors.primary },

  participantRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: 10, borderBottomWidth: 1, borderBottomColor: colors.divider },
  participantName:   { flex: 1, color: colors.txt, fontFamily: fonts.body, fontSize: 14 },
  participantStatus: { fontFamily: fonts.semibold, fontSize: 12 },

  // ── Vote bar ──────────────────────────────────────────────────────────────
  voteBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'column',
    gap: 10, paddingHorizontal: 16, paddingBottom: 30, paddingTop: 14,
    backgroundColor: colors.bg,
    borderTopWidth: 1, borderTopColor: colors.divider,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: 10,
  },

  // Small buttons (NO / MAYBE)
  smallBtnWrap: { flex: 1 },
  smallBtn: {
    paddingVertical: 11,
    borderRadius: radius.md,
    alignItems: 'center',
    borderWidth: 1,
    backgroundColor: colors.surface,
  },
  smallBtnText: { fontFamily: fonts.semibold, fontSize: 13, letterSpacing: 0.2 },

  // I'M IN button
  imInOuter: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  particleContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    zIndex: 10,
  },
  glowRing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: radius.xl,
    borderWidth: 2.5,
    borderColor: colors.primary,
    zIndex: 5,
  },
  imInAnimWrapper: { width: '100%', zIndex: 1 },
  imInButton: {
    paddingVertical: 20,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  imInButtonActive: {
    backgroundColor: colors.primaryHover,
    shadowOpacity: 0.7,
    shadowRadius: 28,
  },
  imInRow:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  imInCheck: { color: colors.txt, fontFamily: fonts.bold, fontSize: 20 },
  imInLabel: { color: colors.txt, fontFamily: fonts.bold, fontSize: 20, letterSpacing: 1.2 },

  // ── Who was really in ─────────────────────────────────────────────────────
  reallyInButton:     { borderWidth: 1.5, borderColor: colors.yellow, borderRadius: radius.lg, paddingVertical: 16, alignItems: 'center', backgroundColor: 'rgba(255,217,61,0.06)' },
  reallyInButtonText: { color: colors.yellow, fontFamily: fonts.bold, fontSize: 16, letterSpacing: 0.3 },
  reallyInChecker:      { backgroundColor: colors.card, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: colors.yellow, gap: 12 },
  reallyInCheckerTitle: { color: colors.txt, fontFamily: fonts.bold, fontSize: 16 },
  reallyInCheckerSub:   { color: colors.txt2, fontFamily: fonts.regular, fontSize: 13, marginTop: -8 },
  checkerList:    { gap: 6 },
  checkerRow:     { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: radius.md, gap: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: 'transparent' },
  checkerRowPresent: { borderColor: colors.yes, backgroundColor: 'rgba(59,255,122,0.06)' },
  checkerName:    { flex: 1, color: colors.txt, fontFamily: fonts.body, fontSize: 14 },
  checkerNameGhost: { color: colors.txt2, textDecorationLine: 'line-through' },
  ghostEmoji:     { fontSize: 16 },
  checkbox:        { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: colors.divider, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: colors.yes, borderColor: colors.yes },
  checkmark:       { color: colors.bg, fontSize: 13, fontFamily: fonts.bold },
  validateBtn:     { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center', marginTop: 4, shadowColor: colors.primary, shadowOpacity: 0.35, shadowRadius: 10, elevation: 6 },
  validateBtnText: { color: colors.txt, fontFamily: fonts.bold, fontSize: 15 },
  reallyInResult:     { backgroundColor: colors.card, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: colors.divider, gap: 12 },
  reallyInResultRow:  { flexDirection: 'row', gap: 10 },
  resultPill:         { flex: 1, borderWidth: 1, borderRadius: radius.pill, paddingVertical: 8, alignItems: 'center' },
  resultPillText:     { fontFamily: fonts.bold, fontSize: 14 },
  ghostList:  { gap: 6, marginTop: 4 },
  ghostRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, backgroundColor: 'rgba(255,77,77,0.06)', borderRadius: radius.md },
  ghostName:  { flex: 1, color: colors.txt, fontFamily: fonts.body, fontSize: 14 },
  ghostLabel: { color: colors.no, fontFamily: fonts.semibold, fontSize: 12 },
  perfectText:{ color: colors.yes, fontFamily: fonts.semibold, fontSize: 14, textAlign: 'center', paddingVertical: 8 },
})
