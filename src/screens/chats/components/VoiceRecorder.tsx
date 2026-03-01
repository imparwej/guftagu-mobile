import { LucideMic, LucideTrash2, LucideX } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
    FadeIn,
    FadeOut,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { theme } from '../../../theme/theme';

interface VoiceRecorderProps {
    visible: boolean;
    onCancel: () => void;
    onSend: (duration: number) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ visible, onCancel, onSend }) => {
    const [seconds, setSeconds] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const pulseScale = useSharedValue(1);

    useEffect(() => {
        if (visible) {
            setSeconds(0);
            timerRef.current = setInterval(() => {
                setSeconds(s => s + 1);
            }, 1000);
            pulseScale.value = withRepeat(
                withSequence(
                    withTiming(1.2, { duration: 600 }),
                    withTiming(1, { duration: 600 }),
                ),
                -1,
                false,
            );
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            setSeconds(0);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [visible]);

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
    }));

    const formatTime = (s: number) => {
        const min = Math.floor(s / 60);
        const sec = s % 60;
        return `${min}:${sec.toString().padStart(2, '0')}`;
    };

    const handleSend = useCallback(() => {
        onSend(seconds);
    }, [seconds, onSend]);

    if (!visible) return null;

    return (
        <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
            style={styles.container}
        >
            {/* Cancel */}
            <Pressable
                style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}
                onPress={onCancel}
            >
                <LucideX color={theme.colors.text.secondary} size={22} />
            </Pressable>

            {/* Timer */}
            <View style={styles.center}>
                <View style={styles.recordDot} />
                <Text style={styles.timer}>{formatTime(seconds)}</Text>
            </View>

            {/* Waveform bars simulate */}
            <View style={styles.waveform}>
                {Array.from({ length: 16 }).map((_, i) => (
                    <Animated.View
                        key={i}
                        style={[
                            styles.waveBar,
                            {
                                height: 6 + Math.sin(i * 0.7 + seconds * 0.5) * 14 + Math.random() * 4,
                            },
                        ]}
                    />
                ))}
            </View>

            {/* Delete */}
            <Pressable
                style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}
                onPress={onCancel}
            >
                <LucideTrash2 color={theme.colors.error} size={20} />
            </Pressable>

            {/* Send */}
            <Pressable
                style={({ pressed }) => [styles.sendBtn, pressed && { opacity: 0.7 }]}
                onPress={handleSend}
            >
                <Animated.View style={pulseStyle}>
                    <LucideMic color="#000" size={20} />
                </Animated.View>
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 12,
        paddingBottom: 28,
        backgroundColor: theme.colors.background,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(255,255,255,0.06)',
    },
    actionBtn: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 18,
    },
    pressed: {
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    center: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 8,
        gap: 8,
    },
    recordDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#FF3B30',
    },
    timer: {
        color: theme.colors.text.primary,
        fontSize: 16,
        fontWeight: '600',
        fontVariant: ['tabular-nums'],
        minWidth: 45,
    },
    waveform: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        height: 32,
        marginHorizontal: 12,
    },
    waveBar: {
        width: 3,
        borderRadius: 1.5,
        backgroundColor: 'rgba(255,255,255,0.25)',
    },
    sendBtn: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#FFF',
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
});

export default VoiceRecorder;
