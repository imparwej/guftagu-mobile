import { AudioModule, RecordingPresets, useAudioRecorder } from 'expo-audio';
import { LucideMic, LucideTrash2, LucideX } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
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
    onSend: (duration: number, uri: string) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ visible, onCancel, onSend }) => {
    const [seconds, setSeconds] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
    const pulseScale = useSharedValue(1);

    useEffect(() => {
        if (visible) {
            startRecording();
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
            stopRecordingCleanup();
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [visible]);

    const startRecording = async () => {
        try {
            const permission = await AudioModule.requestRecordingPermissionsAsync();
            if (!permission.granted) {
                Alert.alert('Permission needed', 'Microphone access is required to record audio.');
                onCancel();
                return;
            }

            await AudioModule.setAudioModeAsync({
                allowsRecording: true,
                playsInSilentMode: true,
            });

            await audioRecorder.prepareToRecordAsync();
            audioRecorder.record();
        } catch (err) {
            console.error('Failed to start recording:', err);
            onCancel();
        }
    };

    const stopRecordingCleanup = async () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        try {
            if (audioRecorder.isRecording) {
                await audioRecorder.stop();
            }
        } catch (e) {
            // Already stopped
        }
        setSeconds(0);
    };

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
    }));

    const formatTime = (s: number) => {
        const min = Math.floor(s / 60);
        const sec = s % 60;
        return `${min}:${sec.toString().padStart(2, '0')}`;
    };

    const handleSend = useCallback(async () => {
        try {
            if (audioRecorder.isRecording) {
                await audioRecorder.stop();
            }
            const uri = audioRecorder.uri;

            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }

            if (uri) {
                onSend(seconds, uri);
            } else {
                onCancel();
            }
        } catch (err) {
            console.error('Failed to stop recording:', err);
            onCancel();
        }
    }, [seconds, onSend, onCancel, audioRecorder]);

    const handleCancel = useCallback(async () => {
        await stopRecordingCleanup();
        onCancel();
    }, [onCancel]);

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
                onPress={handleCancel}
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
                onPress={handleCancel}
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
