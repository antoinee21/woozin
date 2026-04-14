import { View, Text, StyleSheet, SafeAreaView } from 'react-native'
import { colors, fonts } from '../../constants/theme'

// Full implementation in step 9
export default function InvitationsScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Text style={styles.title}>Invitations</Text>
        <Text style={styles.sub}>Bientôt disponible — étape 9</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  title: { color: colors.txt, fontFamily: fonts.bold, fontSize: 22 },
  sub: { color: colors.txt2, fontFamily: fonts.regular, fontSize: 14 },
})
