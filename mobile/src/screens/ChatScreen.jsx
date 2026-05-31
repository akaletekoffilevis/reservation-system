import { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import api from '../services/api';
import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';

export default function ChatScreen() {
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/chat/professional');
      setConversations(data || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openConversation = async (conv) => {
    setSelectedConv(conv);
    try {
      const { data } = await api.get(`/chat/${conv.id}/messages`);
      setMessages(data || []);
    } catch {}
  };

  const send = async () => {
    if (!text.trim()) return;
    try {
      const { data } = await api.post(`/chat/${selectedConv.id}/messages`, { content: text });
      setMessages((prev) => [...prev, data]);
      setText('');
    } catch { Alert.alert('Erreur', 'Message non envoyé'); }
  };

  if (loading) return <Loading />;

  if (selectedConv) {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => setSelectedConv(null)}>
          <Text style={styles.back}>← Retour</Text>
        </TouchableOpacity>
        <FlatList
          style={styles.messagesList}
          data={messages}
          keyExtractor={(i, idx) => String(i.id || idx)}
          renderItem={({ item }) => (
            <View style={[styles.msg, item.isFromProfessional ? styles.msgMine : styles.msgTheirs]}>
              <Text style={styles.msgText}>{item.content}</Text>
              <Text style={styles.msgTime}>{new Date(item.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
          )}
        />
        <View style={styles.inputRow}>
          <TextInput style={styles.input} value={text} onChangeText={setText} placeholder="Votre message..." />
          <TouchableOpacity style={styles.sendBtn} onPress={send}>
            <Text style={styles.sendText}>Envoyer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Conversations</Text>
      {conversations.length === 0 ? <EmptyState message="Aucune conversation" /> : (
        <FlatList
          data={conversations}
          keyExtractor={(i) => String(i.id)}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.convCard} onPress={() => openConversation(item)}>
              <Text style={styles.convName}>{item.clientName || 'Client'}</Text>
              {item.lastMessage && <Text style={styles.lastMsg} numberOfLines={1}>{item.lastMessage}</Text>}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  back: { fontSize: 16, color: '#2563eb', marginBottom: 12 },
  sectionTitle: { fontSize: 20, fontWeight: '600', marginBottom: 16 },
  convCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 8 },
  convName: { fontSize: 16, fontWeight: '500' },
  lastMsg: { fontSize: 13, color: '#999', marginTop: 4 },
  messagesList: { flex: 1 },
  msg: { maxWidth: '75%', padding: 12, borderRadius: 16, marginBottom: 8 },
  msgMine: { backgroundColor: '#2563eb', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  msgTheirs: { backgroundColor: '#e5e7eb', alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  msgText: { fontSize: 14, color: '#fff' },
  msgTime: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 4, alignSelf: 'flex-end' },
  inputRow: { flexDirection: 'row', gap: 8, paddingTop: 8 },
  input: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 12, fontSize: 14 },
  sendBtn: { backgroundColor: '#2563eb', borderRadius: 12, paddingHorizontal: 20, justifyContent: 'center' },
  sendText: { color: '#fff', fontWeight: '600' },
});