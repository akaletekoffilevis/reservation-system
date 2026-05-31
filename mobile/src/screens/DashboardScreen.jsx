import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import AppointmentsScreen from './AppointmentsScreen';
import ChatScreen from './ChatScreen';
import ProReviewsScreen from './ProReviewsScreen';
import AdminDashboardScreen from './AdminDashboardScreen';
import AdminProfessionalsScreen from './AdminProfessionalsScreen';
import AdminReviewsScreen from './AdminReviewsScreen';

const PRO_TABS = [
  { key: 'appointments', label: 'RDV' },
  { key: 'chat', label: 'Messages' },
  { key: 'reviews', label: 'Avis' },
];

const ADMIN_TABS = [
  { key: 'dashboard', label: 'Stats' },
  { key: 'professionals', label: 'Pros' },
  { key: 'reviews', label: 'Avis' },
];

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const tabs = isAdmin ? ADMIN_TABS : PRO_TABS;
  const [activeTab, setActiveTab] = useState(tabs[0].key);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>
            {isAdmin ? 'Administrateur' : 'Professionnel'}
          </Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={() => { logout(); navigation.reset({ index: 0, routes: [{ name: 'Home' }] }); }}>
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        {activeTab === 'appointments' && <AppointmentsScreen />}
        {activeTab === 'chat' && <ChatScreen />}
        {activeTab === 'reviews' && (isAdmin ? <AdminReviewsScreen /> : <ProReviewsScreen />)}
        {activeTab === 'dashboard' && <AdminDashboardScreen />}
        {activeTab === 'professionals' && <AdminProfessionalsScreen />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  topBar: { backgroundColor: '#fff', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderColor: '#e5e7eb' },
  greeting: { fontSize: 18, fontWeight: 'bold' },
  email: { fontSize: 13, color: '#666', marginTop: 2 },
  logoutBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#fef2f2' },
  logoutText: { color: '#dc2626', fontWeight: '500', fontSize: 13 },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 16, paddingBottom: 0 },
  tab: { paddingVertical: 12, paddingHorizontal: 16, marginRight: 4 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#2563eb' },
  tabText: { fontSize: 14, color: '#999', fontWeight: '500' },
  activeTabText: { color: '#2563eb', fontWeight: '600' },
  content: { flex: 1 },
});