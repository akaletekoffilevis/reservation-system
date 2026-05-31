import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, RefreshControl } from 'react-native';
import api from '../services/api';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';

export default function AppointmentsScreen() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/pro/appointments');
      setAppointments(data);
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de charger les rendez-vous');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleConfirm = async (id) => {
    try {
      await api.put(`/pro/appointments/${id}/confirm`);
      load();
    } catch { Alert.alert('Erreur', 'Action impossible'); }
  };

  const handleCancel = async (id) => {
    try {
      await api.put(`/pro/appointments/${id}/cancel`, { reason: 'Annulé' });
      load();
    } catch { Alert.alert('Erreur', 'Action impossible'); }
  };

  if (loading) return <Loading />;

  return (
    <View style={styles.container}>
      {appointments.length === 0 ? <EmptyState message="Aucun rendez-vous" /> : (
        <FlatList
          data={appointments}
          keyExtractor={(i) => String(i.id)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.header}>
                <Text style={styles.client}>{item.clientName}</Text>
                <Badge variant={item.status} />
              </View>
              <Text style={styles.info}>{item.serviceName}</Text>
              <Text style={styles.info}>{new Date(item.startUtc).toLocaleString('fr-FR')}</Text>
              <Text style={styles.info}>{item.clientEmail}</Text>
              {item.clientPhone && <Text style={styles.info}>{item.clientPhone}</Text>}
              {item.status === 'Pending' && (
                <View style={styles.actions}>
                  <TouchableOpacity style={styles.confirmBtn} onPress={() => handleConfirm(item.id)}>
                    <Text style={styles.btnText}>Confirmer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancel(item.id)}>
                    <Text style={[styles.btnText, { color: '#dc2626' }]}>Annuler</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9fafb' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  client: { fontSize: 16, fontWeight: '600' },
  info: { fontSize: 13, color: '#666', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  confirmBtn: { flex: 1, backgroundColor: '#2563eb', padding: 12, borderRadius: 10, alignItems: 'center' },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: '#fca5a5', padding: 12, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});