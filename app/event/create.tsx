import React, { useState, useRef, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
  PanResponder,
  LayoutChangeEvent,
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { colors, fonts, radius } from '../../constants/theme'
import { Avatar } from '../../components/atoms'
import { MOCK_FRIENDS } from '../../mock/events'

// ─── Section wrapper ─────────────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      {children}
    </View>
  )
}

// ─── Custom Slider ────────────────────────────────────────────────────────────

interface SliderProps {
  value: number
  min?: number
  max?: number
  onChange: (v: number) => void
}

function CustomSlider({ value, min = 2, max = 50, onChange }: SliderProps) {
  const trackWidth = useRef(0)

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const x = e.nativeEvent.locationX
        const pct = Math.max(0, Math.min(1, x / trackWidth.current))
        const newVal = Math.round(min + pct * (max - min))
        onChange(newVal)
      },
      onPanResponderMove: (e) => {
        const x = e.nativeEvent.locationX
        const pct = Math.max(0, Math.min(1, x / trackWidth.current))
        const newVal = Math.round(min + pct * (max - min))
        onChange(newVal)
      },
    }),
  ).current

  const onLayout = (e: LayoutChangeEvent) => {
    trackWidth.current = e.nativeEvent.layout.width
  }

  const pct = (value - min) / (max - min)

  return (
    <View style={styles.sliderContainer}>
      <Text style={styles.sliderValue}>{value}</Text>

      <View
        style={styles.sliderTrack}
        onLayout={onLayout}
        {...panResponder.panHandlers}
      >
        <View style={[styles.sliderFill, { width: `${pct * 100}%` }]} />
        <View style={[styles.sliderThumb, { left: `${pct * 100}%` }]} />
      </View>

      <View style={styles.sliderMinMax}>
        <Text style={styles.sliderMinMaxText}>{min}</Text>
        <Text style={styles.sliderMinMaxText}>{max}</Text>
      </View>
    </View>
  )
}

// ─── Deadline shortcuts ───────────────────────────────────────────────────────

const DEADLINE_SHORTCUTS = [
  { label: '2h', hours: 2 },
  { label: '6h', hours: 6 },
  { label: '24h', hours: 24 },
  { label: '48h', hours: 48 },
]

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function CreateEventScreen() {
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [date, setDate] = useState(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000))
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [spots, setSpots] = useState(10)
  const [unlimited, setUnlimited] = useState(false)
  const [deadlineHours, setDeadlineHours] = useState<number | null>(24)
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set())
  const [friendSearch, setFriendSearch] = useState('')

  const allSelected = selectedFriends.size === MOCK_FRIENDS.length

  const filteredFriends = MOCK_FRIENDS.filter((f) =>
    f.name.toLowerCase().includes(friendSearch.toLowerCase()),
  )

  const toggleFriend = useCallback(
    async (id: string) => {
      await Haptics.selectionAsync()
      setSelectedFriends((prev) => {
        const next = new Set(prev)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return next
      })
    },
    [],
  )

  const toggleAll = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    if (allSelected) {
      setSelectedFriends(new Set())
    } else {
      setSelectedFriends(new Set(MOCK_FRIENDS.map((f) => f.id)))
    }
  }, [allSelected])

  const canSubmit = title.trim().length > 0

  const handleCreate = useCallback(async () => {
    if (!canSubmit) return
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    // TODO: write to Firestore
    router.back()
  }, [canSubmit, router])

  const deadlineDate =
    deadlineHours !== null
      ? new Date(date.getTime() - deadlineHours * 60 * 60 * 1000)
      : null

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nouvel event</Text>
        </View>

        {/* Title */}
        <Section label="Titre">
          <TextInput
            style={styles.titleInput}
            placeholder="Soirée, foot, ciné…"
            placeholderTextColor={colors.txt2}
            value={title}
            onChangeText={setTitle}
            autoFocus
            selectionColor={colors.primary}
          />
        </Section>

        {/* Date & time */}
        <Section label="Date & heure">
          <View style={styles.dateRow}>
            <TouchableOpacity
              style={styles.datePill}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.datePillText}>
                📅{' '}
                {date.toLocaleDateString('fr-FR', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                })}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.datePill}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.datePillText}>
                🕐{' '}
                {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              minimumDate={new Date()}
              themeVariant="dark"
              onChange={(_, selected) => {
                setShowDatePicker(Platform.OS === 'ios')
                if (selected) {
                  setDate((prev) => {
                    const d = new Date(selected)
                    d.setHours(prev.getHours(), prev.getMinutes())
                    return d
                  })
                }
              }}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={date}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              themeVariant="dark"
              onChange={(_, selected) => {
                setShowTimePicker(Platform.OS === 'ios')
                if (selected) {
                  setDate((prev) => {
                    const d = new Date(prev)
                    d.setHours(selected.getHours(), selected.getMinutes())
                    return d
                  })
                }
              }}
            />
          )}
        </Section>

        {/* Spots */}
        <Section label="Places max">
          <View style={styles.spotsHeader}>
            <Text style={styles.unlimitedLabel}>Illimité ∞</Text>
            <TouchableOpacity
              style={[styles.toggle, unlimited && styles.toggleActive]}
              onPress={async () => {
                await Haptics.selectionAsync()
                setUnlimited((v) => !v)
              }}
            >
              <View style={[styles.toggleThumb, unlimited && styles.toggleThumbActive]} />
            </TouchableOpacity>
          </View>

          {!unlimited && (
            <CustomSlider value={spots} min={2} max={50} onChange={setSpots} />
          )}
        </Section>

        {/* Deadline */}
        <Section label="Deadline de réponse">
          <View style={styles.shortcutsRow}>
            {DEADLINE_SHORTCUTS.map((s) => (
              <TouchableOpacity
                key={s.hours}
                style={[
                  styles.shortcutPill,
                  deadlineHours === s.hours && styles.shortcutPillActive,
                ]}
                onPress={async () => {
                  await Haptics.selectionAsync()
                  setDeadlineHours(s.hours)
                }}
              >
                <Text
                  style={[
                    styles.shortcutText,
                    deadlineHours === s.hours && styles.shortcutTextActive,
                  ]}
                >
                  {s.label} avant
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {deadlineDate && (
            <Text style={styles.deadlineInfo}>
              Clôture :{' '}
              {deadlineDate.toLocaleDateString('fr-FR', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          )}
        </Section>

        {/* Friends */}
        <Section label={`Inviter (${selectedFriends.size}/${MOCK_FRIENDS.length})`}>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un ami…"
            placeholderTextColor={colors.txt2}
            value={friendSearch}
            onChangeText={setFriendSearch}
            selectionColor={colors.primary}
          />

          <TouchableOpacity
            style={[styles.selectAllBtn, allSelected && styles.selectAllBtnActive]}
            onPress={toggleAll}
          >
            <Text
              style={[styles.selectAllText, allSelected && styles.selectAllTextActive]}
            >
              {allSelected ? 'Tout désélectionner' : 'Tous inviter'}
            </Text>
          </TouchableOpacity>

          <View style={styles.friendList}>
            {filteredFriends.map((friend) => {
              const selected = selectedFriends.has(friend.id)
              return (
                <TouchableOpacity
                  key={friend.id}
                  style={[styles.friendRow, selected && styles.friendRowSelected]}
                  onPress={() => toggleFriend(friend.id)}
                  activeOpacity={0.7}
                >
                  <Avatar name={friend.name} size={36} />
                  <Text style={styles.friendName}>{friend.name}</Text>
                  <View
                    style={[styles.checkbox, selected && styles.checkboxSelected]}
                  >
                    {selected && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>
        </Section>
      </ScrollView>

      {/* CTA */}
      <View style={styles.ctaWrapper}>
        <TouchableOpacity
          style={[styles.ctaButton, !canSubmit && styles.ctaDisabled]}
          onPress={handleCreate}
          disabled={!canSubmit}
          activeOpacity={0.85}
        >
          <Text style={[styles.ctaText, !canSubmit && styles.ctaTextDisabled]}>
            Créer l'event →
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 110, gap: 4 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
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
  headerTitle: {
    color: colors.txt,
    fontFamily: fonts.display,
    fontSize: 22,
  },

  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    color: colors.txt2,
    fontFamily: fonts.semibold,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },

  // Title input
  titleInput: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.divider,
    color: colors.txt,
    fontFamily: fonts.bold,
    fontSize: 18,
    padding: 14,
  },

  // Date
  dateRow: { flexDirection: 'row', gap: 10 },
  datePill: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.divider,
    padding: 12,
    alignItems: 'center',
  },
  datePillText: { color: colors.txt, fontFamily: fonts.body, fontSize: 14 },

  // Spots
  spotsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  unlimitedLabel: { color: colors.txt, fontFamily: fonts.body, fontSize: 14 },
  toggle: {
    width: 44,
    height: 26,
    borderRadius: radius.pill,
    backgroundColor: colors.divider,
    justifyContent: 'center',
    padding: 3,
  },
  toggleActive: { backgroundColor: colors.primary },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: radius.pill,
    backgroundColor: colors.txt2,
  },
  toggleThumbActive: {
    backgroundColor: colors.txt,
    transform: [{ translateX: 18 }],
  },

  // Slider
  sliderContainer: { gap: 8 },
  sliderValue: {
    color: colors.primary,
    fontFamily: fonts.display,
    fontSize: 40,
    textAlign: 'center',
  },
  sliderTrack: {
    height: 6,
    backgroundColor: colors.divider,
    borderRadius: radius.pill,
    justifyContent: 'center',
  },
  sliderFill: {
    height: 6,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
  },
  sliderThumb: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    backgroundColor: colors.txt,
    borderWidth: 3,
    borderColor: colors.primary,
    marginLeft: -11,
    top: -8,
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  sliderMinMax: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sliderMinMaxText: { color: colors.txt2, fontFamily: fonts.regular, fontSize: 12 },

  // Deadline
  shortcutsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  shortcutPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.card,
  },
  shortcutPillActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryGlow,
  },
  shortcutText: { color: colors.txt2, fontFamily: fonts.body, fontSize: 13 },
  shortcutTextActive: { color: colors.primary },
  deadlineInfo: {
    color: colors.txt2,
    fontFamily: fonts.regular,
    fontSize: 12,
    marginTop: 10,
    textTransform: 'capitalize',
  },

  // Friends
  searchInput: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.divider,
    color: colors.txt,
    fontFamily: fonts.body,
    fontSize: 14,
    padding: 12,
    marginBottom: 10,
  },
  selectAllBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.divider,
    marginBottom: 12,
  },
  selectAllBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryGlow,
  },
  selectAllText: { color: colors.txt2, fontFamily: fonts.body, fontSize: 13 },
  selectAllTextActive: { color: colors.primary },
  friendList: { gap: 4 },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: radius.md,
    gap: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  friendRowSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryGlow,
  },
  friendName: { flex: 1, color: colors.txt, fontFamily: fonts.body, fontSize: 14 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: { color: colors.txt, fontSize: 13, fontFamily: fonts.bold },

  // CTA
  ctaWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 28,
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
  ctaDisabled: {
    backgroundColor: colors.divider,
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaText: { color: colors.txt, fontFamily: fonts.bold, fontSize: 17, letterSpacing: 0.3 },
  ctaTextDisabled: { color: colors.txt2 },
})
