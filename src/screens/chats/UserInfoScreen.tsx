import * as Haptics from 'expo-haptics';
import {
    LucideArrowLeft,
    LucideBan,
    LucideBell,
    LucideChevronRight,
    LucideClock,
    LucideImage,
    LucideLock,
    LucidePaintbrush,
    LucidePhone,
    LucideSearch,
    LucideThumbsDown,
    LucideTrash2,
    LucideVideo,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import apiClient from '../../api/api';
import {
    blockUser as blockUserApi,
    clearChatForUser,
    muteConversation,
    unblockUser as unblockUserApi,
} from '../../api/chatApi';
import { API_BASE_URL } from '../../config/api';
import { blockChat, clearChat, toggleMute, unblockChat } from '../../store/slices/chatSlice';
import { RootState } from '../../store/store';
import { theme } from '../../theme/theme';

const DISAPPEARING_OPTIONS = [
    { label: 'Off', value: 0 },
    { label: '24 hours', value: 24 * 60 * 60 * 1000 },
    { label: '7 days', value: 7 * 24 * 60 * 60 * 1000 },
    { label: '90 days', value: 90 * 24 * 60 * 60 * 1000 },
];

const UserInfoScreen = ({ route, navigation }: any) => {
    const { userId, conversationId: passedConversationId } = route.params || {};

    const dispatch = useDispatch();
    const currentUser = useSelector((state: RootState) => state.auth.user);
    const { chats, activeChatId } = useSelector((state: RootState) => state.chat);

    const conversationId = passedConversationId || activeChatId;
    const chat = chats.find(c => c.id === conversationId);

    // User data state
    const [user, setUser] = useState<any>({
        name: chat?.otherUser?.name || chat?.name || 'User',
        phoneNumber: chat?.otherUser?.phoneNumber || chat?.otherUser?.phone || '',
        avatar: chat?.otherUser?.avatar || chat?.otherUser?.profilePicture || null,
        bio: chat?.otherUser?.bio || chat?.otherUser?.about || 'Available',
        lastSeen: chat?.otherUser?.lastSeen || '',
    });

    const [isMuted, setIsMuted] = useState(chat?.isMuted || false);
    const [isBlocked, setIsBlocked] = useState(chat?.isBlocked || false);
    const [showEncryption, setShowEncryption] = useState(false);
    const [showDisappearing, setShowDisappearing] = useState(false);
    const [disappearingValue, setDisappearingValue] = useState(0);

    // Fetch real user data
    useEffect(() => {
        if (userId) {
            apiClient.get(`/users/${userId}`).then(res => {
                const u = res.data;
                setUser({
                    name: u.name || 'User',
                    phoneNumber: u.phoneNumber || '',
                    avatar: u.profilePicture || null,
                    bio: u.bio || 'Available',
                    lastSeen: u.lastSeen || '',
                });
            }).catch(err => console.warn('Failed to fetch user info:', err));
        }
    }, [userId]);

    // ──────── MUTE ────────
    const handleMuteToggle = useCallback(async () => {
        setIsMuted(prev => !prev);
        if (conversationId) {
            dispatch(toggleMute([conversationId]));
        }
        if (currentUser?.id && conversationId) {
            try {
                await muteConversation(currentUser.id, conversationId);
            } catch (err) {
                console.warn('Failed to mute on server:', err);
            }
        }
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, [conversationId, currentUser, dispatch]);

    // ──────── BLOCK ────────
    const handleBlock = useCallback(() => {
        if (isBlocked) {
            // Unblock
            setIsBlocked(false);
            if (conversationId) dispatch(unblockChat(conversationId));
            if (currentUser?.id && userId) {
                unblockUserApi(currentUser.id, userId).catch(err =>
                    console.warn('Failed to unblock on server:', err)
                );
            }
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
            Alert.alert('Block Contact', `Block ${user.name}? They won't be able to send you messages.`, [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Block', style: 'destructive', onPress: () => {
                        setIsBlocked(true);
                        if (conversationId) dispatch(blockChat(conversationId));
                        if (currentUser?.id && userId) {
                            blockUserApi(currentUser.id, userId).catch(err =>
                                console.warn('Failed to block on server:', err)
                            );
                        }
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                    }
                },
            ]);
        }
    }, [isBlocked, conversationId, currentUser, userId, user.name, dispatch]);

    // ──────── CLEAR CHAT ────────
    const handleClearChat = useCallback(() => {
        Alert.alert('Clear Chat', 'This will clear the chat for you. The other person will still see the messages.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Clear', style: 'destructive', onPress: async () => {
                    if (conversationId && currentUser?.id) {
                        try {
                            await clearChatForUser(conversationId, currentUser.id);
                        } catch (err) {
                            console.warn('Failed to clear chat on server:', err);
                        }
                        dispatch(clearChat(conversationId));
                    }
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
            },
        ]);
    }, [conversationId, currentUser, dispatch]);

    // ──────── DISAPPEARING MESSAGES ────────
    const handleDisappearingSelect = useCallback((value: number) => {
        setDisappearingValue(value);
        setShowDisappearing(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, []);

    const [isImageModalVisible, setIsImageModalVisible] = useState(false);

    const avatarUri = user.avatar
        ? (user.avatar.startsWith('http') ? user.avatar : `${API_BASE_URL}${user.avatar}`)
        : null;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <LucideArrowLeft color={theme.colors.text.primary} size={24} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <TouchableOpacity onPress={() => setIsImageModalVisible(true)} activeOpacity={0.8}>
                        {avatarUri ? (
                            <Image source={{ uri: avatarUri }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, styles.placeholderAvatar]}>
                                <Text style={styles.placeholderText}>
                                    {(user.name || '?').charAt(0).toUpperCase()}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                    <Text style={styles.nameText}>{user.name}</Text>
                    <Text style={styles.phoneText}>{user.phoneNumber}</Text>
                    {user.bio ? <Text style={styles.bioText}>{user.bio}</Text> : null}
                </View>

                {/* Full-screen Image Modal */}
                <Modal visible={isImageModalVisible} transparent animationType="fade">
                    <View style={styles.fullScreenModalBackground}>
                        <TouchableOpacity
                            style={styles.closeModalButton}
                            onPress={() => setIsImageModalVisible(false)}
                            hitSlop={{ top: 15, right: 15, bottom: 15, left: 15 }}
                        >
                            <Text style={styles.closeModalText}>✕</Text>
                        </TouchableOpacity>
                        <View style={styles.fullScreenImageContainer}>
                            {avatarUri ? (
                                <Image
                                    source={{ uri: avatarUri }}
                                    style={styles.fullScreenImage}
                                    resizeMode="contain"
                                />
                            ) : (
                                <View style={[styles.fullScreenImage, styles.placeholderAvatar, { borderRadius: 0 }]}>
                                    <Text style={[styles.placeholderText, { fontSize: 100 }]}>
                                        {(user.name || '?').charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </Modal>

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.actionButton}>
                        <LucidePhone color={theme.colors.accent} size={24} />
                        <Text style={styles.actionText}>Audio</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <LucideVideo color={theme.colors.accent} size={24} />
                        <Text style={styles.actionText}>Video</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <LucideSearch color={theme.colors.accent} size={24} />
                        <Text style={styles.actionText}>Search</Text>
                    </TouchableOpacity>
                </View>

                {/* Media, Links & Docs */}
                <View style={styles.section}>
                    <TouchableOpacity
                        style={styles.settingItem}
                        onPress={() => navigation.navigate('MediaLinksDocs', { conversationId })}
                    >
                        <View style={styles.settingInfoWithIcon}>
                            <LucideImage color={theme.colors.text.secondary} size={24} />
                            <Text style={[styles.settingTitle, { marginLeft: 16 }]}>Media, links, and docs</Text>
                        </View>
                        <LucideChevronRight color={theme.colors.text.secondary} size={20} />
                    </TouchableOpacity>
                </View>

                {/* Mute & Notifications */}
                <View style={styles.section}>
                    <View style={styles.settingItem}>
                        <View style={styles.settingInfoWithIcon}>
                            <LucideBell color={theme.colors.text.secondary} size={24} />
                            <Text style={[styles.settingTitle, { marginLeft: 16 }]}>Mute notifications</Text>
                        </View>
                        <Switch
                            value={isMuted}
                            onValueChange={handleMuteToggle}
                            trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
                            thumbColor="#fff"
                        />
                    </View>
                </View>

                {/* Encryption */}
                <View style={styles.section}>
                    <TouchableOpacity style={styles.settingItem} onPress={() => setShowEncryption(true)}>
                        <View style={styles.settingInfoWithIcon}>
                            <LucideLock color={theme.colors.text.secondary} size={24} />
                            <View style={[styles.settingInfo, { marginLeft: 16 }]}>
                                <Text style={styles.settingTitle}>Encryption</Text>
                                <Text style={styles.settingValue}>Messages and calls are end-to-end encrypted. Tap to verify.</Text>
                            </View>
                        </View>
                        <LucideChevronRight color={theme.colors.text.secondary} size={20} />
                    </TouchableOpacity>

                    {/* Disappearing Messages */}
                    <TouchableOpacity style={styles.settingItem} onPress={() => setShowDisappearing(true)}>
                        <View style={styles.settingInfoWithIcon}>
                            <LucideClock color={theme.colors.text.secondary} size={24} />
                            <View style={[styles.settingInfo, { marginLeft: 16 }]}>
                                <Text style={styles.settingTitle}>Disappearing messages</Text>
                                <Text style={styles.settingValue}>
                                    {disappearingValue === 0 ? 'Off' : DISAPPEARING_OPTIONS.find(o => o.value === disappearingValue)?.label}
                                </Text>
                            </View>
                        </View>
                        <LucideChevronRight color={theme.colors.text.secondary} size={20} />
                    </TouchableOpacity>
                </View>

                {/* Wallpaper & Clear Chat */}
                <View style={styles.section}>
                    <TouchableOpacity style={styles.settingItem} onPress={() => {
                        navigation.goBack();
                        // Delay slightly so ChatScreen is focused before showing wallpaper
                        setTimeout(() => {
                            navigation.getParent()?.setParams?.({ showWallpaper: true });
                        }, 300);
                    }}>
                        <View style={styles.settingInfoWithIcon}>
                            <LucidePaintbrush color={theme.colors.text.secondary} size={24} />
                            <Text style={[styles.settingTitle, { marginLeft: 16 }]}>Wallpaper</Text>
                        </View>
                        <LucideChevronRight color={theme.colors.text.secondary} size={20} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingItem} onPress={handleClearChat}>
                        <View style={styles.settingInfoWithIcon}>
                            <LucideTrash2 color={theme.colors.text.secondary} size={24} />
                            <Text style={[styles.settingTitle, { marginLeft: 16 }]}>Clear chat</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Block & Report */}
                <View style={styles.section}>
                    <TouchableOpacity style={styles.settingItem} onPress={handleBlock}>
                        <LucideBan color={theme.colors.error} size={24} />
                        <Text style={[styles.settingTitle, { color: theme.colors.error, marginLeft: 16 }]}>
                            {isBlocked ? `Unblock ${user.name}` : `Block ${user.name}`}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.settingItem}>
                        <LucideThumbsDown color={theme.colors.error} size={24} />
                        <Text style={[styles.settingTitle, { color: theme.colors.error, marginLeft: 16 }]}>Report {user.name}</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Encryption Info Modal */}
            <Modal visible={showEncryption} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <LucideLock color={theme.colors.accent} size={40} />
                        <Text style={styles.modalTitle}>End-to-End Encrypted</Text>
                        <Text style={styles.modalText}>
                            Messages and calls are end-to-end encrypted. Only people in this chat can read or listen to them. Not even Guftagu can read or listen to them.
                        </Text>
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => setShowEncryption(false)}
                        >
                            <Text style={styles.modalButtonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Disappearing Messages Modal */}
            <Modal visible={showDisappearing} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <LucideClock color={theme.colors.accent} size={40} />
                        <Text style={styles.modalTitle}>Disappearing Messages</Text>
                        <Text style={styles.modalText}>
                            New messages will disappear from this chat after the selected duration.
                        </Text>
                        {DISAPPEARING_OPTIONS.map(option => (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.disappearingOption,
                                    disappearingValue === option.value && styles.disappearingOptionActive,
                                ]}
                                onPress={() => handleDisappearingSelect(option.value)}
                            >
                                <Text style={[
                                    styles.disappearingOptionText,
                                    disappearingValue === option.value && styles.disappearingOptionTextActive,
                                ]}>
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={[styles.modalButton, { marginTop: 16 }]}
                            onPress={() => setShowDisappearing(false)}
                        >
                            <Text style={styles.modalButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        position: 'absolute',
        top: 20,
        left: 0,
        right: 0,
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md,
        zIndex: 10,
    },
    backButton: {
        padding: theme.spacing.xs,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
    },
    content: {
        flex: 1,
    },
    profileHeader: {
        alignItems: 'center',
        paddingTop: 80,
        paddingBottom: theme.spacing.lg,
        backgroundColor: theme.colors.secondary,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: theme.spacing.md,
    },
    placeholderAvatar: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 48,
        fontWeight: '700',
    },
    fullScreenModalBackground: {
        flex: 1,
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeModalButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 22,
    },
    closeModalText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    fullScreenImageContainer: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullScreenImage: {
        width: '100%',
        height: '100%',
    },
    nameText: {
        color: theme.colors.text.primary,
        fontSize: theme.typography.sizes.xl,
        fontWeight: theme.typography.weights.bold as any,
        marginBottom: 4,
    },
    phoneText: {
        color: theme.colors.text.secondary,
        fontSize: theme.typography.sizes.md,
        marginBottom: 4,
    },
    bioText: {
        color: theme.colors.text.secondary,
        fontSize: theme.typography.sizes.sm,
        marginTop: 4,
        fontStyle: 'italic',
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        paddingVertical: theme.spacing.md,
        backgroundColor: theme.colors.secondary,
        marginBottom: theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    actionButton: {
        alignItems: 'center',
        padding: theme.spacing.sm,
        width: 80,
    },
    actionText: {
        color: theme.colors.accent,
        fontSize: theme.typography.sizes.sm,
        marginTop: 8,
    },
    section: {
        backgroundColor: theme.colors.secondary,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: theme.spacing.sm,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.colors.border,
    },
    settingInfo: {
        flex: 1,
        paddingRight: theme.spacing.md,
    },
    settingInfoWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    settingTitle: {
        color: theme.colors.text.primary,
        fontSize: theme.typography.sizes.md,
    },
    settingValue: {
        color: theme.colors.text.secondary,
        fontSize: theme.typography.sizes.sm,
        marginTop: 2,
    },
    // Modals
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },
    modalContent: {
        backgroundColor: theme.colors.secondary,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        width: '100%',
        maxWidth: 340,
    },
    modalTitle: {
        color: theme.colors.text.primary,
        fontSize: 18,
        fontWeight: '700',
        marginTop: 16,
        marginBottom: 8,
    },
    modalText: {
        color: theme.colors.text.secondary,
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 16,
    },
    modalButton: {
        backgroundColor: theme.colors.accent,
        paddingHorizontal: 32,
        paddingVertical: 10,
        borderRadius: 8,
    },
    modalButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    disappearingOption: {
        width: '100%',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginTop: 6,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    disappearingOptionActive: {
        backgroundColor: theme.colors.accent + '22',
        borderWidth: 1,
        borderColor: theme.colors.accent,
    },
    disappearingOptionText: {
        color: theme.colors.text.primary,
        fontSize: 14,
        textAlign: 'center',
    },
    disappearingOptionTextActive: {
        color: theme.colors.accent,
        fontWeight: '600',
    },
});

export default UserInfoScreen;
