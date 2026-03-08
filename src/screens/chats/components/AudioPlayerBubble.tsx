import { Audio } from 'expo-av';
import { LucidePause, LucidePlay } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';

interface AudioPlayerBubbleProps {
    uri: string;
    duration?: string;
    isMine: boolean;
}

const AudioPlayerBubble: React.FC<AudioPlayerBubbleProps> = ({ uri, isMine }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);

    const waveAnim = useSharedValue(1);

    useEffect(() => {
        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, [sound]);

    const playPause = async () => {
        if (sound) {
            if (isPlaying) {
                await sound.pauseAsync();
                setIsPlaying(false);
                waveAnim.value = withTiming(1);
            } else {
                await sound.playAsync();
                setIsPlaying(true);
                startWaveAnimation();
            }
        } else {
            try {
                const { sound: newSound } = await Audio.Sound.createAsync(
                    { uri },
                    { shouldPlay: true },
                    onPlaybackStatusUpdate
                );
                setSound(newSound);
                setIsPlaying(true);
                startWaveAnimation();
            } catch (error) {
                console.error('Error playing audio', error);
            }
        }
    };

    const onPlaybackStatusUpdate = (status: any) => {
        if (status.isLoaded) {
            setPosition(status.positionMillis);
            setDuration(status.durationMillis || 0);
            if (status.didJustFinish) {
                setIsPlaying(false);
                setPosition(0);
                waveAnim.value = withTiming(1);
            }
        }
    };

    const startWaveAnimation = () => {
        waveAnim.value = withRepeat(
            withSequence(
                withTiming(1.5, { duration: 400 }),
                withTiming(1, { duration: 400 })
            ),
            -1,
            true
        );
    };

    const formatTime = (millis: number) => {
        const totalSeconds = millis / 1000;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const progress = duration > 0 ? (position / duration) * 100 : 0;

    return (
        <View style={[styles.container, isMine ? styles.mine : styles.other]}>
            <Pressable onPress={playPause} style={styles.playButton}>
                {isPlaying ? (
                    <LucidePause size={20} color={isMine ? "#000" : "#FFF"} fill={isMine ? "#000" : "#FFF"} />
                ) : (
                    <LucidePlay size={20} color={isMine ? "#000" : "#FFF"} fill={isMine ? "#000" : "#FFF"} />
                )}
            </Pressable>

            <View style={styles.waveformContainer}>
                <View style={styles.waveform}>
                    {Array.from({ length: 15 }).map((_, i) => (
                        <Animated.View
                            key={i}
                            style={[
                                styles.waveBar,
                                {
                                    height: 4 + Math.random() * 12,
                                    backgroundColor: isMine ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.3)',
                                    opacity: (i / 15) * 100 < progress ? 1 : 0.4
                                },
                                isPlaying && {
                                    height: withRepeat(
                                        withTiming(4 + Math.random() * 16, { duration: 500 }),
                                        -1,
                                        true
                                    )
                                }
                            ]}
                        />
                    ))}
                </View>
                <Text style={[styles.duration, { color: isMine ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.6)' }]}>
                    {formatTime(isPlaying ? position : duration || 0)}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 12,
        minWidth: 180,
    },
    mine: {
        // Transparent as it's inside a bubble
    },
    other: {
        // Transparent as it's inside a bubble
    },
    playButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    waveformContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    waveform: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 20,
        gap: 2,
    },
    waveBar: {
        width: 2,
        borderRadius: 1,
    },
    duration: {
        fontSize: 10,
        marginTop: 2,
        fontVariant: ['tabular-nums'],
    },
});

export default AudioPlayerBubble;
