import { useNavigation } from '@react-navigation/native';
import { LucideArrowLeft } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { getStarredMessagesApi } from '../../api/chatApi';
import { RootState } from '../../store/store';
import { theme } from '../../theme/theme';
import { Message } from '../../types';
import MessageBubble from './components/MessageBubble';

const StarredMessagesScreen = () => {
    const navigation = useNavigation<any>();
    const currentUser = useSelector((state: RootState) => state.auth.user);

    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStarred = async () => {
            if (!currentUser?.id) return;
            try {
                const data = await getStarredMessagesApi(currentUser.id);
                setMessages(data);
            } catch (e) {
                console.error('Failed to load starred messages', e);
            } finally {
                setLoading(false);
            }
        };

        fetchStarred();
    }, [currentUser?.id]);

    const renderEmpty = () => {
        if (loading) return null;
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No starred messages</Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={10}>
                    <LucideArrowLeft color={theme.colors.text.primary} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Starred Messages</Text>
            </View>

            {loading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={theme.colors.accent} />
                </View>
            ) : (
                <FlatList
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.messageWrapper}>
                            <View style={styles.senderHeader}>
                                <Text style={styles.senderInfo}>
                                    {item.senderId === currentUser?.id ? 'You' : 'Someone'}
                                </Text>
                            </View>
                            <MessageBubble
                                message={item}
                                isMine={item.senderId === currentUser?.id}
                                isGroup={false}
                                isFirstInGroup={true}
                                isLastInGroup={true}
                                onLongPress={() => { }} // Could implement unstar here if desired
                            />
                        </View>
                    )}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={renderEmpty}
                />
            )}
        </SafeAreaView>
    );
};

export default StarredMessagesScreen;

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
    },
    backBtn: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: theme.typography.sizes.lg,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingVertical: 16,
        paddingHorizontal: 8,
    },
    messageWrapper: {
        marginBottom: 20,
    },
    senderHeader: {
        marginBottom: 4,
        marginLeft: 16,
    },
    senderInfo: {
        fontSize: 12,
        color: theme.colors.text.secondary,
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        color: theme.colors.text.secondary,
        fontSize: 16,
    },
});
