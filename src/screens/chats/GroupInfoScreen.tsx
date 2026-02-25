import { LucideArrowLeft, LucideBell, LucideChevronRight, LucideHash, LucideLogOut, LucidePhone, LucideSearch, LucideUserPlus, LucideVideo } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme/theme';

const GroupInfoScreen = ({ route, navigation }: any) => {
    // In a real app we'd fetch the group info using route.params.chatId
    // Using dummy data for now
    const group = {
        name: 'Design Team',
        members: 12,
        avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150',
        description: 'Design discussions and reviews.',
        createdAt: 'Created by You, 10/12/2023'
    };

    const dummyParticipants = [
        { id: '1', name: 'You', status: 'Available', abstract: true },
        { id: '2', name: 'Alice', status: 'Busy', avatar: 'https://i.pravatar.cc/150?u=2' },
        { id: '3', name: 'Bob', status: 'At work', avatar: 'https://i.pravatar.cc/150?u=3' },
    ];

    const [muteNotifications, setMuteNotifications] = useState(false);

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
                    <Image source={{ uri: group.avatar }} style={styles.avatar} />
                    <Text style={styles.nameText}>{group.name}</Text>
                    <Text style={styles.subtitleText}>Group • {group.members} participants</Text>
                </View>

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

                {/* Add participant */}
                <View style={styles.section}>
                    <TouchableOpacity style={styles.settingItem}>
                        <LucideUserPlus color={theme.colors.accent} size={24} />
                        <Text style={[styles.settingTitle, { color: theme.colors.accent, marginLeft: 16 }]}>Add participants</Text>
                    </TouchableOpacity>
                </View>

                {/* Media */}
                <View style={styles.section}>
                    <TouchableOpacity style={styles.settingItem}>
                        <Text style={styles.settingTitle}>Media, links, and docs</Text>
                        <View style={styles.itemRight}>
                            <Text style={styles.settingValue}>128</Text>
                            <LucideChevronRight color={theme.colors.text.secondary} size={20} />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Settings */}
                <View style={styles.section}>
                    <View style={styles.settingItem}>
                        <View style={styles.settingInfoWithIcon}>
                            <LucideBell color={theme.colors.text.secondary} size={24} />
                            <Text style={[styles.settingTitle, { marginLeft: 16 }]}>Mute notifications</Text>
                        </View>
                        <Switch
                            value={muteNotifications}
                            onValueChange={setMuteNotifications}
                            trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
                            thumbColor="#fff"
                        />
                    </View>
                    <TouchableOpacity style={styles.settingItem}>
                        <Text style={styles.settingTitle}>Custom notifications</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.settingItem}>
                        <Text style={styles.settingTitle}>Media visibility</Text>
                    </TouchableOpacity>
                </View>

                {/* Group settings */}
                <View style={styles.section}>
                    <TouchableOpacity style={styles.settingItem}>
                        <View style={styles.settingInfoWithIcon}>
                            <LucideHash color={theme.colors.text.secondary} size={24} />
                            <Text style={[styles.settingTitle, { marginLeft: 16 }]}>Group settings</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Participants */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{group.members} participants</Text>
                    {dummyParticipants.map((p, index) => (
                        <TouchableOpacity key={index} style={styles.participantItem}>
                            {p.abstract ? (
                                <View style={[styles.participantAvatar, { backgroundColor: theme.colors.accent }]}>
                                    <Text style={styles.abstractAvatarText}>{p.name[0]}</Text>
                                </View>
                            ) : (
                                <Image source={{ uri: p.avatar }} style={styles.participantAvatar} />
                            )}
                            <View style={styles.participantInfo}>
                                <Text style={styles.participantName}>{p.name}</Text>
                                <Text style={styles.participantStatus}>{p.status}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity style={styles.viewAllButton}>
                        <Text style={styles.viewAllText}>View all past participants</Text>
                    </TouchableOpacity>
                </View>

                {/* Actions */}
                <View style={styles.section}>
                    <TouchableOpacity style={styles.settingItem}>
                        <LucideLogOut color={theme.colors.error} size={24} />
                        <Text style={[styles.settingTitle, { color: theme.colors.error, marginLeft: 16 }]}>Exit group</Text>
                    </TouchableOpacity>
                </View>
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
        position: 'absolute',
        top: 20, // safe area top
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
    nameText: {
        color: theme.colors.text.primary,
        fontSize: theme.typography.sizes.xl,
        fontWeight: theme.typography.weights.bold as any,
        marginBottom: 4,
    },
    subtitleText: {
        color: theme.colors.text.secondary,
        fontSize: theme.typography.sizes.md,
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
    sectionTitle: {
        color: theme.colors.accent,
        fontSize: theme.typography.sizes.sm,
        fontWeight: theme.typography.weights.semibold as any,
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.md,
        paddingBottom: theme.spacing.sm,
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
    settingInfoWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    itemRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingTitle: {
        color: theme.colors.text.primary,
        fontSize: theme.typography.sizes.md,
    },
    settingValue: {
        color: theme.colors.text.secondary,
        fontSize: theme.typography.sizes.sm,
        marginRight: 8,
    },
    participantItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.lg,
    },
    participantAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: theme.spacing.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    abstractAvatarText: {
        color: '#fff',
        fontSize: theme.typography.sizes.md,
        fontWeight: 'bold',
    },
    participantInfo: {
        flex: 1,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.colors.border,
        paddingBottom: theme.spacing.sm,
    },
    participantName: {
        color: theme.colors.text.primary,
        fontSize: theme.typography.sizes.md,
        marginBottom: 2,
    },
    participantStatus: {
        color: theme.colors.text.secondary,
        fontSize: theme.typography.sizes.xs,
    },
    viewAllButton: {
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
    },
    viewAllText: {
        color: theme.colors.accent,
        fontSize: theme.typography.sizes.sm,
    }
});

export default GroupInfoScreen;
