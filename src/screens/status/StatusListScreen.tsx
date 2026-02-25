import { LucidePlus } from 'lucide-react-native';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { theme } from '../../theme/theme';
import { Story } from '../../types';

const StatusListScreen = ({ navigation }: any) => {
    const { stories } = useSelector((state: RootState) => state.status);
    const { chats } = useSelector((state: RootState) => state.chat);
    const currentUser = useSelector((state: RootState) => state.auth.user);

    // Group stories by user
    const groupedStories = stories.reduce((acc: any, story) => {
        if (!acc[story.userId]) {
            acc[story.userId] = [];
        }
        acc[story.userId].push(story);
        return acc;
    }, {});

    const recentUpdates: any[] = [];
    const viewedUpdates: any[] = [];

    Object.keys(groupedStories).forEach(userId => {
        const userStories = groupedStories[userId];
        const allViewed = userStories.every((s: Story) => s.isViewed);
        const chat = chats.find(c => c.participants.includes(userId));
        const userObj = {
            userId,
            name: chat?.name || 'Unknown',
            avatar: chat?.avatar || 'https://i.pravatar.cc/150',
            stories: userStories,
            lastUpdated: userStories[0].timestamp // assuming sorted
        };

        if (allViewed) {
            viewedUpdates.push(userObj);
        } else {
            recentUpdates.push(userObj);
        }
    });

    const handlePressStatus = (userObj: any) => {
        navigation.navigate('StatusViewer', { userId: userObj.userId, stories: userObj.stories, user: userObj });
    };

    const StatusItem = ({ item, isViewed }: any) => {
        const borderStyle = isViewed ? styles.avatarBorderViewed : styles.avatarBorderUnviewed;
        return (
            <TouchableOpacity style={styles.statusItem} onPress={() => handlePressStatus(item)}>
                <View style={[styles.avatarContainer, borderStyle]}>
                    <Image source={{ uri: item.avatar }} style={styles.avatar} />
                </View>
                <View style={styles.statusInfo}>
                    <Text style={styles.statusName}>{item.name}</Text>
                    <Text style={styles.statusTime}>
                        {new Date(item.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Status</Text>
            </View>
            <ScrollView style={styles.scrollContent}>

                {/* My Status */}
                <TouchableOpacity style={styles.myStatusItem}>
                    <View style={styles.myAvatarContainer}>
                        <Image source={{ uri: currentUser?.avatar || 'https://i.pravatar.cc/150?u=me' }} style={styles.avatar} />
                        <View style={styles.plusBadge}>
                            <LucidePlus size={16} color={theme.colors.text.inverse} />
                        </View>
                    </View>
                    <View style={styles.statusInfo}>
                        <Text style={styles.statusName}>My status</Text>
                        <Text style={styles.statusTime}>Tap to add status update</Text>
                    </View>
                </TouchableOpacity>

                {recentUpdates.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>Recent updates</Text>
                        {recentUpdates.map((item, index) => (
                            <StatusItem key={index} item={item} isViewed={false} />
                        ))}
                    </View>
                )}

                {viewedUpdates.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>Viewed updates</Text>
                        {viewedUpdates.map((item, index) => (
                            <StatusItem key={index} item={item} isViewed={true} />
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        marginTop: 20,
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
    scrollContent: {
        flex: 1,
    },
    myStatusItem: {
        flexDirection: 'row',
        padding: theme.spacing.md,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    myAvatarContainer: {
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
        position: 'relative',
    },
    plusBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: theme.colors.accent,
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.colors.background,
    },
    section: {
        marginTop: theme.spacing.sm,
    },
    sectionHeader: {
        color: theme.colors.text.secondary,
        fontSize: theme.typography.sizes.sm,
        fontWeight: theme.typography.weights.semibold as any,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        backgroundColor: theme.colors.secondary,
    },
    statusItem: {
        flexDirection: 'row',
        padding: theme.spacing.md,
        alignItems: 'center',
    },
    avatarContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    avatarBorderUnviewed: {
        borderWidth: 3,
        borderColor: theme.colors.accent,
    },
    avatarBorderViewed: {
        borderWidth: 3,
        borderColor: theme.colors.border,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    statusInfo: {
        flex: 1,
        borderBottomWidth: 0.5,
        borderBottomColor: theme.colors.border,
        paddingBottom: theme.spacing.md,
    },
    statusName: {
        color: theme.colors.text.primary,
        fontSize: theme.typography.sizes.lg,
        fontWeight: theme.typography.weights.semibold as any,
        marginBottom: 4,
    },
    statusTime: {
        color: theme.colors.text.secondary,
        fontSize: theme.typography.sizes.sm,
    }
});

export default StatusListScreen;
