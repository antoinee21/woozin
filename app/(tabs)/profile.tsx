import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Share,
} from 'react-native'
import { colors, fonts, radius } from '../../constants/theme'
import { Avatar } from '../../components/atoms'
import { MOCK_EVENTS } from '../../mock/events'

// ─── Mock current user ────────────────────────────────────────────────────────

const ME = {
  id: 'me',
  name: 'Antoine',
  handle: '@antoine',
  joinedDate: 'Janvier 2024',
}

// ─── Stats derived from mock events ──────────────────────────────────────────

function buildStats() {
  const all = MOCK_EVENTS
  const yes    = all.filter(e => e.userStatus === 'yes').length
  const maybe  = all.filter(e => e.userStatus === 'maybe').length
  const no     = all.filter(e => e.userStatus === 'no').length
  const past   = all.filter(e => e.date < new Date())
  const coming = all.filter(e => e.date >= new Date() && e.userStatus === 'yes').length
  const reliability = past.length > 0
    ? Math.round((past.filter(e => e.userStatus === 'yes').length / past.length) * 100)
    : 100
  return { yes, maybe, no, coming, reliability, total: all.length }
}

// ─── Stat tile ────────────────────────────────────────────────────────────────

function StatTile({ value, label, color }: { value: string | number; label: string; color?: string }) {
  return (
    <View style={styles.statTile}>
      <Text style={[styles.statValue, color ? { color } : {}]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

// ─── Badge ────────────────────────────────────────────────────────────────────

const BADGES = [
  { id: 'fiable',   emoji: '🏆', label: 'Fiable',       desc: '+90% de présence',         unlocked: true },
  { id: 'social',   emoji: '🎉', label: 'Social',        desc: '10+ events rejoints',       unlocked: true },
  { id: 'early',    emoji: '⚡', label: 'Early Bird',    desc: 'Répond en moins d\'1h',     unlocked: true },
  { id: 'creator',  emoji: '✨', label: 'Organisateur',  desc: '3+ events créés',           unlocked: false },
  { id: 'streak',   emoji: '🔥', label: 'En feu',        desc: '5 events d\'affilée',       unlocked: false },
  { id: 'night',    emoji: '🌙', label: 'Noctambule',    desc: '5 events le soir',          unlocked: false },
]

function BadgeItem({ badge }: { badge: typeof BADGES[0] }) {
  return (
    <View style={[styles.badgeItem, !badge.unlocked && styles.badgeLocked]}>
      <Text style={[styles.badgeEmoji, !badge.unlocked && styles.badgeEmojiLocked]}>
        {badge.emoji}
      </Text>
      <Text style={[styles.badgeLabel, !badge.unlocked && styles.badgeTextLocked]}>
        {badge.label}
      </Text>
      <Text style={[styles.badgeDesc, !badge.unlocked && styles.badgeTextLocked]} numberOfLines={2}>
        {badge.desc}
      </Text>
    </View>
  )
}

// ─── Recent event row ─────────────────────────────────────────────────────────

function RecentRow({ event }: { event: (typeof MOCK_EVENTS)[0] }) {
  const isPast = event.date < new Date()
  const statusColor: Record<string, string> = {
    yes: colors.yes, maybe: colors.yellow, no: colors.no, waitlist: colors.waitlist, pending: colors.txt2,
  }
  const statusLabel: Record<string, string> = {
    yes: '✓', maybe: '~', no: '✕', waitlist: '⏳', pending: '?',
  }
  const s = event.userStatus as string
  return (
    <View style={styles.recentRow}>
      <View style={[styles.recentDot, { backgroundColor: statusColor[s] ?? colors.txt2 }]} />
      <View style={styles.recentInfo}>
        <Text style={[styles.recentTitle, isPast && { color: colors.txt2 }]} numberOfLines={1}>
          {event.title}
        </Text>
        <Text style={styles.recentDate}>
          {event.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
          {isPast ? ' · passé' : ''}
        </Text>
      </View>
      <Text style={[styles.recentStatus, { color: statusColor[s] ?? colors.txt2 }]}>
        {statusLabel[s] ?? '?'}
      </Text>
    </View>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const stats = buildStats()
  const [showAll, setShowAll] = useState(false)

  const sortedEvents = [...MOCK_EVENTS].sort((a, b) => b.date.getTime() - a.date.getTime())
  const visibleEvents = showAll ? sortedEvents : sortedEvents.slice(0, 4)

  async function handleShare() {
    try {
      await Share.share({
        message: `${ME.name} sur Woozin · ${stats.reliability}% de fiabilité · ${stats.yes} events rejoints 🎉`,
      })
    } catch (_) {}
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ── */}
        <View style={styles.hero}>
          <Avatar name={ME.name} size={72} fontSize={28} />
          <View style={styles.heroInfo}>
            <Text style={styles.heroName}>{ME.name}</Text>
            <Text style={styles.heroHandle}>{ME.handle}</Text>
            <Text style={styles.heroJoined}>Membre depuis {ME.joinedDate}</Text>
          </View>
        </View>

        {/* ── Reliability ring ── */}
        <View style={styles.reliabilityCard}>
          <View style={styles.reliabilityLeft}>
            <Text style={styles.reliabilityScore}>{stats.reliability}%</Text>
            <Text style={styles.reliabilityLabel}>de fiabilité</Text>
            <Text style={styles.reliabilityDesc}>
              {stats.reliability >= 90
                ? '🏆 Tu es une référence'
                : stats.reliability >= 70
                ? '👍 Plutôt fiable'
                : '👀 À améliorer'}
            </Text>
          </View>
          <View style={styles.statsGrid}>
            <StatTile value={stats.yes}     label="oui"       color={colors.yes} />
            <StatTile value={stats.maybe}   label="peut-être" color={colors.yellow} />
            <StatTile value={stats.no}      label="non"       color={colors.no} />
            <StatTile value={stats.coming}  label="à venir"   color={colors.primary} />
          </View>
        </View>

        {/* ── Share button ── */}
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.8}>
          <Text style={styles.shareBtnText}>🔗  Partager mon profil</Text>
        </TouchableOpacity>

        {/* ── Badges ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Badges</Text>
          <View style={styles.badgeGrid}>
            {BADGES.map(b => <BadgeItem key={b.id} badge={b} />)}
          </View>
        </View>

        {/* ── Recent events ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mes events</Text>
          <View style={styles.recentCard}>
            {visibleEvents.map((e, i) => (
              <View key={e.id}>
                <RecentRow event={e} />
                {i < visibleEvents.length - 1 && <View style={styles.rowDivider} />}
              </View>
            ))}
          </View>
          {sortedEvents.length > 4 && (
            <TouchableOpacity onPress={() => setShowAll(v => !v)} style={styles.showMoreBtn}>
              <Text style={styles.showMoreText}>
                {showAll ? 'Voir moins' : `Voir les ${sortedEvents.length - 4} autres`}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Settings stub ── */}
        <View style={styles.section}>
          {[
            { icon: '🔔', label: 'Notifications' },
            { icon: '🔒', label: 'Confidentialité' },
            { icon: '❓', label: 'Aide & feedback' },
            { icon: '🚪', label: 'Se déconnecter', danger: true },
          ].map(item => (
            <TouchableOpacity key={item.label} style={styles.settingsRow} activeOpacity={0.7}>
              <Text style={styles.settingsIcon}>{item.icon}</Text>
              <Text style={[styles.settingsLabel, item.danger && { color: colors.no }]}>
                {item.label}
              </Text>
              <Text style={styles.settingsChevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20 },

  // Hero
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  heroInfo: { flex: 1 },
  heroName: {
    color: colors.txt,
    fontFamily: fonts.bold,
    fontSize: 26,
  },
  heroHandle: {
    color: colors.txt2,
    fontFamily: fonts.regular,
    fontSize: 14,
    marginTop: 2,
  },
  heroJoined: {
    color: colors.txt2,
    fontFamily: fonts.regular,
    fontSize: 12,
    marginTop: 4,
  },

  // Reliability card
  reliabilityCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.divider,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 12,
  },
  reliabilityLeft: { flex: 1 },
  reliabilityScore: {
    color: colors.primary,
    fontFamily: fonts.display,
    fontSize: 42,
    lineHeight: 46,
  },
  reliabilityLabel: {
    color: colors.txt2,
    fontFamily: fonts.regular,
    fontSize: 13,
    marginTop: 2,
  },
  reliabilityDesc: {
    color: colors.txt,
    fontFamily: fonts.semibold,
    fontSize: 13,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    flex: 1,
  },
  statTile: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
    minWidth: 52,
  },
  statValue: {
    color: colors.txt,
    fontFamily: fonts.bold,
    fontSize: 18,
  },
  statLabel: {
    color: colors.txt2,
    fontFamily: fonts.regular,
    fontSize: 10,
    marginTop: 2,
  },

  // Share
  shareBtn: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.divider,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 28,
  },
  shareBtnText: {
    color: colors.txt,
    fontFamily: fonts.semibold,
    fontSize: 14,
  },

  // Section
  section: { marginBottom: 28 },
  sectionTitle: {
    color: colors.txt,
    fontFamily: fonts.bold,
    fontSize: 18,
    marginBottom: 12,
  },

  // Badges
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  badgeItem: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.divider,
    padding: 12,
    width: '30%',
    minWidth: 96,
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  badgeLocked: {
    opacity: 0.4,
  },
  badgeEmoji: { fontSize: 26 },
  badgeEmojiLocked: { opacity: 0.5 },
  badgeLabel: {
    color: colors.txt,
    fontFamily: fonts.semibold,
    fontSize: 12,
    textAlign: 'center',
  },
  badgeDesc: {
    color: colors.txt2,
    fontFamily: fonts.regular,
    fontSize: 10,
    textAlign: 'center',
  },
  badgeTextLocked: { color: colors.txt2 },

  // Recent events
  recentCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.divider,
    overflow: 'hidden',
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  recentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  recentInfo: { flex: 1 },
  recentTitle: {
    color: colors.txt,
    fontFamily: fonts.semibold,
    fontSize: 14,
  },
  recentDate: {
    color: colors.txt2,
    fontFamily: fonts.regular,
    fontSize: 12,
    marginTop: 2,
  },
  recentStatus: {
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  rowDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginLeft: 36,
  },
  showMoreBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  showMoreText: {
    color: colors.primary,
    fontFamily: fonts.semibold,
    fontSize: 14,
  },

  // Settings
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    gap: 14,
  },
  settingsIcon: { fontSize: 18, width: 26, textAlign: 'center' },
  settingsLabel: {
    flex: 1,
    color: colors.txt,
    fontFamily: fonts.semibold,
    fontSize: 15,
  },
  settingsChevron: {
    color: colors.txt2,
    fontFamily: fonts.regular,
    fontSize: 20,
  },
})
