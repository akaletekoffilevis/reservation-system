import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';

import HomeScreen from '../screens/HomeScreen';
import ProfessionalListScreen from '../screens/ProfessionalListScreen';
import ProfessionalScreen from '../screens/ProfessionalScreen';
import BookingSuccessScreen from '../screens/BookingSuccessScreen';
import ManageBookingScreen from '../screens/ManageBookingScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ProfessionalList" component={ProfessionalListScreen} options={{ title: 'Professionnels' }} />
        <Stack.Screen name="Professional" component={ProfessionalScreen} options={{ title: 'Détails' }} />
        <Stack.Screen name="BookingSuccess" component={BookingSuccessScreen} options={{ title: 'Confirmation' }} />
        <Stack.Screen name="ManageBooking" component={ManageBookingScreen} options={{ title: 'Mon rendez-vous' }} />

        {!user && (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Connexion' }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Inscription' }} />
          </>
        )}

        {user && (
          <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}