import React, { useEffect } from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
    interpolate,
    LinearTransition,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';
import { theme } from '../theme/theme';

interface SkeletonProps {
    width?: number | string;
    height?: number | string;
    borderRadius?: number;
    style?: StyleProp<ViewStyle>;
}

const Skeleton: React.FC<SkeletonProps> = ({
    width = '100%',
    height = 20,
    borderRadius = theme.radius.sm,
    style,
}) => {
    const shimmer = useSharedValue(0);

    useEffect(() => {
        shimmer.value = withRepeat(
            withTiming(1, { duration: 1500 }),
            -1,
            false
        );
    }, []);

    const shimmerStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            shimmer.value,
            [0, 0.5, 1],
            [0.3, 0.7, 0.3]
        );
        return { opacity };
    });

    return (
        <Animated.View
            layout={LinearTransition}
            style={[
                styles.skeleton,
                {
                    width: width as any,
                    height: height as any,
                    borderRadius,
                },
                style,
                shimmerStyle,
            ]}
        />
    );
};

const styles = StyleSheet.create({
    skeleton: {
        backgroundColor: theme.colors.surface,
    },
});

export default Skeleton;
