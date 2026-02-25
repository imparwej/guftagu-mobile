import { LucideArrowLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme/theme';

const NotificationsScreen = ({ navigation }: any) => {
    const [conversationTones, setConversationTones] = useState(true);
    const [highPriority, setHighPriority] = useState(true);
    const [reactionNotifications, setReactionNotifications] = useState(true);

    const renderToggleItem = (title: string, subtitle: string, value: boolean, onValueChange: (val: boolean) => void) => (
        <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{title}</Text>
                <Text style={[styles.settingValue, { marginTop: 4 }]}>{subtitle}</Text>
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
                thumbColor="#fff"
            />
        </View>
    );

    const renderSettingItemAction = (title: string, value: string) => (
        <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{title}</Text>
                <Text style={[styles.settingValue, { marginTop: 4 }]}>{value}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <LucideArrowLeft color={theme.colors.text.primary} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    {renderToggleItem('Conversation tones', 'Play sounds for incoming and outgoing messages.', conversationTones, setConversationTones)}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Messages</Text>
                    {renderSettingItemAction('Notification tone', 'Default (Aurora)')}
                    {renderSettingItemAction('Vibrate', 'Default')}
                    {renderSettingItemAction('Light', 'White')}
                    {renderToggleItem('Use high priority notifications', 'Show previews of notifications at the top of the screen', highPriority, setHighPriority)}
                    {renderToggleItem('Reaction Notifications', 'Show notifications for reactions to messages you send', reactionNotifications, setReactionNotifications)}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Groups</Text>
                    {renderSettingItemAction('Notification tone', 'Default (Aurora)')}
                    {renderSettingItemAction('Vibrate', 'Default')}
                    {renderSettingItemAction('Light', 'White')}
                    {renderToggleItem('Use high priority notifications', 'Show previews of notifications at the top of the screen', highPriority, () => { })}
                    {renderToggleItem('Reaction Notifications', 'Show notifications for reactions to messages you send', reactionNotifications, () => { })}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Calls</Text>
                    {renderSettingItemAction('Ringtone', 'Default')}
                    {renderSettingItemAction('Vibrate', 'Default')}
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
        marginTop: 20,
    },
    backButton: {
        padding: theme.spacing.xs,
        marginRight: theme.spacing.md,
    },
    headerTitle: {
        color: theme.colors.text.primary,
        fontSize: theme.typography.sizes.xl,
        fontWeight: theme.typography.weights.bold as any,
    },
    content: {
        flex: 1,
    },
    section: {
        marginTop: theme.spacing.lg,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.secondary,
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
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    settingInfo: {
        flex: 1,
        paddingRight: theme.spacing.md,
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
});

export default NotificationsScreen;
