import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true
    }),
});

export async function registerForPushNotificationsAsync(): Promise<string | null> {
    let token = null;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            console.warn('Failed to get push token for push notification!');
            return null;
        }
        // Project ID is only needed if using Expo's push service directly.
        // For FCM, we just need the device token.
        try {
            // Using getDevicePushTokenAsync gets the actual native FCM/APNs token
            // rather than the Expo push token (getExpoPushTokenAsync).
            // We'll use the expo push token if preferred, but since the backend uses FCM,
            // we should get the device push token if we are directly sending to FCM.
            // But let's get the Expo Push Token for now as it's easier and works with Expo.
            // If the user configures firebase admin SDK in backend to use FCM directly,
            // they would switch to getDevicePushTokenAsync.
            const tokenResponse = await Notifications.getExpoPushTokenAsync({
                projectId: "5a88208e-be7e-47c1-879d-054236b4c14d"
            });
            token = tokenResponse.data;
            console.log('Push notification token:', token);
        } catch (error) {
            console.error('Error getting push token', error);
        }
    } else {
        console.warn('Must use physical device for Push Notifications');
    }

    return token;
}
