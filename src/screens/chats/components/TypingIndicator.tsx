import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { theme } from '../../../theme/theme';

const DOT_SIZE = 7;
const BOUNCE_HEIGHT = -6;
const DURATION = 350;

const AnimatedDot = ({ delay }: { delay: number }) => {
    const translateY = useSharedValue(0);
    const opacity = useSharedValue(0.4);

    useEffect(() => {
        translateY.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(BOUNCE_HEIGHT, { duration: DURATION }),
                    withTiming(0, { duration: DURATION }),
                ),
                -1,
                false,
            ),
        );
        opacity.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(1, { duration: DURATION }),
                    withTiming(0.4, { duration: DURATION }),
                ),
                -1,
                false,
            ),
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
    }));

    return <Animated.View style={[styles.dot, animatedStyle]} />;
};

const TypingIndicator = React.memo(() => {
    return (
        <View style={styles.container}>
            <View style={styles.bubble}>
                <AnimatedDot delay={0} />
                <AnimatedDot delay={150} />
                <AnimatedDot delay={300} />
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        alignSelf: 'flex-start',
        marginBottom: 8,
        maxWidth: '85%',
    },
    bubble: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: 20,
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        paddingHorizontal: 20,
        paddingVertical: 14,
        gap: 5,
    },
    dot: {
        width: DOT_SIZE,
        height: DOT_SIZE,
        borderRadius: DOT_SIZE / 2,
        backgroundColor: theme.colors.text.secondary,
    },
});

export default TypingIndicator;
