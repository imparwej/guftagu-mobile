import NetInfo from '@react-native-community/netinfo';
import * as Clipboard from 'expo-clipboard';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
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
import { blockUser as blockUserApi, clearChatForUser, deleteMessageApi, editMessageApi, getLinkPreview, getMessages, markAsRead, reactToMessage, toggleStarMessageApi, unblockUser as unblockUserApi, uploadFile } from '../../api/chatApi';
import { API_BASE_URL } from '../../config/api';
import { chatSocketService } from '../../socket/chatSocket';
import {
    addMessage,
    blockChat,
    deleteMessage,
    exitGroup,
    setActiveChat,
    setMessages,
    setWallpaper,
    starMessage,
    toggleMute,
    toggleReaction,
    unblockChat,
    updateMessage,
} from '../../store/slices/chatSlice';
import { RootState, store } from '../../store/store';
import { theme } from '../../theme/theme';
import { Message } from '../../types';
import { registerShareCallback } from '../../utils/shareCallbacks';
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

const ChatScreen = ({ navigation, route }: any) => {
    const { otherUser } = route.params || {};
    const [text, setText] = useState('');
    const [showAttachments, setShowAttachments] = useState(false);
    const [showHeaderMenu, setShowHeaderMenu] = useState(false);
    const [longPressMessage, setLongPressMessage] = useState<Message | null>(null);
    const [isTypingRemote, setIsTypingRemote] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showWallpaper, setShowWallpaper] = useState(false);
    const [highlightedMessageIds, setHighlightedMessageIds] = useState<string[]>([]);
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isOffline, setIsOffline] = useState(false);
    const [editingMessage, setEditingMessage] = useState<Message | null>(null);

    const dispatch = useDispatch();
    const { activeChatId, chats, messages } = useSelector((state: RootState) => state.chat);
    const currentUser = useSelector((state: RootState) => state.auth.user);
    const insets = useSafeAreaInsets();

    const chat = chats.find(c => c.id === activeChatId);

    // Virtual chat for new conversations
    const displayChat = chat || {
        id: 'new',
        name: otherUser?.name,
        avatar: otherUser?.avatar,
        otherUser: otherUser,
        isGroup: false,
    } as any;

    const chatMessages = activeChatId ? messages[activeChatId] || [] : [];
    const isGroup = displayChat?.isGroup || false;
    const isBlocked = displayChat?.isBlocked || false;

    const flatListRef = useRef<FlatList>(null);

    // ──────── DATA FETCHING & SOCKET ────────
    useEffect(() => {
        const loadMessages = async () => {
            if (activeChatId) {
                try {
                    const data = await getMessages(activeChatId, currentUser?.id);
                    dispatch(setMessages({ chatId: activeChatId, messages: data }));
                } catch (error) {
                    console.error('Failed to load messages:', error);
                }
            }
        };

        loadMessages();

        // Mark messages as seen when opening a chat
        if (activeChatId && currentUser?.id) {
            markAsRead(activeChatId, currentUser.id).catch(err =>
                console.error('Failed to mark as read:', err)
            );
        }
    }, [activeChatId, currentUser?.id, dispatch]);

    // ──────── OFFLINE DETECTION ────────
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            const offline = !(state.isConnected && state.isInternetReachable !== false);
            setIsOffline(offline);
            // Reconnect WebSocket when back online
            if (!offline && currentUser?.id) {
                chatSocketService.connect(
                    () => console.log('Reconnected WebSocket'),
                    (err: any) => console.error('Reconnect failed:', err)
                );
            }
        });
        return () => unsubscribe();
    }, [currentUser?.id]);

    // ──────── AUTO-SAVE RECEIVED MEDIA ────────
    const autoSaveMedia = useCallback(async (message: Message) => {
        if (message.senderId === currentUser?.id) return;
        if (!message.mediaUrl) return;
        if (message.type !== 'IMAGE' && message.type !== 'DOCUMENT') return;

        try {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') return;

            const fullUrl = `${API_BASE_URL}${message.mediaUrl}`;
            const filename = message.mediaUrl.split('/').pop() || `file_${Date.now()}`;
            const localUri = `${FileSystem.documentDirectory}${filename}`;

            const downloadResult = await FileSystem.downloadAsync(fullUrl, localUri);
            if (downloadResult.status === 200) {
                await MediaLibrary.saveToLibraryAsync(downloadResult.uri);
            }
        } catch (err) {
            console.warn('Auto-save media failed:', err);
        }
    }, [currentUser?.id]);

    // Subscribe to incoming messages (socket already connected from ChatListScreen)
    useEffect(() => {
        if (!currentUser?.id) return;

        const handleIncomingMessage = (message: Message) => {
            // Check if this message already exists (edit/reaction update)
            const existing = store.getState().chat.messages[message.conversationId];
            if (existing && existing.find((m: Message) => m.id === message.id)) {
                // Update existing message in-place (for edits, reactions, etc.)
                dispatch(updateMessage(message));
                return;
            }

            dispatch(addMessage(message));

            // Auto-save received media
            autoSaveMedia(message);

            // If this is a new conversation (activeChatId was null), set it
            if (!activeChatId && message.conversationId &&
                (message.senderId === currentUser.id || message.receiverId === currentUser.id)) {
                // Check if this message involves the otherUser we're chatting with
                const isRelevant = otherUser?.id &&
                    (message.senderId === otherUser.id || message.receiverId === otherUser.id);
                if (isRelevant) {
                    dispatch(setActiveChat(message.conversationId));
                }
            }

            // Auto-scroll if message is for current conversation
            const currentActiveId = activeChatId || message.conversationId;
            if (message.conversationId === currentActiveId) {
                setTimeout(() => {
                    flatListRef.current?.scrollToEnd({ animated: true });
                }, 100);
            }
        };

        // Subscribe (ChatListScreen may already have a sub, but ChatScreen needs its own
        // handler for scroll and new-chat detection)
        const messageSub = chatSocketService.subscribe('/user/queue/messages', handleIncomingMessage);

        // Typing indicator
        let typingSub: any;
        if (activeChatId) {
            typingSub = chatSocketService.subscribe('/user/queue/typing', (status: any) => {
                if (status.conversationId === activeChatId && status.userId !== currentUser?.id) {
                    setIsTypingRemote(status.typing);
                }
            });
        }

        return () => {
            chatSocketService.unsubscribe('/user/queue/messages');
            if (activeChatId) chatSocketService.unsubscribe('/user/queue/typing');
        };
    }, [activeChatId, currentUser?.id, dispatch, otherUser?.id]);

    // ──────── SEND MESSAGE ────────
    const sendMessage = useCallback(async (msgOverrides: Partial<Message> = {}) => {
        if (!currentUser?.id) return;

        // Resolve receiverId from multiple sources
        let receiverId = otherUser?.id
            || displayChat?.otherUser?.id
            || (chat?.user1Id === currentUser?.id ? chat?.user2Id : chat?.user1Id);

        if (!receiverId) {
            console.error('Cannot send message: receiverId is null');
            return;
        }

        const content = msgOverrides.content !== undefined ? msgOverrides.content : text.trim();

        if (!content && !msgOverrides.mediaUrl && !msgOverrides.type) return;

        // URL detection for link preview
        const urlRegex = /(https?:\/\/[^\s]+)/gi;
        const detectedUrls = content ? content.match(urlRegex) : null;
        let finalType = msgOverrides.type || 'TEXT';
        let metadata: Record<string, string> | undefined;

        if (detectedUrls && detectedUrls.length > 0 && !msgOverrides.type) {
            // Fetch link preview
            try {
                const preview = await getLinkPreview(detectedUrls[0]);
                if (preview && (preview.title || preview.description)) {
                    finalType = 'LINK';
                    metadata = {
                        url: detectedUrls[0],
                        title: preview.title || '',
                        description: preview.description || '',
                        image: preview.image || '',
                        siteName: preview.siteName || '',
                    };
                }
            } catch (err) {
                console.warn('Link preview fetch failed, sending as TEXT:', err);
            }
        }

        const messagePayload: any = {
            conversationId: activeChatId || '',
            senderId: currentUser.id,
            receiverId: receiverId,
            type: finalType,
            content: content,
            mediaUrl: msgOverrides.mediaUrl || null,
            metadata: metadata || undefined,
            ...msgOverrides,
        };

        // Override type if we detected a link
        if (metadata) {
            messagePayload.type = 'LINK';
            messagePayload.metadata = metadata;
        }

        // Remove frontend-only fields before sending
        delete messagePayload.id;
        delete messagePayload.status;
        delete messagePayload.replyTo;
        delete messagePayload.mediaUri;

        try {
            chatSocketService.sendChatMessage(messagePayload);
            // Clear text input after sending text
            if (!msgOverrides.type || msgOverrides.type === 'TEXT' || finalType === 'LINK') {
                setText('');
            }
        } catch (error) {
            console.error('Failed to send message via socket:', error);
            Alert.alert('Error', 'Failed to send message. Please check your connection.');
        }

        setReplyingTo(null);
    }, [activeChatId, currentUser, replyingTo, otherUser, text, chat, displayChat]);

    const handleSendText = useCallback(() => {
        if (!text.trim() || isBlocked || !currentUser?.id) return;

        // Edit mode: update existing message instead of sending new
        if (editingMessage) {
            editMessageApi(editingMessage.id, text.trim())
                .then((updatedMsg: any) => {
                    if (updatedMsg && activeChatId) {
                        dispatch(updateMessage(updatedMsg));
                    }
                })
                .catch((err: any) => {
                    console.warn('Edit failed:', err);
                    Alert.alert('Error', 'Failed to edit message.');
                });
            setEditingMessage(null);
            setText('');
            return;
        }

        sendMessage();
        const receiverId = otherUser?.id
            || displayChat?.otherUser?.id
            || (chat?.user1Id === currentUser?.id ? chat?.user2Id : chat?.user1Id);

        setText('');
        setShowAttachments(false);
        setShowEmoji(false);
        if (receiverId) {
            chatSocketService.sendTyping(activeChatId || '', currentUser.id, receiverId, false);
        }
    }, [text, isBlocked, activeChatId, currentUser, sendMessage, otherUser, displayChat, chat]);

    // Typing behavior
    useEffect(() => {
        const receiverId = otherUser?.id
            || displayChat?.otherUser?.id
            || (chat?.user1Id === currentUser?.id ? chat?.user2Id : chat?.user1Id);

        if (activeChatId && currentUser?.id && receiverId && text.length > 0) {
            chatSocketService.sendTyping(activeChatId, currentUser.id, receiverId, true);
            const timer = setTimeout(() => {
                if (currentUser?.id) {
                    chatSocketService.sendTyping(activeChatId, currentUser.id, receiverId, false);
                }
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [text, activeChatId, currentUser?.id, otherUser?.id, displayChat, chat]);

    // ──────── AUTO-SCROLL ────────
    useEffect(() => {
        if (flatListRef.current && chatMessages.length > 0) {
            const timer = setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [chatMessages.length, isTypingRemote]);

    // ──────── HEADER ACTIONS ────────
    const handleBack = useCallback(() => navigation.goBack(), [navigation]);

    const handleInfoPress = useCallback(() => {
        if (isGroup) {
            navigation.navigate('GroupInfo', { chatId: activeChatId });
        } else {
            navigation.navigate('UserInfo', { userId: displayChat?.otherUser?.id });
        }
    }, [navigation, isGroup, activeChatId, displayChat]);

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
                navigation.navigate('UserInfo', { userId: displayChat?.otherUser?.id });
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
                Alert.alert('Clear this chat?', 'Messages will be removed from this device only.', [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Clear chat', style: 'destructive', onPress: async () => {
                            if (currentUser?.id) {
                                try {
                                    await clearChatForUser(activeChatId, currentUser.id);
                                    dispatch(setMessages({ chatId: activeChatId, messages: [] }));
                                } catch (err: any) {
                                    console.warn('Failed to clear chat on server:', err);
                                }
                            }
                        }
                    },
                ]);
                break;
            case 'block':
                if (isBlocked) {
                    const targetUserId = otherUser?.id || displayChat?.otherUser?.id;
                    if (currentUser?.id && targetUserId) {
                        unblockUserApi(currentUser.id, targetUserId).catch((err: any) =>
                            console.warn('Failed to unblock on server:', err)
                        );
                    }
                    dispatch(unblockChat(activeChatId));
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                } else {
                    Alert.alert('Block Contact', 'You will no longer be able to send or receive messages.', [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Block', style: 'destructive', onPress: () => {
                                const targetUserId = otherUser?.id || displayChat?.otherUser?.id;
                                if (currentUser?.id && targetUserId) {
                                    blockUserApi(currentUser.id, targetUserId).catch((err: any) =>
                                        console.warn('Failed to block on server:', err)
                                    );
                                }
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
                if (longPressMessage.content) {
                    Clipboard.setStringAsync(longPressMessage.content);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
                break;
            case 'delete':
                if (currentUser?.id) {
                    const msgTime = longPressMessage.timestamp;
                    const thirtyMins = 30 * 60 * 1000;
                    const canDeleteForEveryone = longPressMessage.senderId === currentUser.id && ((Date.now() - msgTime) < thirtyMins);

                    const buttons: any[] = [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Delete for me',
                            style: 'destructive',
                            onPress: async () => {
                                try {
                                    await deleteMessageApi(longPressMessage.id, currentUser.id, false);
                                    dispatch(deleteMessage({ chatId: activeChatId, messageId: longPressMessage.id, forEveryone: false }));
                                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                } catch (e) {
                                    Alert.alert('Error', 'Failed to delete message.');
                                }
                            }
                        }
                    ];

                    if (canDeleteForEveryone) {
                        buttons.push({
                            text: 'Delete for everyone',
                            style: 'destructive',
                            onPress: async () => {
                                try {
                                    await deleteMessageApi(longPressMessage.id, currentUser.id, true);
                                    // Normally we might receive a websocket event to update others, but for now just update locally
                                    dispatch(deleteMessage({ chatId: activeChatId, messageId: longPressMessage.id, forEveryone: true }));
                                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                } catch (e) {
                                    Alert.alert('Error', 'Failed to delete message for everyone.');
                                }
                            }
                        });
                    }

                    Alert.alert('Delete Message', 'Are you sure you want to delete this message?', buttons);
                }
                break;
            case 'star':
                try {
                    toggleStarMessageApi(longPressMessage.id).catch(console.error);
                } catch (e) { }
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
                    // Call API to persist reaction
                    reactToMessage(longPressMessage.id, currentUser?.id || 'me', emoji).catch(err =>
                        console.warn('Failed to save reaction:', err)
                    );
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                } else if (action === 'edit') {
                    // Edit message — only if within 15 minutes
                    if (longPressMessage.senderId === currentUser?.id) {
                        const fifteenMins = 15 * 60 * 1000;
                        if (Date.now() - longPressMessage.timestamp < fifteenMins) {
                            setEditingMessage(longPressMessage);
                            setText(longPressMessage.content || '');
                        } else {
                            Alert.alert('Cannot Edit', 'Messages can only be edited within 15 minutes of sending.');
                        }
                    }
                }
                break;
        }
        setLongPressMessage(null);
    }, [longPressMessage, activeChatId, dispatch]);

    // ──────── ATTACHMENT ACTIONS ────────
    const handleAttachmentSelect = useCallback(async (type: string) => {
        if ((!activeChatId && !otherUser?.id) || isBlocked) return;
        setShowAttachments(false);

        const token = store.getState().auth.token;
        if (!token) return;

        switch (type) {
            case 'gallery': {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permission Denied', 'We need camera roll permissions to upload images.');
                    return;
                }
                const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ['images'],
                    quality: 0.8,
                });
                if (!result.canceled && result.assets?.[0]) {
                    const uploadResult = await uploadFile('image', result.assets[0].uri, token);
                    sendMessage({
                        type: 'IMAGE',
                        mediaUrl: uploadResult.url,
                        mediaUri: result.assets[0].uri,
                    });
                }
                break;
            }
            case 'camera': {
                const cameraCallbackId = registerShareCallback(async (uri: string) => {
                    const t = store.getState().auth.token;
                    if (t) {
                        const uploadResult = await uploadFile('image', uri, t);
                        sendMessage({
                            type: 'IMAGE',
                            mediaUrl: uploadResult.url,
                            mediaUri: uri,
                        });
                    }
                });
                navigation.navigate('Camera', { callbackId: cameraCallbackId });
                break;
            }
            case 'document': {
                try {
                    const docResult = await DocumentPicker.getDocumentAsync({ type: '*/*' });
                    if (!docResult.canceled && docResult.assets?.[0]) {
                        const doc = docResult.assets[0];
                        const uploadResult = await uploadFile('document', doc.uri, token, (progress) => {
                            console.log(`Document upload progress: ${progress}%`);
                        });
                        sendMessage({
                            type: 'DOCUMENT',
                            mediaUrl: uploadResult.url,
                            content: doc.name || 'Document',
                            fileName: doc.name || 'document',
                            fileSize: doc.size ? `${(doc.size / 1024).toFixed(1)} KB` : undefined,
                        });
                    }
                } catch (err) {
                    console.error('Document pick failed:', err);
                }
                break;
            }
            case 'location': {
                const locationCallbackId = registerShareCallback((data: any) => {
                    sendMessage({
                        type: 'LOCATION',
                        content: JSON.stringify(data),
                    });
                });
                navigation.navigate('LocationShare', { callbackId: locationCallbackId });
                break;
            }
            case 'contact': {
                const contactCallbackId = registerShareCallback((data: any) => {
                    sendMessage({
                        type: 'CONTACT',
                        content: JSON.stringify(data),
                    });
                });
                navigation.navigate('ContactShare', { callbackId: contactCallbackId });
                break;
            }
        }
    }, [activeChatId, isBlocked, sendMessage]);

    // ──────── CAMERA SHORTCUT ────────
    const handleCameraPress = useCallback(async () => {
        if (isBlocked) return;
        const callbackId = registerShareCallback(async (uri: string) => {
            const token = store.getState().auth.token;
            if (token) {
                const uploadResult = await uploadFile('image', uri, token);
                sendMessage({
                    type: 'IMAGE',
                    mediaUrl: uploadResult.url,
                    mediaUri: uri,
                });
            }
        });
        navigation.navigate('Camera', { callbackId });
    }, [isBlocked, sendMessage, navigation]);

    // ──────── VOICE RECORDING ────────
    const handleMicPress = useCallback(() => {
        if (isBlocked) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setIsRecording(true);
        setShowEmoji(false);
        setShowAttachments(false);
    }, [isBlocked]);

    const handleVoiceSend = useCallback(async (duration: number, uri: string) => {
        setIsRecording(false);
        const token = store.getState().auth.token;
        if (!token || !uri) return;

        // Optimistic UI for progress could be added here, but for now just send
        try {
            const uploadResult = await uploadFile('audio', uri, token, (progress) => {
                console.log(`Audio upload progress: ${progress}%`);
                // We could set an upload progress state here to show in UI
            });

            sendMessage({
                type: 'AUDIO',
                mediaUrl: uploadResult.url,
                content: `Audio (${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')})`,
                voiceDuration: duration,
            });
        } catch (err) {
            console.error('Audio upload failed:', err);
            Alert.alert('Error', 'Could not upload audio recording.');
        }
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

    const handleGifSelect = useCallback((url: string) => {
        setShowEmoji(false);
        sendMessage({
            type: 'GIF',
            mediaUrl: url,
        });
    }, [sendMessage]);

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
        if (isTypingRemote) return 'typing...';

        const status = displayChat?.otherUser?.status;
        if (status === 'online') return 'online';
        if (status && status !== 'offline') {
            try {
                const date = new Date(status);
                // Check if valid date
                if (!isNaN(date.getTime())) {
                    const now = new Date();
                    const diffMs = now.getTime() - date.getTime();
                    const diffMins = Math.floor(diffMs / (1000 * 60));
                    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                    const diffMonths = Math.floor(diffDays / 30);

                    if (diffMins < 60) {
                        return `last seen ${Math.max(1, diffMins)} minutes ago`;
                    } else if (diffHours < 24) {
                        return `last seen ${diffHours} hours ago`;
                    } else if (diffDays < 7) {
                        return `last seen ${diffDays} days ago`;
                    } else if (diffDays > 30) {
                        return `last seen ${diffMonths} months ago`;
                    } else {
                        // fallback for 7-30 days range
                        return `last seen ${diffDays} days ago`;
                    }
                }
            } catch (e) {
                // fallthrough
            }
        }

        return 'offline';
    };

    // ──────── RENDER MESSAGE ────────
    const renderMessage = useCallback(({ item, index }: { item: Message; index: number }) => {
        const isMine = item.senderId === currentUser?.id;
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
            replyPreviewText = repliedMsg?.content || 'Message';
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
                onSwipeToReply={(message: Message) => setReplyingTo(message)}
                replyPreviewText={replyPreviewText}
                isHighlighted={isHighlighted}
                searchQuery={searchQuery}
            />
        );
    }, [currentUser, chatMessages, isGroup, handleMessageLongPress, highlightedMessageIds, searchQuery]);

    const keyExtractor = useCallback((item: Message) => item.id, []);

    if (!chat && !otherUser) return null;

    const wallpaperBg = displayChat?.wallpaper || theme.colors.background;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <ChatHeader
                chat={displayChat}
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
                isMuted={displayChat?.isMuted}
                isBlocked={isBlocked}
                onClose={() => setShowHeaderMenu(false)}
                onAction={handleMenuAction}
            />

            {/* Offline Banner */}
            {isOffline && (
                <View style={styles.offlineBanner}>
                    <Text style={styles.offlineText}>⏳ No internet connection</Text>
                </View>
            )}

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
                    ListFooterComponent={isTypingRemote ? <TypingIndicator /> : null}
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
                                    {replyingTo.content || 'Media'}
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

                {/* Emoji / GIF Picker */}
                <EmojiPicker
                    visible={showEmoji}
                    onSelect={handleEmojiSelect}
                    onSelectGif={handleGifSelect}
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
                currentWallpaper={displayChat?.wallpaper}
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
    offlineBanner: {
        backgroundColor: 'rgba(255,149,0,0.15)',
        paddingVertical: 8,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    offlineText: {
        color: '#FF9500',
        fontSize: 13,
        fontWeight: '600',
    },
});

export default ChatScreen;
