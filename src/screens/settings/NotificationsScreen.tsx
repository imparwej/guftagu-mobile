import {
    LucideArrowLeft,
    LucideChevronRight,
    LucideCircle,
    LucideMusic,
    LucideSmartphone,
    LucideVibrate
} from 'lucide-react-native';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import PressableScale from '../../components/PressableScale';
import { updateNotifications } from '../../store/slices/settingsSlice';
import { RootState } from '../../store/store';
import { theme } from '../../theme/theme';

const NotificationsScreen = ({ navigation }: any) => {
    const dispatch = useDispatch();
    const notifications = useSelector((state: RootState) => state.settings.notifications);

    const updatePref = (key: string, value: any) => {
        dispatch(updateNotifications({ [key]: value }));
    };

    const selectTone = (type: 'messages' | 'groups' | 'calls') => {
        const tones = ['Default (Aurora)', 'Crystal', 'Chimes', 'Waves', 'Pulse'];
        Alert.alert(
            `Select ${type === 'calls' ? 'Ringtone' : 'Notification Tone'}`,
            'Choose a sound for your notifications.',
            tones.map(tone => ({
                text: tone,
                onPress: () => updatePref(type === 'calls' ? 'callTone' : `${type}Tone`, tone)
            })),
            { cancelable: true }
        );
    };

    const selectVibrate = (type: 'messages' | 'groups' | 'calls') => {
        const options = ['Off', 'Default', 'Short', 'Long'];
        Alert.alert(
            'Vibration',
            'Choose vibration length.',
            options.map(opt => ({
                text: opt,
                onPress: () => updatePref(`${type}Vibrate`, opt)
            })),
            { cancelable: true }
        );
    };

    const selectLight = (type: 'messages' | 'groups') => {
        const colors = ['None', 'White', 'Red', 'Yellow', 'Green', 'Cyan', 'Blue', 'Purple'];
        Alert.alert(
            'Light Color',
            'Choose LED notification color (if supported).',
            colors.map(color => ({
                text: color,
                onPress: () => updatePref(`${type}Light`, color)
            })),
            { cancelable: true }
        );
    };

    const renderToggleItem = (title: string, subtitle: string, value: boolean, onValueChange: (val: boolean) => void) => (
        <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{title}</Text>
                <Text style={styles.settingSubtitle}>{subtitle}</Text>
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
                thumbColor="#fff"
            />
        </View>
    );

    const renderActionItem = (icon: any, title: string, value: string, onPress: () => void) => {
        const Icon = icon;
        return (
            <PressableScale style={styles.settingItem} onPress={onPress} scaleTo={0.98}>
                <View style={[styles.iconContainer, { width: 30 }]}>
                    <Icon color={theme.colors.text.secondary} size={20} />
                </View>
                <View style={styles.settingInfo}>
                    <Text style={styles.settingTitle}>{title}</Text>
                    <Text style={styles.settingSubtitle}>{value}</Text>
                </View>
                <LucideChevronRight color={theme.colors.text.tertiary} size={18} />
            </PressableScale>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <PressableScale onPress={() => navigation.goBack()} style={styles.backButton}>
                    <LucideArrowLeft color={theme.colors.text.primary} size={28} />
                </PressableScale>
                <Text style={styles.headerTitle}>Notifications</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>General</Text>
                    {renderToggleItem('Conversation tones', 'Play sounds for incoming and outgoing messages.', notifications.conversationTones, (v) => updatePref('conversationTones', v))}
                </View>

                <View style={styles.sectionDivider} />

                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Messages</Text>
                    {renderActionItem(LucideMusic, 'Notification tone', notifications.messagesTone, () => selectTone('messages'))}
                    {renderActionItem(LucideVibrate, 'Vibrate', notifications.messagesVibrate, () => selectVibrate('messages'))}
                    {renderActionItem(LucideCircle, 'Light', notifications.messagesLight, () => selectLight('messages'))}
                    {renderToggleItem('High priority notifications', 'Show previews of notifications at the top of the screen', notifications.messagesHighPriority, (v) => updatePref('messagesHighPriority', v))}
                    {renderToggleItem('Reaction notifications', 'Show notifications for reactions to messages you send', notifications.messagesReactions, (v) => updatePref('messagesReactions', v))}
                </View>

                <View style={styles.sectionDivider} />

                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Groups</Text>
                    {renderActionItem(LucideMusic, 'Notification tone', notifications.groupsTone, () => selectTone('groups'))}
                    {renderActionItem(LucideVibrate, 'Vibrate', notifications.groupsVibrate, () => selectVibrate('groups'))}
                    {renderActionItem(LucideCircle, 'Light', notifications.groupsLight, () => selectLight('groups'))}
                    {renderToggleItem('High priority notifications', 'Show previews of notifications at the top of the screen', notifications.groupsHighPriority, (v) => updatePref('groupsHighPriority', v))}
                    {renderToggleItem('Reaction notifications', 'Show notifications for reactions to messages you send', notifications.groupsReactions, (v) => updatePref('groupsReactions', v))}
                </View>

                <View style={styles.sectionDivider} />

                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Calls</Text>
                    {renderActionItem(LucideSmartphone, 'Ringtone', notifications.callTone, () => selectTone('calls'))}
                    {renderActionItem(LucideVibrate, 'Vibrate', notifications.callVibrate, () => selectVibrate('calls'))}
                </View>

                <View style={styles.footer}>
                    <PressableScale onPress={() => Alert.alert('Reset', 'Notification settings reset to default.')}>
                        <Text style={styles.footerText}>Reset notification settings</Text>
                    </PressableScale>
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
    },
    footer: {
        padding: 40,
        paddingBottom: 60,
        alignItems: 'center',
    },
    footerText: {
        color: theme.colors.error,
        fontWeight: '700',
        fontSize: 14,
        letterSpacing: 0.5,
    }
});

export default NotificationsScreen;
