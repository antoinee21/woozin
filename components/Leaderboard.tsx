import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Share } from 'react-native'
import { colors, fonts, radius } from '../constants/theme'
import { Avatar } from './atoms'

type LeaderboardTab = 'reliable' | 'ghost' | 'hot'

interface LeaderEntry {
  rank: number
  name: string
  avatar?: string
  stat: string
  statLabel: string
  badgeEmoji: string
  badgeTitle: string
  taunt: string
}

const MOCK_LEADERS: Record<LeaderboardTab, LeaderEntry[]> = {
  reliable: [
    {
      rank: 1,
      name: 'Emma',
      stat: '94%',
      statLabel: 'de présence',
      badgeEmoji: '🏆',
      badgeTitle: 'La Béton',
      taunt: 'Dit oui et elle vient. Concept révolutionnaire.',
    },
    {
      rank: 2,
      name: 'Lucas',
      stat: '87%',
      statLabel: 'de présence',
      badgeEmoji: '🥈',
      badgeTitle: 'Presque parfait',
      taunt: 'Fiable mais humain.',
    },
    {
      rank: 3,
      name: 'Sarah',
      stat: '81%',
      statLabel: 'de présence',
      badgeEmoji: '🥉',
      badgeTitle: 'Sur le podium',
      taunt: 'On peut compter sur elle. Généralement.',
    },
  ],
  ghost: [
    {
      rank: 1,
      name: 'Jules',
      stat: '7',
      statLabel: 'annulations',
      badgeEmoji: '👻',
      badgeTitle: 'Le Fantôme Suprême',
      taunt: 'Expert en disparitions de dernière minute. Un talent rare.',
    },
    {
      rank: 2,
      name: 'Maxime',
      stat: '5',
      statLabel: 'annulations',
      badgeEmoji: '💨',
      badgeTitle: 'Faux plans',
      taunt: 'Il confirme, puis s\'évapore.',
    },
    {
      rank: 3,
      name: 'Théo',
      stat: '4',
      statLabel: 'annulations',
      badgeEmoji: '🌫',
      badgeTitle: 'Brouillard',
      taunt: 'Présence aléatoire.',
    },
  ],
  hot: [
    {
      rank: 1,
      name: 'Lucas',
      stat: '89%',
      statLabel: 'de oui',
      badgeEmoji: '🔥',
      badgeTitle: 'Toujours chaud',
      taunt: 'Dit oui avant même de lire l\'event.',
    },
    {
      rank: 2,
      name: 'Léa',
      stat: '82%',
      statLabel: 'de oui',
      badgeEmoji: '⚡',
      badgeTitle: 'Allumée',
      taunt: 'Jamais un non, rarement un peut-être.',
    },
    {
      rank: 3,
      name: 'Nina',
      stat: '76%',
      statLabel: 'de oui',
      badgeEmoji: '🌶',
      badgeTitle: 'Hot streak',
      taunt: 'Présente à tout, partout, tout le temps.',
    },
  ],
}

const TAB_CONFIG: Array<{ id: LeaderboardTab; label: string; emoji: string }> = [
  { id: 'reliable', label: 'Fiables', emoji: '🏆' },
  { id: 'ghost', label: 'Faux plans', emoji: '👻' },
  { id: 'hot', label: 'Chauds', emoji: '🔥' },
]

function PodiumCard({ entry }: { entry: LeaderEntry }) {
  const handleShare = () => {
    Share.share({
      message: `Selon Woozin, ${entry.name} est officiellement ${entry.badgeEmoji} ${entry.badgeTitle}. On confirme. 💀`,
    })
  }

  return (
    <View style={styles.podiumCard}>
      <View style={styles.podiumTop}>
        <Text style={styles.crownEmoji}>{entry.badgeEmoji}</Text>
        <Avatar name={entry.name} size={52} />
        <Text style={styles.podiumName}>{entry.name}</Text>
        <Text style={styles.podiumBadge}>{entry.badgeTitle}</Text>
      </View>

      <View style={styles.podiumStat}>
        <Text style={styles.podiumStatValue}>{entry.stat}</Text>
        <Text style={styles.podiumStatLabel}>{entry.statLabel}</Text>
      </View>

      <Text style={styles.podiumTaunt}>"{entry.taunt}"</Text>

      <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.8}>
        <Text style={styles.shareBtnText}>Partager le classement 🔗</Text>
      </TouchableOpacity>
    </View>
  )
}

function RunnerUp({ entry }: { entry: LeaderEntry }) {
  return (
    <View style={styles.runnerRow}>
      <Text style={styles.runnerRank}>{entry.badgeEmoji}</Text>
      <Avatar name={entry.name} size={32} />
      <Text style={styles.runnerName}>{entry.name}</Text>
      <Text style={styles.runnerStat}>{entry.stat}</Text>
    </View>
  )
}

export function Leaderboard() {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('reliable')
  const leaders = MOCK_LEADERS[activeTab]

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Classement de bande</Text>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TAB_CONFIG.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            onPress={() => setActiveTab(tab.id)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
              {tab.emoji} {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Podium #1 */}
      <PodiumCard entry={leaders[0]} />

      {/* Runners up */}
      <View style={styles.runnersContainer}>
        {leaders.slice(1).map((entry) => (
          <RunnerUp key={entry.rank} entry={entry} />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
    paddingBottom: 32,
  },
  sectionTitle: {
    color: colors.txt,
    fontFamily: fonts.bold,
    fontSize: 20,
    marginBottom: 14,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.divider,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.primaryGlow,
    borderColor: colors.primary,
  },
  tabText: {
    color: colors.txt2,
    fontFamily: fonts.body,
    fontSize: 12,
  },
  tabTextActive: {
    color: colors.primary,
  },
  podiumCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.divider,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  podiumTop: {
    alignItems: 'center',
    gap: 6,
  },
  crownEmoji: {
    fontSize: 28,
  },
  podiumName: {
    color: colors.txt,
    fontFamily: fonts.bold,
    fontSize: 18,
  },
  podiumBadge: {
    color: colors.primary,
    fontFamily: fonts.semibold,
    fontSize: 13,
  },
  podiumStat: {
    alignItems: 'center',
    marginVertical: 4,
  },
  podiumStatValue: {
    color: colors.primary,
    fontFamily: fonts.display,
    fontSize: 36,
  },
  podiumStatLabel: {
    color: colors.txt2,
    fontFamily: fonts.regular,
    fontSize: 13,
  },
  podiumTaunt: {
    color: colors.txt2,
    fontFamily: fonts.regular,
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  shareBtn: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  shareBtnText: {
    color: colors.txt2,
    fontFamily: fonts.body,
    fontSize: 13,
  },
  runnersContainer: {
    marginTop: 10,
    gap: 8,
  },
  runnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 12,
    gap: 10,
  },
  runnerRank: {
    fontSize: 18,
    width: 28,
    textAlign: 'center',
  },
  runnerName: {
    flex: 1,
    color: colors.txt,
    fontFamily: fonts.body,
    fontSize: 14,
  },
  runnerStat: {
    color: colors.txt2,
    fontFamily: fonts.semibold,
    fontSize: 14,
  },
})
