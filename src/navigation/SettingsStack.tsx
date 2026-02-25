import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import ChatsSettingsScreen from '../screens/settings/ChatsSettingsScreen';
import NotificationsScreen from '../screens/settings/NotificationsScreen';
import PrivacyScreen from '../screens/settings/PrivacyScreen';
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
            <Stack.Screen name="Privacy" component={PrivacyScreen} />
            <Stack.Screen name="ChatsSettings" component={ChatsSettingsScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Storage" component={StorageScreen} />
        </Stack.Navigator>
    );
};

export default SettingsStack;
