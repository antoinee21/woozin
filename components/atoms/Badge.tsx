import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors, radius, fonts } from '../../constants/theme'

type BadgeVariant = 'primary' | 'hot' | 'full' | 'new' | 'waitlist' | 'custom'

interface BadgeProps {
  label: string
  variant?: BadgeVariant
  emoji?: string
  bgColor?: string
  textColor?: string
}

const variantStyles: Record<
  BadgeVariant,
  { bg: string; text: string; border?: string }
> = {
  primary: { bg: colors.primaryGlow, text: colors.primary },
  hot: { bg: 'rgba(255, 90, 60, 0.15)', text: colors.primary, border: 'rgba(255, 90, 60, 0.4)' },
  full: { bg: 'rgba(255, 77, 77, 0.15)', text: colors.no, border: 'rgba(255, 77, 77, 0.4)' },
  new: { bg: 'rgba(162, 155, 254, 0.15)', text: colors.waitlist, border: 'rgba(162, 155, 254, 0.3)' },
  waitlist: { bg: 'rgba(162, 155, 254, 0.15)', text: colors.waitlist },
  custom: { bg: 'transparent', text: colors.txt },
}

export function Badge({ label, variant = 'primary', emoji, bgColor, textColor }: BadgeProps) {
  const style = variantStyles[variant]
  const bg = bgColor ?? style.bg
  const text = textColor ?? style.text
  const border = (style as { border?: string }).border

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: bg },
        border ? { borderWidth: 1, borderColor: border } : undefined,
      ]}
    >
      {emoji ? (
        <Text style={styles.emoji}>{emoji}</Text>
      ) : null}
      <Text style={[styles.label, { color: text }]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    gap: 3,
  },
  emoji: {
    fontSize: 11,
  },
  label: {
    fontSize: 11,
    fontFamily: fonts.semibold,
    letterSpacing: 0.2,
  },
})
