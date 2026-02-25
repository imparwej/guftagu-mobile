import { LucidePhone, LucidePhoneIncoming, LucidePhoneMissed, LucidePhoneOutgoing, LucideVideo } from 'lucide-react-native';
import React from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { theme } from '../../theme/theme';
import { Call } from '../../types';

const CallListScreen = ({ navigation }: any) => {
    const { calls } = useSelector((state: RootState) => state.call);
    const { chats } = useSelector((state: RootState) => state.chat);

    // In a real app, users would be in a separate slice, for now we map from chats
    const getUserInfo = (userId: string) => {
        const chat = chats.find(c => c.participants.includes(userId));
        return {
            name: chat?.name || 'Unknown',
            avatar: chat?.avatar || 'https://i.pravatar.cc/150',
        };
    };

    const handleCallPress = (call: Call) => {
        // Here we could open Call Detail UI or initiate a new call
        // For now, let's just simulate initiating a new call of the same type
        if (call.type === 'voice') {
            navigation.navigate('VoiceCall', { userId: call.participants.find(id => id !== '1') });
        } else {
            navigation.navigate('VideoCall', { userId: call.participants.find(id => id !== '1') });
        }
    };

    const renderItem = ({ item }: { item: Call }) => {
        const otherUserId = item.participants.find(id => id !== '1') || '2';
        const user = getUserInfo(otherUserId);

        const isMissed = item.status === 'missed';

        let CallIcon = LucidePhone;
        let iconColor = theme.colors.text.secondary;

        if (isMissed) {
            CallIcon = LucidePhoneMissed;
            iconColor = theme.colors.error;
        } else if (item.status === 'incoming') {
            CallIcon = LucidePhoneIncoming;
        } else if (item.status === 'outgoing') {
            CallIcon = LucidePhoneOutgoing;
        }

        return (
            <View style={styles.callItem}>
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
                <View style={styles.callInfo}>
                    <Text style={[styles.callName, isMissed && styles.missedCallName]}>{user.name}</Text>
                    <View style={styles.callDetails}>
                        <CallIcon size={14} color={iconColor} style={styles.statusIcon} />
                        <Text style={styles.callTime}>
                            {new Date(item.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </Text>
                    </View>
                </View>
                <TouchableOpacity onPress={() => handleCallPress(item)} style={styles.actionButton}>
                    {item.type === 'video' ?
                        <LucideVideo size={24} color={theme.colors.accent} /> :
                        <LucidePhone size={24} color={theme.colors.accent} />
                    }
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Calls</Text>
            </View>
            <FlatList
                data={calls}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContainer}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        marginTop: 48,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    headerTitle: {
        color: theme.colors.text.primary,
        fontSize: theme.typography.sizes.xl,
        fontWeight: theme.typography.weights.bold as any,
    },
    listContainer: {
        paddingVertical: theme.spacing.sm,
    },
    callItem: {
        flexDirection: 'row',
        padding: theme.spacing.md,
        alignItems: 'center',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: theme.spacing.md,
    },
    callInfo: {
        flex: 1,
        borderBottomWidth: 0.5,
        borderBottomColor: theme.colors.border,
        paddingBottom: theme.spacing.md,
    },
    callName: {
        color: theme.colors.text.primary,
        fontSize: theme.typography.sizes.lg,
        fontWeight: theme.typography.weights.semibold as any,
        marginBottom: 4,
    },
    missedCallName: {
        color: theme.colors.error,
    },
    callDetails: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusIcon: {
        marginRight: 4,
    },
    callTime: {
        color: theme.colors.text.secondary,
        fontSize: theme.typography.sizes.sm,
    },
    actionButton: {
        padding: theme.spacing.sm,
    }
});

export default CallListScreen;
