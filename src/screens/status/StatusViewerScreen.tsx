import { LucideChevronLeft, LucideLock, LucideMoreVertical, LucideX } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, Image, Pressable, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    cancelAnimation,
    Easing,
    FadeIn,
    FadeOut,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import PressableScale from '../../components/PressableScale';
import { addChat, setActiveChat } from '../../store/slices/chatSlice';
import { addViewer, markStoryViewed } from '../../store/slices/statusSlice';
import { RootState } from '../../store/store';

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

    const currentStory = stories[currentIndex];

    const handleNextStory = useCallback(() => {
        if (currentIndex < stories.length - 1) {
            setCurrentIndex(currentIndex + 1);
            progress.value = 0;
        } else {
            navigation.goBack();
        }
    }, [currentIndex, stories.length, navigation]);

    const handlePrevStory = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            progress.value = 0;
        } else {
            navigation.goBack();
        }
    }, [currentIndex, navigation]);

    useEffect(() => {
        if (!isPaused) {
            progress.value = withTiming(1, {
                duration: STORY_DURATION * (1 - progress.value),
                easing: Easing.linear
            }, (finished) => {
                if (finished) {
                    runOnJS(handleNextStory)();
                }
            });
        } else {
            cancelAnimation(progress);
        }

        if (currentStory) {
            dispatch(markStoryViewed(currentStory.id));
            if (currentStory.userId !== currentUser?.id) {
                dispatch(addViewer({ storyId: currentStory.id, userId: currentUser?.id || 'me' }));
            }
        }

        return () => cancelAnimation(progress);
    }, [currentIndex, isPaused, currentStory, currentUser?.id, handleNextStory]);

    const handleOpenChat = () => {
        setIsPaused(true);
        let chat = chats.find((c: any) => c.participants.includes(user.userId) && !c.isGroup);
        if (!chat) {
            chat = {
                id: `new_${Date.now()}`,
                participants: [currentUser?.id || '1', user.userId],
                type: 'individual',
                name: user.name,
                avatar: user.avatar,
                unreadCount: 0,
                isGroup: false,
            } as any;
            dispatch(addChat(chat as any));
        }
        dispatch(setActiveChat(chat!.id));
        navigation.navigate('Chat');
    };

    const StoryProgressBar = ({ index, currentIndex, progress }: any) => {
        const animatedStyle = useAnimatedStyle(() => {
            if (index === currentIndex) {
                return { width: `${progress.value * 100}%` };
            } else if (index < currentIndex) {
                return { width: '100%' };
            } else {
                return { width: '0%' };
            }
        });

        return (
            <View style={styles.progressBar}>
                <Animated.View style={[styles.progressFill, animatedStyle]} />
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar hidden />

            {/* Background Content with Transitions */}
            <View style={StyleSheet.absoluteFill}>
                {currentStory?.mediaType === 'image' ? (
                    <Animated.Image
                        key={currentIndex}
                        source={{ uri: currentStory.mediaUri }}
                        style={styles.storyImage}
                        resizeMode="cover"
                        entering={FadeIn.duration(400)}
                        exiting={FadeOut.duration(300)}
                    />
                ) : (
                    <Animated.View
                        key={currentIndex}
                        style={[styles.textStoryContainer, { backgroundColor: currentStory?.backgroundColor || '#000' }]}
                        entering={FadeIn.duration(400)}
                        exiting={FadeOut.duration(300)}
                    >
                        <Text style={styles.textStoryContent}>{currentStory?.text}</Text>
                    </Animated.View>
                )}
            </View>

            {/* Top Gradient for visibility */}
            <View style={styles.topGradient} />

            {/* Header Overlay */}
            <SafeAreaView style={styles.header} edges={['top']}>
                <View style={styles.progressContainer}>
                    {stories.map((_: any, index: number) => (
                        <StoryProgressBar
                            key={index}
                            index={index}
                            currentIndex={currentIndex}
                            progress={progress}
                        />
                    ))}
                </View>

                <View style={styles.topActions}>
                    <PressableScale style={styles.userInfo} onPress={handleOpenChat}>
                        <LucideChevronLeft color="#FFF" size={28} />
                        <Image source={{ uri: user.avatar }} style={styles.avatar} />
                        <View>
                            <Text style={styles.userName}>{user.name}</Text>
                            <Text style={styles.timeText}>
                                {new Date(currentStory?.timestamp || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </View>
                    </PressableScale>
                    <TouchableOpacity style={styles.moreBtn}>
                        <LucideMoreVertical color="#FFF" size={24} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* Tap areas for navigation */}
            <View style={styles.tapContainer}>
                <Pressable
                    style={styles.tapArea}
                    onPress={handlePrevStory}
                    onLongPress={() => setIsPaused(true)}
                    onPressOut={() => setIsPaused(false)}
                    delayLongPress={200}
                />
                <Pressable
                    style={styles.tapArea}
                    onPress={handleNextStory}
                    onLongPress={() => setIsPaused(true)}
                    onPressOut={() => setIsPaused(false)}
                    delayLongPress={200}
                />
            </View>

            {/* Footer */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                {currentStory?.caption && (
                    <Text style={styles.caption}>{currentStory.caption}</Text>
                )}

                <View style={styles.encryptionBadge}>
                    <LucideLock size={12} color="rgba(255,255,255,0.5)" />
                    <Text style={styles.encryptionText}>End-to-end encrypted</Text>
                </View>
            </View>

            <TouchableOpacity
                style={[styles.closeBtn, { top: insets.top + 50 }]}
                onPress={() => navigation.goBack()}
            >
                <LucideX color="#FFF" size={30} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
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
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 10,
    },
    topGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 140,
        backgroundColor: 'rgba(0,0,0,0.35)',
        zIndex: 10,
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
        paddingTop: 10,
        height: 13,
    },
    progressBar: {
        flex: 1,
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.25)',
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
        marginTop: 10,
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
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    userName: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    timeText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        marginTop: 1,
    },
    moreBtn: {
        padding: 8,
    },
    closeBtn: {
        position: 'absolute',
        right: 20,
        zIndex: 110,
        padding: 5,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 20,
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
        backgroundColor: 'rgba(0,0,0,0.4)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        overflow: 'hidden',
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
