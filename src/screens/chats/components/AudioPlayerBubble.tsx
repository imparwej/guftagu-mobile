import * as Audio from 'expo-audio';
import { LucidePause, LucidePlay } from 'lucide-react-native';
import React, { useEffect, useState, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';

interface AudioPlayerBubbleProps {
    uri: string;
    voiceDuration?: number;
    isMine: boolean;
}

const AudioPlayerBubble: React.FC<AudioPlayerBubbleProps> = ({ uri, voiceDuration, isMine }) => {
    const player = Audio.useAudioPlayer(uri);
    const status = Audio.useAudioPlayerStatus(player);
    const [duration, setDuration] = useState(0);
    const [position, setPosition] = useState(0);

    const waveAnim = useSharedValue(1);

    useEffect(() => {
        if (status.playing) {
            waveAnim.value = withRepeat(
                withSequence(
                    withTiming(1.5, { duration: 400 }),
                    withTiming(1, { duration: 400 })
                ),
                -1,
                true
            );
        } else {
            waveAnim.value = withTiming(1);
        }
    }, [status.playing]);

    useEffect(() => {
        if (status.duration) {
            setDuration(status.duration);
        }
        if (status.currentTime) {
            setPosition(status.currentTime);
        }
    }, [status.duration, status.currentTime]);

    const playPause = () => {
        if (status.playing) {
            player.pause();
        } else {
            player.play();
        }
    };

    const formatTime = (secondsTotal: number) => {
        const totalSeconds = isNaN(secondsTotal) ? 0 : Math.floor(secondsTotal);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const progress = duration > 0 ? (position / duration) * 100 : 0;

    return (
        <View style={[styles.container, isMine ? styles.mine : styles.other]}>
            <Pressable onPress={playPause} style={styles.playButton}>
                {status.playing ? (
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
                                status.playing && {
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
                    {formatTime(status.playing ? position : ((duration) || voiceDuration || 0))}
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
