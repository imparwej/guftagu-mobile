import {
    LucideCamera,
    LucideMic,
    LucidePaperclip,
    LucideSend,
    LucideSmile,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { theme } from '../../../theme/theme';

interface ChatInputBarProps {
    text: string;
    onChangeText: (text: string) => void;
    onSend: () => void;
    onAttachPress: () => void;
    onEmojiPress: () => void;
    onCameraPress: () => void;
    onMicPress: () => void;
    showAttachments: boolean;
    bottomInset?: number;
    disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SPRING_CONFIG = { damping: 15, stiffness: 200, mass: 0.8 };

const ChatInputBar: React.FC<ChatInputBarProps> = React.memo(({
    text,
    onChangeText,
    onSend,
    onAttachPress,
    onEmojiPress,
    onCameraPress,
    onMicPress,
    showAttachments,
    bottomInset = 0,
    disabled = false,
}) => {
    const hasText = text.trim().length > 0;
    const morphProgress = useSharedValue(0);
    const cameraOpacity = useSharedValue(1);
    const inputRef = useRef<TextInput>(null);

    useEffect(() => {
        morphProgress.value = withSpring(hasText ? 1 : 0, SPRING_CONFIG);
        cameraOpacity.value = withTiming(hasText ? 0 : 1, { duration: 150 });
    }, [hasText]);

    // Send button animated style (scale in from mic)
    const sendBtnStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: interpolate(morphProgress.value, [0, 1], [0.4, 1]) },
            { rotate: `${interpolate(morphProgress.value, [0, 1], [90, 0])}deg` },
        ],
        opacity: morphProgress.value,
    }));

    // Mic button animated style (scale out to send)
    const micBtnStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: interpolate(morphProgress.value, [0, 1], [1, 0.4]) },
        ],
        opacity: interpolate(morphProgress.value, [0, 1], [1, 0]),
    }));

    // Camera icon fade
    const cameraStyle = useAnimatedStyle(() => ({
        opacity: cameraOpacity.value,
        transform: [{ scale: interpolate(cameraOpacity.value, [0, 1], [0.7, 1]) }],
    }));

    const handleSend = useCallback(() => {
        if (hasText) onSend();
    }, [hasText, onSend]);

    return (
        <View style={[styles.container, { paddingBottom: Math.max(bottomInset, 8) }]}>
            {/* Attachment button */}
            <Pressable
                style={({ pressed }) => [styles.sideBtn, pressed && styles.pressed]}
                onPress={onAttachPress}
                hitSlop={6}
            >
                <LucidePaperclip
                    color={showAttachments ? theme.colors.text.primary : theme.colors.text.secondary}
                    size={21}
                    style={showAttachments ? { transform: [{ rotate: '45deg' }] } : undefined}
                />
            </Pressable>

            {/* Input field container */}
            <View style={styles.inputWrapper}>
                {/* Emoji button */}
                <Pressable
                    style={({ pressed }) => [styles.inlineBtn, pressed && styles.pressed]}
                    onPress={onEmojiPress}
                    hitSlop={4}
                >
                    <LucideSmile color={theme.colors.text.secondary} size={20} />
                </Pressable>

                <TextInput
                    ref={inputRef}
                    style={[styles.input, disabled && { opacity: 0.4 }]}
                    value={text}
                    onChangeText={onChangeText}
                    placeholder={disabled ? 'Blocked' : 'Message'}
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    multiline
                    maxLength={4000}
                    editable={!disabled}
                />

                {/* Camera icon - only when no text */}
                <AnimatedPressable
                    style={[styles.inlineBtn, cameraStyle]}
                    onPress={onCameraPress}
                    hitSlop={4}
                    pointerEvents={hasText ? 'none' : 'auto'}
                >
                    <LucideCamera color={theme.colors.text.secondary} size={20} />
                </AnimatedPressable>
            </View>

            {/* Mic / Send morph button */}
            <View style={styles.morphContainer}>
                {/* Mic button (background layer) */}
                <AnimatedPressable
                    style={[styles.morphBtn, micBtnStyle]}
                    onPress={onMicPress}
                    hitSlop={6}
                    pointerEvents={hasText ? 'none' : 'auto'}
                >
                    <LucideMic color={theme.colors.text.primary} size={22} />
                </AnimatedPressable>

                {/* Send button (foreground layer) */}
                <AnimatedPressable
                    style={[styles.morphBtn, styles.sendBtn, sendBtnStyle]}
                    onPress={handleSend}
                    hitSlop={6}
                    pointerEvents={hasText ? 'auto' : 'none'}
                >
                    <LucideSend color="#000" size={19} style={{ marginLeft: -2, marginTop: -1 }} />
                </AnimatedPressable>
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 8,
        paddingVertical: 8,
        backgroundColor: theme.colors.background,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(255,255,255,0.06)',
    },
    sideBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    pressed: {
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    inputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: '#1C1C1E',
        borderRadius: 22,
        paddingHorizontal: 6,
        paddingVertical: 4,
        marginHorizontal: 4,
        maxHeight: 130,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    inlineBtn: {
        width: 34,
        height: 34,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 17,
    },
    input: {
        flex: 1,
        color: theme.colors.text.primary,
        fontSize: 16,
        lineHeight: 21,
        paddingHorizontal: 4,
        paddingVertical: 6,
        maxHeight: 110,
    },
    morphContainer: {
        width: 42,
        height: 42,
        justifyContent: 'center',
        alignItems: 'center',
    },
    morphBtn: {
        position: 'absolute',
        width: 42,
        height: 42,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 21,
    },
    sendBtn: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#FFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
});

export default ChatInputBar;
