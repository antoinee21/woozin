import React from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'
import { colors, radius, fonts } from '../../constants/theme'

interface AvatarProps {
  uri?: string
  name?: string
  size?: number
  statusColor?: string
}

export function Avatar({ uri, name, size = 36, statusColor }: AvatarProps) {
  const initials = name
    ? name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?'

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={[styles.image, { width: size, height: size, borderRadius: radius.sm }]}
        />
      ) : (
        <View
          style={[
            styles.fallback,
            { width: size, height: size, borderRadius: radius.sm },
          ]}
        >
          <Text style={[styles.initials, { fontSize: size * 0.36 }]}>{initials}</Text>
        </View>
      )}
      {statusColor && (
        <View
          style={[
            styles.statusDot,
            { backgroundColor: statusColor, width: size * 0.28, height: size * 0.28 },
          ]}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  image: {
    resizeMode: 'cover',
  },
  fallback: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: colors.txt2,
    fontFamily: fonts.semibold,
  },
  statusDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.card,
  },
})
