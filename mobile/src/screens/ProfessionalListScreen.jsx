import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import api from '../services/api';

export default function ProfessionalListScreen({ route, navigation }) {
  const [professionals, setProfessionals] = useState([]);
  const [search, setSearch] = useState(route.params?.search || '');

  useEffect(() => {
    api.get(`/professionals?search=${search}`).then(({ data }) => setProfessionals(data));
  }, [search]);

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} placeholder="Rechercher..." value={search} onChangeText={setSearch} />
      <FlatList
        data={professionals}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Professional', { slug: item.slug })}>
            <Text style={styles.name}>{item.businessName}</Text>
            {item.city && <Text style={styles.city}>{item.city}</Text>}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9fafb' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 16 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 8 },
  name: { fontSize: 16, fontWeight: '600' },
  city: { fontSize: 14, color: '#666', marginTop: 4 },
});
