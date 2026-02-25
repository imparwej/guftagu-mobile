import { LucideArrowLeft, LucideDatabase, LucideFolder } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme/theme';

const StorageScreen = ({ navigation }: any) => {
    const [useLessData, setUseLessData] = useState(false);

    const renderSettingItemAction = (Icon: any, title: string, subtitle: string) => (
        <TouchableOpacity style={styles.settingItem}>
            <View style={styles.iconContainer}>
                <Icon color={theme.colors.text.secondary} size={24} />
            </View>
            <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{title}</Text>
                <Text style={styles.settingValue}>{subtitle}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <LucideArrowLeft color={theme.colors.text.primary} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Storage and data</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    {renderSettingItemAction(LucideFolder, 'Manage storage', '2.4 GB')}
                    <View style={styles.divider} />
                    {renderSettingItemAction(LucideDatabase, 'Network usage', '1.2 GB sent • 4.5 GB received')}
                    <View style={styles.divider} />
                    <View style={styles.settingItemToggle}>
                        <View style={styles.settingInfoToggle}>
                            <Text style={styles.settingTitle}>Use less data for calls</Text>
                        </View>
                        <Switch
                            value={useLessData}
                            onValueChange={setUseLessData}
                            trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
                            thumbColor="#fff"
                        />
                    </View>
                </View>

                <View style={styles.sectionTitleContainer}>
                    <Text style={styles.sectionTitle}>Media auto-download</Text>
                    <Text style={styles.sectionSubtitle}>Voice messages are always automatically downloaded</Text>
                </View>

                <View style={styles.section}>
                    <TouchableOpacity style={styles.settingItemTextOnly}>
                        <Text style={styles.settingTitle}>When using mobile data</Text>
                        <Text style={styles.settingValue}>Photos</Text>
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.settingItemTextOnly}>
                        <Text style={styles.settingTitle}>When connected on Wi-Fi</Text>
                        <Text style={styles.settingValue}>All media</Text>
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.settingItemTextOnly}>
                        <Text style={styles.settingTitle}>When roaming</Text>
                        <Text style={styles.settingValue}>No media</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.sectionTitleContainer}>
                    <Text style={styles.sectionTitle}>Media upload quality</Text>
                    <Text style={styles.sectionSubtitle}>Choose the quality of media files to be sent</Text>
                </View>

                <View style={styles.section}>
                    <TouchableOpacity style={styles.settingItemTextOnly}>
                        <Text style={styles.settingTitle}>Photo upload quality</Text>
                        <Text style={styles.settingValue}>Auto (recommended)</Text>
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
        marginVertical: theme.spacing.sm,
    },
    sectionTitleContainer: {
        paddingHorizontal: theme.spacing.xl,
        paddingTop: theme.spacing.lg,
        paddingBottom: theme.spacing.xs,
    },
    sectionTitle: {
        color: theme.colors.text.secondary,
        fontSize: theme.typography.sizes.sm,
        fontWeight: theme.typography.weights.semibold as any,
        marginBottom: 2,
    },
    sectionSubtitle: {
        color: theme.colors.text.secondary,
        fontSize: theme.typography.sizes.xs,
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
    settingItemToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.xl,
    },
    settingInfoToggle: {
        flex: 1,
    },
    settingItemTextOnly: {
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.xl,
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
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: theme.colors.border,
        marginLeft: 74,
    }
});

export default StorageScreen;
