import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import api from '../services/api';

export default function ManageBookingScreen({ route }) {
  const { token } = route.params;
  const [appointment, setAppointment] = useState(null);

  const load = async () => {
    try {
      const { data } = await api.get(`/appointments/${token}`);
      setAppointment(data);
    } catch {
      Alert.alert('Erreur', 'Rendez-vous introuvable');
    }
  };

  useEffect(() => { load(); }, [token]);

  const handleCancel = async () => {
    await api.put(`/appointments/${token}/cancel`, { reason: 'Annulé par le client' });
    load();
  };

  if (!appointment) return <View style={styles.center}><Text>Chargement...</Text></View>;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Professionnel</Text>
          <Text style={styles.value}>{appointment.businessName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Service</Text>
          <Text style={styles.value}>{appointment.serviceName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>{new Date(appointment.startUtc).toLocaleString('fr-FR')}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Statut</Text>
          <Text style={[styles.value, appointment.status === 'Cancelled' && { color: '#dc2626' }]}>
            {appointment.status}
          </Text>
        </View>
        {appointment.status !== 'Cancelled' && appointment.status !== 'Completed' && (
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelText}>Annuler ce rendez-vous</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9fafb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  row: { marginBottom: 16 },
  label: { fontSize: 12, color: '#999', marginBottom: 2 },
  value: { fontSize: 16, fontWeight: '500' },
  cancelButton: { borderWidth: 1, borderColor: '#fca5a5', backgroundColor: '#fef2f2', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  cancelText: { color: '#dc2626', fontSize: 14, fontWeight: '500' },
});
