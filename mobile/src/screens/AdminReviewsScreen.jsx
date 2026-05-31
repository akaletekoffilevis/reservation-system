import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import api from '../services/api';
import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';

export default function AdminReviewsScreen() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/reviews/pending');
      setReviews(data || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAction = async (id, action) => {
    try {
      await api.post(`/admin/reviews/${id}/${action}`);
      load();
    } catch { Alert.alert('Erreur', 'Action impossible'); }
  };

  if (loading) return <Loading />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Avis en attente</Text>
      {reviews.length === 0 ? <EmptyState message="Aucun avis en attente" /> : (
        <FlatList
          data={reviews}
          keyExtractor={(i) => String(i.id)}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.pro}>{item.professionalName || 'Professionnel'}</Text>
              <Text style={styles.stars}>{'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}</Text>
              {item.comment && <Text style={styles.comment}>{item.comment}</Text>}
              <Text style={styles.client}>— {item.clientName || 'Anonyme'}</Text>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.approveBtn} onPress={() => handleAction(item.id, 'approve')}>
                  <Text style={styles.btnText}>Approuver</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.rejectBtn} onPress={() => handleAction(item.id, 'reject')}>
                  <Text style={[styles.btnText, { color: '#dc2626' }]}>Rejeter</Text>
                </TouchableOpacity>
              </View>
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
  pro: { fontSize: 15, fontWeight: '500', color: '#2563eb', marginBottom: 4 },
  stars: { fontSize: 16, color: '#f59e0b', marginBottom: 8 },
  comment: { fontSize: 14, color: '#333', marginBottom: 4 },
  client: { fontSize: 13, color: '#999', marginBottom: 10 },
  actions: { flexDirection: 'row', gap: 8 },
  approveBtn: { flex: 1, backgroundColor: '#059669', padding: 12, borderRadius: 10, alignItems: 'center' },
  rejectBtn: { flex: 1, borderWidth: 1, borderColor: '#fca5a5', padding: 12, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});