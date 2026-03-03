import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import AccountSettingsScreen from '../screens/settings/AccountSettingsScreen';
import AvatarCreatorScreen from '../screens/settings/AvatarCreatorScreen';
import ChatsSettingsScreen from '../screens/settings/ChatsSettingsScreen';
import HelpCenterScreen from '../screens/settings/HelpCenterScreen';
import NotificationsScreen from '../screens/settings/NotificationsScreen';
import PrivacyScreen from '../screens/settings/PrivacyScreen';
import ProfileSettingsScreen from '../screens/settings/ProfileSettingsScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import StorageScreen from '../screens/settings/StorageScreen';

const Stack = createNativeStackNavigator();

const SettingsStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="SettingsHome" component={SettingsScreen} />
            <Stack.Screen name="Profile" component={ProfileSettingsScreen} />
            <Stack.Screen name="Account" component={AccountSettingsScreen} />
            <Stack.Screen name="Privacy" component={PrivacyScreen} />
            <Stack.Screen name="Avatar" component={AvatarCreatorScreen} />
            <Stack.Screen name="ChatsSettings" component={ChatsSettingsScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Storage" component={StorageScreen} />
            <Stack.Screen name="Help" component={HelpCenterScreen} />
        </Stack.Navigator>
    );
};

export default SettingsStack;
