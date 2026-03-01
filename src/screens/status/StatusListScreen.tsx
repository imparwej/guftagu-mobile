import { LucideEye, LucideMoreVertical, LucidePlus, LucideX } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { FlatList, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { TAB_BAR_HEIGHT } from '../../navigation/tabConstants';
import { RootState } from '../../store/store';
import { theme } from '../../theme/theme';
import { Story } from '../../types';

const StatusItem = ({ item, isViewed, onPress }: any) => {
    const borderStyle = isViewed ? styles.avatarBorderViewed : styles.avatarBorderUnviewed;
    return (
        <TouchableOpacity style={styles.statusItem} onPress={() => onPress(item)} activeOpacity={0.7}>
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

const StatusListScreen = ({ navigation }: any) => {
    const { stories } = useSelector((state: RootState) => state.status);
    const { chats } = useSelector((state: RootState) => state.chat);
    const currentUser = useSelector((state: RootState) => state.auth.user);
    const [menuVisible, setMenuVisible] = useState(false);
    const [viewerListVisible, setViewerListVisible] = useState(false);
    const [selectedStoryForViewers, setSelectedStoryForViewers] = useState<Story | null>(null);

    // Filter my stories (latest first)
    const myStories = useMemo(() =>
        stories.filter(s => s.userId === currentUser?.id)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
        [stories, currentUser?.id]
    );

    // Group other stories by user
    const groupedStories = useMemo(() => stories.reduce((acc: any, story) => {
        if (story.userId === currentUser?.id) return acc;
        if (!acc[story.userId]) {
            acc[story.userId] = [];
        }
        acc[story.userId].push(story);
        return acc;
    }, {}), [stories, currentUser?.id]);

    const { recentUpdates, viewedUpdates } = useMemo(() => {
        const recent: any[] = [];
        const viewed: any[] = [];

        Object.keys(groupedStories).forEach(userId => {
            const userStories = groupedStories[userId].sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            const allViewed = userStories.every((s: Story) => s.isViewed);
            const chat = chats.find(c => c.participants.includes(userId));
            const userObj = {
                userId,
                name: chat?.name || 'Unknown',
                avatar: chat?.avatar || `https://i.pravatar.cc/150?u=${userId}`,
                stories: userStories,
                lastUpdated: userStories[0].timestamp
            };

            if (allViewed) {
                viewed.push(userObj);
            } else {
                recent.push(userObj);
            }
        });
        return { recentUpdates: recent, viewedUpdates: viewed };
    }, [groupedStories, chats]);

    const handlePressStatus = React.useCallback((userObj: any) => {
        navigation.navigate('StatusViewer', { userId: userObj.userId, stories: userObj.stories, user: userObj });
    }, [navigation]);

    const handleAddStatus = React.useCallback(() => {
        navigation.navigate('CreateStatus');
    }, [navigation]);

    const handleViewViewerList = React.useCallback((story: Story) => {
        setSelectedStoryForViewers(story);
        setViewerListVisible(true);
    }, []);

    // These were sub-components defined inside the render, which is a bad practice.
    // They will be inlined in the return below for better stability.

    const renderHeader = useMemo(() => {
        const hasStories = myStories.length > 0;
        const latestStory = myStories[0];

        return (
            <>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Status</Text>
                    <TouchableOpacity onPress={() => setMenuVisible(true)}>
                        <LucideMoreVertical color={theme.colors.text.primary} size={24} />
                    </TouchableOpacity>
                </View>

                {/* My Status Section - Refactored to avoid nested touchables */}
                <View style={styles.myStatusContainer}>
                    <View style={styles.myStatusItem}>
                        <TouchableOpacity
                            onPress={hasStories ? () => handlePressStatus({ userId: currentUser?.id, stories: myStories, name: 'My status', avatar: currentUser?.avatar }) : handleAddStatus}
                            activeOpacity={0.7}
                            style={styles.myAvatarBtn}
                        >
                            <View style={styles.myAvatarWrapper}>
                                <View style={[
                                    styles.avatarContainer,
                                    hasStories && (myStories.every(s => s.isViewed) ? styles.avatarBorderViewed : styles.avatarBorderUnviewed)
                                ]}>
                                    <Image source={{ uri: currentUser?.avatar || 'https://i.pravatar.cc/150?u=me' }} style={styles.avatar} />
                                </View>
                                <View style={styles.plusBadge}>
                                    <LucidePlus size={14} color={theme.colors.background} strokeWidth={3} />
                                </View>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.statusInfoBtn}
                            onPress={hasStories ? () => handlePressStatus({ userId: currentUser?.id, stories: myStories, name: 'My status', avatar: currentUser?.avatar }) : handleAddStatus}
                        >
                            <View style={styles.statusInfo}>
                                <Text style={styles.statusName}>My status</Text>
                                <Text style={styles.statusTime}>
                                    {hasStories
                                        ? new Date(latestStory.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                        : 'Tap to add status update'}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {hasStories && (
                            <TouchableOpacity
                                style={styles.viewCountContainer}
                                onPress={() => handleViewViewerList(latestStory)}
                            >
                                <LucideEye size={16} color={theme.colors.text.secondary} />
                                <Text style={styles.viewCountText}>{latestStory.viewers?.length || 0}</Text>
                            </TouchableOpacity>
                        )}

                        {!hasStories && (
                            <TouchableOpacity style={styles.addStatusBtn} onPress={handleAddStatus}>
                                <LucidePlus size={24} color={theme.colors.text.secondary} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </>
        );
    }, [myStories, currentUser, handlePressStatus, handleAddStatus, handleViewViewerList]);

    const sections = useMemo(() => [
        ...(recentUpdates.length > 0 ? [{ id: 'recent_header', type: 'header', title: 'Recent updates' }, ...recentUpdates.map(u => ({ ...u, type: 'status', isViewed: false }))] : []),
        ...(viewedUpdates.length > 0 ? [{ id: 'viewed_header', type: 'header', title: 'Viewed updates' }, ...viewedUpdates.map(u => ({ ...u, type: 'status', isViewed: true }))] : []),
    ], [recentUpdates, viewedUpdates]);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header Menu Modal */}
            <Modal
                transparent
                visible={menuVisible}
                onRequestClose={() => setMenuVisible(false)}
                animationType="fade"
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setMenuVisible(false)}
                >
                    <View style={styles.menuCard}>
                        <TouchableOpacity
                            style={styles.menuOption}
                            onPress={() => {
                                setMenuVisible(false);
                                navigation.navigate('StatusPrivacy');
                            }}
                        >
                            <Text style={styles.menuText}>Status privacy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.menuOption}
                            onPress={() => {
                                setMenuVisible(false);
                                navigation.navigate('Settings');
                            }}
                        >
                            <Text style={styles.menuText}>Settings</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Viewer List Modal */}
            <Modal
                visible={viewerListVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setViewerListVisible(false)}
            >
                <View style={styles.viewerModalContainer}>
                    <View style={styles.viewerModalHeader}>
                        <Text style={styles.viewerModalTitle}>Viewed by {selectedStoryForViewers?.viewers?.length || 0}</Text>
                        <TouchableOpacity onPress={() => setViewerListVisible(false)} style={styles.closeIcon}>
                            <LucideX color={theme.colors.text.primary} size={24} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView contentContainerStyle={styles.viewerList} showsVerticalScrollIndicator={false}>
                        {selectedStoryForViewers?.viewers?.map((viewer, index) => {
                            const viewerUser = chats.find(c => c.participants.includes(viewer.userId));
                            return (
                                <View key={index} style={styles.viewerItem}>
                                    <Image
                                        source={{ uri: viewerUser?.avatar || `https://i.pravatar.cc/150?u=${viewer.userId}` }}
                                        style={styles.viewerAvatar}
                                    />
                                    <View style={styles.viewerInfo}>
                                        <Text style={styles.viewerName}>{viewerUser?.name || 'Unknown'}</Text>
                                        <Text style={styles.viewerTime}>
                                            {new Date(viewer.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}
                        {(!selectedStoryForViewers?.viewers || selectedStoryForViewers.viewers.length === 0) && (
                            <View style={styles.emptyViewers}>
                                <LucideEye size={48} color={theme.colors.text.tertiary} style={{ marginBottom: 16 }} />
                                <Text style={styles.emptyViewersText}>No views yet</Text>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </Modal>
            <FlatList
                data={sections}
                keyExtractor={(item, index) => item.userId || item.id || index.toString()}
                renderItem={({ item }) => {
                    if (item.type === 'header') {
                        return (
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionHeaderText}>{item.title}</Text>
                            </View>
                        );
                    }
                    return <StatusItem item={item} isViewed={item.isViewed} onPress={handlePressStatus} />;
                }}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + 20 }}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 20,
    },
    headerTitle: {
        color: theme.colors.text.primary,
        fontSize: 32,
        fontWeight: '700',
    },
    myStatusContainer: {
        marginBottom: 10,
    },
    myStatusItem: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 12,
        alignItems: 'center',
    },
    myAvatarBtn: {
        marginRight: 0,
    },
    statusInfoBtn: {
        flex: 1,
    },
    addStatusBtn: {
        padding: 8,
    },
    myAvatarWrapper: {
        position: 'relative',
    },
    plusBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: theme.colors.accent,
        borderRadius: 12,
        width: 22,
        height: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.colors.background,
    },
    sectionHeader: {
        backgroundColor: theme.colors.secondary,
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginTop: 10,
    },
    sectionHeaderText: {
        color: theme.colors.text.secondary,
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    statusItem: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 12,
        alignItems: 'center',
    },
    avatarContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarBorderUnviewed: {
        borderWidth: 2.5,
        borderColor: theme.colors.accent,
    },
    avatarBorderViewed: {
        borderWidth: 1.5,
        borderColor: theme.colors.border,
    },
    avatar: {
        width: 54,
        height: 54,
        borderRadius: 27,
    },
    statusInfo: {
        flex: 1,
        marginLeft: 16,
        justifyContent: 'center',
    },
    statusName: {
        color: theme.colors.text.primary,
        fontSize: 17,
        fontWeight: '600',
    },
    statusTime: {
        color: theme.colors.text.secondary,
        fontSize: 14,
        marginTop: 2,
    },
    viewCountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    viewCountText: {
        color: theme.colors.text.secondary,
        fontSize: 13,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    menuCard: {
        position: 'absolute',
        top: 60,
        right: 20,
        backgroundColor: theme.colors.surface,
        borderRadius: 14,
        paddingVertical: 6,
        minWidth: 190,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    menuOption: {
        paddingHorizontal: 18,
        paddingVertical: 14,
    },
    menuText: {
        color: theme.colors.text.primary,
        fontSize: 16,
        fontWeight: '500',
    },
    // Viewer Modal Styles
    viewerModalContainer: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    viewerModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.colors.border,
    },
    viewerModalTitle: {
        color: theme.colors.text.primary,
        fontSize: 18,
        fontWeight: '700',
    },
    closeIcon: {
        padding: 4,
    },
    viewerList: {
        paddingBottom: 40,
    },
    viewerItem: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 12,
        alignItems: 'center',
    },
    viewerAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    viewerInfo: {
        flex: 1,
        marginLeft: 16,
    },
    viewerName: {
        color: theme.colors.text.primary,
        fontSize: 16,
        fontWeight: '600',
    },
    viewerTime: {
        color: theme.colors.text.secondary,
        fontSize: 13,
        marginTop: 2,
    },
    emptyViewers: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyViewersText: {
        color: theme.colors.text.secondary,
        fontSize: 16,
    }
});

export default StatusListScreen;
