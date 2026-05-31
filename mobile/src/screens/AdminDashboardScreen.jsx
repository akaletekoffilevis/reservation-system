import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import api from '../services/api';
import Loading from '../components/Loading';

export default function AdminDashboardScreen() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/dashboard');
      setStats(data);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Loading />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}>
      <Text style={styles.title}>Tableau de bord</Text>
      {stats && (
        <View style={styles.grid}>
          <StatCard label="Professionnels" value={stats.totalProfessionals || 0} color="#2563eb" />
          <StatCard label="Rendez-vous" value={stats.totalAppointments || 0} color="#059669" />
          <StatCard label="Avis en attente" value={stats.pendingReviews || 0} color="#d97706" />
          <StatCard label="Clients" value={stats.totalClients || 0} color="#7c3aed" />
        </View>
      )}
    </ScrollView>
  );
}

function StatCard({ label, value, color }) {
  return (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '47%', borderLeftWidth: 4 },
  value: { fontSize: 32, fontWeight: 'bold' },
  label: { fontSize: 14, color: '#666', marginTop: 4 },
});