import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import {
    CircleDot,
    MessageSquare,
    Phone,
    Settings,
} from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import CallListScreen from '../screens/calls/CallListScreen';
import StatusListScreen from '../screens/status/StatusListScreen';
import ChatStack from './ChatStack';
import SettingsStack from './SettingsStack';

const Tab = createBottomTabNavigator();

/* ─── Animated Tab Icon + Label ────────────────────────────────────────────── */
const TabBarIcon = ({
    icon: Icon,
    focused,
    color,
    label,
}: {
    icon: any;
    focused: boolean;
    color: string;
    label: string;
}) => {
    const scale = useSharedValue(1);
    const translateY = useSharedValue(0);
    const labelOpacity = useSharedValue(0);
    const indicatorWidth = useSharedValue(0);

    useEffect(() => {
        if (focused) {
            scale.value = withSpring(1.15, { damping: 12, stiffness: 260 });
            translateY.value = withSpring(-2, { damping: 12, stiffness: 260 });
            labelOpacity.value = withTiming(1, { duration: 250 });
            indicatorWidth.value = withSpring(24, { damping: 14, stiffness: 200 });
        } else {
            scale.value = withSpring(1, { damping: 12, stiffness: 260 });
            translateY.value = withSpring(0, { damping: 12, stiffness: 260 });
            labelOpacity.value = withTiming(0, { duration: 200 });
            indicatorWidth.value = withSpring(0, { damping: 14, stiffness: 200 });
        }
    }, [focused]);

    const iconAnimStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: scale.value },
            { translateY: translateY.value },
        ],
    }));

    const labelAnimStyle = useAnimatedStyle(() => ({
        opacity: labelOpacity.value,
    }));

    const indicatorAnimStyle = useAnimatedStyle(() => ({
        width: indicatorWidth.value,
    }));

    return (
        <View style={styles.tabIconOuter}>
            <Animated.View style={[styles.iconContainer, iconAnimStyle]}>
                <Icon
                    color={color}
                    size={22}
                    strokeWidth={focused ? 2.4 : 1.8}
                />
            </Animated.View>
            <Animated.Text
                style={[
                    styles.tabLabel,
                    { color },
                    labelAnimStyle,
                ]}
                numberOfLines={1}
            >
                {label}
            </Animated.Text>
            <Animated.View style={[styles.activeIndicator, indicatorAnimStyle]} />
        </View>
    );
};

/* ─── Tab Navigator ────────────────────────────────────────────────────────── */
const TabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarShowLabel: false,
                tabBarActiveTintColor: '#FFFFFF',
                tabBarInactiveTintColor: 'rgba(255,255,255,0.35)',
                tabBarStyle: {
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: Platform.OS === 'ios' ? 88 : 72,
                    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
                    paddingTop: 8,
                    borderTopWidth: 0,
                    elevation: 0,
                    backgroundColor: 'transparent',
                },
                tabBarBackground: () => (
                    <View style={StyleSheet.absoluteFill}>
                        <BlurView
                            intensity={60}
                            tint="dark"
                            style={StyleSheet.absoluteFill}
                        />
                        {/* Subtle top border line */}
                        <View style={styles.tabBarTopBorder} />
                    </View>
                ),
                tabBarIcon: ({ color, focused }) => {
                    let icon: any;
                    let label = '';

                    if (route.name === 'Chats') { icon = MessageSquare; label = 'Chats'; }
                    else if (route.name === 'Status') { icon = CircleDot; label = 'Status'; }
                    else if (route.name === 'Calls') { icon = Phone; label = 'Calls'; }
                    else if (route.name === 'Settings') { icon = Settings; label = 'Settings'; }

                    return (
                        <TabBarIcon
                            icon={icon}
                            focused={focused}
                            color={color}
                            label={label}
                        />
                    );
                },
            })}
            screenListeners={{
                tabPress: () => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                },
            }}
        >
            <Tab.Screen name="Chats" component={ChatStack} />
            <Tab.Screen name="Status" component={StatusListScreen} />
            <Tab.Screen name="Calls" component={CallListScreen} />
            <Tab.Screen name="Settings" component={SettingsStack} />
        </Tab.Navigator>
    );
};

/* ─── Styles ───────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
    tabIconOuter: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 64,
        paddingTop: 2,
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 36,
        height: 28,
    },
    tabLabel: {
        fontSize: 10,
        fontWeight: '600',
        marginTop: 2,
        letterSpacing: 0.2,
    },
    activeIndicator: {
        height: 3,
        borderRadius: 1.5,
        backgroundColor: '#FFFFFF',
        marginTop: 4,
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 6,
    },
    tabBarTopBorder: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: StyleSheet.hairlineWidth,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
});

export default TabNavigator;
