import { LucideChevronLeft, LucideX } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, StatusBar, StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    FadeIn,
    ZoomIn,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';
import PressableScale from '../../components/PressableScale';

const { width, height } = Dimensions.get('window');

const StatusViewerScreen = ({ route, navigation }: any) => {
    const { story: initialStory, stories = [] } = route.params || {};
    const [story, setStory] = useState(initialStory || stories[0]);
    const progress = useSharedValue(0);
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!story) {
        navigation.goBack();
        return null;
    }

    useEffect(() => {
        progress.value = 0;
        progress.value = withTiming(1, {
            duration: 5000,
            easing: Easing.linear
        }, (finished) => {
            if (finished) {
                // In a real app, go to next story or close
                // navigation.goBack();
            }
        });
    }, [currentIndex]);

    const progressStyle = useAnimatedStyle(() => ({
        width: `${progress.value * 100}%`,
    }));

    return (
        <View style={styles.container}>
            <StatusBar hidden />

            {/* Background Image with Zoom Effect */}
            <Animated.View entering={FadeIn.duration(500)} style={styles.imageContainer}>
                <Animated.Image
                    entering={ZoomIn.duration(1000).delay(200)}
                    source={{ uri: story.imageUrl }}
                    style={styles.storyImage}
                    resizeMode="cover"
                />
            </Animated.View>

            {/* Header Overlay */}
            <View style={styles.header}>
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <Animated.View style={[styles.progressFill, progressStyle]} />
                    </View>
                </View>

                <View style={styles.topActions}>
                    <View style={styles.userInfo}>
                        <PressableScale onPress={() => navigation.goBack()}>
                            <LucideChevronLeft color="#FFF" size={28} />
                        </PressableScale>
                        <Image source={{ uri: story.userAvatar }} style={styles.avatar} />
                        <View>
                            <Text style={styles.userName}>{story.userName}</Text>
                            <Text style={styles.timeText}>2h ago</Text>
                        </View>
                    </View>
                    <PressableScale onPress={() => navigation.goBack()} style={styles.closeButton}>
                        <LucideX color="#FFF" size={24} />
                    </PressableScale>
                </View>
            </View>

            {/* Tap areas for navigation (Mock) */}
            <View style={styles.tapContainer}>
                <PressableScale style={styles.tapArea} onPress={() => navigation.goBack()}>
                    <View />
                </PressableScale>
                <PressableScale style={styles.tapArea} onPress={() => navigation.goBack()}>
                    <View />
                </PressableScale>
            </View>

            {/* Reply Caption (Mock) */}
            <View style={styles.footer}>
                <Text style={styles.caption}>Life is beautiful! ✨</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    imageContainer: {
        flex: 1,
    },
    storyImage: {
        width: width,
        height: height,
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingTop: 12,
        paddingHorizontal: 16,
        zIndex: 10,
    },
    progressContainer: {
        flexDirection: 'row',
        height: 3,
        marginBottom: 16,
    },
    progressBar: {
        flex: 1,
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 2,
        overflow: 'hidden',
        marginHorizontal: 2,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#FFF',
    },
    topActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginHorizontal: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    userName: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    timeText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
    },
    closeButton: {
        padding: 4,
    },
    tapContainer: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: 'row',
        zIndex: 5,
    },
    tapArea: {
        flex: 1,
    },
    footer: {
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    caption: {
        color: '#FFF',
        fontSize: 16,
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
});

export default StatusViewerScreen;
