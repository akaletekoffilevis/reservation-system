import { View, Text, StyleSheet } from 'react-native';

const colors = {
  Pending: { bg: '#fef3c7', text: '#92400e' },
  Confirmed: { bg: '#dbeafe', text: '#1e40af' },
  Completed: { bg: '#dcfce7', text: '#166534' },
  Cancelled: { bg: '#fce4ec', text: '#c62828' },
  Active: { bg: '#dcfce7', text: '#166534' },
  Inactive: { bg: '#f3f4f6', text: '#6b7280' },
};

export default function Badge({ label, variant }) {
  const c = colors[variant] || colors.Pending;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.text, { color: c.text }]}>{label || variant}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start' },
  text: { fontSize: 12, fontWeight: '600' },
});