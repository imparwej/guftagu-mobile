import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import {
    BellOff,
    Check,
    EllipsisVertical,
    Laptop,
    Pen,
    Pin,
    Search,
    Settings,
    Trash2,
    Users,
    VolumeX,
    X
} from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import {
    FlatList,
    Image,
    Platform,
    Pressable,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import Animated, {
    FadeIn,
    FadeInDown,
    FadeInRight,
    FadeInUp,
    FadeOut,
    FadeOutUp,
    Layout,
} from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';
import GuftaguLogo from '../../../assets/images/favicon.svg';
import PressableScale from '../../components/PressableScale';
import {
    clearChat,
    deleteChats,
    markAllAsRead,
    markAsRead,
    setActiveChat,
    toggleMute,
    togglePin,
} from '../../store/slices/chatSlice';
import { RootState } from '../../store/store';
import { theme } from '../../theme/theme';
import { Chat } from '../../types';
import ChatContextMenu from './ChatContextMenu';
import ContactListModal from './ContactListModal';

/* ─── Filters ──────────────────────────────────────────────────────────────── */
type FilterType = 'all' | 'unread' | 'groups';

/* ─── Header Menu Item ─────────────────────────────────────────────────────── */
const HEADER_MENU_ITEMS = [
    { icon: Users, label: 'New Group' },
    { icon: Check, label: 'Read All' },
    { icon: Laptop, label: 'Linked Devices' },
    { icon: Settings, label: 'Settings' },
];

/* ─── Helper: relative time ────────────────────────────────────────────────── */
const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    if (hours < 24) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (days === 1) return 'Yesterday';
    if (days < 7) return date.toLocaleDateString([], { weekday: 'short' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

/* ─── Main Component ───────────────────────────────────────────────────────── */
const ChatListScreen = ({ navigation }: any) => {
    const dispatch = useDispatch();
    const { chats, messages } = useSelector((state: RootState) => state.chat);

    // Local state
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [headerMenuVisible, setHeaderMenuVisible] = useState(false);
    const [contextMenuVisible, setContextMenuVisible] = useState(false);
    const [contextChatId, setContextChatId] = useState<string | null>(null);
    const [contactModalVisible, setContactModalVisible] = useState(false);

    const isSelectionMode = selectedIds.size > 0;

    /* ─── Derived data ──────────────────────────────────────────────────── */
    const filteredChats = useMemo(() => {
        let result = chats.filter(c => !c.isArchived);

        // Filter by search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(c => c.name?.toLowerCase().includes(q));
        }

        // Filter by category
        if (activeFilter === 'unread') {
            result = result.filter(c => c.unreadCount > 0);
        } else if (activeFilter === 'groups') {
            result = result.filter(c => c.isGroup);
        }

        // Sort: pinned first, then by last message time
        return result.sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            const aMsg = messages[a.id]?.[messages[a.id]?.length - 1];
            const bMsg = messages[b.id]?.[messages[b.id]?.length - 1];
            const aTime = aMsg ? new Date(aMsg.timestamp).getTime() : 0;
            const bTime = bMsg ? new Date(bMsg.timestamp).getTime() : 0;
            return bTime - aTime;
        });
    }, [chats, messages, searchQuery, activeFilter]);

    const contextChat = useMemo(() => {
        return chats.find(c => c.id === contextChatId) || null;
    }, [chats, contextChatId]);

    /* ─── Handlers ──────────────────────────────────────────────────────── */
    const handleChatPress = useCallback((chatId: string) => {
        if (isSelectionMode) {
            toggleSelection(chatId);
            return;
        }
        dispatch(setActiveChat(chatId));
        navigation.navigate('Chat');
    }, [isSelectionMode, dispatch, navigation]);

    const handleLongPress = useCallback((chatId: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (isSelectionMode) {
            // In multi-select mode, long-press opens the context menu for that chat
            setContextChatId(chatId);
            setContextMenuVisible(true);
        } else {
            // Enter selection mode
            setSelectedIds(new Set([chatId]));
        }
    }, [isSelectionMode]);

    const toggleSelection = useCallback((chatId: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(chatId)) {
                next.delete(chatId);
            } else {
                next.add(chatId);
            }
            return next;
        });
    }, []);

    const exitSelectionMode = useCallback(() => {
        setSelectedIds(new Set());
    }, []);

    const handleSelectionAction = useCallback((action: 'pin' | 'delete' | 'mute') => {
        const ids = Array.from(selectedIds);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        switch (action) {
            case 'pin':
                dispatch(togglePin(ids));
                break;
            case 'delete':
                dispatch(deleteChats(ids));
                break;
            case 'mute':
                dispatch(toggleMute(ids));
                break;
        }
        exitSelectionMode();
    }, [selectedIds, dispatch]);

    const handleHeaderMenuAction = useCallback((label: string) => {
        setHeaderMenuVisible(false);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        switch (label) {
            case 'Read All':
                dispatch(markAllAsRead());
                break;
            case 'Settings':
                navigation.navigate('Settings');
                break;
            // New Group and Linked Devices — stub for now
        }
    }, [dispatch, navigation]);

    /* ─── Render: Chat Row ──────────────────────────────────────────────── */
    const renderChatItem = useCallback(({ item }: { item: Chat }) => {
        const lastMessage = messages[item.id]?.[messages[item.id]?.length - 1];
        const isSelected = selectedIds.has(item.id);
        const hasUnread = item.unreadCount > 0;

        return (
            <Animated.View entering={FadeInDown.duration(300).delay(50)} layout={Layout.springify()}>
                <PressableScale
                    style={[
                        styles.chatItem,
                        isSelected && styles.chatItemSelected,
                    ]}
                    onPress={() => handleChatPress(item.id)}
                    onLongPress={() => handleLongPress(item.id)}
                    scaleTo={0.97}
                    delayLongPress={350}
                >
                    {/* Avatar */}
                    <View style={styles.avatarContainer}>
                        <Image source={{ uri: item.avatar }} style={styles.avatar} />
                        {isSelected && (
                            <Animated.View entering={FadeIn.duration(150)} style={styles.checkOverlay}>
                                <Check size={16} color="#000" strokeWidth={3} />
                            </Animated.View>
                        )}
                        {/* Online indicator for Alice */}
                        {item.name === 'Alice' && !isSelected && (
                            <View style={styles.onlineIndicator} />
                        )}
                    </View>

                    {/* Content */}
                    <View style={styles.chatContent}>
                        <View style={styles.chatTopRow}>
                            <View style={styles.chatNameRow}>
                                <Text
                                    style={[
                                        styles.chatName,
                                        hasUnread && styles.chatNameBold,
                                    ]}
                                    numberOfLines={1}
                                >
                                    {item.name}
                                </Text>
                                {item.isGroup && (
                                    <Users
                                        size={12}
                                        color="rgba(255,255,255,0.25)"
                                        style={{ marginLeft: 6 }}
                                    />
                                )}
                            </View>
                            {lastMessage && (
                                <Text style={[styles.timeText, hasUnread && styles.timeTextUnread]}>
                                    {formatTime(lastMessage.timestamp)}
                                </Text>
                            )}
                        </View>
                        <View style={styles.chatBottomRow}>
                            <Text style={[styles.lastMessage, hasUnread && styles.lastMessageUnread]} numberOfLines={1}>
                                {lastMessage?.text || 'Start a conversation'}
                            </Text>
                            <View style={styles.badges}>
                                {item.isMuted && (
                                    <BellOff size={13} color="rgba(255,255,255,0.2)" style={{ marginRight: 6 }} />
                                )}
                                {item.isPinned && (
                                    <Pin size={13} color="rgba(255,255,255,0.25)" style={{ marginRight: 6, transform: [{ rotate: '45deg' }] }} />
                                )}
                                {hasUnread && (
                                    <View style={styles.unreadBadge}>
                                        <Text style={styles.unreadText}>{item.unreadCount}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                </PressableScale>
            </Animated.View>
        );
    }, [messages, selectedIds, isSelectionMode, handleChatPress, handleLongPress]);

    /* ─── JSX ───────────────────────────────────────────────────────────── */
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000000" translucent />

            {/* ── Selection Mode Header ─────────────────────────────────── */}
            {isSelectionMode ? (
                <Animated.View entering={FadeInUp.duration(200)} exiting={FadeOutUp.duration(150)} style={styles.selectionHeader}>
                    <View style={styles.selectionLeft}>
                        <Pressable onPress={exitSelectionMode} hitSlop={12}>
                            <X color="#FFFFFF" size={22} />
                        </Pressable>
                        <Text style={styles.selectionCount}>{selectedIds.size}</Text>
                    </View>
                    <View style={styles.selectionActions}>
                        <Pressable style={styles.selectionBtn} onPress={() => handleSelectionAction('pin')}>
                            <Pin size={20} color="#FFFFFF" strokeWidth={1.8} style={{ transform: [{ rotate: '45deg' }] }} />
                        </Pressable>
                        <Pressable style={styles.selectionBtn} onPress={() => handleSelectionAction('delete')}>
                            <Trash2 size={20} color="#FFFFFF" strokeWidth={1.8} />
                        </Pressable>
                        <Pressable style={styles.selectionBtn} onPress={() => handleSelectionAction('mute')}>
                            <VolumeX size={20} color="#FFFFFF" strokeWidth={1.8} />
                        </Pressable>
                        <Pressable
                            style={styles.selectionBtn}
                            onPress={() => {
                                // Open context menu for the first selected item
                                const firstId = Array.from(selectedIds)[0];
                                setContextChatId(firstId);
                                setContextMenuVisible(true);
                            }}
                        >
                            <EllipsisVertical size={20} color="#FFFFFF" strokeWidth={1.8} />
                        </Pressable>
                    </View>
                </Animated.View>
            ) : (
                /* ── Normal Header ──────────────────────────────────────── */
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <GuftaguLogo width={30} height={30} />
                        <Text style={styles.headerTitle}>Guftagu</Text>
                    </View>
                    <Pressable
                        style={styles.menuButton}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setHeaderMenuVisible(true);
                        }}
                        hitSlop={12}
                    >
                        <EllipsisVertical color="rgba(255,255,255,0.7)" size={22} />
                    </Pressable>
                </View>
            )}

            {/* ── Search Bar ───────────────────────────────────────────── */}
            {!isSelectionMode && (
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <Search color="rgba(255,255,255,0.28)" size={17} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search chats..."
                            placeholderTextColor="rgba(255,255,255,0.22)"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            selectionColor="rgba(255,255,255,0.5)"
                        />
                        {searchQuery.length > 0 && (
                            <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                                <X color="rgba(255,255,255,0.3)" size={16} />
                            </Pressable>
                        )}
                    </View>
                </View>
            )}

            {/* ── Filter Chips ─────────────────────────────────────────── */}
            {!isSelectionMode && (
                <View style={styles.filterRow}>
                    {(['all', 'unread', 'groups'] as FilterType[]).map((filter) => {
                        const isActive = activeFilter === filter;
                        const labels: Record<FilterType, string> = { all: 'All', unread: 'Unread', groups: 'Groups' };
                        return (
                            <PressableScale
                                key={filter}
                                style={[styles.filterChip, isActive && styles.filterChipActive]}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setActiveFilter(filter);
                                }}
                                scaleTo={0.94}
                            >
                                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                                    {labels[filter]}
                                </Text>
                            </PressableScale>
                        );
                    })}
                </View>
            )}

            {/* ── Chat List ────────────────────────────────────────────── */}
            <FlatList
                data={filteredChats}
                keyExtractor={item => item.id}
                renderItem={renderChatItem}
                contentContainerStyle={[
                    styles.listContainer,
                    filteredChats.length === 0 && styles.listEmpty,
                ]}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <Animated.View entering={FadeIn.duration(400)} style={styles.emptyContainer}>
                        <Search color="rgba(255,255,255,0.15)" size={52} />
                        <Text style={styles.emptyTitle}>
                            {searchQuery ? 'No results' : 'No chats yet'}
                        </Text>
                        <Text style={styles.emptySubtitle}>
                            {searchQuery
                                ? `No chats matching "${searchQuery}"`
                                : 'Tap the button below to start a conversation'}
                        </Text>
                    </Animated.View>
                }
            />

            {/* ── FAB ──────────────────────────────────────────────────── */}
            {!isSelectionMode && (
                <Animated.View entering={FadeInRight.duration(400).delay(200)}>
                    <PressableScale
                        style={styles.fab}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            setContactModalVisible(true);
                        }}
                        scaleTo={0.9}
                    >
                        <Pen size={22} color="#000000" strokeWidth={2.2} />
                    </PressableScale>
                </Animated.View>
            )}

            {/* ── Header Dropdown Menu ─────────────────────────────────── */}
            {headerMenuVisible && (
                <Pressable
                    style={StyleSheet.absoluteFill}
                    onPress={() => setHeaderMenuVisible(false)}
                >
                    <Animated.View
                        entering={FadeIn.duration(150)}
                        exiting={FadeOut.duration(100)}
                        style={styles.dropdownPosition}
                    >
                        <BlurView intensity={80} tint="dark" style={styles.dropdownBlur}>
                            <View style={styles.dropdownInner}>
                                {HEADER_MENU_ITEMS.map((item, idx) => (
                                    <Pressable
                                        key={item.label}
                                        style={({ pressed }) => [
                                            styles.dropdownItem,
                                            pressed && styles.dropdownItemPressed,
                                            idx === HEADER_MENU_ITEMS.length - 1 && styles.dropdownItemLast,
                                        ]}
                                        onPress={() => handleHeaderMenuAction(item.label)}
                                    >
                                        <item.icon size={17} color="rgba(255,255,255,0.65)" strokeWidth={1.8} />
                                        <Text style={styles.dropdownText}>{item.label}</Text>
                                    </Pressable>
                                ))}
                            </View>
                        </BlurView>
                    </Animated.View>
                </Pressable>
            )}

            {/* ── Context Menu ─────────────────────────────────────────── */}
            <ChatContextMenu
                visible={contextMenuVisible}
                isGroup={contextChat?.isGroup || false}
                onClose={() => {
                    setContextMenuVisible(false);
                    setContextChatId(null);
                }}
                onViewContact={() => {
                    if (contextChat?.isGroup) {
                        navigation.navigate('GroupInfo', { chatId: contextChatId });
                    } else {
                        navigation.navigate('UserInfo', { chatId: contextChatId });
                    }
                }}
                onMarkAsRead={() => {
                    if (contextChatId) dispatch(markAsRead([contextChatId]));
                }}
                onClearChat={() => {
                    if (contextChatId) dispatch(clearChat(contextChatId));
                }}
                onBlock={() => {
                    // Stub — block action
                }}
                onExitGroup={() => {
                    if (contextChatId) dispatch(deleteChats([contextChatId]));
                }}
            />

            {/* ── Contact Modal ────────────────────────────────────────── */}
            <ContactListModal
                visible={contactModalVisible}
                onClose={() => setContactModalVisible(false)}
                onMessage={(contact) => {
                    setContactModalVisible(false);
                    // Navigate to a chat with that contact
                }}
                onInvite={() => {
                    setContactModalVisible(false);
                    // Share invite link stub
                }}
            />
        </View>
    );
};

/* ─── Styles ───────────────────────────────────────────────────────────────── */
const SAFE_TOP = Platform.OS === 'ios' ? 56 : 44;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },

    /* ── Header ─────────────────────────────────────────────────────────── */
    header: {
        marginTop: SAFE_TOP,
        paddingHorizontal: 20,
        paddingVertical: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 26,
        fontWeight: '700',
        letterSpacing: -0.5,
        marginLeft: 10,
    },
    menuButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.06)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    /* ── Selection Header ───────────────────────────────────────────────── */
    selectionHeader: {
        marginTop: SAFE_TOP,
        paddingHorizontal: 20,
        paddingVertical: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    selectionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    selectionCount: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '700',
        marginLeft: 16,
    },
    selectionActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    selectionBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 4,
    },

    /* ── Search ─────────────────────────────────────────────────────────── */
    searchContainer: {
        paddingHorizontal: 20,
        paddingBottom: 8,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 14,
        paddingHorizontal: 14,
        height: 44,
    },
    searchInput: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 15,
        marginLeft: 10,
        height: 44,
    },

    /* ── Filters ────────────────────────────────────────────────────────── */
    filterRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingBottom: 10,
        paddingTop: 4,
    },
    filterChip: {
        paddingHorizontal: 18,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    filterChipActive: {
        backgroundColor: '#FFFFFF',
        borderColor: '#FFFFFF',
    },
    filterText: {
        color: 'rgba(255,255,255,0.55)',
        fontSize: 13,
        fontWeight: '600',
    },
    filterTextActive: {
        color: '#000000',
    },

    /* ── Chat List ──────────────────────────────────────────────────────── */
    listContainer: {
        paddingHorizontal: 12,
        paddingBottom: 100,
    },
    listEmpty: {
        flex: 1,
    },
    chatItem: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 2,
    },
    chatItemSelected: {
        backgroundColor: 'rgba(255,255,255,0.06)',
    },

    /* ── Avatar ─────────────────────────────────────────────────────────── */
    avatarContainer: {
        position: 'relative',
        marginRight: 14,
    },
    avatar: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: theme.colors.surface,
    },
    checkOverlay: {
        position: 'absolute',
        right: -2,
        bottom: -2,
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#000000',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 1,
        right: 1,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#34C759',
        borderWidth: 2.5,
        borderColor: '#000000',
    },

    /* ── Chat Content ───────────────────────────────────────────────────── */
    chatContent: {
        flex: 1,
        justifyContent: 'center',
    },
    chatTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    chatNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 8,
    },
    chatName: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
        letterSpacing: -0.1,
    },
    chatNameBold: {
        fontWeight: '700',
    },
    timeText: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 12,
        fontWeight: '400',
    },
    timeTextUnread: {
        color: 'rgba(255,255,255,0.6)',
    },
    chatBottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    lastMessage: {
        color: 'rgba(255,255,255,0.30)',
        flex: 1,
        marginRight: 8,
        fontSize: 14,
        fontWeight: '400',
    },
    lastMessageUnread: {
        color: 'rgba(255,255,255,0.50)',
    },
    badges: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    unreadBadge: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    unreadText: {
        color: '#000000',
        fontSize: 11,
        fontWeight: '700',
    },

    /* ── Empty State ────────────────────────────────────────────────────── */
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 18,
        fontWeight: '600',
        marginTop: 20,
    },
    emptySubtitle: {
        color: 'rgba(255,255,255,0.2)',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
    },

    /* ── FAB ────────────────────────────────────────────────────────────── */
    fab: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 100 : 84,
        right: 20,
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 10,
    },

    /* ── Dropdown Menu ──────────────────────────────────────────────────── */
    dropdownPosition: {
        position: 'absolute',
        top: SAFE_TOP + 8,
        right: 16,
        width: 200,
        borderRadius: 14,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 12,
    },
    dropdownBlur: {
        borderRadius: 14,
        overflow: 'hidden',
    },
    dropdownInner: {
        backgroundColor: 'rgba(30,30,30,0.8)',
        paddingVertical: 4,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 13,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255,255,255,0.06)',
    },
    dropdownItemPressed: {
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    dropdownItemLast: {
        borderBottomWidth: 0,
    },
    dropdownText: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: 15,
        fontWeight: '500',
        marginLeft: 14,
    },
});

export default ChatListScreen;
