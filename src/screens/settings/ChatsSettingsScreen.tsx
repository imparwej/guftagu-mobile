import { LucideArrowLeft, LucideChevronRight } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme/theme';

const ChatsSettingsScreen = ({ navigation }: any) => {
    const [enterIsSend, setEnterIsSend] = useState(false);
    const [mediaVisibility, setMediaVisibility] = useState(true);
    const [keepArchived, setKeepArchived] = useState(true);

    const renderSettingItemAction = (title: string, subtitle?: string) => (
        <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{title}</Text>
                {subtitle && <Text style={[styles.settingValue, { marginTop: 4 }]}>{subtitle}</Text>}
            </View>
        </TouchableOpacity>
    );

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

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <LucideArrowLeft color={theme.colors.text.primary} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chats</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Display</Text>
                    <TouchableOpacity style={styles.settingItem}>
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingTitle}>Theme</Text>
                            <Text style={styles.settingValue}>System default</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.settingItem}>
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingTitle}>Wallpaper</Text>
                        </View>
                        <LucideChevronRight color={theme.colors.text.secondary} size={20} />
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Chat settings</Text>
                    {renderToggleItem('Enter is send', 'Enter key will send your message', enterIsSend, setEnterIsSend)}
                    {renderToggleItem('Media visibility', 'Show newly downloaded media in your device\'s gallery', mediaVisibility, setMediaVisibility)}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Archived chats</Text>
                    {renderToggleItem('Keep chats archived', 'Archived chats will remain archived when you receive a new message', keepArchived, setKeepArchived)}
                </View>

                <View style={styles.section}>
                    {renderSettingItemAction('Chat backup')}
                    {renderSettingItemAction('Transfer chats')}
                    {renderSettingItemAction('Chat history')}
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

export default ChatsSettingsScreen;
