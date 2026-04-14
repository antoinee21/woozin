import React from 'react'
import { View, StyleSheet } from 'react-native'
import { colors, radius } from '../../constants/theme'

interface ParticipationBarProps {
  yes: number
  maybe: number
  no: number
  height?: number
}

export function ParticipationBar({ yes, maybe, no, height = 6 }: ParticipationBarProps) {
  const total = yes + maybe + no
  if (total === 0) {
    return (
      <View style={[styles.track, { height, borderRadius: radius.pill }]}>
        <View style={[styles.empty, { height }]} />
      </View>
    )
  }

  const yesPct = (yes / total) * 100
  const maybePct = (maybe / total) * 100
  const noPct = (no / total) * 100

  return (
    <View style={[styles.track, { height, borderRadius: radius.pill }]}>
      {yesPct > 0 && (
        <View
          style={[
            styles.segment,
            { width: `${yesPct}%`, backgroundColor: colors.yes, height },
          ]}
        />
      )}
      {maybePct > 0 && (
        <View
          style={[
            styles.segment,
            { width: `${maybePct}%`, backgroundColor: colors.maybe, height },
          ]}
        />
      )}
      {noPct > 0 && (
        <View
          style={[
            styles.segment,
            { width: `${noPct}%`, backgroundColor: colors.divider, height },
          ]}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: colors.divider,
    width: '100%',
  },
  segment: {
    // width set inline
  },
  empty: {
    flex: 1,
    backgroundColor: colors.divider,
  },
})
