import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function HomeScreen({ navigation }) {
  const [search, setSearch] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Booking</Text>
      <Text style={styles.subtitle}>Réservez vos rendez-vous en ligne</Text>
      <TextInput
        style={styles.input}
        placeholder="Rechercher un professionnel..."
        value={search}
        onChangeText={setSearch}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ProfessionalList', { search })}
      >
        <Text style={styles.buttonText}>Rechercher</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#2563eb', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 24, textAlign: 'center' },
  input: { width: '100%', borderWidth: 1, borderColor: '#ddd', padding: 16, borderRadius: 12, marginBottom: 16, fontSize: 16 },
  button: { backgroundColor: '#2563eb', padding: 16, borderRadius: 12, width: '100%', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
