import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import ProfessionalListScreen from '../screens/ProfessionalListScreen';
import ProfessionalScreen from '../screens/ProfessionalScreen';
import BookingSuccessScreen from '../screens/BookingSuccessScreen';
import ManageBookingScreen from '../screens/ManageBookingScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ProfessionalList" component={ProfessionalListScreen} options={{ title: 'Professionnels' }} />
        <Stack.Screen name="Professional" component={ProfessionalScreen} options={{ title: 'Détails' }} />
        <Stack.Screen name="BookingSuccess" component={BookingSuccessScreen} options={{ title: 'Confirmation' }} />
        <Stack.Screen name="ManageBooking" component={ManageBookingScreen} options={{ title: 'Mon rendez-vous' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
