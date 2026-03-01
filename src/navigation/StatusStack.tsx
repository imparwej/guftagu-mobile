import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import CreateStatusScreen from '../screens/status/CreateStatusScreen';
import StatusListScreen from '../screens/status/StatusListScreen';
import StatusPrivacyScreen from '../screens/status/StatusPrivacyScreen';
import StatusViewerScreen from '../screens/status/StatusViewerScreen';

const Stack = createNativeStackNavigator();

const StatusStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="StatusList" component={StatusListScreen} />
            <Stack.Screen
                name="StatusViewer"
                component={StatusViewerScreen}
                options={{
                    animation: 'fade',
                    gestureEnabled: false
                }}
            />
            <Stack.Screen
                name="StatusPrivacy"
                component={StatusPrivacyScreen}
            />
            <Stack.Screen
                name="CreateStatus"
                component={CreateStatusScreen}
                options={{
                    animation: 'slide_from_bottom'
                }}
            />
        </Stack.Navigator>
    );
};

export default StatusStack;
