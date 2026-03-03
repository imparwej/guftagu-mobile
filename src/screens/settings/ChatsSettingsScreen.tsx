import {
    LucideArrowLeft,
    LucideCheck,
    LucideChevronRight,
    LucideHistory,
    LucideMonitor,
    LucidePalette,
    LucideSmartphone,
    LucideSun,
    LucideUploadCloud
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    ImageBackground,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { updateBackup, updateTheme } from '../../store/slices/settingsSlice';
import { RootState } from '../../store/store';
import { theme } from '../../theme/theme';

const BRIGHTNESS_LEVELS = [
    { label: 'Low', value: 0.3 },
    { label: 'Medium', value: 0.6 },
    { label: 'Normal', value: 1.0 },
];

const WALLPAPERS = [
    { id: 'nature1', type: 'nature', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=400' },
    { id: 'nature2', type: 'nature', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=400' },
    { id: 'solid1', type: 'solid', color: '#0B141B' },
    { id: 'solid2', type: 'solid', color: '#1B242B' },
    { id: 'solid3', type: 'solid', color: '#2B141B' },
];

const ChatsSettingsScreen = ({ navigation }: any) => {
    const dispatch = useDispatch();
    const settings = useSelector((state: RootState) => state.settings);

    const [enterIsSend, setEnterIsSend] = useState(false);
    const [mediaVisibility, setMediaVisibility] = useState(true);
    const [keepArchived, setKeepArchived] = useState(true);

    const [showWallpaperModal, setShowWallpaperModal] = useState(false);
    const [tempTheme, setTempTheme] = useState(settings.theme);

    const handleApplyTheme = () => {
        dispatch(updateTheme(tempTheme));
        setShowWallpaperModal(false);
    };

    const handleBackup = () => {
        Alert.alert(
            'Backup to Google Drive',
            'Back up your messages and media to Google Drive. You can restore them when you reinstall Guftagu.',
            [
                {
                    text: 'Back Up',
                    onPress: () => {
                        Alert.alert('Backing up...', 'Please wait while we secure your chats.');
                        setTimeout(() => {
                            dispatch(updateBackup({ lastBackup: new Date().toLocaleString() }));
                            Alert.alert('Success', 'Backup completed.');
                        }, 2000);
                    }
                },
                { text: 'Cancel', style: 'cancel' }
            ]
        );
    };

    const handleTransfer = () => {
        Alert.alert(
            'Transfer Chats',
            'Transfer your chat history to another Android device or iPhone.',
            [
                { text: 'Start', onPress: () => Alert.alert('Searching...', 'Ensure Guftagu is open on your new device and both devices are on the same Wi-Fi.') },
                { text: 'Cancel', style: 'cancel' }
            ]
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

    const renderActionItem = (icon: any, title: string, subtitle: string, onPress: () => void) => {
        const Icon = icon;
        return (
            <TouchableOpacity style={styles.settingItem} onPress={onPress}>
                <View style={styles.iconContainer}>
                    <Icon color={theme.colors.text.secondary} size={22} />
                </View>
                <View style={styles.settingInfo}>
                    <Text style={styles.settingTitle}>{title}</Text>
                    <Text style={styles.settingSubtitle}>{subtitle}</Text>
                </View>
                <LucideChevronRight color={theme.colors.text.tertiary} size={20} />
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <LucideArrowLeft color={theme.colors.text.primary} size={28} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chats</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Display</Text>
                    {renderActionItem(LucideMonitor, 'Theme', 'Dark', () => { })}
                    {renderActionItem(LucidePalette, 'Wallpaper', 'Choose chat background', () => setShowWallpaperModal(true))}
                </View>

                <View style={styles.sectionDivider} />

                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Chat settings</Text>
                    {renderToggleItem('Enter is send', 'Enter key will send your message', enterIsSend, setEnterIsSend)}
                    {renderToggleItem('Media visibility', 'Show newly downloaded media in your device\'s gallery', mediaVisibility, setMediaVisibility)}
                    <TouchableOpacity style={styles.settingItem}>
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingTitle}>Font size</Text>
                            <Text style={styles.settingSubtitle}>Medium</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.sectionDivider} />

                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Archived chats</Text>
                    {renderToggleItem('Keep chats archived', 'Archived chats will remain archived when you receive a new message', keepArchived, setKeepArchived)}
                </View>

                <View style={styles.sectionDivider} />

                <View style={styles.section}>
                    {renderActionItem(LucideUploadCloud, 'Chat backup', settings.backup.lastBackup ? `Last backup: ${settings.backup.lastBackup}` : 'Never backed up', handleBackup)}
                    {renderActionItem(LucideSmartphone, 'Transfer chats', 'Move chats to another device', handleTransfer)}
                    {renderActionItem(LucideHistory, 'Chat history', 'Export, archive, clear, or delete all chats', () => { })}
                </View>
            </ScrollView>

            <Modal visible={showWallpaperModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <SafeAreaView style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={() => setShowWallpaperModal(false)}>
                                <LucideArrowLeft color={theme.colors.text.primary} size={28} />
                            </TouchableOpacity>
                            <Text style={modalStyles.modalTitle}>Wallpaper Preview</Text>
                            <TouchableOpacity onPress={handleApplyTheme}>
                                <LucideCheck color={theme.colors.success} size={28} />
                            </TouchableOpacity>
                        </View>

                        <View style={modalStyles.previewArea}>
                            {tempTheme.type === 'solid' ? (
                                <View style={[modalStyles.wallpaperPreview, { backgroundColor: tempTheme.value }]} />
                            ) : (
                                <ImageBackground source={{ uri: tempTheme.value }} style={modalStyles.wallpaperPreview} />
                            )}
                            <View style={[modalStyles.dimmer, { opacity: 1 - tempTheme.brightness }]} />

                            <View style={modalStyles.chatBubbleMock}>
                                <Text style={modalStyles.bubbleText}>Hey look, a preview!</Text>
                            </View>
                        </View>

                        <View style={modalStyles.controlsArea}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                <LucideSun color={theme.colors.text.secondary} size={18} />
                                <Text style={[modalStyles.controlLabel, { marginBottom: 0, marginLeft: 8 }]}>Wallpaper Brightness</Text>
                            </View>
                            <View style={modalStyles.brightnessContainer}>
                                {BRIGHTNESS_LEVELS.map((level) => (
                                    <TouchableOpacity
                                        key={level.label}
                                        style={[
                                            modalStyles.brightnessBtn,
                                            tempTheme.brightness === level.value && modalStyles.activeBrightnessBtn
                                        ]}
                                        onPress={() => setTempTheme({ ...tempTheme, brightness: level.value })}
                                    >
                                        <Text style={[
                                            modalStyles.brightnessText,
                                            tempTheme.brightness === level.value && modalStyles.activeBrightnessText
                                        ]}>{level.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={[modalStyles.controlLabel, { marginTop: 20 }]}>Styles</Text>
                            <FlatList
                                horizontal
                                data={WALLPAPERS}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[
                                            modalStyles.styleThumb,
                                            item.type === 'solid' ? { backgroundColor: item.color } : {},
                                            tempTheme.value === (item.type === 'solid' ? item.color : item.url) && modalStyles.selectedThumb
                                        ]}
                                        onPress={() => setTempTheme({
                                            ...tempTheme,
                                            type: item.type as any,
                                            value: (item.type === 'solid' ? item.color : item.url) as string
                                        })}
                                    >
                                        {item.type === 'nature' && (
                                            <Image source={{ uri: item.url }} style={modalStyles.thumbImage} />
                                        )}
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </SafeAreaView>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const modalStyles = StyleSheet.create({
    modalTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    previewArea: {
        flex: 1,
        margin: 20,
        borderRadius: 24,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    wallpaperPreview: {
        ...StyleSheet.absoluteFillObject,
    },
    dimmer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000',
    },
    chatBubbleMock: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 16,
        borderRadius: 20,
        maxWidth: '80%',
    },
    bubbleText: {
        color: '#fff',
        fontSize: 16,
    },
    controlsArea: {
        padding: 20,
    },
    controlLabel: {
        color: theme.colors.text.secondary,
        marginBottom: 10,
        fontSize: 14,
    },
    brightnessContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        padding: 4,
    },
    brightnessBtn: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    activeBrightnessBtn: {
        backgroundColor: theme.colors.accent,
    },
    brightnessText: {
        color: theme.colors.text.secondary,
        fontSize: 13,
    },
    activeBrightnessText: {
        color: theme.colors.text.inverse,
        fontWeight: 'bold',
    },
    styleThumb: {
        width: 60,
        height: 60,
        borderRadius: 12,
        marginRight: 12,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedThumb: {
        borderColor: theme.colors.accent,
    },
    thumbImage: {
        width: '100%',
        height: '100%',
    }
});

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
        color: theme.colors.text.secondary,
        fontSize: theme.typography.sizes.sm,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    sectionDivider: {
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
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
        color: theme.colors.text.primary,
        fontSize: theme.typography.sizes.md,
    },
    settingSubtitle: {
        color: theme.colors.text.secondary,
        fontSize: theme.typography.sizes.xs,
        marginTop: 2,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    modalContent: {
        flex: 1,
    }
});

export default ChatsSettingsScreen;
