import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function BookingSuccessScreen({ route, navigation }) {
  const token = route.params?.token;

  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <Text style={styles.iconText}>✓</Text>
      </View>
      <Text style={styles.title}>Rendez-vous confirmé !</Text>
      <Text style={styles.subtitle}>Vous recevrez un email de confirmation.</Text>
      {token && (
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ManageBooking', { token })}>
          <Text style={styles.buttonText}>Gérer mon rendez-vous</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  icon: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#dcfce7', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  iconText: { fontSize: 32, color: '#16a34a' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 24 },
  button: { backgroundColor: '#2563eb', padding: 16, borderRadius: 12, width: '100%', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
