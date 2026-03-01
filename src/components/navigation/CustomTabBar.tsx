import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import {
    CircleDot,
    MessageSquare,
    Phone,
    Settings,
} from 'lucide-react-native';
import React, { useCallback, useEffect } from 'react';
import {
    LayoutChangeEvent,
    Platform,
    Pressable,
    StyleSheet,
    View
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TAB_BAR_HEIGHT } from '../../navigation/tabConstants';

/* ─── Spring Configs ───────────────────────────────────────────────────────── */
const SPRING_CONFIG = {
    damping: 20,
    stiffness: 220,
    mass: 0.8,
};

/* ─── Icons Map ────────────────────────────────────────────────────────────── */
const ICONS: Record<string, any> = {
    Chats: MessageSquare,
    Status: CircleDot,
    Calls: Phone,
    Settings: Settings,
};

const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
    const insets = useSafeAreaInsets();
    const tabWidth = useSharedValue(0);
    const translateX = useSharedValue(0);

    // Update indicator position when tab changes
    useEffect(() => {
        // We use a small delay or check to ensure tabWidth has been set by onLayout
        translateX.value = withSpring(state.index * tabWidth.value, SPRING_CONFIG);
    }, [state.index]); // No .value in deps

    const onLayout = useCallback((event: LayoutChangeEvent) => {
        const { width } = event.nativeEvent.layout;
        const widthPerTab = width / state.routes.length;
        tabWidth.value = widthPerTab;
        translateX.value = state.index * widthPerTab;
    }, [state.routes.length, state.index]);

    const indicatorStyle = useAnimatedStyle(() => ({
        width: tabWidth.value,
        transform: [{ translateX: translateX.value }],
    }));

    return (
        <View style={[styles.wrapper, { height: TAB_BAR_HEIGHT }]}>
            <BlurView intensity={85} tint="dark" style={StyleSheet.absoluteFill}>
                <View style={styles.overlay} />
            </BlurView>

            {/* Top Border Inner Glow */}
            <View style={styles.topBorder} />

            <View style={styles.content} onLayout={onLayout}>
                {/* Active Indicator Background Pill */}
                <Animated.View style={[styles.indicatorContainer, indicatorStyle]}>
                    <View style={styles.indicatorPill} />
                </Animated.View>

                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const label = options.tabBarLabel !== undefined
                        ? options.tabBarLabel
                        : options.title !== undefined
                            ? options.title
                            : route.name;

                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            navigation.navigate(route.name);
                        }
                    };

                    return (
                        <TabItem
                            key={route.key}
                            label={label as string}
                            isFocused={isFocused}
                            onPress={onPress}
                            name={route.name}
                        />
                    );
                })}
            </View>
            {/* Native spacing for home indicator */}
            <View style={{ height: Platform.OS === 'ios' ? insets.bottom : 0 }} />
        </View>
    );
};

/* ─── Sub-component for individual tabs ────────────────────────────────────── */
const TabItem = React.memo(({
    label,
    isFocused,
    onPress,
    name,
}: {
    label: string;
    isFocused: boolean;
    onPress: () => void;
    name: string;
}) => {
    const scale = useSharedValue(1);
    const progress = useSharedValue(isFocused ? 1 : 0);

    useEffect(() => {
        progress.value = withTiming(isFocused ? 1 : 0, { duration: 250 });
    }, [isFocused]);

    const Icon = ICONS[name] || MessageSquare;

    const animatedIconStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const activeIconStyle = useAnimatedStyle(() => ({
        opacity: progress.value,
    }));

    const inactiveIconStyle = useAnimatedStyle(() => ({
        opacity: 1 - progress.value,
    }));

    const animatedTextStyle = useAnimatedStyle(() => ({
        opacity: progress.value,
        transform: [{ translateY: (1 - progress.value) * 4 }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.9, { damping: 12, stiffness: 200 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 12, stiffness: 200 });
    };

    return (
        <Pressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={styles.tabButton}
        >
            <Animated.View style={[styles.iconBox, animatedIconStyle]}>
                {/* Active Icon (White) */}
                <Animated.View style={[StyleSheet.absoluteFill, styles.iconCenter, activeIconStyle]}>
                    <Icon size={22} strokeWidth={2.3} color="#FFFFFF" />
                </Animated.View>
                {/* Inactive Icon (Faded) */}
                <Animated.View style={[StyleSheet.absoluteFill, styles.iconCenter, inactiveIconStyle]}>
                    <Icon size={22} strokeWidth={1.8} color="rgba(255, 255, 255, 0.4)" />
                </Animated.View>
            </Animated.View>
            <Animated.Text style={[styles.label, animatedTextStyle]}>
                {label}
            </Animated.Text>
        </Pressable>
    );
});

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'transparent',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        overflow: 'hidden',
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
    },
    topBorder: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
    },
    content: {
        flexDirection: 'row',
        flex: 1,
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 8,
    },
    iconBox: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconCenter: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        fontSize: 10,
        fontWeight: '700',
        marginTop: 2,
        color: '#FFFFFF',
        letterSpacing: 0.3,
    },
    indicatorContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
    },
    indicatorPill: {
        position: 'absolute',
        top: 7, // Refined for better centering with the 32px iconBox
        alignSelf: 'center',
        width: 52,
        height: 32,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 16,
    },
});

export default CustomTabBar;
