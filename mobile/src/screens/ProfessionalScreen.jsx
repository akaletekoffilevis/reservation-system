import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import api from '../services/api';

export default function ProfessionalScreen({ route, navigation }) {
  const { slug } = route.params;
  const [pro, setPro] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [form, setForm] = useState({ clientName: '', clientEmail: '', clientPhone: '' });

  useEffect(() => {
    api.get(`/professionals/${slug}`).then(({ data }) => setPro(data));
  }, [slug]);

  const handleBook = async () => {
    if (!selectedService) return Alert.alert('Erreur', 'Sélectionnez un service');
    if (!form.clientName || !form.clientEmail) return Alert.alert('Erreur', 'Remplissez vos informations');

    try {
      const { data } = await api.post('/appointments', {
        professionalId: pro.id,
        serviceId: selectedService.id,
        ...form,
        startUtc: new Date().toISOString(),
      });
      navigation.navigate('BookingSuccess', { token: data.token });
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Erreur de réservation');
    }
  };

  if (!pro) return <View style={styles.center}><Text>Chargement...</Text></View>;

  return (
    <FlatList
      style={styles.container}
      ListHeaderComponent={
        <View>
          <Text style={styles.name}>{pro.businessName}</Text>
          {pro.city && <Text style={styles.city}>{pro.city}</Text>}
          <Text style={styles.sectionTitle}>Services</Text>
        </View>
      }
      data={pro.services || []}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[styles.service, selectedService?.id === item.id && styles.selected]}
          onPress={() => setSelectedService(item)}
        >
          <Text style={styles.serviceName}>{item.name}</Text>
          <Text style={styles.serviceInfo}>{item.durationMinutes}min — {item.price}€</Text>
        </TouchableOpacity>
      )}
      ListFooterComponent={
        selectedService ? (
          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Vos informations</Text>
            <TextInput style={styles.input} placeholder="Nom" value={form.clientName}
              onChangeText={(v) => setForm({ ...form, clientName: v })} />
            <TextInput style={styles.input} placeholder="Email" value={form.clientEmail}
              onChangeText={(v) => setForm({ ...form, clientEmail: v })} keyboardType="email-address" />
            <TextInput style={styles.input} placeholder="Téléphone" value={form.clientPhone}
              onChangeText={(v) => setForm({ ...form, clientPhone: v })} keyboardType="phone-pad" />
            <TouchableOpacity style={styles.bookButton} onPress={handleBook}>
              <Text style={styles.bookButtonText}>Réserver</Text>
            </TouchableOpacity>
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9fafb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  name: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  city: { fontSize: 14, color: '#666', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 12 },
  service: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#eee' },
  selected: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  serviceName: { fontSize: 16, fontWeight: '500' },
  serviceInfo: { fontSize: 14, color: '#666', marginTop: 4 },
  form: { marginTop: 16 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', padding: 14, borderRadius: 8, marginBottom: 12, fontSize: 16 },
  bookButton: { backgroundColor: '#2563eb', padding: 16, borderRadius: 12, alignItems: 'center' },
  bookButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
