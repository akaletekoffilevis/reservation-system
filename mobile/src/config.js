import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Change this for deployment
let API_BASE_URL = 'http://localhost:5161/api';

if (__DEV__) {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    API_BASE_URL = `http://${ip}:5161/api`;
  } else if (Platform.OS === 'android') {
    API_BASE_URL = 'http://10.0.2.2:5161/api';
  }
}

export default { API_BASE_URL };
