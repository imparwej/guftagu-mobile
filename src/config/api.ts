import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

const getBaseUrl = () => {
    if (!__DEV__) {
        return 'https://your-production-url.com'; // Replace with actual prod URL
    }

    // Automatic detection
    // For Android Emulator
    if (Platform.OS === 'android' && !Device.isDevice) {
        return 'http://10.0.2.2:8080';
    }

    // For Physical Devices using Expo Dev Client
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
        const ip = hostUri.split(':')[0];
        return `http://${ip}:8080`;
    }

    // Fallback
    return "http://10.155.135.216:8080";
};

export const API_BASE_URL = getBaseUrl();