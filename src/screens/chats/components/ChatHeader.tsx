import {
    LucideArrowLeft,
    LucideMoreVertical,
    LucidePhone,
    LucideVideo,
} from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { theme } from '../../../theme/theme';
import { Chat } from '../../../types';

interface ChatHeaderProps {
    chat: Chat;
    statusText: string;
    onBack: () => void;
    onInfoPress: () => void;
    onCallPress: () => void;
    onVideoPress: () => void;
    onMenuPress: () => void;
}

const OnlineDot = () => {
    const pulseScale = useSharedValue(1);

    useEffect(() => {
        pulseScale.value = withRepeat(
            withSequence(
                withTiming(1.3, { duration: 1200 }),
                withTiming(1, { duration: 1200 }),
            ),
            -1,
            false,
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
    }));

    return (
        <Animated.View style={[styles.onlineDotOuter, animatedStyle]}>
            <View style={styles.onlineDotInner} />
        </Animated.View>
    );
};

const ChatHeader: React.FC<ChatHeaderProps> = React.memo(({
    chat,
    statusText,
    onBack,
    onInfoPress,
    onCallPress,
    onVideoPress,
    onMenuPress,
}) => {
    const isOnline = statusText === 'online';
    const isTyping = statusText === 'typing...';

    return (
        <View style={styles.container}>
            {/* Back button */}
            <Pressable
                style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
                onPress={onBack}
                hitSlop={8}
            >
                <LucideArrowLeft color={theme.colors.text.primary} size={22} />
            </Pressable>

            {/* Avatar + Info - tappable to open info screen */}
            <Pressable
                style={({ pressed }) => [styles.infoArea, pressed && { opacity: 0.7 }]}
                onPress={onInfoPress}
            >
                <View style={styles.avatarContainer}>
                    <Image
                        source={{ uri: chat.avatar }}
                        style={styles.avatar}
                    />
                    {isOnline && <OnlineDot />}
                </View>
                <View style={styles.textArea}>
                    <Text style={styles.name} numberOfLines={1}>
                        {chat.name}
                    </Text>
                    <Text
                        style={[
                            styles.status,
                            isOnline && styles.statusOnline,
                            isTyping && styles.statusTyping,
                        ]}
                        numberOfLines={1}
                    >
                        {statusText}
                    </Text>
                </View>
            </Pressable>

            {/* Action buttons */}
            <View style={styles.actions}>
                <Pressable
                    style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}
                    onPress={onCallPress}
                    hitSlop={6}
                >
                    <LucidePhone color={theme.colors.text.secondary} size={20} />
                </Pressable>
                <Pressable
                    style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}
                    onPress={onVideoPress}
                    hitSlop={6}
                >
                    <LucideVideo color={theme.colors.text.secondary} size={20} />
                </Pressable>
                <Pressable
                    style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}
                    onPress={onMenuPress}
                    hitSlop={6}
                >
                    <LucideMoreVertical color={theme.colors.text.secondary} size={20} />
                </Pressable>
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        paddingTop: 54,
        paddingHorizontal: 12,
        paddingBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255,255,255,0.08)',
    },
    backBtn: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 18,
    },
    pressed: {
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    infoArea: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 6,
    },
    avatarContainer: {
        width: 40,
        height: 40,
        marginRight: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    onlineDotOuter: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    onlineDotInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#34C759',
    },
    textArea: {
        flex: 1,
    },
    name: {
        color: theme.colors.text.primary,
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.1,
        marginBottom: 1,
    },
    status: {
        color: theme.colors.text.secondary,
        fontSize: 12,
        fontWeight: '400',
    },
    statusOnline: {
        color: '#34C759',
    },
    statusTyping: {
        color: '#5AC8FA',
        fontStyle: 'italic',
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    actionBtn: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 18,
    },
});

export default ChatHeader;
