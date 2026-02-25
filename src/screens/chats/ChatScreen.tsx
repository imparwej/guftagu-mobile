import {
    LucideArrowLeft,
    LucideCamera,
    LucideFile,
    LucideImage,
    LucideMapPin,
    LucideMic,
    LucideMoreVertical,
    LucidePlus,
    LucideSend,
    LucideUser,
    LucideX
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import Animated, {
    FadeInDown,
    FadeInLeft,
    FadeInRight,
    FadeOutDown,
    Layout
} from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';
import PressableScale from '../../components/PressableScale';
import { addMessage, updateMessageStatus } from '../../store/slices/chatSlice';
import { RootState } from '../../store/store';
import { theme } from '../../theme/theme';

const { width } = Dimensions.get('window');

const ChatScreen = ({ navigation }: any) => {
    const [text, setText] = useState('');
    const [showAttachments, setShowAttachments] = useState(false);
    const dispatch = useDispatch();
    const { activeChatId, chats, messages } = useSelector((state: RootState) => state.chat);
    const currentUser = useSelector((state: RootState) => state.auth.user);

    const chat = chats.find(c => c.id === activeChatId);
    const chatMessages = activeChatId ? messages[activeChatId] || [] : [];

    const flatListRef = useRef<FlatList>(null);

    const handleSend = () => {
        if (!text.trim() || !activeChatId) return;

        const senderId = currentUser?.id || 'me';
        const newMsgId = Date.now().toString();

        dispatch(addMessage({
            id: newMsgId,
            chatId: activeChatId,
            senderId: senderId,
            text: text.trim(),
            timestamp: new Date().toISOString(),
            status: 'sent',
        }));

        setText('');
        setShowAttachments(false);

        // Simulate message lifecycle
        setTimeout(() => {
            dispatch(updateMessageStatus({ chatId: activeChatId, messageId: newMsgId, status: 'delivered' }));
            setTimeout(() => {
                dispatch(updateMessageStatus({ chatId: activeChatId, messageId: newMsgId, status: 'read' }));
            }, 2000);
        }, 1500);
    };

    useEffect(() => {
        if (flatListRef.current && chatMessages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [chatMessages.length]);

    if (!chat) return null;

    const renderMessage = ({ item, index }: { item: any; index: number }) => {
        const isMine = item.senderId === 'me' || item.senderId === currentUser?.id;

        return (
            <Animated.View
                entering={isMine ? FadeInRight.delay(50).duration(400) : FadeInLeft.delay(50).duration(400)}
                layout={Layout.springify()}
                style={[
                    styles.messageContainer,
                    isMine ? styles.messageContainerMine : styles.messageContainerOther,
                ]}
            >
                <View style={[
                    styles.messageBubble,
                    isMine ? styles.messageBubbleMine : styles.messageBubbleOther
                ]}>
                    {item.mediaType === 'image' && (
                        <View style={styles.mediaPlaceholder}>
                            <LucideImage color={isMine ? theme.colors.text.inverse : theme.colors.text.primary} size={32} />
                        </View>
                    )}
                    {item.text && (
                        <Text style={[
                            styles.messageText,
                            isMine ? styles.messageTextMine : styles.messageTextOther
                        ]}>
                            {item.text}
                        </Text>
                    )}
                    <View style={styles.timeContainer}>
                        <Text style={[
                            styles.messageTime,
                            { color: isMine ? 'rgba(0,0,0,0.5)' : theme.colors.text.secondary }
                        ]}>
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                        {isMine && (
                            <Text style={[
                                styles.tick,
                                { color: item.status === 'read' ? theme.colors.text.inverse : 'rgba(0,0,0,0.3)' }
                            ]}>
                                {item.status === 'read' ? '✓✓' : '✓'}
                            </Text>
                        )}
                    </View>
                </View>
            </Animated.View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.header}>
                <PressableScale style={styles.backButton} onPress={() => navigation.goBack()}>
                    <LucideArrowLeft color={theme.colors.text.primary} size={24} />
                </PressableScale>
                <View style={styles.headerInfo}>
                    <Image source={{ uri: chat?.avatar }} style={styles.headerAvatar} />
                    <View>
                        <Text style={styles.headerName}>{chat?.name}</Text>
                        <Text style={styles.headerStatus}>online</Text>
                    </View>
                </View>
                <PressableScale style={styles.headerAction}>
                    <LucideMoreVertical color={theme.colors.text.primary} size={24} />
                </PressableScale>
            </View>

            <FlatList
                ref={flatListRef}
                data={chatMessages}
                keyExtractor={item => item.id}
                renderItem={renderMessage}
                contentContainerStyle={styles.messageList}
                showsVerticalScrollIndicator={false}
            />

            {showAttachments && (
                <Animated.View
                    entering={FadeInDown.duration(300)}
                    exiting={FadeOutDown.duration(200)}
                    style={styles.attachmentSheet}
                >
                    <View style={styles.attachmentGrid}>
                        {[
                            { icon: LucideFile, label: 'Document', color: '#5856D6' },
                            { icon: LucideCamera, label: 'Camera', color: '#FF2D55' },
                            { icon: LucideImage, label: 'Gallery', color: '#AF52DE' },
                            { icon: LucideUser, label: 'Contact', color: '#007AFF' },
                            { icon: LucideMapPin, label: 'Location', color: '#34C759' }
                        ].map((item, idx) => (
                            <PressableScale key={idx} style={styles.attachmentItem}>
                                <View style={[styles.attachmentIcon, { backgroundColor: item.color }]}>
                                    <item.icon color="#FFF" size={24} />
                                </View>
                                <Text style={styles.attachmentLabel}>{item.label}</Text>
                            </PressableScale>
                        ))}
                    </View>
                </Animated.View>
            )}

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={styles.inputArea}>
                    <PressableScale
                        style={styles.attachButton}
                        onPress={() => setShowAttachments(!showAttachments)}
                    >
                        {showAttachments ?
                            <LucideX color={theme.colors.text.primary} size={24} /> :
                            <LucidePlus color={theme.colors.text.secondary} size={24} />
                        }
                    </PressableScale>
                    <View style={styles.textInputWrapper}>
                        <TextInput
                            style={styles.input}
                            placeholder="Message"
                            placeholderTextColor={theme.colors.text.secondary}
                            value={text}
                            onChangeText={setText}
                            multiline
                        />
                        {!text && (
                            <PressableScale style={styles.cameraIcon}>
                                <LucideCamera color={theme.colors.text.secondary} size={20} />
                            </PressableScale>
                        )}
                    </View>
                    {text.trim() ? (
                        <PressableScale style={styles.sendButton} onPress={handleSend}>
                            <LucideSend color={theme.colors.text.inverse} size={20} />
                        </PressableScale>
                    ) : (
                        <PressableScale style={styles.micButton}>
                            <LucideMic color={theme.colors.text.primary} size={24} />
                        </PressableScale>
                    )}
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        marginTop: 54,
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    backButton: {
        padding: 4,
    },
    headerInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 12,
    },
    headerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    headerName: {
        color: theme.colors.text.primary,
        fontSize: 17,
        fontWeight: '600',
    },
    headerStatus: {
        color: '#34C759',
        fontSize: 12,
    },
    headerAction: {
        padding: 4,
    },
    messageList: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    messageContainer: {
        marginBottom: 8,
        maxWidth: '85%',
    },
    messageContainerMine: {
        alignSelf: 'flex-end',
    },
    messageContainerOther: {
        alignSelf: 'flex-start',
    },
    messageBubble: {
        padding: 12,
        paddingHorizontal: 16,
        borderRadius: 22,
        paddingBottom: 8,
    },
    messageBubbleMine: {
        backgroundColor: theme.colors.accent,
        borderBottomRightRadius: 4,
    },
    messageBubbleOther: {
        backgroundColor: theme.colors.surface,
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
    },
    messageTextMine: {
        color: theme.colors.text.inverse,
    },
    messageTextOther: {
        color: theme.colors.text.primary,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 4,
    },
    messageTime: {
        fontSize: 10,
    },
    tick: {
        fontSize: 10,
        marginLeft: 4,
    },
    inputArea: {
        padding: 12,
        paddingBottom: 32,
        flexDirection: 'row',
        alignItems: 'flex-end',
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    attachButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 4,
    },
    textInputWrapper: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        borderRadius: 22,
        paddingHorizontal: 16,
        paddingVertical: 10,
        maxHeight: 120,
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        color: theme.colors.text.primary,
        fontSize: 16,
        padding: 0,
    },
    cameraIcon: {
        padding: 4,
        marginLeft: 8,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.colors.accent,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    micButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 4,
    },
    attachmentSheet: {
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: 40,
        position: 'absolute',
        bottom: 100,
        width: '100%',
        zIndex: 100,
    },
    attachmentGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    attachmentItem: {
        width: '30%',
        alignItems: 'center',
        marginBottom: 20,
    },
    attachmentIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    attachmentLabel: {
        color: theme.colors.text.secondary,
        fontSize: 12,
        fontWeight: '500',
    },
    mediaPlaceholder: {
        width: 200,
        height: 150,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    }
});

export default ChatScreen;
