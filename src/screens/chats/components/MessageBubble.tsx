import {
    LucideFile,
    LucideImage,
    LucideMapPin,
    LucidePlay,
    LucideStar,
    LucideUser,
} from 'lucide-react-native';
import React, { useCallback } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, Layout as LayoutAnim } from 'react-native-reanimated';
import PressableScale from '../../../components/PressableScale';
import { theme } from '../../../theme/theme';
import { Message } from '../../../types';

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

const formatTime = (timestamp: string) => {
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

const StatusTicks = ({ status }: { status: Message['status'] }) => {
    if (status === 'sending') {
        return <Text style={[styles.tick, { color: 'rgba(255,255,255,0.3)' }]}>○</Text>;
    }
    if (status === 'sent') {
        return <Text style={[styles.tick, { color: 'rgba(0,0,0,0.35)' }]}>✓</Text>;
    }
    if (status === 'delivered') {
        return <Text style={[styles.tick, { color: 'rgba(0,0,0,0.35)' }]}>✓✓</Text>;
    }
    if (status === 'read') {
        return <Text style={[styles.tick, { color: '#34A0FF' }]}>✓✓</Text>;
    }
    return null;
};

const MediaContent = ({ message, isMine }: { message: Message; isMine: boolean }) => {
    const iconColor = isMine ? 'rgba(0,0,0,0.6)' : theme.colors.text.secondary;

    switch (message.mediaType) {
        case 'image':
            return message.mediaUri ? (
                <Image
                    source={{ uri: message.mediaUri }}
                    style={styles.imageContent}
                    resizeMode="cover"
                />
            ) : (
                <View style={styles.mediaPlaceholder}>
                    <LucideImage color={iconColor} size={28} />
                    <Text style={[styles.mediaLabel, { color: iconColor }]}>Photo</Text>
                </View>
            );
        case 'video':
            return (
                <View style={styles.mediaPlaceholder}>
                    <View style={styles.playOverlay}>
                        <LucidePlay color="#FFF" size={24} />
                    </View>
                    <Text style={[styles.mediaLabel, { color: iconColor }]}>Video</Text>
                </View>
            );
        case 'voice':
        case 'audio':
            return (
                <View style={styles.voiceContainer}>
                    <View style={styles.playBtn}>
                        <LucidePlay color="#FFF" size={14} />
                    </View>
                    <View style={styles.waveform}>
                        {Array.from({ length: 20 }).map((_, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.waveBar,
                                    {
                                        height: 4 + Math.sin(i * 0.8) * 12 + Math.random() * 6,
                                        backgroundColor: isMine
                                            ? 'rgba(0,0,0,0.25)'
                                            : 'rgba(255,255,255,0.2)',
                                    },
                                ]}
                            />
                        ))}
                    </View>
                    <Text style={[styles.voiceDuration, { color: iconColor }]}>
                        {formatDuration(message.voiceDuration)}
                    </Text>
                </View>
            );
        case 'document':
            return (
                <View style={styles.documentContainer}>
                    <View style={[styles.docIcon, { backgroundColor: isMine ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.06)' }]}>
                        <LucideFile color={iconColor} size={22} />
                    </View>
                    <View style={styles.docInfo}>
                        <Text style={[styles.docName, { color: isMine ? '#000' : theme.colors.text.primary }]} numberOfLines={1}>
                            {message.fileName || 'Document'}
                        </Text>
                        <Text style={[styles.docSize, { color: iconColor }]}>
                            {message.fileSize || 'Unknown size'}
                        </Text>
                    </View>
                </View>
            );
        case 'location':
            return (
                <View style={styles.locationContainer}>
                    <View style={[styles.locationMap, { backgroundColor: isMine ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.04)' }]}>
                        <LucideMapPin color={iconColor} size={28} />
                    </View>
                    <Text style={[styles.locationLabel, { color: isMine ? 'rgba(0,0,0,0.7)' : theme.colors.text.secondary }]}>
                        {message.text || `${message.latitude?.toFixed(4)}, ${message.longitude?.toFixed(4)}`}
                    </Text>
                </View>
            );
        case 'contact':
            return (
                <View style={styles.contactContainer}>
                    <View style={[styles.contactAvatar, { backgroundColor: isMine ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)' }]}>
                        <LucideUser color={iconColor} size={22} />
                    </View>
                    <View style={styles.contactInfo}>
                        <Text style={[styles.contactName, { color: isMine ? '#000' : theme.colors.text.primary }]}>
                            {message.contactName || 'Contact'}
                        </Text>
                        <Text style={[styles.contactPhone, { color: iconColor }]}>
                            {message.contactPhone || ''}
                        </Text>
                    </View>
                </View>
            );
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

    return (
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
                {message.isStarred && (
                    <View style={styles.starBadge}>
                        <LucideStar color="#FFD60A" size={10} fill="#FFD60A" />
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
                {message.mediaType && <MediaContent message={message} isMine={isMine} />}

                {/* Text content - skip for media-only types that use text differently */}
                {message.text && !['location', 'contact'].includes(message.mediaType || '') && (
                    <Text style={[styles.text, isMine ? styles.textMine : styles.textOther]}>
                        {(() => {
                            if (!searchQuery || !message.text.toLowerCase().includes(searchQuery.toLowerCase())) {
                                return message.text;
                            }
                            const parts = message.text.split(new RegExp(`(${searchQuery})`, 'gi'));
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
                    <Text style={[styles.time, { color: isMine ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.35)' }]}>
                        {formatTime(message.timestamp)}
                    </Text>
                    {isMine && <StatusTicks status={message.status} />}
                </View>

                {/* Reactions */}
                {message.reactions && Object.keys(message.reactions).length > 0 && (
                    <View style={[
                        styles.reactionsContainer,
                        isMine ? styles.reactionsMine : styles.reactionsOther
                    ]}>
                        {Object.entries(message.reactions).map(([emoji, users]) => (
                            <View key={emoji} style={styles.reactionBadge}>
                                <Text style={styles.reactionText}>{emoji}</Text>
                                <Text style={styles.reactionCount}>{users.length}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </PressableScale>
        </Animated.View>
    );
});

const styles = StyleSheet.create({
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    bubbleOther: {
        backgroundColor: '#1C1C1E',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    starBadge: {
        position: 'absolute',
        top: 6,
        right: 6,
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
    // Image
    imageContent: {
        width: 200,
        height: 200,
        borderRadius: 12,
        marginBottom: 6,
    },
    // Media placeholder
    mediaPlaceholder: {
        width: 200,
        height: 140,
        backgroundColor: 'rgba(128,128,128,0.08)',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    mediaLabel: {
        fontSize: 11,
        marginTop: 6,
        fontWeight: '500',
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
        height: 100,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    locationLabel: {
        fontSize: 12,
        fontWeight: '400',
    },
    // Contact card
    contactContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 4,
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
});

export default MessageBubble;
