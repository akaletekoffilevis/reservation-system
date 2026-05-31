import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', role: 'Client' });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!form.email || !form.password || !form.firstName || !form.lastName)
      return Alert.alert('Erreur', 'Remplissez tous les champs');
    setLoading(true);
    try {
      await register(form);
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || "Échec de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Inscription</Text>
      <TextInput style={styles.input} placeholder="Prénom" value={form.firstName}
        onChangeText={(v) => setForm({ ...form, firstName: v })} />
      <TextInput style={styles.input} placeholder="Nom" value={form.lastName}
        onChangeText={(v) => setForm({ ...form, lastName: v })} />
      <TextInput style={styles.input} placeholder="Email" value={form.email}
        onChangeText={(v) => setForm({ ...form, email: v })} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Mot de passe" value={form.password}
        onChangeText={(v) => setForm({ ...form, password: v })} secureTextEntry />
      <TouchableOpacity style={[styles.button, loading && styles.disabled]} onPress={handleRegister} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Inscription...' : "S'inscrire"}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.link}>Déjà un compte ? Se connecter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24, justifyContent: 'center', flexGrow: 1 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 32, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 14, borderRadius: 12, marginBottom: 12, fontSize: 16 },
  button: { backgroundColor: '#2563eb', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  disabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { color: '#2563eb', textAlign: 'center', marginTop: 16, fontSize: 14 },
});