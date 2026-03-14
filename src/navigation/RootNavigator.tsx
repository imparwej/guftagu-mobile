import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useSelector } from 'react-redux';
import { updateDeviceTokenApi } from '../api/chatApi';
import SplashScreen from '../screens/Splash';
import CreateProfileScreen from '../screens/auth/CreateProfileScreen';
import OtpScreen from '../screens/auth/OtpScreen';
import PhoneScreen from '../screens/auth/PhoneScreen';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import VideoCallScreen from '../screens/calls/VideoCallScreen';
import VoiceCallScreen from '../screens/calls/VoiceCallScreen';
import CameraScreen from '../screens/chats/CameraScreen';
import ChatScreen from '../screens/chats/ChatScreen';
import ContactListScreen from '../screens/chats/ContactListScreen';
import ContactShareScreen from '../screens/chats/ContactShareScreen';
import ForwardMessageScreen from '../screens/chats/ForwardMessageScreen';
import GroupInfoScreen from '../screens/chats/GroupInfoScreen';
import LocationShareScreen from '../screens/chats/LocationShareScreen';
import LiveLocationMap from '../screens/chats/LiveLocationMap';
import MediaLinksDocsScreen from '../screens/chats/MediaLinksDocsScreen';
import MediaPreviewScreen from '../screens/chats/MediaPreviewScreen';
import StarredMessagesScreen from '../screens/chats/StarredMessagesScreen';
import UserInfoScreen from '../screens/chats/UserInfoScreen';
import LinkedDevicesScreen from '../screens/devices/LinkedDevicesScreen';
import StatusViewerScreen from '../screens/status/StatusViewerScreen';
import { RootState } from '../store/store';
import { registerForPushNotificationsAsync } from '../utils/pushNotifications';
import TabNavigator from './TabNavigator';

const Stack = createNativeStackNavigator();

// Premium transition config for onboarding screens
const onboardingTransition = {
    animation: 'fade_from_bottom' as const,
    animationDuration: 350,
};

const RootNavigator = () => {
    const { isAuthenticated, profileCompleted } = useSelector(
        (state: RootState) => state.auth,
    );

    // Ensure we always have a stable boolean
    const isFullyOnboarded = !!(isAuthenticated && profileCompleted);
    const currentUser = useSelector((state: RootState) => state.auth.user);

    React.useEffect(() => {
        if (isFullyOnboarded && currentUser?.id) {
            registerForPushNotificationsAsync().then(token => {
                if (token) {
                    updateDeviceTokenApi(currentUser.id, token).catch((err: any) =>
                        console.warn('Failed to register device token:', err)
                    );
                }
            });
        }
    }, [isFullyOnboarded, currentUser?.id]);

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'fade',
            }}
        >
            {isFullyOnboarded ? (
                <Stack.Group key="app-flow">
                    <Stack.Screen name="Main" component={TabNavigator} />
                    <Stack.Screen
                        name="ContactList"
                        component={ContactListScreen}
                        options={{ animation: 'slide_from_bottom' }}
                    />
                    <Stack.Screen
                        name="Chat"
                        component={ChatScreen}
                        options={{ animation: 'slide_from_right' }}
                    />
                    <Stack.Screen
                        name="VoiceCall"
                        component={VoiceCallScreen}
                        options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
                    />
                    <Stack.Screen
                        name="VideoCall"
                        component={VideoCallScreen}
                        options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
                    />
                    <Stack.Screen
                        name="StatusViewer"
                        component={StatusViewerScreen}
                        options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
                    />
                    <Stack.Screen
                        name="UserInfo"
                        component={UserInfoScreen}
                        options={{ animation: 'slide_from_right' }}
                    />
                    <Stack.Screen
                        name="GroupInfo"
                        component={GroupInfoScreen}
                        options={{ animation: 'slide_from_right' }}
                    />
                    <Stack.Screen
                        name="LinkedDevices"
                        component={LinkedDevicesScreen}
                        options={{ animation: 'slide_from_right' }}
                    />
                    <Stack.Screen
                        name="Camera"
                        component={CameraScreen}
                        options={{ presentation: 'fullScreenModal', animation: 'fade' }}
                    />
                    <Stack.Screen
                        name="LocationShare"
                        component={LocationShareScreen}
                        options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
                    />
                    <Stack.Screen
                        name="LiveLocationMap"
                        component={LiveLocationMap}
                        options={{ animation: 'slide_from_right' }}
                    />
                    <Stack.Screen
                        name="ContactShare"
                        component={ContactShareScreen}
                        options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
                    />
                    <Stack.Screen
                        name="MediaPreview"
                        component={MediaPreviewScreen}
                        options={{ presentation: 'transparentModal', animation: 'fade' }}
                    />
                    {/* <Stack.Screen name="ConversationDetails" component={ConversationDetailsScreen} /> */}
                    <Stack.Screen
                        name="MediaLinksDocs"
                        component={MediaLinksDocsScreen}
                        options={{ animation: 'slide_from_right' }}
                    />
                    <Stack.Screen name="StarredMessages" component={StarredMessagesScreen} options={{ presentation: 'card' }} />
                    <Stack.Screen name="ForwardMessage" component={ForwardMessageScreen} options={{ presentation: 'formSheet' }} />
                </Stack.Group>
            ) : (
                <Stack.Group key="auth-flow">
                    <Stack.Screen name="Splash" component={SplashScreen} />
                    <Stack.Screen
                        name="Welcome"
                        component={WelcomeScreen}
                        options={{ animation: 'fade', animationDuration: 500 }}
                    />
                    <Stack.Screen
                        name="PhoneNumber"
                        component={PhoneScreen}
                        options={onboardingTransition}
                    />
                    <Stack.Screen
                        name="Otp"
                        component={OtpScreen}
                        options={onboardingTransition}
                    />
                    <Stack.Screen
                        name="CreateProfile"
                        component={CreateProfileScreen}
                        options={onboardingTransition}
                    />
                </Stack.Group>
            )}
        </Stack.Navigator>
    );
};

export default RootNavigator;
