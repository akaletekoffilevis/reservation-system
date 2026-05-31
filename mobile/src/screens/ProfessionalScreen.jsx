import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Alert, ScrollView } from 'react-native';
import api from '../services/api';

function getNextDays(count = 7) {
  const days = [];
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

function toSlotKey(date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start.toISOString().split('T')[0];
}

function generateSlots(availabilitySlots, date) {
  const dayOfWeek = date.getDay();
  const slots = [];
  for (const s of availabilitySlots) {
    if (s.dayOfWeek === dayOfWeek) {
      const [sh, sm] = s.startTime.split(':').map(Number);
      const [eh, em] = s.endTime.split(':').map(Number);
      let current = sh * 60 + sm;
      const end = eh * 60 + em;
      while (current + 45 <= end) {
        const h = Math.floor(current / 60);
        const m = current % 60;
        slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
        current += 45;
      }
    }
  }
  return slots;
}

export default function ProfessionalScreen({ route, navigation }) {
  const { slug } = route.params;
  const [pro, setPro] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [form, setForm] = useState({ clientName: '', clientEmail: '', clientPhone: '' });

  useEffect(() => {
    api.get(`/professionals/${slug}`).then(({ data }) => setPro(data));
    api.get(`/professionals/${route.params?.id || ''}`).catch(() => {});
  }, [slug]);

  const loadAvailability = useCallback(async () => {
    if (!pro) return;
    try {
      const { data } = await api.get(`/professionals/${pro.id}/availability`);
      setAvailability(data.slots || []);
    } catch {}
  }, [pro]);

  useEffect(() => { loadAvailability(); }, [loadAvailability]);

  useEffect(() => {
    if (!selectedDate || availability.length === 0) { setSlots([]); return; }
    setSlots(generateSlots(availability, selectedDate));
    setSelectedTime(null);
  }, [selectedDate, availability]);

  const handleBook = async () => {
    if (!selectedService) return Alert.alert('Erreur', 'Sélectionnez un service');
    if (!selectedDate || !selectedTime) return Alert.alert('Erreur', 'Sélectionnez une date et un horaire');
    if (!form.clientName || !form.clientEmail) return Alert.alert('Erreur', 'Remplissez vos informations');

    const [h, m] = selectedTime.split(':').map(Number);
    const startUtc = new Date(selectedDate);
    startUtc.setHours(h, m, 0, 0);

    try {
      const { data } = await api.post('/appointments', {
        professionalId: pro.id,
        serviceId: selectedService.id,
        clientName: form.clientName,
        clientEmail: form.clientEmail,
        clientPhone: form.clientPhone,
        startUtc: startUtc.toISOString(),
      });
      navigation.navigate('BookingSuccess', { token: data.token });
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Erreur de réservation');
    }
  };

  if (!pro) return <View style={styles.center}><Text>Chargement...</Text></View>;

  const days = getNextDays();
  const frenchDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.name}>{pro.businessName}</Text>
      {pro.city && <Text style={styles.city}>{pro.city}</Text>}
      {pro.description && <Text style={styles.desc}>{pro.description}</Text>}

      <Text style={styles.sectionTitle}>Services</Text>
      {(pro.services || []).map((s) => (
        <TouchableOpacity
          key={s.id}
          style={[styles.service, selectedService?.id === s.id && styles.selected]}
          onPress={() => setSelectedService(s)}
        >
          <Text style={styles.serviceName}>{s.name}</Text>
          <Text style={styles.serviceInfo}>{s.durationMinutes}min — {s.price}€</Text>
        </TouchableOpacity>
      ))}

      {selectedService && (
        <>
          <Text style={styles.sectionTitle}>Date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.datesRow}>
            {days.map((d, i) => {
              const key = toSlotKey(d);
              const isToday = i === 0;
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.dateCard, selectedDate && toSlotKey(selectedDate) === key && styles.selectedDate]}
                  onPress={() => setSelectedDate(d)}
                >
                  <Text style={styles.dateDay}>{frenchDays[d.getDay()]}</Text>
                  <Text style={styles.dateNum}>{d.getDate()}</Text>
                  <Text style={styles.dateMonth}>
                    {d.toLocaleString('fr-FR', { month: 'short' }).replace('.', '')}
                  </Text>
                  {isToday && <Text style={styles.todayTag}>Aujourd'hui</Text>}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {selectedDate && slots.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Horaire</Text>
              <View style={styles.slotsGrid}>
                {slots.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[styles.slot, selectedTime === time && styles.selectedSlot]}
                    onPress={() => setSelectedTime(time)}
                  >
                    <Text style={[styles.slotText, selectedTime === time && styles.selectedSlotText]}>{time}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

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
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9fafb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  name: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  city: { fontSize: 14, color: '#666', marginBottom: 4 },
  desc: { fontSize: 14, color: '#444', marginBottom: 16, lineHeight: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 12 },
  service: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#eee' },
  selected: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  serviceName: { fontSize: 16, fontWeight: '500' },
  serviceInfo: { fontSize: 14, color: '#666', marginTop: 4 },
  datesRow: { flexDirection: 'row', marginBottom: 12 },
  dateCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, alignItems: 'center', marginRight: 8, minWidth: 70, borderWidth: 1, borderColor: '#eee' },
  selectedDate: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  dateDay: { fontSize: 12, color: '#999' },
  dateNum: { fontSize: 20, fontWeight: '700', marginVertical: 4 },
  dateMonth: { fontSize: 12, color: '#666' },
  todayTag: { fontSize: 10, color: '#2563eb', fontWeight: '600', marginTop: 4 },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slot: { backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1, borderColor: '#eee' },
  selectedSlot: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  slotText: { fontSize: 14, color: '#333' },
  selectedSlotText: { color: '#fff', fontWeight: '600' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', padding: 14, borderRadius: 8, marginBottom: 12, fontSize: 16 },
  bookButton: { backgroundColor: '#2563eb', padding: 16, borderRadius: 12, alignItems: 'center', marginVertical: 20 },
  bookButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});