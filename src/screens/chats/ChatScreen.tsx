import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Alert,
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import {
    addMessage,
    blockChat,
    clearChat,
    deleteMessage,
    exitGroup,
    setWallpaper,
    starMessage,
    toggleMute,
    toggleReaction,
    unblockChat,
    updateMessageStatus,
} from '../../store/slices/chatSlice';
import { RootState } from '../../store/store';
import { theme } from '../../theme/theme';
import { Message } from '../../types';
import AttachmentPanel from './components/AttachmentPanel';
import ChatHeader from './components/ChatHeader';
import ChatHeaderMenu from './components/ChatHeaderMenu';
import ChatInputBar from './components/ChatInputBar';
import ChatSearchBar from './components/ChatSearchBar';
import EmojiPicker from './components/EmojiPicker';
import MessageBubble from './components/MessageBubble';
import MessageLongPressMenu from './components/MessageLongPressMenu';
import TypingIndicator from './components/TypingIndicator';
import VoiceRecorder from './components/VoiceRecorder';
import WallpaperPicker from './components/WallpaperPicker';

const AUTO_REPLIES = [
    'Got it, thanks! 👍',
    'That sounds great!',
    'Let me think about it...',
    'Sure, I\'ll get back to you.',
    'Interesting!',
    'Haha, nice one 😄',
    'Absolutely!',
    'I\'ll check and let you know.',
];

const getSmartSuggestions = (messageText: string): string[] => {
    const lower = messageText.toLowerCase();
    if (lower.includes('how are you')) return ['Doing great!', 'I am good', 'How about you?'];
    if (lower.includes('where are you')) return ['On my way', 'Almost there', 'At home'];
    if (lower.includes('hello') || lower.includes('hi')) return ['Hey!', 'Hi there', 'Hello!'];
    if (lower.includes('thanks') || lower.includes('thank you')) return ['You\'re welcome', 'Anytime!', 'No problem'];
    if (lower.includes('ok') || lower.includes('okay')) return ['Cool', 'Sounds good', '👍'];
    return ['Got it', 'Okay', 'Thanks'];
};

const ChatScreen = ({ navigation }: any) => {
    const [text, setText] = useState('');
    const [showAttachments, setShowAttachments] = useState(false);
    const [showHeaderMenu, setShowHeaderMenu] = useState(false);
    const [longPressMessage, setLongPressMessage] = useState<Message | null>(null);
    const [isTyping, setIsTyping] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showWallpaper, setShowWallpaper] = useState(false);
    const [highlightedMessageIds, setHighlightedMessageIds] = useState<string[]>([]);
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);

    const dispatch = useDispatch();
    const { activeChatId, chats, messages } = useSelector((state: RootState) => state.chat);
    const currentUser = useSelector((state: RootState) => state.auth.user);
    const insets = useSafeAreaInsets();

    const chat = chats.find(c => c.id === activeChatId);
    const chatMessages = activeChatId ? messages[activeChatId] || [] : [];
    const isGroup = chat?.isGroup || chat?.type === 'group';
    const isBlocked = chat?.isBlocked || false;

    const flatListRef = useRef<FlatList>(null);

    // ──────── SEND MESSAGE ────────
    const sendMessage = useCallback((msgOverrides: Partial<Message> = {}) => {
        if (!activeChatId) return;
        const senderId = currentUser?.id || 'me';
        const newMsgId = Date.now().toString();

        const msg: Message = {
            id: newMsgId,
            chatId: activeChatId,
            senderId,
            timestamp: new Date().toISOString(),
            status: 'sent',
            replyTo: replyingTo?.id,
            ...msgOverrides,
        };

        dispatch(addMessage(msg));
        setReplyingTo(null);

        // Lifecycle simulation
        setTimeout(() => {
            dispatch(updateMessageStatus({ chatId: activeChatId, messageId: newMsgId, status: 'delivered' }));
            setTimeout(() => {
                dispatch(updateMessageStatus({ chatId: activeChatId, messageId: newMsgId, status: 'read' }));
            }, 2000);
        }, 1500);
    }, [activeChatId, currentUser, replyingTo, dispatch]);

    const handleSendText = useCallback(() => {
        if (!text.trim() || isBlocked) return;
        sendMessage({ text: text.trim() });
        setText('');
        setShowAttachments(false);
        setShowEmoji(false);

        // Typing simulation
        setTimeout(() => {
            setIsTyping(true);
            setTimeout(() => {
                setIsTyping(false);
                if (!activeChatId) return;
                const newIncomingMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    chatId: activeChatId,
                    senderId: chat?.participants?.[1] || 'other',
                    text: AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)],
                    timestamp: new Date().toISOString(),
                    status: 'read',
                };
                dispatch(addMessage(newIncomingMsg));
                setSuggestions(getSmartSuggestions(newIncomingMsg.text || ''));
            }, 2500);
        }, 1800);
    }, [text, isBlocked, activeChatId, chat, sendMessage, dispatch]);

    // ──────── AUTO-SCROLL ────────
    useEffect(() => {
        if (flatListRef.current && chatMessages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 150);
        }
    }, [chatMessages.length, isTyping]);

    // ──────── HEADER ACTIONS ────────
    const handleBack = useCallback(() => navigation.goBack(), [navigation]);

    const handleInfoPress = useCallback(() => {
        if (isGroup) {
            navigation.navigate('GroupInfo', { chatId: activeChatId });
        } else {
            navigation.navigate('UserInfo', { userId: chat?.participants?.[1] });
        }
    }, [navigation, isGroup, activeChatId, chat]);

    const handleCallPress = useCallback(() => {
        navigation.navigate('VoiceCall', { chatId: activeChatId });
    }, [navigation, activeChatId]);

    const handleVideoPress = useCallback(() => {
        navigation.navigate('VideoCall', { chatId: activeChatId });
    }, [navigation, activeChatId]);

    // ──────── HEADER MENU ────────
    const handleMenuAction = useCallback((action: string) => {
        if (!activeChatId) return;
        switch (action) {
            case 'view_contact':
                navigation.navigate('UserInfo', { userId: chat?.participants?.[1] });
                break;
            case 'view_group':
                navigation.navigate('GroupInfo', { chatId: activeChatId });
                break;
            case 'search':
                setShowSearch(true);
                setSearchQuery('');
                break;
            case 'mute':
                dispatch(toggleMute([activeChatId]));
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                break;
            case 'wallpaper':
                setShowWallpaper(true);
                break;
            case 'clear_chat':
                Alert.alert('Clear Chat', 'Are you sure you want to clear all messages?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Clear', style: 'destructive', onPress: () => dispatch(clearChat(activeChatId)) },
                ]);
                break;
            case 'block':
                if (isBlocked) {
                    dispatch(unblockChat(activeChatId));
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                } else {
                    Alert.alert('Block Contact', 'You will no longer be able to send or receive messages.', [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Block', style: 'destructive', onPress: () => {
                                dispatch(blockChat(activeChatId));
                                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                            }
                        },
                    ]);
                }
                break;
            case 'exit_group':
                Alert.alert('Exit Group', 'You will no longer receive messages from this group.', [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Exit', style: 'destructive', onPress: () => {
                            dispatch(exitGroup(activeChatId));
                            navigation.goBack();
                        }
                    },
                ]);
                break;
        }
    }, [activeChatId, navigation, chat, isBlocked, dispatch]);

    // ──────── LONG PRESS ────────
    const handleMessageLongPress = useCallback((message: Message) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setLongPressMessage(message);
    }, []);

    const handleLongPressAction = useCallback((action: string) => {
        if (!longPressMessage || !activeChatId) return;

        switch (action) {
            case 'reply':
                setReplyingTo(longPressMessage);
                break;
            case 'copy':
                if (longPressMessage.text) {
                    Clipboard.setStringAsync(longPressMessage.text);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
                break;
            case 'delete':
                dispatch(deleteMessage({ chatId: activeChatId, messageId: longPressMessage.id }));
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                break;
            case 'star':
                dispatch(starMessage({ chatId: activeChatId, messageId: longPressMessage.id }));
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                break;
            case 'forward':
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                break;
            case 'info':
                break;
            default:
                if (action.startsWith('react:')) {
                    const emoji = action.split(':')[1];
                    dispatch(toggleReaction({
                        chatId: activeChatId,
                        messageId: longPressMessage.id,
                        userId: currentUser?.id || 'me',
                        emoji
                    }));
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                break;
        }
        setLongPressMessage(null);
    }, [longPressMessage, activeChatId, dispatch]);

    // ──────── ATTACHMENT ACTIONS ────────
    const handleAttachmentSelect = useCallback(async (type: string) => {
        if (!activeChatId || isBlocked) return;
        setShowAttachments(false);

        switch (type) {
            case 'gallery': {
                const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ['images'],
                    quality: 0.8,
                });
                if (!result.canceled && result.assets?.[0]) {
                    sendMessage({
                        mediaType: 'image',
                        mediaUri: result.assets[0].uri,
                        text: undefined,
                    });
                }
                break;
            }
            case 'camera': {
                const perm = await ImagePicker.requestCameraPermissionsAsync();
                if (!perm.granted) {
                    Alert.alert('Permission needed', 'Camera access is required.');
                    return;
                }
                const result = await ImagePicker.launchCameraAsync({
                    quality: 0.8,
                });
                if (!result.canceled && result.assets?.[0]) {
                    sendMessage({
                        mediaType: 'image',
                        mediaUri: result.assets[0].uri,
                        text: undefined,
                    });
                }
                break;
            }
            case 'document':
                sendMessage({
                    mediaType: 'document',
                    fileName: 'Report_Q4_2025.pdf',
                    fileSize: '2.4 MB',
                    text: undefined,
                });
                break;
            case 'location':
                sendMessage({
                    mediaType: 'location',
                    latitude: 28.6139,
                    longitude: 77.2090,
                    text: 'New Delhi, India',
                });
                break;
            case 'contact':
                sendMessage({
                    mediaType: 'contact',
                    contactName: 'John Smith',
                    contactPhone: '+1 555 123 4567',
                    text: undefined,
                });
                break;
        }
    }, [activeChatId, isBlocked, sendMessage]);

    // ──────── CAMERA SHORTCUT ────────
    const handleCameraPress = useCallback(async () => {
        if (isBlocked) return;
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
            Alert.alert('Permission needed', 'Camera access is required.');
            return;
        }
        const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
        if (!result.canceled && result.assets?.[0]) {
            sendMessage({
                mediaType: 'image',
                mediaUri: result.assets[0].uri,
                text: undefined,
            });
        }
    }, [isBlocked, sendMessage]);

    // ──────── VOICE RECORDING ────────
    const handleMicPress = useCallback(() => {
        if (isBlocked) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setIsRecording(true);
        setShowEmoji(false);
        setShowAttachments(false);
    }, [isBlocked]);

    const handleVoiceSend = useCallback((duration: number) => {
        setIsRecording(false);
        sendMessage({
            mediaType: 'voice',
            voiceDuration: duration,
            text: undefined,
        });
    }, [sendMessage]);

    // ──────── EMOJI ────────
    const handleEmojiPress = useCallback(() => {
        Keyboard.dismiss();
        setShowEmoji(prev => !prev);
        setShowAttachments(false);
    }, []);

    const handleEmojiSelect = useCallback((emoji: string) => {
        setText(prev => prev + emoji);
    }, []);

    // ──────── SEARCH ────────
    const handleScrollToIndex = useCallback((index: number) => {
        flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
    }, []);

    // ──────── WALLPAPER ────────
    const handleWallpaperSelect = useCallback((wallpaper: string | undefined) => {
        if (!activeChatId) return;
        dispatch(setWallpaper({ chatId: activeChatId, wallpaper }));
    }, [activeChatId, dispatch]);

    // ──────── STATUS TEXT ────────
    const getStatusText = () => {
        if (isBlocked) return 'blocked';
        if (isTyping) return 'typing...';
        return 'online';
    };

    // ──────── RENDER MESSAGE ────────
    const renderMessage = useCallback(({ item, index }: { item: Message; index: number }) => {
        const isMine = item.senderId === 'me' || item.senderId === currentUser?.id;
        const prevMsg = index > 0 ? chatMessages[index - 1] : null;
        const nextMsg = index < chatMessages.length - 1 ? chatMessages[index + 1] : null;
        const isFirstInGroup = !prevMsg || prevMsg.senderId !== item.senderId;
        const isLastInGroup = !nextMsg || nextMsg.senderId !== item.senderId;

        let senderName: string | undefined;
        if (isGroup && !isMine) {
            const names: Record<string, string> = {
                '2': 'Alice', '3': 'Bob', '4': 'Carol', '5': 'Dave',
                '6': 'Eve', '7': 'Frank', '8': 'Grace', '9': 'Heidi',
                '10': 'Ivan', '11': 'Judy', '12': 'Karl', '13': 'Leo', '14': 'Mia',
            };
            senderName = names[item.senderId] || `User ${item.senderId}`;
        }

        let replyPreviewText: string | undefined;
        if (item.replyTo) {
            const repliedMsg = chatMessages.find(m => m.id === item.replyTo);
            replyPreviewText = repliedMsg?.text || 'Message';
        }

        const isHighlighted = highlightedMessageIds.includes(item.id);

        return (
            <MessageBubble
                message={item}
                isMine={isMine}
                isGroup={isGroup || false}
                senderName={senderName}
                isFirstInGroup={isFirstInGroup}
                isLastInGroup={isLastInGroup}
                onLongPress={handleMessageLongPress}
                replyPreviewText={replyPreviewText}
                isHighlighted={isHighlighted}
                searchQuery={searchQuery}
            />
        );
    }, [currentUser, chatMessages, isGroup, handleMessageLongPress, highlightedMessageIds, searchQuery]);

    const keyExtractor = useCallback((item: Message) => item.id, []);

    if (!chat) return null;

    const wallpaperBg = chat.wallpaper || theme.colors.background;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <ChatHeader
                chat={chat}
                statusText={getStatusText()}
                onBack={handleBack}
                onInfoPress={handleInfoPress}
                onCallPress={handleCallPress}
                onVideoPress={handleVideoPress}
                onMenuPress={() => setShowHeaderMenu(true)}
            />

            {/* Search bar */}
            <ChatSearchBar
                visible={showSearch}
                messages={chatMessages}
                onClose={() => {
                    setShowSearch(false);
                    setSearchQuery('');
                }}
                onScrollToIndex={handleScrollToIndex}
                onHighlightedIds={setHighlightedMessageIds}
                onQueryChange={setSearchQuery}
            />

            {/* Header Menu */}
            <ChatHeaderMenu
                visible={showHeaderMenu}
                isGroup={isGroup || false}
                isMuted={chat.isMuted}
                isBlocked={isBlocked}
                onClose={() => setShowHeaderMenu(false)}
                onAction={handleMenuAction}
            />

            {/* Messages */}
            <KeyboardAvoidingView
                style={[styles.flex, { backgroundColor: wallpaperBg }]}
                behavior="padding"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <FlatList
                    ref={flatListRef}
                    data={chatMessages}
                    keyExtractor={keyExtractor}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.messageList}
                    showsVerticalScrollIndicator={false}
                    initialNumToRender={15}
                    maxToRenderPerBatch={10}
                    windowSize={11}
                    removeClippedSubviews={Platform.OS === 'android'}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="interactive"
                    ListFooterComponent={isTyping ? <TypingIndicator /> : null}
                    onScrollBeginDrag={() => {
                        if (showAttachments) setShowAttachments(false);
                        if (showEmoji) setShowEmoji(false);
                    }}
                    onScrollToIndexFailed={(info) => {
                        setTimeout(() => {
                            flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
                        }, 200);
                    }}
                />

                {/* Reply preview bar */}
                {replyingTo && (
                    <View style={styles.replyBar}>
                        <View style={styles.replyBarContent}>
                            <View style={styles.replyBarAccent} />
                            <View style={styles.replyBarText}>
                                <Text style={styles.replyBarLabel}>
                                    Replying to {replyingTo.senderId === (currentUser?.id || 'me') ? 'yourself' : 'message'}
                                </Text>
                                <Text style={styles.replyBarMessage} numberOfLines={1}>
                                    {replyingTo.text || 'Media'}
                                </Text>
                            </View>
                        </View>
                        <Text
                            style={styles.replyBarClose}
                            onPress={() => setReplyingTo(null)}
                        >✕</Text>
                    </View>
                )}

                {/* Blocked indicator */}
                {isBlocked && (
                    <View style={styles.blockedBar}>
                        <Text style={styles.blockedText}>
                            You have blocked this contact. Unblock to send messages.
                        </Text>
                    </View>
                )}

                {/* Attachment Panel */}
                <AttachmentPanel
                    visible={showAttachments}
                    onClose={() => setShowAttachments(false)}
                    onSelect={handleAttachmentSelect}
                />

                {/* Emoji Picker */}
                <EmojiPicker
                    visible={showEmoji}
                    onSelect={handleEmojiSelect}
                    onClose={() => setShowEmoji(false)}
                />

                {/* Voice Recorder (replaces input bar while recording) */}
                {isRecording ? (
                    <VoiceRecorder
                        visible={isRecording}
                        onCancel={() => setIsRecording(false)}
                        onSend={handleVoiceSend}
                    />
                ) : (
                    /* Input Bar */
                    <ChatInputBar
                        text={text}
                        onChangeText={(t) => {
                            setText(t);
                            if (t.length > 0) {
                                setSuggestions([]);
                            }
                        }}
                        onSend={handleSendText}
                        onAttachPress={() => {
                            Keyboard.dismiss();
                            setShowEmoji(false);
                            setShowAttachments(!showAttachments);
                        }}
                        onEmojiPress={handleEmojiPress}
                        onCameraPress={handleCameraPress}
                        onMicPress={handleMicPress}
                        showAttachments={showAttachments}
                        bottomInset={insets.bottom}
                        disabled={isBlocked}
                        suggestions={suggestions}
                        onSuggestionPress={(suggestion) => {
                            setText(suggestion);
                            setSuggestions([]);
                        }}
                    />
                )}
            </KeyboardAvoidingView>

            {/* Long Press Menu */}
            <MessageLongPressMenu
                visible={!!longPressMessage}
                onClose={() => setLongPressMessage(null)}
                onAction={handleLongPressAction}
                isMine={longPressMessage?.senderId === 'me' || longPressMessage?.senderId === currentUser?.id || false}
            />

            {/* Wallpaper Picker */}
            <WallpaperPicker
                visible={showWallpaper}
                currentWallpaper={chat.wallpaper}
                onSelect={handleWallpaperSelect}
                onClose={() => setShowWallpaper(false)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    flex: {
        flex: 1,
    },
    messageList: {
        paddingTop: 12,
        paddingBottom: 8,
    },
    replyBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1C1C1E',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(255,255,255,0.06)',
    },
    replyBarContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    replyBarAccent: {
        width: 3,
        height: 32,
        backgroundColor: '#5AC8FA',
        borderRadius: 2,
        marginRight: 10,
    },
    replyBarText: {
        flex: 1,
    },
    replyBarLabel: {
        color: '#5AC8FA',
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 2,
    },
    replyBarMessage: {
        color: theme.colors.text.secondary,
        fontSize: 14,
    },
    replyBarClose: {
        color: theme.colors.text.secondary,
        fontSize: 18,
        paddingLeft: 12,
        padding: 4,
    },
    blockedBar: {
        backgroundColor: 'rgba(255,59,48,0.1)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(255,59,48,0.2)',
    },
    blockedText: {
        color: theme.colors.error,
        fontSize: 13,
        textAlign: 'center',
        fontWeight: '500',
    },
});

export default ChatScreen;
