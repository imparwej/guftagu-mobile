import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useSelector } from 'react-redux';
import SplashScreen from '../screens/Splash';
import CreateProfileScreen from '../screens/auth/CreateProfileScreen';
import OtpScreen from '../screens/auth/OtpScreen';
import PhoneScreen from '../screens/auth/PhoneScreen';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import VideoCallScreen from '../screens/calls/VideoCallScreen';
import VoiceCallScreen from '../screens/calls/VoiceCallScreen';
import ChatScreen from '../screens/chats/ChatScreen';
import ContactListScreen from '../screens/chats/ContactListScreen';
import GroupInfoScreen from '../screens/chats/GroupInfoScreen';
import UserInfoScreen from '../screens/chats/UserInfoScreen';
import LinkedDevicesScreen from '../screens/devices/LinkedDevicesScreen';
import StatusViewerScreen from '../screens/status/StatusViewerScreen';
import { RootState } from '../store/store';
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

    // Once authenticated with profile complete, auth screens are unreachable
    const isFullyOnboarded = isAuthenticated && profileCompleted;

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'fade',
            }}
        >
            {isFullyOnboarded ? (
                // ── Authenticated stack — no auth screens in tree at all
                <>
                    <Stack.Screen name="Chats" component={TabNavigator} />
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
                </>
            ) : (
                // ── Auth/onboarding stack
                <>
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
                </>
            )}
        </Stack.Navigator>
    );
};

export default RootNavigator;
