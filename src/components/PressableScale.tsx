import React from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

interface PressableScaleProps extends PressableProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    scaleTo?: number;
}

const PressableScale: React.FC<PressableScaleProps> = ({
    children,
    style,
    scaleTo = 0.97,
    ...props
}) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const onPressIn = (e: any) => {
        scale.value = withSpring(scaleTo, { damping: 10, stiffness: 300 });
        props.onPressIn?.(e);
    };

    const onPressOut = (e: any) => {
        scale.value = withSpring(1, { damping: 10, stiffness: 300 });
        props.onPressOut?.(e);
    };

    return (
        <Pressable {...props} onPressIn={onPressIn} onPressOut={onPressOut}>
            <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
        </Pressable>
    );
};

export default PressableScale;
