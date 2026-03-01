import {
    LucideBell,
    LucideCircleDashed,
    LucideHelpCircle,
    LucideKey,
    LucideLock,
    LucideMessageSquare,
    LucideQrCode,
    LucideUser,
    LucideUsers
} from 'lucide-react-native';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { TAB_BAR_HEIGHT } from '../../navigation/tabConstants';
import { RootState } from '../../store/store';
import { theme } from '../../theme/theme';

const SettingsScreen = ({ navigation }: any) => {
    const user = useSelector((state: RootState) => state.auth.user);

    const renderSettingItem = (Icon: any, title: string, subtitle: string, onPress: () => void) => (
        <TouchableOpacity style={styles.settingItem} onPress={onPress}>
            <View style={styles.iconContainer}>
                <Icon color={theme.colors.text.secondary} size={24} />
            </View>
            <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{title}</Text>
                <Text style={styles.settingSubtitle}>{subtitle}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Settings</Text>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT }}>
                <TouchableOpacity style={styles.profileSection}>
                    <Image source={{ uri: user?.avatar || 'https://i.pravatar.cc/150?u=me' }} style={styles.avatar} />
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>{user?.name || 'Guftagu User'}</Text>
                        <Text style={styles.profileStatus}>{user?.status || 'Available'}</Text>
                    </View>
                    <View style={styles.qrContainer}>
                        <LucideQrCode color={theme.colors.accent} size={28} />
                    </View>
                </TouchableOpacity>

                <View style={styles.sectionDivider} />

                {renderSettingItem(LucideKey, 'Account', 'Security notifications, change number', () => { })}
                {renderSettingItem(LucideLock, 'Privacy', 'Block contacts, disappearing messages', () => navigation.navigate('Privacy'))}
                {renderSettingItem(LucideUser, 'Avatar', 'Create, edit, profile photo', () => { })}
                {renderSettingItem(LucideMessageSquare, 'Chats', 'Theme, wallpapers, chat history', () => navigation.navigate('ChatsSettings'))}
                {renderSettingItem(LucideBell, 'Notifications', 'Message, group & call tones', () => navigation.navigate('Notifications'))}
                {renderSettingItem(LucideCircleDashed, 'Storage and data', 'Network usage, auto-download', () => navigation.navigate('Storage'))}
                {renderSettingItem(LucideHelpCircle, 'Help', 'Help center, contact us, privacy policy', () => { })}
                {renderSettingItem(LucideUsers, 'Invite a friend', '', () => { })}

                <View style={styles.footer}>
                    <Text style={styles.footerText}>from</Text>
                    <Text style={styles.footerBrand}>Guftagu</Text>
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
        paddingHorizontal: theme.spacing.xl,
        paddingTop: theme.spacing.xl,
        paddingBottom: theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        marginTop: 20,
    },
    headerTitle: {
        color: theme.colors.text.primary,
        fontSize: theme.typography.sizes.xl,
        fontWeight: theme.typography.weights.bold as any,
    },
    content: {
        flex: 1,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.lg,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: theme.spacing.md,
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        color: theme.colors.text.primary,
        fontSize: theme.typography.sizes.lg,
        fontWeight: theme.typography.weights.semibold as any,
        marginBottom: 4,
    },
    profileStatus: {
        color: theme.colors.text.secondary,
        fontSize: theme.typography.sizes.sm,
    },
    qrContainer: {
        padding: theme.spacing.sm,
    },
    sectionDivider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginBottom: theme.spacing.sm,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
    },
    iconContainer: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    settingInfo: {
        flex: 1,
    },
    settingTitle: {
        color: theme.colors.text.primary,
        fontSize: theme.typography.sizes.md,
        fontWeight: theme.typography.weights.semibold as any,
    },
    settingSubtitle: {
        color: theme.colors.text.secondary,
        fontSize: theme.typography.sizes.xs,
        marginTop: 2,
    },
    footer: {
        alignItems: 'center',
        marginTop: theme.spacing.xxl,
        marginBottom: theme.spacing.xl,
    },
    footerText: {
        color: theme.colors.text.secondary,
        fontSize: theme.typography.sizes.xs,
        marginBottom: 2,
    },
    footerBrand: {
        color: theme.colors.text.primary,
        fontSize: theme.typography.sizes.sm,
        fontWeight: 'bold',
        letterSpacing: 1,
    }
});

export default SettingsScreen;
