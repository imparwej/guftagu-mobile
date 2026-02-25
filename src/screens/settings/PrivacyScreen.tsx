import { LucideArrowLeft, LucideChevronRight } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme/theme';

const PrivacyScreen = ({ navigation }: any) => {
    const [readReceipts, setReadReceipts] = useState(true);

    const renderSettingItem = (title: string, value: string, showChevron: boolean = true) => (
        <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{title}</Text>
                <Text style={styles.settingValue}>{value}</Text>
            </View>
            {showChevron && <LucideChevronRight color={theme.colors.text.secondary} size={20} />}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <LucideArrowLeft color={theme.colors.text.primary} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Who can see my personal info</Text>
                    {renderSettingItem('Last seen and online', 'Nobody')}
                    {renderSettingItem('Profile photo', 'My contacts')}
                    {renderSettingItem('About', 'Everyone')}
                    {renderSettingItem('Status', 'My contacts')}
                </View>

                <View style={styles.section}>
                    <View style={styles.settingItem}>
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingTitle}>Read receipts</Text>
                            <Text style={[styles.settingValue, { marginTop: 4 }]}>
                                If turned off, you won't send or receive read receipts.
                            </Text>
                        </View>
                        <Switch
                            value={readReceipts}
                            onValueChange={setReadReceipts}
                            trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
                            thumbColor="#fff"
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    {renderSettingItem('Disappearing messages', 'Off')}
                </View>

                <View style={styles.section}>
                    {renderSettingItem('Groups', 'Everyone')}
                    {renderSettingItem('Live location', 'None')}
                    {renderSettingItem('Calls', 'Silence unknown callers')}
                    {renderSettingItem('Blocked contacts', '12')}
                    {renderSettingItem('App lock', 'Disabled')}
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

export default PrivacyScreen;
