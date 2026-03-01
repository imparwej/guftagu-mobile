import * as Contacts from 'expo-contacts';
import * as Haptics from 'expo-haptics';
import * as SMS from 'expo-sms';
import {
    AlertCircle,
    ArrowLeft,
    ChevronRight,
    EllipsisVertical,
    HelpCircle,
    RefreshCw,
    Search,
    UserPlus,
    UserX,
    Users,
    X,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    Pressable,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import Animated, {
    FadeIn,
    FadeInDown,
    FadeOut,
    SlideInRight,
    SlideOutRight,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveChat } from '../../store/slices/chatSlice';
import { RootState } from '../../store/store';
import { theme } from '../../theme/theme';

/* ─── Constants ────────────────────────────────────────────────────────────── */
const INVITE_MESSAGE =
    "🎉 Hey! I'm using Guftagu — a premium chat app. Join me! Download: https://guftagu.app/download";

// Simulated Guftagu phone numbers (matched from Redux chats)
const GUFTAGU_PHONES = new Set([
    '+1 234 567 8901',
    '+1 234 567 8902',
    '+1 234 567 8904',
    '+1 234 567 8905',
    '+1 234 567 8907',
    '+1 234 567 8909',
    '+1 234 567 8910',
]);

const CONTACT_ROW_HEIGHT = 72;

/* ─── Types ────────────────────────────────────────────────────────────────── */
interface DeviceContact {
    id: string;
    name: string;
    phone: string;
    avatar?: string;
    isGuftaguUser: boolean;
}

type ListItem =
    | { type: 'self' }
    | { type: 'newGroup' }
    | { type: 'sectionHeader'; title: string }
    | { type: 'contact'; data: DeviceContact };

/* ─── Memoized Contact Row ─────────────────────────────────────────────────── */
const ContactRow = React.memo(
    ({
        contact,
        onPress,
        index,
    }: {
        contact: DeviceContact;
        onPress: (c: DeviceContact) => void;
        index: number;
    }) => (
        <Animated.View entering={FadeInDown.delay(Math.min(index * 20, 400)).duration(250)}>
            <Pressable
                style={({ pressed }) => [
                    styles.contactRow,
                    pressed && styles.contactRowPressed,
                ]}
                onPress={() => onPress(contact)}
            >
                {contact.avatar ? (
                    <Image source={{ uri: contact.avatar }} style={styles.contactAvatar} />
                ) : (
                    <View style={[styles.contactAvatar, styles.avatarPlaceholder]}>
                        <Text style={styles.avatarInitial}>
                            {contact.name.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                )}
                <View style={styles.contactInfo}>
                    <Text style={styles.contactName} numberOfLines={1}>
                        {contact.name}
                    </Text>
                    <Text style={styles.contactPhone} numberOfLines={1}>
                        {contact.phone}
                    </Text>
                </View>
                {contact.isGuftaguUser ? (
                    <View style={styles.guftaguBadge}>
                        <Text style={styles.guftaguBadgeText}>on Guftagu</Text>
                    </View>
                ) : (
                    <View style={styles.inviteChip}>
                        <UserPlus size={13} color="rgba(255,255,255,0.6)" />
                        <Text style={styles.inviteChipText}>Invite</Text>
                    </View>
                )}
            </Pressable>
        </Animated.View>
    ),
);

/* ─── Main Screen ──────────────────────────────────────────────────────────── */
const ContactListScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();
    const { chats } = useSelector((state: RootState) => state.chat);
    const user = useSelector((state: RootState) => state.auth.user);

    // State
    const [contacts, setContacts] = useState<DeviceContact[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [permissionDenied, setPermissionDenied] = useState(false);
    const [searchMode, setSearchMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [menuVisible, setMenuVisible] = useState(false);
    const [helpVisible, setHelpVisible] = useState(false);
    const searchInputRef = useRef<TextInput>(null);

    /* ─── Load Contacts ─────────────────────────────────────────────── */
    const loadContacts = useCallback(async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        setPermissionDenied(false);

        try {
            const { status } = await Contacts.requestPermissionsAsync();
            if (status !== 'granted') {
                setPermissionDenied(true);
                setLoading(false);
                setRefreshing(false);
                return;
            }

            const { data } = await Contacts.getContactsAsync({
                fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Image],
                sort: Contacts.SortTypes.FirstName,
            });

            const mapped: DeviceContact[] = data
                .filter((c) => c.phoneNumbers && c.phoneNumbers.length > 0 && c.name)
                .map((c) => {
                    const phone = c.phoneNumbers?.[0]?.number || '';
                    const cleanPhone = phone.replace(/[^+\d\s]/g, '').trim();
                    return {
                        id: c.id || String(Math.random()),
                        name: c.name || 'Unknown',
                        phone: cleanPhone,
                        avatar: c.image?.uri,
                        isGuftaguUser: GUFTAGU_PHONES.has(cleanPhone),
                    };
                });

            // Sort: Guftagu users first, then alphabetical
            mapped.sort((a, b) => {
                if (a.isGuftaguUser && !b.isGuftaguUser) return -1;
                if (!a.isGuftaguUser && b.isGuftaguUser) return 1;
                return a.name.localeCompare(b.name);
            });

            setContacts(mapped);
        } catch {
            setContacts([]);
        }

        setLoading(false);
        setRefreshing(false);
    }, []);

    useEffect(() => {
        loadContacts();
    }, [loadContacts]);

    /* ─── Filtered Contacts ─────────────────────────────────────────── */
    const filtered = useMemo(() => {
        if (!searchQuery.trim()) return contacts;
        const q = searchQuery.toLowerCase();
        return contacts.filter(
            (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q),
        );
    }, [searchQuery, contacts]);

    const guftaguCount = useMemo(
        () => contacts.filter((c) => c.isGuftaguUser).length,
        [contacts],
    );

    /* ─── Build List Data ───────────────────────────────────────────── */
    const listData = useMemo<ListItem[]>(() => {
        const items: ListItem[] = [];

        if (!searchMode || !searchQuery.trim()) {
            items.push({ type: 'self' });
            items.push({ type: 'newGroup' });
        }

        if (filtered.length > 0) {
            const guftaguUsers = filtered.filter((c) => c.isGuftaguUser);
            const otherUsers = filtered.filter((c) => !c.isGuftaguUser);

            if (guftaguUsers.length > 0) {
                items.push({ type: 'sectionHeader', title: `Contacts on Guftagu · ${guftaguUsers.length}` });
                guftaguUsers.forEach((c) => items.push({ type: 'contact', data: c }));
            }

            if (otherUsers.length > 0) {
                items.push({ type: 'sectionHeader', title: `Invite to Guftagu · ${otherUsers.length}` });
                otherUsers.forEach((c) => items.push({ type: 'contact', data: c }));
            }
        }

        return items;
    }, [filtered, searchMode, searchQuery]);

    /* ─── Handlers ──────────────────────────────────────────────────── */
    const handleContactPress = useCallback(
        async (contact: DeviceContact) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            if (contact.isGuftaguUser) {
                // Find matching chat in Redux
                const matchingChat = chats.find(
                    (c) => c.name?.toLowerCase() === contact.name.toLowerCase(),
                );
                if (matchingChat) {
                    dispatch(setActiveChat(matchingChat.id));
                    navigation.navigate('Chat');
                } else {
                    Alert.alert('Chat', `Starting chat with ${contact.name}...`);
                }
            } else {
                // SMS invite
                try {
                    const isAvailable = await SMS.isAvailableAsync();
                    if (isAvailable && contact.phone) {
                        await SMS.sendSMSAsync([contact.phone], INVITE_MESSAGE);
                    } else {
                        Alert.alert(
                            'SMS Unavailable',
                            'SMS is not available on this device. Share the link manually: https://guftagu.app/download',
                        );
                    }
                } catch {
                    Alert.alert('Error', 'Could not open SMS composer.');
                }
            }
        },
        [chats, dispatch, navigation],
    );

    const handleSelfPress = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        // Find self-chat or alert
        const selfChat = chats.find((c) => c.name === user?.name);
        if (selfChat) {
            dispatch(setActiveChat(selfChat.id));
            navigation.navigate('Chat');
        } else {
            Alert.alert('Personal Chat', 'Message yourself — notes, links, reminders.');
        }
    }, [chats, user, dispatch, navigation]);

    const handleNewGroup = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Alert.alert('New Group', 'Group creation coming soon!');
    }, []);

    const handleRefresh = useCallback(() => {
        setMenuVisible(false);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        loadContacts(true);
    }, [loadContacts]);

    const enterSearchMode = useCallback(() => {
        setSearchMode(true);
        setTimeout(() => searchInputRef.current?.focus(), 150);
    }, []);

    const exitSearchMode = useCallback(() => {
        setSearchQuery('');
        setSearchMode(false);
    }, []);

    /* ─── Render Item ───────────────────────────────────────────────── */
    const renderItem = useCallback(
        ({ item, index }: { item: ListItem; index: number }) => {
            switch (item.type) {
                case 'self':
                    return (
                        <Pressable
                            style={({ pressed }) => [
                                styles.contactRow,
                                styles.specialRow,
                                pressed && styles.contactRowPressed,
                            ]}
                            onPress={handleSelfPress}
                        >
                            <View style={[styles.contactAvatar, styles.selfAvatar]}>
                                <Text style={styles.selfAvatarText}>
                                    {user?.name?.charAt(0)?.toUpperCase() || 'Y'}
                                </Text>
                            </View>
                            <View style={styles.contactInfo}>
                                <Text style={styles.contactName}>
                                    {user?.name || 'You'}
                                </Text>
                                <Text style={styles.contactPhone}>Message yourself</Text>
                            </View>
                            <View style={styles.youBadge}>
                                <Text style={styles.youBadgeText}>You</Text>
                            </View>
                        </Pressable>
                    );

                case 'newGroup':
                    return (
                        <Pressable
                            style={({ pressed }) => [
                                styles.contactRow,
                                styles.specialRow,
                                pressed && styles.contactRowPressed,
                            ]}
                            onPress={handleNewGroup}
                        >
                            <View style={[styles.contactAvatar, styles.newGroupIcon]}>
                                <Users size={20} color="#FFFFFF" />
                            </View>
                            <View style={styles.contactInfo}>
                                <Text style={styles.contactName}>New group</Text>
                                <Text style={styles.contactPhone}>
                                    Create a group conversation
                                </Text>
                            </View>
                            <ChevronRight size={18} color="rgba(255,255,255,0.25)" />
                        </Pressable>
                    );

                case 'sectionHeader':
                    return (
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionHeaderText}>{item.title}</Text>
                        </View>
                    );

                case 'contact':
                    return (
                        <ContactRow
                            contact={item.data}
                            onPress={handleContactPress}
                            index={index}
                        />
                    );

                default:
                    return null;
            }
        },
        [handleSelfPress, handleNewGroup, handleContactPress, user],
    );

    const keyExtractor = useCallback(
        (item: ListItem, index: number) => {
            switch (item.type) {
                case 'self':
                    return 'self';
                case 'newGroup':
                    return 'newGroup';
                case 'sectionHeader':
                    return `section-${item.title}`;
                case 'contact':
                    return item.data.id;
                default:
                    return String(index);
            }
        },
        [],
    );

    /* ─── Render States ─────────────────────────────────────────────── */
    const renderContent = () => {
        if (loading) {
            return (
                <View style={styles.centerState}>
                    <ActivityIndicator size="large" color="rgba(255,255,255,0.4)" />
                    <Text style={styles.stateText}>Loading contacts…</Text>
                </View>
            );
        }

        if (permissionDenied) {
            return (
                <View style={styles.centerState}>
                    <AlertCircle color="rgba(255,255,255,0.18)" size={52} />
                    <Text style={styles.stateTitle}>Permission Required</Text>
                    <Text style={styles.stateText}>
                        Allow access to your contacts to find friends on Guftagu and start
                        new conversations.
                    </Text>
                    <Pressable
                        style={({ pressed }) => [
                            styles.retryBtn,
                            pressed && { opacity: 0.7 },
                        ]}
                        onPress={() => loadContacts()}
                    >
                        <Text style={styles.retryBtnText}>Allow Access</Text>
                    </Pressable>
                </View>
            );
        }

        return (
            <FlatList
                data={listData}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                initialNumToRender={20}
                maxToRenderPerBatch={15}
                windowSize={11}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                ListEmptyComponent={
                    searchQuery.trim() ? (
                        <Animated.View entering={FadeIn} style={styles.centerState}>
                            <UserX color="rgba(255,255,255,0.15)" size={44} />
                            <Text style={styles.stateTitle}>No matches</Text>
                            <Text style={styles.stateText}>
                                No contacts matching "{searchQuery}"
                            </Text>
                        </Animated.View>
                    ) : (
                        <Animated.View entering={FadeIn} style={styles.centerState}>
                            <UserX color="rgba(255,255,255,0.15)" size={44} />
                            <Text style={styles.stateTitle}>No contacts</Text>
                            <Text style={styles.stateText}>
                                Your contact list appears to be empty
                            </Text>
                        </Animated.View>
                    )
                }
            />
        );
    };

    /* ─── JSX ───────────────────────────────────────────────────────── */
    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="light-content" backgroundColor="#000000" translucent />

            {/* ── Header ─────────────────────────────────────────────── */}
            {searchMode ? (
                <Animated.View
                    entering={SlideInRight.duration(200)}
                    exiting={SlideOutRight.duration(150)}
                    style={styles.searchHeader}
                >
                    <Pressable
                        onPress={exitSearchMode}
                        hitSlop={12}
                        style={styles.headerBtn}
                    >
                        <ArrowLeft color="#FFFFFF" size={22} />
                    </Pressable>
                    <TextInput
                        ref={searchInputRef}
                        style={styles.searchHeaderInput}
                        placeholder="Search contacts…"
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        selectionColor="rgba(255,255,255,0.5)"
                        autoFocus
                    />
                    {searchQuery.length > 0 && (
                        <Pressable
                            onPress={() => setSearchQuery('')}
                            hitSlop={8}
                            style={styles.headerBtn}
                        >
                            <X color="rgba(255,255,255,0.5)" size={18} />
                        </Pressable>
                    )}
                </Animated.View>
            ) : (
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Pressable
                            onPress={() => navigation.goBack()}
                            hitSlop={12}
                            style={styles.headerBtn}
                        >
                            <ArrowLeft color="#FFFFFF" size={22} />
                        </Pressable>
                        <View style={styles.headerTitleBlock}>
                            <Text style={styles.headerTitle}>Select Contact</Text>
                            {!loading && !permissionDenied && (
                                <Text style={styles.headerSubtitle}>
                                    {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
                                    {guftaguCount > 0 && ` · ${guftaguCount} on Guftagu`}
                                </Text>
                            )}
                        </View>
                    </View>
                    <View style={styles.headerRight}>
                        <Pressable
                            onPress={enterSearchMode}
                            hitSlop={10}
                            style={styles.headerBtn}
                        >
                            <Search color="rgba(255,255,255,0.7)" size={20} />
                        </Pressable>
                        <Pressable
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setMenuVisible(true);
                            }}
                            hitSlop={10}
                            style={styles.headerBtn}
                        >
                            <EllipsisVertical
                                color="rgba(255,255,255,0.7)"
                                size={20}
                            />
                        </Pressable>
                    </View>
                </View>
            )}

            {/* ── Refresh indicator ──────────────────────────────────── */}
            {refreshing && (
                <Animated.View entering={FadeIn.duration(200)} style={styles.refreshBar}>
                    <ActivityIndicator size="small" color="rgba(255,255,255,0.5)" />
                    <Text style={styles.refreshText}>Refreshing contacts…</Text>
                </Animated.View>
            )}

            {/* ── Content ────────────────────────────────────────────── */}
            {renderContent()}

            {/* ── 3-dot Menu Dropdown ────────────────────────────────── */}
            {menuVisible && (
                <Pressable
                    style={StyleSheet.absoluteFill}
                    onPress={() => setMenuVisible(false)}
                >
                    <Animated.View
                        entering={FadeIn.duration(150)}
                        exiting={FadeOut.duration(100)}
                        style={[styles.dropdownPosition, { top: insets.top + 48 }]}
                    >
                        <View style={styles.dropdownInner}>
                            <Pressable
                                style={({ pressed }) => [
                                    styles.dropdownItem,
                                    pressed && styles.dropdownItemPressed,
                                ]}
                                onPress={handleRefresh}
                            >
                                <RefreshCw
                                    size={17}
                                    color="rgba(255,255,255,0.65)"
                                    strokeWidth={1.8}
                                />
                                <Text style={styles.dropdownText}>Refresh</Text>
                            </Pressable>
                            <Pressable
                                style={({ pressed }) => [
                                    styles.dropdownItem,
                                    styles.dropdownItemLast,
                                    pressed && styles.dropdownItemPressed,
                                ]}
                                onPress={() => {
                                    setMenuVisible(false);
                                    setHelpVisible(true);
                                }}
                            >
                                <HelpCircle
                                    size={17}
                                    color="rgba(255,255,255,0.65)"
                                    strokeWidth={1.8}
                                />
                                <Text style={styles.dropdownText}>Help</Text>
                            </Pressable>
                        </View>
                    </Animated.View>
                </Pressable>
            )}

            {/* ── Help Modal ─────────────────────────────────────────── */}
            <Modal
                visible={helpVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setHelpVisible(false)}
            >
                <View style={styles.helpOverlay}>
                    <View style={styles.helpCard}>
                        <HelpCircle
                            size={36}
                            color="rgba(255,255,255,0.4)"
                            style={{ alignSelf: 'center', marginBottom: 16 }}
                        />
                        <Text style={styles.helpTitle}>About Contacts</Text>
                        <Text style={styles.helpBody}>
                            Guftagu reads your device contacts to show which friends are
                            already using the app. Contacts marked{' '}
                            <Text style={{ color: '#34C759', fontWeight: '600' }}>
                                "on Guftagu"
                            </Text>{' '}
                            can be messaged directly.{'\n\n'}
                            Others can be invited via SMS with a download link. Your contacts
                            are never uploaded to our servers.
                        </Text>
                        <Pressable
                            style={({ pressed }) => [
                                styles.helpCloseBtn,
                                pressed && { opacity: 0.7 },
                            ]}
                            onPress={() => setHelpVisible(false)}
                        >
                            <Text style={styles.helpCloseBtnText}>Got it</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

/* ─── Styles ───────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },

    /* ── Header ───────────────────────────────────────────────────────── */
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 10,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitleBlock: {
        marginLeft: 4,
        flex: 1,
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    headerSubtitle: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
        fontWeight: '500',
        marginTop: 1,
    },

    /* ── Search Header ────────────────────────────────────────────────── */
    searchHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 6,
    },
    searchHeaderInput: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 16,
        height: 44,
        marginHorizontal: 4,
    },

    /* ── Refresh Bar ──────────────────────────────────────────────────── */
    refreshBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        gap: 8,
    },
    refreshText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
        fontWeight: '500',
    },

    /* ── List ─────────────────────────────────────────────────────────── */
    listContent: {
        paddingBottom: 40,
    },

    /* ── Contact Row ──────────────────────────────────────────────────── */
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        minHeight: CONTACT_ROW_HEIGHT,
    },
    contactRowPressed: {
        backgroundColor: 'rgba(255,255,255,0.04)',
    },
    specialRow: {
        borderBottomWidth: 0,
    },
    contactAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: theme.colors.surface,
    },
    avatarPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    avatarInitial: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 18,
        fontWeight: '700',
    },
    selfAvatar: {
        backgroundColor: 'rgba(255,255,255,0.12)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    selfAvatarText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '700',
    },
    newGroupIcon: {
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contactInfo: {
        flex: 1,
        marginLeft: 14,
    },
    contactName: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: -0.1,
    },
    contactPhone: {
        color: 'rgba(255,255,255,0.35)',
        fontSize: 13,
        marginTop: 2,
    },

    /* ── Badges ───────────────────────────────────────────────────────── */
    guftaguBadge: {
        backgroundColor: 'rgba(52,199,89,0.12)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    guftaguBadgeText: {
        color: '#34C759',
        fontSize: 11,
        fontWeight: '600',
    },
    youBadge: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    youBadgeText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 11,
        fontWeight: '600',
    },
    inviteChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 16,
    },
    inviteChipText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        fontWeight: '600',
    },

    /* ── Section Header ───────────────────────────────────────────────── */
    sectionHeader: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 8,
    },
    sectionHeaderText: {
        color: 'rgba(255,255,255,0.35)',
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 0.3,
        textTransform: 'uppercase',
    },

    /* ── States ───────────────────────────────────────────────────────── */
    centerState: {
        alignItems: 'center',
        paddingVertical: 64,
        paddingHorizontal: 40,
    },
    stateTitle: {
        color: 'rgba(255,255,255,0.35)',
        fontSize: 17,
        fontWeight: '600',
        marginTop: 16,
    },
    stateText: {
        color: 'rgba(255,255,255,0.2)',
        fontSize: 13,
        textAlign: 'center',
        marginTop: 6,
        lineHeight: 18,
    },
    retryBtn: {
        marginTop: 24,
        paddingHorizontal: 28,
        paddingVertical: 12,
        borderRadius: 24,
        backgroundColor: '#FFFFFF',
    },
    retryBtnText: {
        color: '#000',
        fontSize: 14,
        fontWeight: '700',
    },

    /* ── Dropdown ─────────────────────────────────────────────────────── */
    dropdownPosition: {
        position: 'absolute',
        right: 12,
        zIndex: 100,
    },
    dropdownInner: {
        backgroundColor: 'rgba(30,30,30,0.96)',
        borderRadius: 14,
        minWidth: 170,
        paddingVertical: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 12,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255,255,255,0.06)',
    },
    dropdownItemLast: {
        borderBottomWidth: 0,
    },
    dropdownItemPressed: {
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    dropdownText: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: 15,
        fontWeight: '500',
        marginLeft: 12,
    },

    /* ── Help Modal ───────────────────────────────────────────────────── */
    helpOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.65)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    helpCard: {
        backgroundColor: '#1C1C1E',
        borderRadius: 20,
        padding: 28,
        maxWidth: 340,
        width: '100%',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    helpTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 12,
    },
    helpBody: {
        color: 'rgba(255,255,255,0.55)',
        fontSize: 14,
        lineHeight: 21,
        textAlign: 'center',
    },
    helpCloseBtn: {
        marginTop: 24,
        alignSelf: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 24,
    },
    helpCloseBtnText: {
        color: '#000',
        fontSize: 15,
        fontWeight: '700',
    },
});

export default ContactListScreen;
