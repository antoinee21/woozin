import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native'
import { useRouter } from 'expo-router'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
  Easing,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { colors, fonts, radius, animation } from '../../constants/theme'
import { Avatar } from '../../components/atoms'
import { MOCK_EVENTS, MOCK_EVENT_DETAILS } from '../../mock/events'

// ─── Types ───────────────────────────────────────────────────────────────────

type VoteChoice = 'yes' | 'maybe' | 'no'

interface Invitation {
  id: string
  title: string
  date: Date
  deadline: Date
  location?: string
  creatorName: string
  confirmed: number
  maybe: number
  maxParticipants: number | null
  participants: Array<{ id: string; name: string }>
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(d: Date): string {
  return d.toLocaleDateString('fr-FR', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
}
function formatTime(d: Date): string {
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}
function deadlineLabel(deadline: Date): string {
  const h = Math.max(0, Math.round((deadline.getTime() - Date.now()) / 3600000))
  if (h < 1) return 'Urgent !'
  if (h < 3) return `⚡ ${h}h pour répondre`
  if (h < 24) return `${h}h pour répondre`
  const d = Math.floor(h / 24)
  return `${d}j pour répondre`
}
function deadlineColor(deadline: Date): string {
  const h = (deadline.getTime() - Date.now()) / 3600000
  if (h < 3) return colors.no
  if (h < 24) return colors.primary
  return colors.txt2
}
function spotsLabel(confirmed: number, max: number | null): string {
  if (max === null) return `${confirmed} participant${confirmed > 1 ? 's' : ''}`
  const left = max - confirmed
  if (left <= 0) return 'Complet'
  if (left === 1) return '🔥 1 place restante'
  return `${left} places restantes`
}

// ─── Build invitation list from mock ─────────────────────────────────────────

function buildInvitations(): Invitation[] {
  return MOCK_EVENTS
    .filter(e => e.userStatus === 'pending')
    .map(e => {
      const detail = MOCK_EVENT_DETAILS[e.id]
      return {
        id: e.id,
        title: e.title,
        date: e.date,
        deadline: detail?.deadline ?? new Date(e.date.getTime() - 2 * 3600000),
        location: e.location,
        creatorName: detail?.creatorName ?? '?',
        confirmed: e.confirmed,
        maybe: e.maybe,
        maxParticipants: e.maxParticipants,
        participants: (detail?.participants ?? []).slice(0, 5),
      }
    })
}

// ─── Invitation Card ──────────────────────────────────────────────────────────

interface InvitationCardProps {
  inv: Invitation
  onVote: (id: string, choice: VoteChoice) => void
}

function InvitationCard({ inv, onVote }: InvitationCardProps) {
  const [voted, setVoted] = useState<VoteChoice | null>(null)
  const opacity  = useSharedValue(1)
  const scale    = useSharedValue(1)
  const height   = useSharedValue<number | undefined>(undefined)

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
    overflow: 'hidden',
    ...(height.value !== undefined ? { height: height.value } : {}),
  }))

  const vote = useCallback((choice: VoteChoice) => {
    if (voted) return
    setVoted(choice)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    // Bounce, then collapse
    scale.value = withSequence(
      withTiming(0.97, { duration: 80 }),
      withTiming(1.01, { duration: 100 }),
      withTiming(1, { duration: 80 }),
    )
    opacity.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.ease) })
    height.value = withTiming(0, { duration: 420, easing: Easing.out(Easing.ease) }, () => {
      runOnJS(onVote)(inv.id, choice)
    })
  }, [voted, inv.id, onVote, opacity, scale, height])

  const dl = deadlineColor(inv.deadline)
  const dlText = deadlineLabel(inv.deadline)
  const spots = spotsLabel(inv.confirmed, inv.maxParticipants)

  return (
    <Animated.View style={[styles.card, animStyle]}>
      {/* Urgency pill */}
      <View style={styles.cardTop}>
        <Text style={[styles.deadline, { color: dl }]}>{dlText}</Text>
        <Text style={styles.creatorLabel}>De <Text style={styles.creatorName}>{inv.creatorName}</Text></Text>
      </View>

      {/* Title + meta */}
      <Text style={styles.cardTitle}>{inv.title}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.meta}>📅 {formatDate(inv.date)} · {formatTime(inv.date)}</Text>
      </View>
      {inv.location && (
        <Text style={styles.meta}>📍 {inv.location}</Text>
      )}
      <Text style={[styles.spots, inv.maxParticipants !== null && inv.maxParticipants - inv.confirmed <= 1 && { color: colors.primary }]}>
        {spots}
      </Text>

      {/* FOMO tease */}
      {inv.participants.length > 0 && (
        <View style={styles.fomoBlock}>
          {/* Avatar stack */}
          <View style={styles.avatarRow}>
            {inv.participants.slice(0, 4).map((p, i) => (
              <View key={p.id} style={[styles.avatarWrap, { zIndex: 10 - i, marginLeft: i === 0 ? 0 : -8 }]}>
                <Avatar name={p.name} size={30} />
              </View>
            ))}
          </View>
          {/* FOMO sentence */}
          <View style={styles.fomoTextBlock}>
            <Text style={styles.fomoText}>
              <Text style={styles.fomoNames}>
                {inv.participants.slice(0, 2).map(p => p.name).join(' et ')}
              </Text>
              {inv.confirmed > 2
                ? ` et ${inv.confirmed - 2} autre${inv.confirmed - 2 > 1 ? 's' : ''} ont dit oui`
                : ' ont déjà dit oui'}
            </Text>
            {/* Hot badge if few spots left */}
            {inv.maxParticipants !== null && inv.maxParticipants - inv.confirmed <= 3 && (
              <View style={styles.fomoBadge}>
                <Text style={styles.fomoBadgeText}>
                  {inv.maxParticipants - inv.confirmed <= 1
                    ? '🔥 Dernière place !'
                    : `🔥 Plus que ${inv.maxParticipants - inv.confirmed} places`}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Divider */}
      <View style={styles.divider} />

      {/* Vote buttons */}
      <View style={styles.voteRow}>
        <TouchableOpacity
          style={[styles.voteBtn, styles.voteBtnYes, voted === 'yes' && styles.votedYes]}
          onPress={() => vote('yes')}
          activeOpacity={0.8}
        >
          <Text style={[styles.voteBtnText, styles.voteBtnYesText]}>✓  I'M IN</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.voteBtn, styles.voteBtnMaybe, voted === 'maybe' && styles.votedMaybe]}
          onPress={() => vote('maybe')}
          activeOpacity={0.8}
        >
          <Text style={[styles.voteBtnText, voted === 'maybe' && { color: colors.yellow }]}>🤔</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.voteBtn, styles.voteBtnNo, voted === 'no' && styles.votedNo]}
          onPress={() => vote('no')}
          activeOpacity={0.8}
        >
          <Text style={[styles.voteBtnText, voted === 'no' && { color: colors.no }]}>✕</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  )
}

// ─── Already-responded row ────────────────────────────────────────────────────

function RespondedRow({ event }: { event: (typeof MOCK_EVENTS)[0] }) {
  const router = useRouter()
  const statusLabel: Record<string, string> = {
    yes: '✓ Tu y vas',
    maybe: '🤔 Peut-être',
    no: '✕ Absent',
    waitlist: '⏳ Liste d\'attente',
  }
  const statusColor: Record<string, string> = {
    yes: colors.yes,
    maybe: colors.yellow,
    no: colors.no,
    waitlist: colors.waitlist,
  }
  const s = event.userStatus as string

  return (
    <TouchableOpacity
      style={styles.respondedRow}
      onPress={() => router.push(`/event/${event.id}` as any)}
      activeOpacity={0.7}
    >
      <View style={styles.respondedLeft}>
        <Text style={styles.respondedTitle} numberOfLines={1}>{event.title}</Text>
        <Text style={styles.respondedDate}>
          {formatDate(event.date)}
        </Text>
      </View>
      <Text style={[styles.respondedStatus, { color: statusColor[s] ?? colors.txt2 }]}>
        {statusLabel[s] ?? s}
      </Text>
    </TouchableOpacity>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function InvitationsScreen() {
  const [pendingIds, setPendingIds] = useState<string[]>(
    () => buildInvitations().map(i => i.id)
  )
  const [answered, setAnswered] = useState<Array<{ id: string; choice: VoteChoice }>>([])

  const invitations = buildInvitations().filter(i => pendingIds.includes(i.id))

  const alreadyResponded = MOCK_EVENTS.filter(
    e => e.userStatus !== 'pending' && e.userStatus !== undefined
  )

  const handleVote = useCallback((id: string, choice: VoteChoice) => {
    setPendingIds(prev => prev.filter(pid => pid !== id))
    setAnswered(prev => [...prev, { id, choice }])
  }, [])

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Invitations</Text>
        {pendingIds.length > 0 && (
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{pendingIds.length}</Text>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Pending invitations */}
        {invitations.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>EN ATTENTE</Text>
            {invitations.map(inv => (
              <InvitationCard key={inv.id} inv={inv} onVote={handleVote} />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎉</Text>
            <Text style={styles.emptyTitle}>Tout bon !</Text>
            <Text style={styles.emptySub}>Tu as répondu à toutes tes invitations.</Text>
          </View>
        )}

        {/* Already responded */}
        {alreadyResponded.length > 0 && (
          <View style={[styles.section, { marginTop: invitations.length > 0 ? 32 : 16 }]}>
            <Text style={styles.sectionLabel}>DÉJÀ RÉPONDU</Text>
            <View style={styles.respondedCard}>
              {alreadyResponded.map((e, i) => (
                <View key={e.id}>
                  <RespondedRow event={e} />
                  {i < alreadyResponded.length - 1 && <View style={styles.rowDivider} />}
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    color: colors.txt,
    fontFamily: fonts.bold,
    fontSize: 26,
  },
  headerBadge: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  headerBadgeText: {
    color: colors.txt,
    fontFamily: fonts.semibold,
    fontSize: 12,
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 4 },

  // Section
  section: {},
  sectionLabel: {
    color: colors.txt2,
    fontFamily: fonts.semibold,
    fontSize: 11,
    letterSpacing: 1.2,
    marginBottom: 12,
  },

  // Invitation card
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deadline: {
    fontFamily: fonts.semibold,
    fontSize: 12,
  },
  creatorLabel: {
    color: colors.txt2,
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  creatorName: {
    color: colors.txt,
    fontFamily: fonts.semibold,
  },
  cardTitle: {
    color: colors.txt,
    fontFamily: fonts.bold,
    fontSize: 20,
    marginBottom: 6,
  },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  meta: {
    color: colors.txt2,
    fontFamily: fonts.regular,
    fontSize: 13,
    marginBottom: 2,
  },
  spots: {
    color: colors.txt2,
    fontFamily: fonts.semibold,
    fontSize: 13,
    marginTop: 6,
    marginBottom: 10,
  },

  // FOMO
  fomoBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
    backgroundColor: 'rgba(59,255,122,0.06)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(59,255,122,0.15)',
    padding: 10,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.card,
  },
  fomoTextBlock: { flex: 1, gap: 4 },
  fomoText: {
    color: colors.txt2,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  fomoNames: {
    color: colors.txt,
    fontFamily: fonts.semibold,
  },
  fomoBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,90,60,0.12)',
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  fomoBadgeText: {
    color: colors.primary,
    fontFamily: fonts.semibold,
    fontSize: 11,
  },

  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginBottom: 12,
  },

  // Vote buttons
  voteRow: {
    flexDirection: 'row',
    gap: 8,
  },
  voteBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  voteBtnYes: {
    flex: 2,
    backgroundColor: colors.primaryGlow,
    borderColor: colors.primary,
  },
  voteBtnMaybe: {
    backgroundColor: 'transparent',
    borderColor: colors.divider,
  },
  voteBtnNo: {
    backgroundColor: 'transparent',
    borderColor: colors.divider,
  },
  votedYes: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  votedMaybe: {
    borderColor: colors.yellow,
    backgroundColor: 'rgba(255,217,61,0.12)',
  },
  votedNo: {
    borderColor: colors.no,
    backgroundColor: 'rgba(255,77,77,0.12)',
  },
  voteBtnText: {
    color: colors.txt,
    fontFamily: fonts.semibold,
    fontSize: 13,
  },
  voteBtnYesText: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 14,
    letterSpacing: 0.5,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: {
    color: colors.txt,
    fontFamily: fonts.bold,
    fontSize: 22,
  },
  emptySub: {
    color: colors.txt2,
    fontFamily: fonts.regular,
    fontSize: 14,
    textAlign: 'center',
  },

  // Already responded
  respondedCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.divider,
    overflow: 'hidden',
  },
  respondedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  respondedLeft: { flex: 1, marginRight: 12 },
  respondedTitle: {
    color: colors.txt,
    fontFamily: fonts.semibold,
    fontSize: 15,
  },
  respondedDate: {
    color: colors.txt2,
    fontFamily: fonts.regular,
    fontSize: 12,
    marginTop: 2,
  },
  respondedStatus: {
    fontFamily: fonts.semibold,
    fontSize: 13,
  },
  rowDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginLeft: 16,
  },
})
