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
    LucideStar,
    LucideUser
} from 'lucide-react-native';
import React, { useCallback, useMemo } from 'react';
import { Alert, Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Animated, { FadeIn, Layout as LayoutAnim } from 'react-native-reanimated';
import { useSelector } from 'react-redux';
import PressableScale from '../../../components/PressableScale';
import { API_BASE_URL } from '../../../config/api';
import { RootState } from '../../../store/store';
import { theme } from '../../../theme/theme';
import { Message } from '../../../types';
import AudioPlayerBubble from './AudioPlayerBubble';
import LiveLocationBubble from './LiveLocationBubble';

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

const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00';
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
};

const StatusTicks = ({ message }: { message: Message }) => {
    if (message.seen) {
        return <Text style={[styles.tick, { color: '#34A0FF' }]}>✓✓</Text>;
    }
    if (message.delivered) {
        return <Text style={[styles.tick, { color: 'rgba(0,0,0,0.35)' }]}>✓✓</Text>;
    }
    // Sent but not yet delivered
    return <Text style={[styles.tick, { color: 'rgba(0,0,0,0.35)' }]}>✓</Text>;
};

const MediaContent: React.FC<{ message: Message; isMine: boolean }> = ({ message, isMine }) => {
    const navigation = useNavigation<any>();
    const currentUserId = useSelector((state: RootState) => state.auth.user?.id);

    const iconColor = isMine ? 'rgba(0,0,0,0.6)' : theme.colors.text.secondary;
    const mediaUrl = useMemo(() => {
        if (message.mediaUrl) {
            if (message.mediaUrl.startsWith('http://') || message.mediaUrl.startsWith('https://')) {
                return message.mediaUrl;
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
        } else if (message.type === 'DOCUMENT' && mediaUrl) {
            // Download file locally then open with share sheet
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
    }, [message.type, message.fileName, mediaUrl, navigation]);

    if (message.type === 'IMAGE' || message.type === 'GIF') {
        return (
            <Pressable onPress={handleMediaPress} style={styles.imageContainer}>
                {mediaUrl ? (
                    <Image
                        source={{ uri: mediaUrl }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.mediaPlaceholder}>
                        <Text style={[styles.mediaLabel, { color: iconColor }]}>
                            {message.type === 'GIF' ? 'GIF' : 'Photo'}
                        </Text>
                    </View>
                )}
                <View style={styles.mediaLabelContainer}>
                    <Text style={styles.mediaLabel}>{message.type === 'GIF' ? 'GIF' : 'Photo'}</Text>
                </View>
            </Pressable>
        );
    }

    switch (message.type) {
        case 'AUDIO':
            return (
                <AudioPlayerBubble
                    uri={mediaUrl || ''}
                    isMine={isMine}
                />
            );
        case 'DOCUMENT':
            return (
                <Pressable onPress={handleMediaPress} style={styles.documentContainer}>
                    <View style={[styles.docIcon, { backgroundColor: isMine ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.06)' }]}>
                        <LucideFile color={iconColor} size={22} />
                    </View>
                    <View style={styles.docInfo}>
                        <Text style={[styles.docName, { color: isMine ? '#000' : theme.colors.text.primary }]} numberOfLines={1}>
                            {message.fileName || message.content || 'Document'}
                        </Text>
                        <Text style={[styles.docSize, { color: iconColor }]}>
                            {message.fileSize || 'Tap to open'}
                        </Text>
                    </View>
                    {message.senderId !== currentUserId && (
                        <PressableScale style={styles.downloadBtn} onPress={handleDownload}>
                            <LucideDownload color={iconColor} size={18} />
                        </PressableScale>
                    )}
                </Pressable>
            );
        case 'LOCATION': {
            let locData = null;
            try { locData = message.content ? JSON.parse(message.content) : null; } catch (_e) { /* malformed */ }
            const lat = locData?.lat || message.latitude;
            const lng = locData?.lng || message.longitude;

            return (
                <PressableScale
                    onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`)}
                    style={styles.locationContainer}
                >
                    <View style={[styles.locationMap, { backgroundColor: isMine ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.04)' }]}>
                        <LucideMapPin color={iconColor} size={28} />
                        <Text style={[styles.mapOpenLabel, { color: iconColor }]}>Open in Maps</Text>
                    </View>
                    <Text style={[styles.locationLabel, { color: isMine ? 'rgba(0,0,0,0.7)' : theme.colors.text.secondary }]}>
                        {locData?.live ? '📍 Shared Live Location' : '📍 Shared Location'}
                    </Text>
                </PressableScale>
            );
        }
        case 'LIVE_LOCATION': {
            return <LiveLocationBubble message={message} isMine={isMine} />;
        }
        case 'CONTACT': {
            let contactData = null;
            try { contactData = message.content ? JSON.parse(message.content) : null; } catch (_e) { /* malformed */ }

            const handleAddContact = async () => {
                const contactName = contactData?.name || message.contactName || 'Contact';
                const contactPhone = contactData?.phoneNumber || message.contactPhone || '';

                try {
                    const { status } = await Contacts.requestPermissionsAsync();
                    if (status !== 'granted') {
                        Alert.alert('Permission needed', 'Contacts permission is required to save contacts.');
                        return;
                    }

                    const contact: Contacts.Contact = {
                        contactType: Contacts.ContactTypes.Person,
                        name: contactName,
                        firstName: contactName.split(' ')[0] || contactName,
                        lastName: contactName.split(' ').slice(1).join(' ') || '',
                        phoneNumbers: contactPhone ? [
                            {
                                label: 'mobile',
                                number: contactPhone,
                            },
                        ] : [],
                    } as Contacts.Contact;

                    await Contacts.addContactAsync(contact);
                    Alert.alert('Saved', `${contactName} has been added to your contacts.`);
                } catch (err) {
                    console.error('Failed to save contact:', err);
                    Alert.alert('Error', 'Could not save the contact.');
                }
            };

            return (
                <View style={styles.contactContainer}>
                    <View style={[styles.contactAvatar, { backgroundColor: isMine ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)' }]}>
                        <LucideUser color={iconColor} size={22} />
                    </View>
                    <View style={styles.contactInfo}>
                        <Text style={[styles.contactName, { color: isMine ? '#000' : theme.colors.text.primary }]}>
                            {contactData?.name || message.contactName || 'Contact'}
                        </Text>
                        <Text style={[styles.contactPhone, { color: iconColor }]}>
                            {contactData?.phoneNumber || message.contactPhone || ''}
                        </Text>
                    </View>
                    <PressableScale style={styles.addContactBtn} onPress={handleAddContact}>
                        <Text style={styles.addContactText}>Add</Text>
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
                    {/* Starred indicator */}
                    {(message.isStarred || message.starred) && (
                        <View style={styles.starBadge}>
                            <LucideStar color="#FFD60A" size={10} fill="#FFD60A" />
                        </View>
                    )}

                    {/* Forwarded indicator */}
                    {message.forwarded && (
                        <View style={styles.forwardedIndicator}>
                            <LucideArrowRight color={theme.colors.text.secondary} size={12} />
                            <Text style={styles.forwardedText}>Forwarded</Text>
                        </View>
                    )}

                    {/* Group sender name */}
                    {isGroup && !isMine && isFirstInGroup && senderName && (
                        <Text style={[styles.senderName, { color: getSenderColor(message.senderId) }]}>
                            {senderName}
                        </Text>
                    )}

                    {/* Reply preview */}
                    {replyPreviewText && (
                        <View style={[styles.replyPreview, { borderLeftColor: isMine ? 'rgba(0,0,0,0.2)' : '#5AC8FA' }]}>
                            <Text style={[styles.replyText, { color: isMine ? 'rgba(0,0,0,0.55)' : theme.colors.text.secondary }]} numberOfLines={1}>
                                {replyPreviewText}
                            </Text>
                        </View>
                    )}

                    {/* Media content */}
                    {message.type !== 'TEXT' && <MediaContent message={message} isMine={isMine} />}

                    {/* Text content - skip for media-only types that use text differently */}
                    {message.content && !['LOCATION', 'LIVE_LOCATION', 'CONTACT', 'AUDIO', 'GIF', 'LINK'].includes(message.type || '') && (
                        <Text
                            style={[
                                styles.text,
                                isMine ? styles.textMine : styles.textOther,
                                message.content === 'This message was deleted' && { fontStyle: 'italic', opacity: 0.6 }
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
                    )}

                    {/* Time + status */}
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

                    {/* Reactions */}
                    {message.reactions && Object.keys(message.reactions).length > 0 && (
                        <View style={[
                            styles.reactionsContainer,
                            isMine ? styles.reactionsMine : styles.reactionsOther
                        ]}>
                            {(() => {
                                // Group by emoji: {emoji: count}
                                const emojiCounts: Record<string, number> = {};
                                Object.values(message.reactions!).forEach((emoji: string) => {
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
        shadowColor: '#FFF', // Glow effect for white bubble
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
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
        width: 220,
        height: 220,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 4,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    mediaPlaceholder: {
        width: 200,
        height: 140,
        backgroundColor: 'rgba(128,128,128,0.08)',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
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
    // Voice
    voiceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        minWidth: 200,
    },
    playBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(128,128,128,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    waveform: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 1.5,
        height: 30,
    },
    waveBar: {
        width: 2.5,
        borderRadius: 2,
    },
    voiceDuration: {
        fontSize: 11,
        fontWeight: '500',
    },
    // Document
    documentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 4,
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
    // Location
    locationContainer: {
        marginBottom: 4,
    },
    locationMap: {
        width: 200,
        height: 120,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
        gap: 8,
    },
    mapOpenLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    locationLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
    // Contact card
    contactContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 4,
        minWidth: 200,
    },
    contactAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contactInfo: {
        flex: 1,
    },
    contactName: {
        fontSize: 14,
        fontWeight: '600',
    },
    contactPhone: {
        fontSize: 12,
        marginTop: 2,
    },
    addContactBtn: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 6,
        backgroundColor: 'rgba(128,128,128,0.15)',
    },
    addContactText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#5AC8FA',
    },
    downloadBtn: {
        padding: 8,
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
    // Link preview
    linkContainer: {
        marginBottom: 4,
        borderRadius: 10,
        overflow: 'hidden',
    },
    linkImage: {
        width: 220,
        height: 120,
        borderRadius: 10,
    },
    linkInfo: {
        paddingTop: 6,
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
});

export default MessageBubble;
