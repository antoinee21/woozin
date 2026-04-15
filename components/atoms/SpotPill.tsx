import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors, radius, fonts } from '../../constants/theme'

interface SpotPillProps {
  confirmed: number
  max: number | null
  waitlistCount?: number
}

function getSpotColor(confirmed: number, max: number | null): string {
  if (max === null) return colors.yes
  if (confirmed >= max) return colors.no
  const remaining = max - confirmed
  const ratio = remaining / max
  if (ratio > 0.5) return colors.yes
  if (ratio > 0.2) return colors.primary
  return colors.no
}

export function SpotPill({ confirmed, max, waitlistCount = 0 }: SpotPillProps) {
  if (max !== null && confirmed >= max) {
    return (
      <View style={[styles.pill, { backgroundColor: 'rgba(255, 77, 77, 0.15)', borderColor: colors.no }]}>
        <Text style={[styles.text, { color: colors.no }]}>
          Complet{waitlistCount > 0 ? ` · Waitlist (${waitlistCount})` : ''}
        </Text>
      </View>
    )
  }

  const remaining = max !== null ? max - confirmed : null
  const color = getSpotColor(confirmed, max)

  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: `${color}22`, borderColor: `${color}66` },
      ]}
    >
      <Text style={[styles.text, { color }]}>
        {remaining !== null ? `${remaining} place${remaining > 1 ? 's' : ''}` : '∞ places'}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  text: {
    fontSize: 12,
    fontFamily: fonts.semibold,
  },
})
