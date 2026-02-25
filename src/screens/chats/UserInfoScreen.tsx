import { LucideArrowLeft, LucideBan, LucideBell, LucideChevronRight, LucideImage, LucidePhone, LucideSearch, LucideThumbsDown, LucideVideo } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme/theme';

const UserInfoScreen = ({ route, navigation }: any) => {
    // In a real app we'd fetch the user info using route.params.userId
    // Using dummy data for now
    const user = {
        name: 'Alice',
        phoneNumber: '+1 234 567 8900',
        avatar: 'https://i.pravatar.cc/150?u=2',
        status: 'Available',
        lastSeen: 'today at 10:30 AM'
    };

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
                    <Image source={{ uri: user.avatar }} style={styles.avatar} />
                    <Text style={styles.nameText}>{user.name}</Text>
                    <Text style={styles.phoneText}>{user.phoneNumber}</Text>
                    <Text style={styles.lastSeenText}>last seen {user.lastSeen}</Text>
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

                {/* About and phone */}
                <View style={styles.section}>
                    <View style={styles.settingItem}>
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingTitle}>{user.status}</Text>
                            <Text style={styles.settingValue}>April 15</Text>
                        </View>
                    </View>
                </View>

                {/* Media */}
                <View style={styles.section}>
                    <TouchableOpacity style={styles.settingItem}>
                        <Text style={styles.settingTitle}>Media, links, and docs</Text>
                        <View style={styles.itemRight}>
                            <Text style={styles.settingValue}>24</Text>
                            <LucideChevronRight color={theme.colors.text.secondary} size={20} />
                        </View>
                    </TouchableOpacity>
                    <View style={styles.mediaPreview}>
                        <View style={styles.mediaBox}>
                            <LucideImage color={theme.colors.text.secondary} size={24} />
                        </View>
                        <View style={styles.mediaBox}>
                            <LucideImage color={theme.colors.text.secondary} size={24} />
                        </View>
                        <View style={styles.mediaBox}>
                            <LucideImage color={theme.colors.text.secondary} size={24} />
                        </View>
                    </View>
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

                {/* Encryption */}
                <View style={styles.section}>
                    <TouchableOpacity style={styles.settingItem}>
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingTitle}>Encryption</Text>
                            <Text style={styles.settingValue}>Messages and calls are end-to-end encrypted. Tap to verify.</Text>
                        </View>
                        <LucideChevronRight color={theme.colors.text.secondary} size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.settingItem}>
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingTitle}>Disappearing messages</Text>
                            <Text style={styles.settingValue}>Off</Text>
                        </View>
                        <LucideChevronRight color={theme.colors.text.secondary} size={20} />
                    </TouchableOpacity>
                </View>

                {/* Actions */}
                <View style={styles.section}>
                    <TouchableOpacity style={styles.settingItem}>
                        <LucideBan color={theme.colors.error} size={24} />
                        <Text style={[styles.settingTitle, { color: theme.colors.error, marginLeft: 16 }]}>Block {user.name}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.settingItem}>
                        <LucideThumbsDown color={theme.colors.error} size={24} />
                        <Text style={[styles.settingTitle, { color: theme.colors.error, marginLeft: 16 }]}>Report {user.name}</Text>
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
    phoneText: {
        color: theme.colors.text.secondary,
        fontSize: theme.typography.sizes.md,
        marginBottom: 4,
    },
    lastSeenText: {
        color: theme.colors.text.secondary,
        fontSize: theme.typography.sizes.sm,
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
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.colors.border,
    },
    settingInfo: {
        flex: 1,
        paddingRight: theme.spacing.md,
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
        marginTop: 2,
    },
    mediaPreview: {
        flexDirection: 'row',
        padding: theme.spacing.md,
    },
    mediaBox: {
        width: 70,
        height: 70,
        backgroundColor: theme.colors.background,
        borderRadius: 8,
        marginRight: theme.spacing.sm,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
    }
});

export default UserInfoScreen;
