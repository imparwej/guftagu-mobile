import { LucideLock, LucideX } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, Image, Pressable, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    cancelAnimation,
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import PressableScale from '../../components/PressableScale';
import { addChat, setActiveChat } from '../../store/slices/chatSlice';
import { addViewer, markStoryViewed } from '../../store/slices/statusSlice';
import { RootState } from '../../store/store';
import { theme } from '../../theme/theme';

const { width, height } = Dimensions.get('window');
const STORY_DURATION = 5000;

const StatusViewerScreen = ({ route, navigation }: any) => {
    const { stories = [], user } = route.params || {};
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const progress = useSharedValue(0);
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();
    const { chats } = useSelector((state: RootState) => state.chat);
    const currentUser = useSelector((state: RootState) => state.auth.user);

    const story = stories[currentIndex];
    const isLastStory = currentIndex === stories.length - 1;

    if (!story) {
        navigation.goBack();
        return null;
    }

    const startAnimation = useCallback(() => {
        progress.value = 0;
        progress.value = withTiming(1, {
            duration: STORY_DURATION,
            easing: Easing.linear
        }, (finished) => {
            if (finished) {
                runOnJS(handleNextStory)();
            }
        });
    }, [currentIndex]);

    useEffect(() => {
        if (!isPaused) {
            startAnimation();
        } else {
            cancelAnimation(progress);
        }

        // Mark as viewed locally
        dispatch(markStoryViewed(story.id));

        // Record viewer if it's someone else's story
        if (story.userId !== currentUser?.id) {
            dispatch(addViewer({ storyId: story.id, userId: currentUser?.id || 'me' }));
        }
    }, [currentIndex, isPaused, currentUser?.id]);

    const handleNextStory = () => {
        if (currentIndex < stories.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            navigation.goBack();
        }
    };

    const handlePrevStory = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        } else {
            navigation.goBack();
        }
    };

    const handlePressIn = () => {
        setIsPaused(true);
    };

    const handlePressOut = () => {
        setIsPaused(false);
    };

    const handleOpenChat = () => {
        setIsPaused(true);

        // Check if chat exists, if not create it
        let chat = chats.find((c: any) => c.participants.includes(user.userId) && !c.isGroup);

        if (!chat) {
            chat = {
                id: `new_${Date.now()}`,
                participants: ['1', user.userId],
                type: 'individual',
                name: user.name,
                avatar: user.avatar,
                unreadCount: 0,
                isGroup: false,
            } as any;
            dispatch(addChat(chat as any));
        }

        dispatch(setActiveChat(chat!.id));

        // Navigate to the global Chat screen
        navigation.navigate('Chat');
    };

    const progressStyle = useAnimatedStyle(() => ({
        width: `${progress.value * 100}%`,
    }));

    const renderMedia = () => {
        if (story.mediaType === 'text') {
            return (
                <View style={[styles.textStoryContainer, { backgroundColor: story.backgroundColor || '#075E54' }]}>
                    <Text style={styles.textStoryContent}>{story.text}</Text>
                </View>
            );
        }
        return (
            <Image
                source={{ uri: story.mediaUri }}
                style={styles.storyImage}
                resizeMode="cover"
            />
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar hidden />

            {/* Background Media */}
            <View style={styles.mediaWrapper}>
                {renderMedia()}
            </View>

            {/* Header Overlay */}
            <View style={[styles.header, { paddingTop: insets.top || 12 }]}>
                {/* Multi-story progress bars */}
                <View style={styles.progressContainer}>
                    {stories.map((_: any, index: number) => (
                        <View key={index} style={styles.progressBar}>
                            <Animated.View
                                style={[
                                    styles.progressFill,
                                    index === currentIndex && progressStyle,
                                    index < currentIndex && { width: '100%' },
                                    index > currentIndex && { width: '0%' }
                                ]}
                            />
                        </View>
                    ))}
                </View>

                <View style={styles.topActions}>
                    <TouchableOpacity style={styles.userInfo} onPress={handleOpenChat}>
                        <Image source={{ uri: user.avatar }} style={styles.avatar} />
                        <View>
                            <Text style={styles.userName}>{user.name}</Text>
                            <Text style={styles.timeText}>
                                {new Date(story.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <PressableScale onPress={() => navigation.goBack()} style={styles.closeButton}>
                        <LucideX color="#FFF" size={28} />
                    </PressableScale>
                </View>
            </View>

            {/* Tap areas for navigation */}
            <View style={styles.tapContainer}>
                <Pressable
                    style={styles.tapArea}
                    onPress={handlePrevStory}
                    onLongPress={handlePressIn}
                    onPressOut={handlePressOut}
                    delayLongPress={200}
                />
                <Pressable
                    style={styles.tapArea}
                    onPress={handleNextStory}
                    onLongPress={handlePressIn}
                    onPressOut={handlePressOut}
                    delayLongPress={200}
                />
            </View>

            {/* Footer with Caption or Encrypted Label */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                {story.caption ? (
                    <Text style={styles.caption}>{story.caption}</Text>
                ) : null}

                <View style={styles.encryptionBadge}>
                    <LucideLock size={12} color="rgba(255,255,255,0.5)" />
                    <Text style={styles.encryptionText}>End-to-end encrypted</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    mediaWrapper: {
        flex: 1,
    },
    storyImage: {
        width: width,
        height: height,
    },
    textStoryContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    textStoryContent: {
        color: '#FFF',
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        zIndex: 100,
    },
    progressContainer: {
        flexDirection: 'row',
        height: 3,
        marginBottom: 16,
    },
    progressBar: {
        flex: 1,
        height: 2,
        backgroundColor: 'rgba(255,255,255,0.25)',
        borderRadius: 1,
        overflow: 'hidden',
        marginHorizontal: 1.5,
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
        width: 42,
        height: 42,
        borderRadius: 21,
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    userName: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    timeText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        marginTop: 1,
    },
    closeButton: {
        padding: 4,
    },
    tapContainer: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: 'row',
        zIndex: 50,
    },
    tapArea: {
        flex: 1,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: 20,
        zIndex: 100,
    },
    caption: {
        color: '#FFF',
        fontSize: 17,
        textAlign: 'center',
        marginBottom: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    encryptionBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    encryptionText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 11,
        fontWeight: '500',
    },
});

export default StatusViewerScreen;
