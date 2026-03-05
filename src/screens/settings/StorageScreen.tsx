import {
    LucideArrowLeft,
    LucideDatabase,
    LucideFolder,
    LucideHardDrive,
    LucideHistory,
    LucideSmartphone,
    LucideTrash2
} from 'lucide-react-native';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import PressableScale from '../../components/PressableScale';
import { updateStorage } from '../../store/slices/settingsSlice';
import { RootState } from '../../store/store';
import { theme } from '../../theme/theme';

const StorageScreen = ({ navigation }: any) => {
    const dispatch = useDispatch();
    const storage = useSelector((state: RootState) => state.settings.storage);

    const updatePref = (key: string, value: any) => {
        dispatch(updateStorage({ [key]: value }));
    };

    const handleClearCache = () => {
        Alert.alert(
            'Clear Cache',
            'This will free up space by removing temporary files. Your messages and media will not be deleted.',
            [
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: () => {
                        Alert.alert('Success', 'Cache cleared successfully.');
                    }
                },
                { text: 'Cancel', style: 'cancel' }
            ]
        );
    };

    const selectAutoDownload = (type: 'mobileData' | 'wifi' | 'roaming') => {
        const options = ['Photos', 'Audio', 'Videos', 'Documents'];
        const current = storage.autoDownload[type];

        Alert.alert(
            `Auto-download (${type})`,
            'Select media types to download automatically.',
            options.map(opt => ({
                text: `${current.includes(opt) ? '✓ ' : ''}${opt}`,
                onPress: () => {
                    const next = current.includes(opt)
                        ? current.filter(i => i !== opt)
                        : [...current, opt];
                    updatePref('autoDownload', { ...storage.autoDownload, [type]: next });
                }
            })),
            { cancelable: true }
        );
    };

    const renderUsageBar = () => {
        const data = [
            { label: 'Photos', size: '1.2 GB', color: '#FF3B30', flex: 0.3 },
            { label: 'Videos', size: '4.5 GB', color: '#FF9500', flex: 0.4 },
            { label: 'Apps', size: '2.1 GB', color: '#34C759', flex: 0.2 },
            { label: 'Free', size: '12.4 GB', color: 'rgba(255,255,255,0.1)', flex: 0.1 },
        ];

        return (
            <View style={styles.usageContainer}>
                <View style={styles.usageBar}>
                    {data.map((item, i) => (
                        <View
                            key={i}
                            style={[
                                styles.usageSegment,
                                { flex: item.flex, backgroundColor: item.color },
                                i === 0 && { borderTopLeftRadius: 10, borderBottomLeftRadius: 10 },
                                i === data.length - 1 && { borderTopRightRadius: 10, borderBottomRightRadius: 10 }
                            ]}
                        />
                    ))}
                </View>
                <View style={styles.usageLabels}>
                    {data.filter(d => d.label !== 'Free').map((item, i) => (
                        <View key={i} style={styles.usageLabelItem}>
                            <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                            <Text style={styles.usageLabelText}>{item.label}: {item.size}</Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    const renderActionItem = (icon: any, title: string, subtitle: string, onPress?: () => void, color?: string) => {
        const Icon = icon;
        return (
            <PressableScale style={styles.settingItem} onPress={onPress} scaleTo={0.98}>
                <View style={styles.iconContainer}>
                    <Icon color={color || theme.colors.text.secondary} size={22} />
                </View>
                <View style={styles.settingInfo}>
                    <Text style={styles.settingTitle}>{title}</Text>
                    <Text style={styles.settingSubtitle}>{subtitle}</Text>
                </View>
            </PressableScale>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <PressableScale onPress={() => navigation.goBack()} style={styles.backButton}>
                    <LucideArrowLeft color={theme.colors.text.primary} size={28} />
                </PressableScale>
                <Text style={styles.headerTitle}>Storage and Data</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Storage Usage</Text>
                    {renderUsageBar()}
                    {renderActionItem(LucideHardDrive, 'Manage storage', '7.8 GB used of 20 GB', () => { })}
                    {renderActionItem(LucideTrash2, 'Clear cache', 'Free up 450 MB', handleClearCache, theme.colors.error)}
                </View>

                <View style={styles.sectionDivider} />

                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Network Usage</Text>
                    {renderActionItem(LucideDatabase, 'Network usage', '2.4 GB sent • 8.1 GB received', () => { })}
                    <View style={styles.settingItem}>
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingTitle}>Use less data for calls</Text>
                            <Text style={styles.settingSubtitle}>Reduces data used during Guftagu calls</Text>
                        </View>
                        <Switch
                            value={storage.lowDataUsage}
                            onValueChange={(v) => updatePref('lowDataUsage', v)}
                            trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
                            thumbColor="#fff"
                        />
                    </View>
                </View>

                <View style={styles.sectionDivider} />

                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Media Auto-download</Text>
                    <Text style={styles.sectionIntro}>Voice messages are always automatically downloaded for the best communication experience.</Text>
                    {renderActionItem(LucideSmartphone, 'When using mobile data', storage.autoDownload.mobileData.join(', ') || 'No media', () => selectAutoDownload('mobileData'))}
                    {renderActionItem(LucideFolder, 'When connected on Wi-Fi', storage.autoDownload.wifi.join(', ') || 'No media', () => selectAutoDownload('wifi'))}
                    {renderActionItem(LucideHistory, 'When roaming', storage.autoDownload.roaming.join(', ') || 'No media', () => selectAutoDownload('roaming'))}
                </View>

                <View style={styles.sectionDivider} />

                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Media Upload Quality</Text>
                    {renderActionItem(LucideFolder, 'Photo upload quality', 'Auto (recommended)', () => { })}
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Reset storage and data settings</Text>
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
    sectionIntro: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 12,
        paddingHorizontal: 20,
        paddingBottom: 16,
        lineHeight: 18,
    },
    sectionDivider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        marginVertical: 10,
    },
    usageContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    usageBar: {
        height: 12,
        flexDirection: 'row',
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    usageSegment: {
        height: '100%',
    },
    usageLabels: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    usageLabelItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
        marginBottom: 8,
    },
    colorDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    usageLabelText: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 12,
        fontWeight: '500',
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

export default StorageScreen;
