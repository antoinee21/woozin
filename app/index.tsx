import { View, Text, StyleSheet } from 'react-native'
import { colors, fonts } from '../constants/theme'

// Placeholder — will be replaced by (tabs)/index.tsx in step 5+
export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>woozin</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    color: colors.primary,
    fontFamily: fonts.display,
    fontSize: 42,
  },
})
