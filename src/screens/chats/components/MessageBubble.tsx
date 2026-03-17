import { useNavigation } from '@react-navigation/native';
import * as Contacts from 'expo-contacts';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import {
    LucideArrowRight,
    LucideDownload,
    LucideFile,
    LucideMapPin,
    LucidePause,
    LucidePlay,
    LucideStar,
    LucideUser,
    LucidePhone,
    LucideX,
    LucideLock
} from 'lucide-react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as Audio from 'expo-audio';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { Alert, Image, Linking, Pressable, StyleSheet, Text, View, Platform, Modal } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Animated, { FadeIn, Layout as LayoutAnim } from 'react-native-reanimated';
import { useSelector } from 'react-redux';
import PressableScale from '../../../components/PressableScale';
import { API_BASE_URL } from '../../../config/api';
import { RootState } from '../../../store/store';
import { theme } from '../../../theme/theme';
import { Message } from '../../../types';
import AudioPlayerBubble from './AudioPlayerBubble';
import LocationMessageBubble from './LocationMessageBubble';

interface MessageBubbleProps {
    message: Message;
    isMine: boolean;
    isGroup: boolean;
    senderName?: string;
    isFirstInGroup: boolean;
    isLastInGroup: boolean;
    onLongPress: (message: Message) => void;
    replyPreviewText?: string;
    isHighlighted?: boolean;
    searchQuery?: string;
    onSwipeToReply?: (message: Message) => void;
}

const SENDER_COLORS = [
    '#5AC8FA', '#FF9500', '#FF2D55', '#AF52DE',
    '#34C759', '#FF6482', '#64D2FF', '#FFD60A',
];

const getSenderColor = (senderId: string) => {
    let hash = 0;
    for (let i = 0; i < senderId.length; i++) {
        hash = senderId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return SENDER_COLORS[Math.abs(hash) % SENDER_COLORS.length];
};

const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });
};

const StatusTicks = ({ message }: { message: Message }) => {
    if (message.seen) {
        return <Text style={[styles.tick, { color: '#34A0FF' }]}>✓✓</Text>;
    }
    if (message.delivered) {
        return <Text style={[styles.tick, { color: 'rgba(0,0,0,0.35)' }]}>✓✓</Text>;
    }
    return <Text style={[styles.tick, { color: 'rgba(0,0,0,0.35)' }]}>✓</Text>;
};

const VideoBubble: React.FC<{ uri: string; isMine: boolean; onExpand: () => void }> = ({ uri, isMine, onExpand }) => {
    const [fullScreen, setFullScreen] = useState(false);
    const player = useVideoPlayer(uri, (player) => {
        player.loop = true;
        player.muted = false;
    });

    const handlePress = () => {
        setFullScreen(true);
        player.play();
    };

    const handleClose = () => {
        player.pause();
        setFullScreen(false);
    };

    return (
        <View>
            <Pressable onPress={handlePress} style={styles.videoContainer}>
                <VideoView
                    player={player}
                    contentFit="cover"
                    style={styles.inlineVideo}
                    nativeControls={false}
                />
                <View style={styles.videoOverlay}>
                    <View style={styles.playOverlay}>
                        <LucidePlay size={24} color="#FFF" fill="#FFF" />
                    </View>
                </View>
            </Pressable>

            <Modal
                visible={fullScreen}
                transparent={false}
                animationType="fade"
                onRequestClose={handleClose}
            >
                <View style={styles.fullScreenVideoContainer}>
                    <VideoView
                        player={player}
                        allowsFullscreen
                        allowsPictureInPicture
                        contentFit="contain"
                        style={styles.fullScreenVideo}
                    />
                    <Pressable onPress={handleClose} style={styles.closeBtn}>
                        <LucideX color="#FFF" size={30} />
                    </Pressable>
                </View>
            </Modal>
        </View>
    );
};

const MediaContent: React.FC<{ message: Message; isMine: boolean }> = ({ message, isMine }) => {
    const navigation = useNavigation<any>();
    const currentUserId = useSelector((state: RootState) => state.auth.user?.id);

    const iconColor = isMine ? 'rgba(0,0,0,0.6)' : theme.colors.text.secondary;
    const mediaUrl = useMemo(() => {
        if (message.mediaUrl) {
            let url = message.mediaUrl;
            if (url.startsWith('http://') || url.startsWith('https://')) {
                if (__DEV__ && url.includes('localhost')) {
                    const hostPart = API_BASE_URL.split('://')[1]?.split(':')[0];
                    if (hostPart && hostPart !== 'localhost') {
                        url = url.replace('localhost', hostPart);
                    }
                }
                return url;
            }
            return `${API_BASE_URL}${message.mediaUrl}`;
        }
        return message.mediaUri;
    }, [message.mediaUrl, message.mediaUri]);

    const handleDownload = useCallback(async () => {
        if (!mediaUrl) return;
        try {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Storage permission is required to download files.');
                return;
            }

            const filename = mediaUrl.split('/').pop() || `download_${Date.now()}`;
            const localUri = `${FileSystem.documentDirectory}${filename}`;

            const downloadResult = await FileSystem.downloadAsync(mediaUrl, localUri);
            if (downloadResult.status === 200) {
                await MediaLibrary.saveToLibraryAsync(downloadResult.uri);
                Alert.alert('Downloaded', 'File saved to your device.');
            } else {
                Alert.alert('Error', 'Download failed.');
            }
        } catch (err) {
            console.error('Download failed:', err);
            Alert.alert('Error', 'Could not download the file.');
        }
    }, [mediaUrl]);

    const handleMediaPress = useCallback(async () => {
        if (message.type === 'IMAGE' || message.type === 'GIF') {
            navigation.navigate('MediaPreview', {
                uri: mediaUrl,
                type: message.type
            });
        } else if (message.type === 'VIDEO') {
            navigation.navigate('MediaPreview', {
                uri: mediaUrl,
                type: 'VIDEO'
            });
        } else if ((message.type === 'DOCUMENT' || message.type === 'FILE') && mediaUrl) {
            // Document open logic for sender and general tap
            if (mediaUrl.startsWith('http') || mediaUrl.startsWith('https')) {
                Linking.openURL(mediaUrl).catch(err => {
                    console.error('Failed to open URL:', err);
                    Alert.alert('Error', 'Could not open document.');
                });
            } else {
                try {
                    const filename = message.fileName || mediaUrl.split('/').pop() || `file_${Date.now()}`;
                    const localUri = `${FileSystem.cacheDirectory}${filename}`;

                    const downloadResult = await FileSystem.downloadAsync(mediaUrl, localUri);
                    if (downloadResult.status === 200) {
                        const isAvailable = await Sharing.isAvailableAsync();
                        if (isAvailable) {
                            await Sharing.shareAsync(downloadResult.uri);
                        } else {
                            Alert.alert('Error', 'Sharing is not available on this device.');
                        }
                    } else {
                        Alert.alert('Error', 'Failed to download the file.');
                    }
                } catch (err) {
                    console.error('File open failed:', err);
                    Alert.alert('Error', 'Could not open the file.');
                }
            }
        }
    }, [message.type, message.fileName, mediaUrl, navigation]);

    if (message.type === 'IMAGE' || message.type === 'GIF') {
        return (
            <Pressable onPress={handleMediaPress} style={styles.imageContainer}>
                {mediaUrl ? (
                    <Image
                        source={{ uri: mediaUrl }}
                        style={styles.chatImage}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.mediaPlaceholder}>
                        <LucidePlay color={iconColor} size={32} />
                        <Text style={[styles.mediaLabel, { color: iconColor, marginTop: 8 }]}>
                            {message.type === 'GIF' ? 'GIF' : 'Photo'}
                        </Text>
                    </View>
                )}
                <View style={styles.mediaLabelContainer}>
                    <Text style={styles.mediaLabel}>
                        {message.type === 'GIF' ? 'GIF' : 'Photo'}
                    </Text>
                </View>
            </Pressable>
        );
    }

    if (message.type === 'VIDEO') {
        return (
            <VideoBubble 
                uri={mediaUrl || ''} 
                isMine={isMine} 
                onExpand={handleMediaPress} 
            />
        );
    }

    switch (message.type) {
        case 'AUDIO':
        case 'VOICE':
            return (
                <AudioPlayerBubble
                    uri={mediaUrl || ''}
                    voiceDuration={message.voiceDuration}
                    isMine={isMine}
                />
            );
        case 'DOCUMENT':
        case 'FILE':
            return (
                <Pressable onPress={handleMediaPress}>
                    <View style={[styles.documentCard, { backgroundColor: isMine ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)' }]}>
                        <View style={styles.documentContainer}>
                            <View style={[styles.docIcon, { backgroundColor: '#FF3B30' }]}>
                                <LucideFile color="#FFF" size={20} strokeWidth={2.5} />
                            </View>
                            <View style={styles.docInfo}>
                                <Text style={[styles.docName, { color: isMine ? '#000' : '#FFF' }]} numberOfLines={1}>
                                    {message.fileName || message.content || 'Document'}
                                </Text>
                                <Text style={[styles.docSize, { color: isMine ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)' }]}>
                                    {message.fileSize ? (Number(message.fileSize) / 1024).toFixed(1) + ' KB' : 'PDF Document'}
                                </Text>
                            </View>
                            {!isMine && (
                                <PressableScale style={styles.downloadBtn} onPress={handleDownload}>
                                    <LucideDownload color={isMine ? "#000" : "#5AC8FA"} size={20} />
                                </PressableScale>
                            )}
                        </View>
                    </View>
                </Pressable>
            );
        case 'LOCATION':
        case 'LIVE_LOCATION':
            return <LocationMessageBubble message={message} isMine={isMine} />;
        case 'CONTACT': {
            let contactData = null;
            try { contactData = message.content ? JSON.parse(message.content) : null; } catch (_e) { }

            return (
                <View style={[styles.contactCard, { backgroundColor: isMine ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)' }]}>
                    <View style={styles.contactHeader}>
                      <View style={[styles.contactAvatar, { backgroundColor: '#5AC8FA' }]}>
                          <LucideUser color="#FFF" size={24} />
                      </View>
                      <View style={styles.contactInfo}>
                          <Text style={[styles.contactName, { color: isMine ? '#000' : '#FFF' }]}>
                              {contactData?.name || message.contactName || 'Contact'}
                          </Text>
                          <Text style={[styles.contactPhone, { color: isMine ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)' }]}>
                              {contactData?.phoneNumber || message.contactPhone || ''}
                          </Text>
                      </View>
                    </View>
                    <View style={styles.contactDivider} />
                    <PressableScale 
                        style={styles.messageContactBtn} 
                        onPress={() => {
                            const phone = contactData?.phoneNumber || message.contactPhone;
                            if (phone) Linking.openURL(`tel:${phone}`);
                        }}
                    >
                        <Text style={styles.messageContactText}>Message</Text>
                    </PressableScale>
                </View>
            );
        }
        case 'LINK': {
            const meta = message.metadata || {};
            const linkUrl = meta.url || message.url || message.content || '';
            const linkTitle = meta.title || message.linkTitle || '';
            const linkDesc = meta.description || message.linkDescription || '';
            const linkImg = meta.image || message.linkImage || '';

            return (
                <PressableScale
                    onPress={() => {
                        if (linkUrl) Linking.openURL(linkUrl);
                    }}
                    style={styles.linkContainer}
                >
                    {linkImg ? (
                        <Image source={{ uri: linkImg }} style={styles.linkImage} resizeMode="cover" />
                    ) : null}
                    <View style={styles.linkInfo}>
                        {linkTitle ? (
                            <Text style={[styles.linkTitle, { color: isMine ? '#000' : theme.colors.text.primary }]} numberOfLines={2}>
                                {linkTitle}
                            </Text>
                        ) : null}
                        {linkDesc ? (
                            <Text style={[styles.linkDesc, { color: isMine ? 'rgba(0,0,0,0.6)' : theme.colors.text.secondary }]} numberOfLines={3}>
                                {linkDesc}
                            </Text>
                        ) : null}
                        <Text style={[styles.linkUrl, { color: '#5AC8FA' }]} numberOfLines={1}>
                            {linkUrl}
                        </Text>
                    </View>
                </PressableScale>
            );
        }
        default:
            return null;
    }
};

const MessageBubble: React.FC<MessageBubbleProps> = React.memo(({
    message,
    isMine,
    isGroup,
    senderName,
    isFirstInGroup,
    isLastInGroup,
    onLongPress,
    replyPreviewText,
    isHighlighted = false,
    searchQuery = '',
    onSwipeToReply,
}) => {
    const handleLongPress = useCallback(() => {
        onLongPress(message);
    }, [message, onLongPress]);

    const bubbleRadius = {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomLeftRadius: isMine ? 20 : (isLastInGroup ? 4 : 20),
        borderBottomRightRadius: isMine ? (isLastInGroup ? 4 : 20) : 20,
    };

    const spacing = isFirstInGroup ? 10 : 2;

    const renderLeftActions = () => {
        return (
            <View style={styles.replyActionContainer}>
                <View style={styles.replyActionIcon}>
                    <LucideArrowRight color={theme.colors.text.secondary} size={20} style={{ transform: [{ scaleX: -1 }] }} />
                </View>
            </View>
        );
    };

    return (
        <Swipeable
            renderLeftActions={renderLeftActions}
            friction={2}
            leftThreshold={40}
            overshootLeft={false}
            onSwipeableWillOpen={() => {
                if (onSwipeToReply) {
                    onSwipeToReply(message);
                }
            }}
            containerStyle={{ overflow: 'visible' }}
        >
            <Animated.View
                entering={FadeIn.duration(350)}
                layout={LayoutAnim.springify().damping(18).stiffness(200)}
                style={[
                    styles.container,
                    isMine ? styles.containerMine : styles.containerOther,
                    { marginTop: spacing },
                    isHighlighted && styles.containerHighlighted,
                ]}
            >
                <PressableScale
                    onLongPress={handleLongPress}
                    delayLongPress={350}
                    scaleTo={0.96}
                    style={[
                        styles.bubble,
                        isMine ? styles.bubbleMine : styles.bubbleOther,
                        bubbleRadius,
                    ]}
                >
                    {(message.isStarred || message.starred) && (
                        <View style={styles.starBadge}>
                            <LucideStar color="#FFD60A" size={10} fill="#FFD60A" />
                        </View>
                    )}

                    {message.forwarded && (
                        <View style={styles.forwardedIndicator}>
                            <LucideArrowRight color={theme.colors.text.secondary} size={12} />
                            <Text style={styles.forwardedText}>Forwarded</Text>
                        </View>
                    )}

                    {isGroup && !isMine && isFirstInGroup && senderName && (
                        <Text style={[styles.senderName, { color: getSenderColor(message.senderId) }]}>
                            {senderName}
                        </Text>
                    )}

                    {replyPreviewText && (
                        <View style={[styles.replyPreview, { borderLeftColor: isMine ? 'rgba(0,0,0,0.2)' : '#5AC8FA' }]}>
                            <Text style={[styles.replyText, { color: isMine ? 'rgba(0,0,0,0.55)' : theme.colors.text.secondary }]} numberOfLines={1}>
                                {replyPreviewText}
                            </Text>
                        </View>
                    )}

                    {message.type !== 'TEXT' && <MediaContent message={message} isMine={isMine} />}

                    {message.content && !['IMAGE', 'VIDEO', 'LOCATION', 'LIVE_LOCATION', 'CONTACT', 'AUDIO', 'VOICE', 'DOCUMENT', 'FILE', 'GIF', 'LINK'].includes(message.type || '') && (
                        <View style={styles.textWithLock}>
                            {message.isEncrypted && (
                                <LucideLock 
                                    size={12} 
                                    color={isMine ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)'} 
                                    style={{ marginRight: 6, marginTop: 4 }} 
                                />
                            )}
                            <Text
                                style={[
                                    styles.text,
                                    isMine ? styles.textMine : styles.textOther,
                                    (message.content === 'This message was deleted' || message.decryptionFailed) && { fontStyle: 'italic', opacity: 0.6 }
                                ]}
                            >
                                {(() => {
                                    if (!searchQuery || !message.content.toLowerCase().includes(searchQuery.toLowerCase())) {
                                        return message.content;
                                    }
                                    const parts = message.content.split(new RegExp(`(${searchQuery})`, 'gi'));
                                    return parts.map((part, i) => (
                                        part.toLowerCase() === searchQuery.toLowerCase() ? (
                                            <Text key={i} style={styles.highlight}>{part}</Text>
                                        ) : part
                                    ));
                                })()}
                            </Text>
                        </View>
                    )}

                    <View style={styles.footer}>
                        {message.edited && (
                            <Text style={[styles.time, { color: isMine ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.28)', fontStyle: 'italic', marginRight: 4 }]}>
                                (edited)
                            </Text>
                        )}
                        <Text style={[styles.time, { color: isMine ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.35)' }]}>
                            {formatTime(message.timestamp)}
                        </Text>
                        {isMine && <StatusTicks message={message} />}
                    </View>

                    {message.reactions && Object.keys(message.reactions).length > 0 && (
                        <View style={[
                            styles.reactionsContainer,
                            isMine ? styles.reactionsMine : styles.reactionsOther
                        ]}>
                            {(() => {
                                const emojiCounts: Record<string, number> = {};
                                Object.values(message.reactions!).forEach((emoji: any) => {
                                    emojiCounts[emoji] = (emojiCounts[emoji] || 0) + 1;
                                });
                                return Object.entries(emojiCounts).map(([emoji, count]) => (
                                    <View key={emoji} style={styles.reactionBadge}>
                                        <Text style={styles.reactionText}>{emoji}</Text>
                                        <Text style={styles.reactionCount}>{count}</Text>
                                    </View>
                                ));
                            })()}
                        </View>
                    )}
                </PressableScale>
            </Animated.View>
        </Swipeable>
    );
});

const styles = StyleSheet.create({
    replyActionContainer: {
        width: 60,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    replyActionIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        maxWidth: '80%',
        marginHorizontal: 14,
    },
    containerMine: {
        alignSelf: 'flex-end',
    },
    containerOther: {
        alignSelf: 'flex-start',
    },
    containerHighlighted: {
        backgroundColor: 'rgba(90,200,250,0.12)',
        borderRadius: 20,
    },
    bubble: {
        paddingHorizontal: 14,
        paddingTop: 10,
        paddingBottom: 6,
    },
    bubbleMine: {
        backgroundColor: '#FFFFFF',
        elevation: 5,
    },
    bubbleOther: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1.2,
        borderColor: 'rgba(255, 255, 255, 0.12)',
        overflow: 'hidden',
    },
    starBadge: {
        position: 'absolute',
        top: 6,
        right: 6,
    },
    forwardedIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 4,
    },
    forwardedText: {
        fontSize: 12,
        fontStyle: 'italic',
        color: theme.colors.text.secondary,
    },
    senderName: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 3,
        letterSpacing: 0.2,
    },
    replyPreview: {
        borderLeftWidth: 3,
        paddingLeft: 8,
        paddingVertical: 4,
        marginBottom: 6,
        borderRadius: 2,
    },
    replyText: {
        fontSize: 13,
        fontWeight: '400',
    },
    text: {
        fontSize: 15.5,
        lineHeight: 21,
        letterSpacing: 0.05,
    },
    textMine: {
        color: '#000000',
    },
    textOther: {
        color: '#FFFFFF',
    },
    textWithLock: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 4,
        gap: 4,
    },
    time: {
        fontSize: 10.5,
        fontWeight: '400',
    },
    highlight: {
        backgroundColor: '#FFD60A',
        color: '#000000',
        borderRadius: 2,
    },
    tick: {
        fontSize: 11,
        fontWeight: '600',
    },
    imageContainer: {
        width: 260,
        height: 260,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 4,
    },
    videoContainer: {
        width: 260,
        height: 260,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 4,
        backgroundColor: '#000',
    },
    inlineVideo: {
        width: '100%',
        height: '100%',
    },
    chatImage: {
        width: '100%',
        height: '100%',
    },
    mediaPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(128,128,128,0.08)',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mediaLabelContainer: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    mediaLabel: {
        fontSize: 10,
        color: '#FFF',
        fontWeight: '600',
    },
    playOverlay: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    documentCard: {
        width: 240,
        borderRadius: 12,
        padding: 10,
        marginBottom: 4,
    },
    documentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    docIcon: {
        width: 40,
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    docInfo: {
        flex: 1,
    },
    docName: {
        fontSize: 14,
        fontWeight: '500',
    },
    docSize: {
        fontSize: 11,
        marginTop: 2,
    },
    downloadBtn: {
        padding: 8,
    },
    contactCard: {
        width: 240,
        borderRadius: 12,
        padding: 12,
        marginBottom: 4,
    },
    contactHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    contactAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contactInfo: {
        flex: 1,
    },
    contactName: {
        fontSize: 16,
        fontWeight: '600',
    },
    contactPhone: {
        fontSize: 13,
        marginTop: 2,
    },
    contactDivider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginVertical: 10,
    },
    messageContactBtn: {
        paddingVertical: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    messageContactText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#5AC8FA',
    },
    reactionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        position: 'absolute',
        bottom: -10,
        gap: 4,
    },
    reactionsMine: {
        right: 14,
    },
    reactionsOther: {
        left: 14,
    },
    reactionBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2C2C2E',
        borderRadius: 12,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderWidth: 1.5,
        borderColor: '#1C1C1E',
        gap: 3,
    },
    reactionText: {
        fontSize: 12,
    },
    reactionCount: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '600',
    },
    linkContainer: {
        marginBottom: 4,
        borderRadius: 10,
        overflow: 'hidden',
        width: 240,
    },
    linkImage: {
        width: '100%',
        height: 140,
    },
    linkInfo: {
        paddingTop: 8,
        paddingHorizontal: 4,
        gap: 2,
    },
    linkTitle: {
        fontSize: 14,
        fontWeight: '600',
    },
    linkDesc: {
        fontSize: 12,
        lineHeight: 16,
    },
    linkUrl: {
        fontSize: 11,
        marginTop: 2,
    },
    fullScreenVideoContainer: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
    },
    fullScreenVideo: {
        width: '100%',
        height: '100%',
    },
    closeBtn: {
        position: 'absolute',
        top: 40,
        right: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
});

export default MessageBubble;
