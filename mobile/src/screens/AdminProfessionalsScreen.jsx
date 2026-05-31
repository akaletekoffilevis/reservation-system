import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import api from '../services/api';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';

export default function AdminProfessionalsScreen() {
  const [pros, setPros] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/professionals');
      setPros(data || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = async (id) => {
    try {
      await api.put(`/admin/professionals/${id}/toggle`);
      load();
    } catch { Alert.alert('Erreur', 'Action impossible'); }
  };

  if (loading) return <Loading />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Professionnels</Text>
      {pros.length === 0 ? <EmptyState message="Aucun professionnel" /> : (
        <FlatList
          data={pros}
          keyExtractor={(i) => String(i.id)}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.header}>
                <Text style={styles.name}>{item.businessName}</Text>
                <Badge variant={item.isActive ? 'Active' : 'Inactive'} label={item.isActive ? 'Actif' : 'Inactif'} />
              </View>
              <Text style={styles.info}>{item.email}</Text>
              <Text style={styles.info}>{item.city} — {item.services?.length || 0} service(s)</Text>
              <TouchableOpacity style={item.isActive ? styles.disableBtn : styles.enableBtn} onPress={() => toggle(item.id)}>
                <Text style={[styles.btnText, { color: item.isActive ? '#dc2626' : '#2563eb' }]}>
                  {item.isActive ? 'Désactiver' : 'Activer'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9fafb' },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  name: { fontSize: 16, fontWeight: '600' },
  info: { fontSize: 13, color: '#666', marginTop: 2 },
  disableBtn: { marginTop: 10, borderWidth: 1, borderColor: '#fca5a5', padding: 10, borderRadius: 10, alignItems: 'center' },
  enableBtn: { marginTop: 10, borderWidth: 1, borderColor: '#93c5fd', padding: 10, borderRadius: 10, alignItems: 'center' },
  btnText: { fontWeight: '600', fontSize: 14 },
});