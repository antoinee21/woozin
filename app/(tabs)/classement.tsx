import { SafeAreaView, StyleSheet } from 'react-native'
import { colors } from '../../constants/theme'
import { Leaderboard } from '../../components/Leaderboard'

export default function ClassementScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <Leaderboard />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
})
