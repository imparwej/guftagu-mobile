import {
    LucideArrowLeft,
    LucideChevronRight,
    LucideLock,
    LucideShield,
    LucideShieldAlert,
    LucideUserX
} from 'lucide-react-native';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import PressableScale from '../../components/PressableScale';
import { updatePrivacy } from '../../store/slices/settingsSlice';
import { RootState } from '../../store/store';
import { theme } from '../../theme/theme';

const PrivacyScreen = ({ navigation }: any) => {
    const dispatch = useDispatch();
    const privacy = useSelector((state: RootState) => state.settings.privacy);

    const updatePref = (key: string, value: any) => {
        dispatch(updatePrivacy({ [key]: value }));
    };

    const selectPrivacyOption = (title: string, key: string) => {
        const options = ['Everyone', 'My contacts', 'Nobody'];
        Alert.alert(
            title,
            `Who can see my ${title.toLowerCase()}`,
            options.map(opt => ({
                text: `${privacy[key as keyof typeof privacy] === opt ? '✓ ' : ''}${opt}`,
                onPress: () => updatePref(key, opt)
            })),
            { cancelable: true }
        );
    };

    const renderActionItem = (title: string, value: string, onPress: () => void) => (
        <PressableScale style={styles.settingItem} onPress={onPress} scaleTo={0.98}>
            <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{title}</Text>
                <Text style={styles.settingSubtitle}>{value}</Text>
            </View>
            <LucideChevronRight color={theme.colors.text.tertiary} size={18} />
        </PressableScale>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <PressableScale onPress={() => navigation.goBack()} style={styles.backButton}>
                    <LucideArrowLeft color={theme.colors.text.primary} size={28} />
                </PressableScale>
                <Text style={styles.headerTitle}>Privacy</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Who can see my personal info</Text>
                    {renderActionItem('Last seen and online', privacy.lastSeen, () => selectPrivacyOption('Last seen and online', 'lastSeen'))}
                    {renderActionItem('Profile photo', privacy.profilePhoto, () => selectPrivacyOption('Profile photo', 'profilePhoto'))}
                    {renderActionItem('About', privacy.about, () => selectPrivacyOption('About', 'about'))}
                    {renderActionItem('Status', privacy.status, () => selectPrivacyOption('Status', 'status'))}

                    <View style={styles.settingItem}>
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingTitle}>Read receipts</Text>
                            <Text style={styles.settingSubtitle}>If turned off, you won't send or receive read receipts. Read receipts are always sent for group chats.</Text>
                        </View>
                        <Switch
                            value={privacy.readReceipts}
                            onValueChange={(v) => updatePref('readReceipts', v)}
                            trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
                            thumbColor="#fff"
                        />
                    </View>
                </View>

                <View style={styles.sectionDivider} />

                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Disappearing Messages</Text>
                    {renderActionItem('Default message timer', privacy.disappearingMessages, () => {
                        const options = ['24 hours', '7 days', '90 days', 'Off'];
                        Alert.alert('Default message timer', 'Start new chats with disappearing messages set to your timer', options.map(opt => ({
                            text: opt,
                            onPress: () => updatePref('disappearingMessages', opt)
                        })));
                    })}
                </View>

                <View style={styles.sectionDivider} />

                <View style={styles.section}>
                    <PressableScale style={styles.settingItem} scaleTo={0.98}>
                        <View style={styles.iconContainer}>
                            <LucideShield color={theme.colors.text.secondary} size={20} />
                        </View>
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingTitle}>Groups</Text>
                            <Text style={styles.settingSubtitle}>{privacy.groups}</Text>
                        </View>
                    </PressableScale>

                    <PressableScale style={styles.settingItem} scaleTo={0.98}>
                        <View style={styles.iconContainer}>
                            <LucideUserX color={theme.colors.text.secondary} size={20} />
                        </View>
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingTitle}>Blocked contacts</Text>
                            <Text style={styles.settingSubtitle}>{privacy.blockedContacts}</Text>
                        </View>
                    </PressableScale>

                    <TouchableOpacity style={styles.settingItem}>
                        <View style={styles.iconContainer}>
                            <LucideLock color={theme.colors.text.secondary} size={20} />
                        </View>
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingTitle}>App lock</Text>
                            <Text style={styles.settingSubtitle}>{privacy.appLock ? 'Enabled' : 'Disabled'}</Text>
                        </View>
                        <Switch
                            value={privacy.appLock}
                            onValueChange={(v) => updatePref('appLock', v)}
                            trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
                            thumbColor="#fff"
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <View style={styles.safetyCard}>
                        <LucideShieldAlert color={theme.colors.accent} size={24} style={{ marginBottom: 8 }} />
                        <Text style={styles.safetyTitle}>Your privacy is our priority</Text>
                        <Text style={styles.safetyText}>Guftagu uses end-to-end encryption to keep your personal messages and calls secure.</Text>
                    </View>
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
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    backButton: {
        marginRight: theme.spacing.md,
    },
    headerTitle: {
        color: theme.colors.text.primary,
        fontSize: theme.typography.sizes.xl,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
    },
    section: {
        backgroundColor: theme.colors.background,
    },
    sectionHeader: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    sectionDivider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        marginVertical: 10,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 18,
    },
    iconContainer: {
        width: 40,
        alignItems: 'center',
        marginRight: 12,
    },
    settingInfo: {
        flex: 1,
    },
    settingTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    },
    settingSubtitle: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 13,
        marginTop: 4,
        lineHeight: 18,
    },
    footer: {
        padding: 20,
        paddingBottom: 60,
    },
    safetyCard: {
        backgroundColor: '#1C1C1E',
        padding: 24,
        borderRadius: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.06)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    safetyTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
    },
    safetyText: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 20,
    }
});

export default PrivacyScreen;
