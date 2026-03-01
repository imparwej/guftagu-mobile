import { BlurView } from 'expo-blur';
import * as Contacts from 'expo-contacts';
import * as Haptics from 'expo-haptics';
import * as SMS from 'expo-sms';
import { AlertCircle, Search, UserX, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown, SlideInDown } from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveChat } from '../../store/slices/chatSlice';
import { RootState } from '../../store/store';
import { theme } from '../../theme/theme';

// Simulated Guftagu phone numbers (matched from Redux chats)
const GUFTAGU_PHONES = new Set([
    '+1 234 567 8901', '+1 234 567 8902', '+1 234 567 8904',
    '+1 234 567 8905', '+1 234 567 8907', '+1 234 567 8909',
    '+1 234 567 8910',
]);

interface DeviceContact {
    id: string;
    name: string;
    phone: string;
    avatar?: string;
    isGuftaguUser: boolean;
}

interface ContactListModalProps {
    visible: boolean;
    onClose: () => void;
    onMessage: (contact: DeviceContact) => void;
    onInvite: (contact: DeviceContact) => void;
}

const INVITE_MESSAGE = '🎉 Hey! I\'m using Guftagu — a premium chat app. Join me! Download: https://guftagu.app/download';

const ContactListModal: React.FC<ContactListModalProps> = ({
    visible,
    onClose,
    onMessage,
    onInvite,
}) => {
    const [search, setSearch] = useState('');
    const [contacts, setContacts] = useState<DeviceContact[]>([]);
    const [loading, setLoading] = useState(true);
    const [permissionDenied, setPermissionDenied] = useState(false);
    const dispatch = useDispatch();
    const { chats } = useSelector((state: RootState) => state.chat);

    // Load contacts when modal opens
    useEffect(() => {
        if (visible) {
            loadContacts();
        } else {
            setSearch('');
        }
    }, [visible]);

    const loadContacts = async () => {
        setLoading(true);
        setPermissionDenied(false);

        try {
            const { status } = await Contacts.requestPermissionsAsync();
            if (status !== 'granted') {
                setPermissionDenied(true);
                setLoading(false);
                return;
            }

            const { data } = await Contacts.getContactsAsync({
                fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Image],
                sort: Contacts.SortTypes.FirstName,
            });

            const mapped: DeviceContact[] = data
                .filter(c => c.phoneNumbers && c.phoneNumbers.length > 0 && c.name)
                .map(c => {
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

            // Sort: Guftagu users first
            mapped.sort((a, b) => {
                if (a.isGuftaguUser && !b.isGuftaguUser) return -1;
                if (!a.isGuftaguUser && b.isGuftaguUser) return 1;
                return a.name.localeCompare(b.name);
            });

            setContacts(mapped);
        } catch {
            // Fallback: show empty with no crash
            setContacts([]);
        }

        setLoading(false);
    };

    const filtered = useMemo(() => {
        if (!search.trim()) return contacts;
        const q = search.toLowerCase();
        return contacts.filter(c =>
            c.name.toLowerCase().includes(q) ||
            c.phone.includes(q)
        );
    }, [search, contacts]);

    const handleInvite = useCallback(async (contact: DeviceContact) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const isAvailable = await SMS.isAvailableAsync();
        if (isAvailable && contact.phone) {
            await SMS.sendSMSAsync([contact.phone], INVITE_MESSAGE);
        }
        onInvite(contact);
    }, [onInvite]);

    const handleMessage = useCallback((contact: DeviceContact) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        // Find matching chat by name
        const matchingChat = chats.find(c =>
            c.name?.toLowerCase() === contact.name.toLowerCase()
        );
        if (matchingChat) {
            dispatch(setActiveChat(matchingChat.id));
        }
        onMessage(contact);
    }, [chats, dispatch, onMessage]);

    const renderContact = useCallback(({ item, index }: { item: DeviceContact; index: number }) => (
        <Animated.View entering={FadeInDown.delay(index * 30).duration(250)}>
            <View style={styles.contactRow}>
                {item.avatar ? (
                    <Image source={{ uri: item.avatar }} style={styles.contactAvatar} />
                ) : (
                    <View style={[styles.contactAvatar, styles.avatarPlaceholder]}>
                        <Text style={styles.avatarInitial}>
                            {item.name.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                )}
                <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{item.name}</Text>
                    <Text style={styles.contactPhone}>{item.phone}</Text>
                    {item.isGuftaguUser && (
                        <View style={styles.guftaguBadge}>
                            <Text style={styles.guftaguBadgeText}>on Guftagu</Text>
                        </View>
                    )}
                </View>
                <Pressable
                    style={({ pressed }) => [
                        styles.contactAction,
                        item.isGuftaguUser ? styles.messageBtn : styles.inviteBtn,
                        pressed && { opacity: 0.7 },
                    ]}
                    onPress={() => {
                        if (item.isGuftaguUser) {
                            handleMessage(item);
                        } else {
                            handleInvite(item);
                        }
                    }}
                >
                    <Text
                        style={[
                            styles.contactActionText,
                            item.isGuftaguUser ? styles.messageBtnText : styles.inviteBtnText,
                        ]}
                    >
                        {item.isGuftaguUser ? 'Message' : 'Invite'}
                    </Text>
                </Pressable>
            </View>
        </Animated.View>
    ), [handleMessage, handleInvite]);

    const renderContent = () => {
        if (loading) {
            return (
                <View style={styles.centerState}>
                    <ActivityIndicator size="large" color="rgba(255,255,255,0.4)" />
                    <Text style={styles.stateText}>Loading contacts...</Text>
                </View>
            );
        }

        if (permissionDenied) {
            return (
                <View style={styles.centerState}>
                    <AlertCircle color="rgba(255,255,255,0.2)" size={48} />
                    <Text style={styles.stateTitle}>Permission Required</Text>
                    <Text style={styles.stateText}>
                        Allow access to your contacts to start new conversations.
                    </Text>
                    <Pressable
                        style={({ pressed }) => [styles.retryBtn, pressed && { opacity: 0.7 }]}
                        onPress={loadContacts}
                    >
                        <Text style={styles.retryBtnText}>Try Again</Text>
                    </Pressable>
                </View>
            );
        }

        return (
            <FlatList
                data={filtered}
                keyExtractor={item => item.id}
                renderItem={renderContact}
                contentContainerStyle={styles.contactList}
                showsVerticalScrollIndicator={false}
                initialNumToRender={15}
                maxToRenderPerBatch={10}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={
                    <Animated.View entering={FadeIn} style={styles.centerState}>
                        <UserX color="rgba(255,255,255,0.15)" size={44} />
                        <Text style={styles.stateTitle}>
                            {search ? 'No matches' : 'No contacts'}
                        </Text>
                        <Text style={styles.stateText}>
                            {search
                                ? `No contacts matching "${search}"`
                                : 'Your contact list appears to be empty'}
                        </Text>
                    </Animated.View>
                }
            />
        );
    };

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <Animated.View
                    entering={SlideInDown.duration(350).springify().damping(18)}
                    style={styles.sheet}
                >
                    <BlurView intensity={90} tint="dark" style={styles.sheetBlur}>
                        <View style={styles.sheetInner}>
                            {/* Handle bar */}
                            <View style={styles.handleRow}>
                                <View style={styles.handle} />
                            </View>

                            {/* Header */}
                            <View style={styles.sheetHeader}>
                                <Text style={styles.sheetTitle}>New Chat</Text>
                                <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
                                    <X color="rgba(255,255,255,0.5)" size={20} />
                                </Pressable>
                            </View>

                            {/* Search */}
                            {!loading && !permissionDenied && (
                                <View style={styles.searchRow}>
                                    <Search color="rgba(255,255,255,0.3)" size={16} />
                                    <TextInput
                                        style={styles.searchInput}
                                        placeholder="Search contacts..."
                                        placeholderTextColor="rgba(255,255,255,0.25)"
                                        value={search}
                                        onChangeText={setSearch}
                                        selectionColor="rgba(255,255,255,0.5)"
                                    />
                                    {search.length > 0 && (
                                        <Pressable onPress={() => setSearch('')} hitSlop={6}>
                                            <X color="rgba(255,255,255,0.3)" size={16} />
                                        </Pressable>
                                    )}
                                </View>
                            )}

                            {/* Content */}
                            {renderContent()}
                        </View>
                    </BlurView>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    sheet: {
        maxHeight: '85%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
    },
    sheetBlur: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
    },
    sheetInner: {
        backgroundColor: 'rgba(20,20,20,0.85)',
        paddingBottom: Platform.OS === 'ios' ? 34 : 16,
        minHeight: 300,
    },
    handleRow: {
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 4,
    },
    handle: {
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    sheetTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    closeBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.06)',
        marginHorizontal: 20,
        borderRadius: 12,
        paddingHorizontal: 14,
        height: 42,
        marginBottom: 12,
    },
    searchInput: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 14,
        marginLeft: 10,
        height: 42,
    },
    contactList: {
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    contactAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
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
    contactInfo: {
        flex: 1,
        marginLeft: 14,
    },
    contactName: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    contactPhone: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
        marginTop: 2,
    },
    guftaguBadge: {
        backgroundColor: 'rgba(52,199,89,0.12)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginTop: 3,
    },
    guftaguBadgeText: {
        color: '#34C759',
        fontSize: 10,
        fontWeight: '600',
    },
    contactAction: {
        paddingHorizontal: 16,
        paddingVertical: 7,
        borderRadius: 20,
    },
    messageBtn: {
        backgroundColor: '#FFFFFF',
    },
    inviteBtn: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
    },
    contactActionText: {
        fontSize: 13,
        fontWeight: '600',
    },
    messageBtnText: {
        color: '#000000',
    },
    inviteBtnText: {
        color: 'rgba(255,255,255,0.7)',
    },
    // States
    centerState: {
        alignItems: 'center',
        paddingVertical: 48,
        paddingHorizontal: 32,
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
        marginTop: 20,
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
    },
    retryBtnText: {
        color: '#000',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default ContactListModal;
