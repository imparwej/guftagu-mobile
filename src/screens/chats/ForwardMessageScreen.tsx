import { useNavigation, useRoute } from '@react-navigation/native';
import { LucideArrowRight, LucideX } from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { chatSocketService } from '../../socket/chatSocket';
import { RootState } from '../../store/store';
import { theme } from '../../theme/theme';
import { Chat, Message } from '../../types';

interface ForwardMessageRouteParams {
    message: Message;
}

const ForwardMessageScreen = () => {
    const route = useRoute();
    const navigation = useNavigation<any>();
    const { message } = route.params as ForwardMessageRouteParams;
    const currentUser = useSelector((state: RootState) => state.auth.user);
    const chats = useSelector((state: RootState) => state.chat.chats);

    const [selectedChatIds, setSelectedChatIds] = useState<Set<string>>(new Set());

    const toggleChat = (chatId: string) => {
        setSelectedChatIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(chatId)) {
                newSet.delete(chatId);
            } else {
                newSet.add(chatId);
            }
            return newSet;
        });
    };

    const handleForward = () => {
        if (!currentUser?.id || selectedChatIds.size === 0) return;

        selectedChatIds.forEach(chatId => {
            const chat = chats.find((c: Chat) => c.id === chatId);
            if (!chat) return;

            const receiverId = chat.otherUser ? chat.otherUser.id : chatId; // For non-group fallback

            chatSocketService.sendChatMessage({
                conversationId: chatId === receiverId ? 'new' : chatId,
                senderId: currentUser.id,
                receiverId: receiverId,
                type: message.type,
                content: message.content,
                mediaUrl: message.mediaUrl,
                fileName: message.fileName,
                fileSize: message.fileSize,
                latitude: message.latitude,
                longitude: message.longitude,
                contactName: message.contactName,
                contactPhone: message.contactPhone,
                voiceDuration: message.voiceDuration,
                forwarded: true,
            });
        });

        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn} hitSlop={10}>
                    <LucideX color="#FFFFFF" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Forward to...</Text>
            </View>

            <FlatList
                data={chats}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    const isSelected = selectedChatIds.has(item.id);
                    return (
                        <TouchableOpacity
                            style={styles.chatRow}
                            activeOpacity={0.7}
                            onPress={() => toggleChat(item.id)}
                        >
                            <View style={styles.avatarContainer}>
                                {item.otherUser?.avatar ? (
                                    <Image source={{ uri: item.otherUser.avatar.startsWith('http') ? item.otherUser.avatar : `http://192.168.1.100:8080${item.otherUser.avatar}` }} style={styles.avatar} />
                                ) : (
                                    <View style={styles.avatarPlaceholder}>
                                        <Text style={styles.avatarInitial}>{item.otherUser?.name?.[0] || '?'}</Text>
                                    </View>
                                )}
                                {isSelected && (
                                    <View style={styles.selectedBadge}>
                                        <Text style={styles.selectedText}>✓</Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.infoContainer}>
                                <Text style={styles.name}>{item.otherUser?.name || 'Unknown'}</Text>
                            </View>
                        </TouchableOpacity>
                    );
                }}
            />

            {selectedChatIds.size > 0 && (
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        {selectedChatIds.size} chat{selectedChatIds.size > 1 ? 's' : ''} selected
                    </Text>
                    <TouchableOpacity style={styles.forwardFab} onPress={handleForward}>
                        <LucideArrowRight color="#FFFFFF" size={24} />
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
};

export default ForwardMessageScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.colors.border,
        backgroundColor: '#1C1C1E',
    },
    closeBtn: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: theme.typography.sizes.lg,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    chatRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.colors.border,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    avatarPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitial: {
        fontSize: 22,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    selectedBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#34C759',
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.colors.background,
    },
    selectedText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    infoContainer: {
        flex: 1,
        marginLeft: 14,
    },
    name: {
        fontSize: 16,
        fontWeight: '500',
        color: '#FFFFFF',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#1C1C1E',
        paddingHorizontal: 20,
        paddingVertical: 16,
        paddingBottom: 32,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: theme.colors.border,
    },
    footerText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    },
    forwardFab: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#34C759',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#34C759',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
});
