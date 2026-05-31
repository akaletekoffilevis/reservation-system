import { View, Text, StyleSheet } from 'react-native';

export default function EmptyState({ message = 'Aucune donnée' }) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📭</Text>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  icon: { fontSize: 40, marginBottom: 12 },
  text: { fontSize: 16, color: '#999', textAlign: 'center' },
});