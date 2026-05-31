import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import api from '../services/api';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';

export default function ProReviewsScreen() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/pro/reviews');
      setReviews(data || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Loading />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Avis clients</Text>
      {reviews.length === 0 ? <EmptyState message="Aucun avis pour le moment" /> : (
        reviews.map((r) => (
          <View key={r.id} style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.name}>{r.clientName || 'Anonyme'}</Text>
              <Text style={styles.stars}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</Text>
            </View>
            {r.comment && <Text style={styles.comment}>{r.comment}</Text>}
            <Badge variant={r.isApproved ? 'Approved' : 'Pending'} label={r.isApproved ? 'Approuvé' : 'En attente'} />
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9fafb' },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  name: { fontSize: 15, fontWeight: '500' },
  stars: { fontSize: 16, color: '#f59e0b' },
  comment: { fontSize: 14, color: '#666', marginBottom: 8 },
});