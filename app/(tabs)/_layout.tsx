import { Tabs } from 'expo-router'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, fonts, radius } from '../../constants/theme'

interface TabIconProps {
  name: React.ComponentProps<typeof Ionicons>['name']
  focused: boolean
  badge?: number
}

function TabIcon({ name, focused, badge }: TabIconProps) {
  return (
    <View style={styles.iconWrapper}>
      <Ionicons
        name={name}
        size={24}
        color={focused ? colors.primary : colors.txt2}
      />
      {badge !== undefined && badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
        </View>
      )}
    </View>
  )
}

import { MOCK_EVENTS } from '../../mock/events'

const PENDING_INVITATIONS = MOCK_EVENTS.filter(e => e.userStatus === 'pending').length

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.txt2,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Events',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'flash' : 'flash-outline'} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="invitations"
        options={{
          title: 'Invitations',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? 'mail' : 'mail-outline'}
              focused={focused}
              badge={PENDING_INVITATIONS}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? 'person-circle' : 'person-circle-outline'}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.divider,
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 8,
    paddingTop: 6,
  },
  tabLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
  },
  iconWrapper: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  badgeText: {
    color: colors.txt,
    fontSize: 9,
    fontFamily: fonts.semibold,
  },
})
