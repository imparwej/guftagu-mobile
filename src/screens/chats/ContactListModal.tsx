import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Search, X } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
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
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { theme } from '../../theme/theme';
import { Contact } from '../../types';

const DUMMY_CONTACTS: Contact[] = [
    { id: 'c1', name: 'Alice', avatar: 'https://i.pravatar.cc/150?u=2', phone: '+1 234 567 8901', isGuftaguUser: true },
    { id: 'c2', name: 'Bob', avatar: 'https://i.pravatar.cc/150?u=3', phone: '+1 234 567 8902', isGuftaguUser: true },
    { id: 'c3', name: 'Charlie', avatar: 'https://i.pravatar.cc/150?u=4', phone: '+1 234 567 8903', isGuftaguUser: false },
    { id: 'c4', name: 'David', avatar: 'https://i.pravatar.cc/150?u=7', phone: '+1 234 567 8904', isGuftaguUser: true },
    { id: 'c5', name: 'Emma', avatar: 'https://i.pravatar.cc/150?u=8', phone: '+1 234 567 8905', isGuftaguUser: true },
    { id: 'c6', name: 'Frank', avatar: 'https://i.pravatar.cc/150?u=20', phone: '+1 234 567 8906', isGuftaguUser: false },
    { id: 'c7', name: 'Grace', avatar: 'https://i.pravatar.cc/150?u=21', phone: '+1 234 567 8907', isGuftaguUser: true },
    { id: 'c8', name: 'Hannah', avatar: 'https://i.pravatar.cc/150?u=22', phone: '+1 234 567 8908', isGuftaguUser: false },
    { id: 'c9', name: 'James', avatar: 'https://i.pravatar.cc/150?u=14', phone: '+1 234 567 8909', isGuftaguUser: true },
    { id: 'c10', name: 'Sophia', avatar: 'https://i.pravatar.cc/150?u=13', phone: '+1 234 567 8910', isGuftaguUser: true },
];

interface ContactListModalProps {
    visible: boolean;
    onClose: () => void;
    onMessage: (contact: Contact) => void;
    onInvite: (contact: Contact) => void;
}

const ContactListModal: React.FC<ContactListModalProps> = ({
    visible,
    onClose,
    onMessage,
    onInvite,
}) => {
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        if (!search.trim()) return DUMMY_CONTACTS;
        const q = search.toLowerCase();
        return DUMMY_CONTACTS.filter(c => c.name.toLowerCase().includes(q));
    }, [search]);

    const renderContact = ({ item }: { item: Contact }) => (
        <View style={styles.contactRow}>
            <Image source={{ uri: item.avatar }} style={styles.contactAvatar} />
            <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{item.name}</Text>
                <Text style={styles.contactPhone}>{item.phone}</Text>
            </View>
            <Pressable
                style={({ pressed }) => [
                    styles.contactAction,
                    item.isGuftaguUser ? styles.messageBtn : styles.inviteBtn,
                    pressed && { opacity: 0.7 },
                ]}
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    if (item.isGuftaguUser) {
                        onMessage(item);
                    } else {
                        onInvite(item);
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
    );

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
                            </View>

                            {/* List */}
                            <FlatList
                                data={filtered}
                                keyExtractor={item => item.id}
                                renderItem={renderContact}
                                contentContainerStyle={styles.contactList}
                                showsVerticalScrollIndicator={false}
                                ListEmptyComponent={
                                    <Animated.View entering={FadeIn} style={styles.emptyState}>
                                        <Text style={styles.emptyText}>No contacts found</Text>
                                    </Animated.View>
                                }
                            />
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
    emptyState: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 14,
    },
});

export default ContactListModal;
