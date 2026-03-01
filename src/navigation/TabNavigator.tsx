import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import React, { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import CustomTabBar from '../components/navigation/CustomTabBar';
import CallListScreen from '../screens/calls/CallListScreen';
import ChatStack from './ChatStack';
import SettingsStack from './SettingsStack';
import StatusStack from './StatusStack';

const Tab = createBottomTabNavigator();

/* ─── Tab Navigator ────────────────────────────────────────────────────────── */
const TabNavigator = () => {
    const screenListeners = useCallback(() => ({
        tabPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        },
    }), []);

    return (
        <Tab.Navigator
            tabBar={(props) => {
                const route = props.state.routes[props.state.index];
                const focusedRouteName = getFocusedRouteNameFromRoute(route);

                // Hide for specific nested routes
                if (focusedRouteName === 'StatusViewer' || focusedRouteName === 'CreateStatus') {
                    return null;
                }

                return <CustomTabBar {...props} />;
            }}
            screenOptions={{
                headerShown: false,
                lazy: true,
            }}
            screenListeners={screenListeners}
        >
            <Tab.Screen name="Chats" component={ChatStack} />
            <Tab.Screen name="Status" component={StatusStack} />
            <Tab.Screen name="Calls" component={CallListScreen} />
            <Tab.Screen name="Settings" component={SettingsStack} />
        </Tab.Navigator>
    );
};


/* ─── Styles ───────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({});

export default TabNavigator;
