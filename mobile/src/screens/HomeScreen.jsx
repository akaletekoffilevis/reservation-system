import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Booking</Text>
      <Text style={styles.subtitle}>Réservez vos rendez-vous en ligne</Text>

      <TextInput
        style={styles.input}
        placeholder="Rechercher un professionnel..."
        onFocus={() => navigation.navigate('ProfessionalList', { search: '' })}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ProfessionalList', { search: '' })}
      >
        <Text style={styles.buttonText}>Rechercher</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.manageButton}
        onPress={() => navigation.navigate('ProfessionalList', { search: '' })}
      >
        <Text style={styles.manageButtonText}>Voir tous les professionnels</Text>
      </TouchableOpacity>

      {user ? (
        <TouchableOpacity style={styles.dashboardBtn} onPress={() => navigation.navigate('Dashboard')}>
          <Text style={styles.dashboardBtnText}>Mon tableau de bord</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginBtnText}>Connexion professionnel / admin</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 36, fontWeight: 'bold', color: '#2563eb', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 32, textAlign: 'center' },
  input: { width: '100%', borderWidth: 1, borderColor: '#ddd', padding: 16, borderRadius: 12, marginBottom: 12, fontSize: 16 },
  button: { backgroundColor: '#2563eb', padding: 16, borderRadius: 12, width: '100%', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  manageButton: { marginTop: 12, padding: 12 },
  manageButtonText: { color: '#2563eb', fontSize: 14 },
  dashboardBtn: { marginTop: 24, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#2563eb', width: '100%', alignItems: 'center' },
  dashboardBtnText: { color: '#2563eb', fontWeight: '600', fontSize: 14 },
  loginBtn: { marginTop: 24, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#ddd', width: '100%', alignItems: 'center' },
  loginBtnText: { color: '#666', fontSize: 14 },
});