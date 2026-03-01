import * as Haptics from 'expo-haptics';
import {
    LucideArrowLeft,
    LucideChrome,
    LucideLaptop,
    LucideMonitor,
    LucidePlus,
    LucideSmartphone,
    LucideTrash2,
    LucideX,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Alert,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import Animated, {
    FadeIn,
    FadeInDown,
    FadeOut,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import GuftaguLogo from '../../../assets/images/favicon.svg';
import { addDevice, clearAllDevices, LinkedDevice, removeDevice } from '../../store/slices/deviceSlice';
import { RootState } from '../../store/store';
import { theme } from '../../theme/theme';

// ──────── DEVICE ICON HELPER ────────
const DeviceIcon = ({ platform, size = 22 }: { platform: string; size?: number }) => {
    const color = theme.colors.text.secondary;
    switch (platform) {
        case 'windows':
            return <LucideMonitor color={color} size={size} />;
        case 'macos':
            return <LucideLaptop color={color} size={size} />;
        case 'web':
            return <LucideChrome color={color} size={size} />;
        case 'android':
        case 'ios':
            return <LucideSmartphone color={color} size={size} />;
        default:
            return <LucideMonitor color={color} size={size} />;
    }
};

// ──────── RELATIVE TIME ────────
const formatRelativeTime = (isoString: string) => {
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'Active now';
    if (mins < 60) return `Active ${mins}m ago`;
    if (hours < 24) return `Active ${hours}h ago`;
    if (days === 1) return 'Active yesterday';
    return `Active ${days}d ago`;
};

const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

// ──────── SIMULATED DEVICE NAMES ────────
const DEVICE_NAMES = [
    { name: 'Firefox on Windows', platform: 'windows' as const },
    { name: 'Edge on Windows', platform: 'windows' as const },
    { name: 'Chrome on MacBook', platform: 'macos' as const },
    { name: 'Safari on iPad', platform: 'ios' as const },
    { name: 'Desktop App - Linux', platform: 'linux' as const },
    { name: 'Guftagu Web', platform: 'web' as const },
    { name: 'Chrome on Android Tablet', platform: 'android' as const },
];

// ──────── QR SCAN SIMULATION ────────
const QRScanModal = ({
    visible,
    onClose,
    onLinked,
}: {
    visible: boolean;
    onClose: () => void;
    onLinked: (device: LinkedDevice) => void;
}) => {
    const scanLineY = useSharedValue(0);
    const pulseOpacity = useSharedValue(0.3);
    const [scanning, setScanning] = useState(true);
    const [success, setSuccess] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (visible) {
            setScanning(true);
            setSuccess(false);

            // Animate scan line
            scanLineY.value = withRepeat(
                withSequence(
                    withTiming(180, { duration: 1500 }),
                    withTiming(0, { duration: 1500 }),
                ),
                -1,
                false,
            );

            pulseOpacity.value = withRepeat(
                withSequence(
                    withTiming(0.8, { duration: 800 }),
                    withTiming(0.3, { duration: 800 }),
                ),
                -1,
                false,
            );

            // Simulate success after 3s
            timerRef.current = setTimeout(() => {
                setScanning(false);
                setSuccess(true);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

                // Pick a random device
                const randomDev = DEVICE_NAMES[Math.floor(Math.random() * DEVICE_NAMES.length)];
                const newDevice: LinkedDevice = {
                    id: `dev-${Date.now()}`,
                    deviceName: randomDev.name,
                    platform: randomDev.platform,
                    lastActive: new Date().toISOString(),
                    linkedAt: new Date().toISOString(),
                };

                setTimeout(() => {
                    onLinked(newDevice);
                    onClose();
                }, 1500);
            }, 3000);
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [visible]);

    const scanLineStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: scanLineY.value }],
    }));

    const pulseStyle = useAnimatedStyle(() => ({
        opacity: pulseOpacity.value,
    }));

    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <Animated.View
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(150)}
                style={styles.qrBackdrop}
            >
                <View style={styles.qrContainer}>
                    {/* Close */}
                    <Pressable
                        style={styles.qrCloseBtn}
                        onPress={onClose}
                        hitSlop={12}
                    >
                        <LucideX color={theme.colors.text.secondary} size={22} />
                    </Pressable>

                    <Text style={styles.qrTitle}>
                        {success ? 'Device Linked!' : 'Scan QR Code'}
                    </Text>
                    <Text style={styles.qrSubtitle}>
                        {success
                            ? 'Successfully connected to Guftagu'
                            : 'Open Guftagu Web on your computer and scan the QR code'}
                    </Text>

                    {/* QR Box */}
                    <View style={styles.qrBox}>
                        {success ? (
                            <Animated.View entering={FadeIn.duration(300)} style={styles.successCircle}>
                                <Text style={styles.successCheck}>✓</Text>
                            </Animated.View>
                        ) : (
                            <>
                                {/* QR placeholder grid */}
                                <View style={styles.qrGrid}>
                                    {Array.from({ length: 64 }).map((_, i) => (
                                        <View
                                            key={i}
                                            style={[
                                                styles.qrDot,
                                                {
                                                    opacity: Math.random() > 0.4 ? 0.8 : 0.15,
                                                    backgroundColor: '#FFF',
                                                },
                                            ]}
                                        />
                                    ))}
                                </View>

                                {/* Scan line */}
                                {scanning && (
                                    <Animated.View style={[styles.scanLine, scanLineStyle]} />
                                )}

                                {/* Corner brackets */}
                                <View style={[styles.corner, styles.cornerTL]} />
                                <View style={[styles.corner, styles.cornerTR]} />
                                <View style={[styles.corner, styles.cornerBL]} />
                                <View style={[styles.corner, styles.cornerBR]} />
                            </>
                        )}
                    </View>

                    {scanning && (
                        <Animated.Text style={[styles.scanStatus, pulseStyle]}>
                            Scanning...
                        </Animated.Text>
                    )}
                </View>
            </Animated.View>
        </Modal>
    );
};

// ──────── DEVICE DETAIL MODAL ────────
const DeviceDetailModal = ({
    device,
    onClose,
    onLogout,
}: {
    device: LinkedDevice | null;
    onClose: () => void;
    onLogout: (id: string) => void;
}) => {
    if (!device) return null;

    return (
        <Modal
            transparent
            visible={!!device}
            animationType="none"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <Pressable style={styles.modalBackdrop} onPress={onClose}>
                <Animated.View
                    entering={FadeIn.duration(120)}
                    exiting={FadeOut.duration(80)}
                    style={styles.modalOverlay}
                />
            </Pressable>
            <View style={styles.modalCenter}>
                <Animated.View entering={FadeIn.duration(200)} style={styles.detailCard}>
                    <View style={styles.detailIconContainer}>
                        <DeviceIcon platform={device.platform} size={32} />
                    </View>
                    <Text style={styles.detailName}>{device.deviceName}</Text>
                    <Text style={styles.detailMeta}>
                        {formatRelativeTime(device.lastActive)}
                    </Text>
                    <Text style={styles.detailMeta}>
                        Linked on {formatDate(device.linkedAt)}
                    </Text>

                    <Pressable
                        style={({ pressed }) => [
                            styles.logoutBtn,
                            pressed && { opacity: 0.7 },
                        ]}
                        onPress={() => {
                            onLogout(device.id);
                            onClose();
                        }}
                    >
                        <LucideTrash2 color={theme.colors.error} size={18} />
                        <Text style={styles.logoutBtnText}>Log Out</Text>
                    </Pressable>

                    <Pressable
                        style={({ pressed }) => [
                            styles.cancelBtn,
                            pressed && { backgroundColor: 'rgba(255,255,255,0.08)' },
                        ]}
                        onPress={onClose}
                    >
                        <Text style={styles.cancelBtnText}>Cancel</Text>
                    </Pressable>
                </Animated.View>
            </View>
        </Modal>
    );
};

// ──────── MAIN SCREEN ────────
const LinkedDevicesScreen = ({ navigation }: any) => {
    const dispatch = useDispatch();
    const { linkedDevices } = useSelector((state: RootState) => state.devices);
    const insets = useSafeAreaInsets();

    const [showQR, setShowQR] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState<LinkedDevice | null>(null);

    const handleBack = useCallback(() => navigation.goBack(), [navigation]);

    const handleLinkDevice = useCallback((device: LinkedDevice) => {
        dispatch(addDevice(device));
    }, [dispatch]);

    const handleLogoutDevice = useCallback((id: string) => {
        dispatch(removeDevice(id));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, [dispatch]);

    const handleLogoutAll = useCallback(() => {
        Alert.alert(
            'Log Out All Devices',
            'All linked devices will be disconnected. You\'ll need to re-link them.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Log Out All',
                    style: 'destructive',
                    onPress: () => {
                        dispatch(clearAllDevices());
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                    },
                },
            ],
        );
    }, [dispatch]);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable
                    style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
                    onPress={handleBack}
                    hitSlop={8}
                >
                    <LucideArrowLeft color={theme.colors.text.primary} size={22} />
                </Pressable>
                <Text style={styles.headerTitle}>Linked Devices</Text>
                <View style={{ width: 36 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Logo + Info */}
                <View style={styles.logoSection}>
                    <View style={styles.logoCircle}>
                        <GuftaguLogo width={36} height={36} />
                    </View>
                    <Text style={styles.infoTitle}>
                        Use Guftagu on other devices
                    </Text>
                    <Text style={styles.infoText}>
                        Link your phone to Guftagu Web, Desktop, or other devices to chat seamlessly across platforms. Your messages stay end-to-end encrypted.
                    </Text>
                </View>

                {/* Link New Device Button */}
                <Pressable
                    style={({ pressed }) => [
                        styles.linkBtn,
                        pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
                    ]}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        setShowQR(true);
                    }}
                >
                    <View style={styles.linkBtnIcon}>
                        <LucidePlus color="#000" size={20} />
                    </View>
                    <Text style={styles.linkBtnText}>Link a Device</Text>
                </Pressable>

                {/* Device List */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>LINKED DEVICES</Text>

                    {linkedDevices.length === 0 ? (
                        <Animated.View entering={FadeIn.duration(300)} style={styles.emptyState}>
                            <LucideLaptop color="rgba(255,255,255,0.12)" size={48} />
                            <Text style={styles.emptyTitle}>No Devices Linked</Text>
                            <Text style={styles.emptySubtitle}>
                                Tap "Link a Device" to connect Guftagu on another device
                            </Text>
                        </Animated.View>
                    ) : (
                        linkedDevices.map((device, index) => (
                            <Animated.View
                                key={device.id}
                                entering={FadeInDown.delay(index * 80).duration(300)}
                            >
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.deviceRow,
                                        pressed && styles.deviceRowPressed,
                                        index < linkedDevices.length - 1 && styles.deviceRowBorder,
                                    ]}
                                    onPress={() => setSelectedDevice(device)}
                                >
                                    <View style={styles.deviceIconContainer}>
                                        <DeviceIcon platform={device.platform} />
                                    </View>
                                    <View style={styles.deviceInfo}>
                                        <Text style={styles.deviceName}>{device.deviceName}</Text>
                                        <Text style={styles.deviceMeta}>
                                            {formatRelativeTime(device.lastActive)}
                                        </Text>
                                    </View>
                                </Pressable>
                            </Animated.View>
                        ))
                    )}
                </View>

                {/* Logout All */}
                {linkedDevices.length > 0 && (
                    <Pressable
                        style={({ pressed }) => [
                            styles.logoutAllBtn,
                            pressed && { opacity: 0.7 },
                        ]}
                        onPress={handleLogoutAll}
                    >
                        <LucideTrash2 color={theme.colors.error} size={18} />
                        <Text style={styles.logoutAllText}>Log Out From All Devices</Text>
                    </Pressable>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* QR Scan Simulation Modal */}
            <QRScanModal
                visible={showQR}
                onClose={() => setShowQR(false)}
                onLinked={handleLinkDevice}
            />

            {/* Device Detail Modal */}
            <DeviceDetailModal
                device={selectedDevice}
                onClose={() => setSelectedDevice(null)}
                onLogout={handleLogoutDevice}
            />
        </View>
    );
};

// ──────── STYLES ────────
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255,255,255,0.08)',
    },
    backBtn: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 18,
    },
    pressed: {
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    headerTitle: {
        color: theme.colors.text.primary,
        fontSize: 17,
        fontWeight: '600',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 24,
    },

    // Logo section
    logoSection: {
        alignItems: 'center',
        marginBottom: 28,
    },
    logoCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: 'rgba(255,255,255,0.06)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    infoTitle: {
        color: theme.colors.text.primary,
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 8,
        letterSpacing: -0.3,
    },
    infoText: {
        color: theme.colors.text.secondary,
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
        paddingHorizontal: 12,
    },

    // Link button
    linkBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        paddingVertical: 14,
        marginBottom: 32,
        gap: 10,
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    linkBtnIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(0,0,0,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    linkBtnText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '600',
    },

    // Section
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        color: theme.colors.text.tertiary,
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.2,
        marginBottom: 12,
    },

    // Device rows
    deviceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        gap: 14,
    },
    deviceRowPressed: {
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 12,
        marginHorizontal: -8,
        paddingHorizontal: 8,
    },
    deviceRowBorder: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255,255,255,0.06)',
    },
    deviceIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.06)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    deviceInfo: {
        flex: 1,
    },
    deviceName: {
        color: theme.colors.text.primary,
        fontSize: 15,
        fontWeight: '500',
        marginBottom: 3,
    },
    deviceMeta: {
        color: theme.colors.text.secondary,
        fontSize: 12,
    },

    // Empty state
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyTitle: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 16,
        fontWeight: '600',
        marginTop: 16,
    },
    emptySubtitle: {
        color: 'rgba(255,255,255,0.15)',
        fontSize: 13,
        textAlign: 'center',
        marginTop: 6,
        paddingHorizontal: 24,
        lineHeight: 18,
    },

    // Logout all
    logoutAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: 'rgba(255,59,48,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255,59,48,0.15)',
    },
    logoutAllText: {
        color: theme.colors.error,
        fontSize: 15,
        fontWeight: '600',
    },

    // QR Modal
    qrBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    qrContainer: {
        width: '85%',
        backgroundColor: '#1C1C1E',
        borderRadius: 24,
        padding: 28,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.5,
        shadowRadius: 32,
        elevation: 24,
    },
    qrCloseBtn: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
    },
    qrTitle: {
        color: theme.colors.text.primary,
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 6,
    },
    qrSubtitle: {
        color: theme.colors.text.secondary,
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 18,
        marginBottom: 24,
        paddingHorizontal: 8,
    },
    qrBox: {
        width: 200,
        height: 200,
        backgroundColor: '#000',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    qrGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: 160,
        gap: 4,
        justifyContent: 'center',
    },
    qrDot: {
        width: 14,
        height: 14,
        borderRadius: 2,
    },
    scanLine: {
        position: 'absolute',
        left: 8,
        right: 8,
        height: 2,
        backgroundColor: '#5AC8FA',
        borderRadius: 1,
        shadowColor: '#5AC8FA',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 8,
    },
    corner: {
        position: 'absolute',
        width: 24,
        height: 24,
        borderColor: '#FFFFFF',
        borderWidth: 3,
    },
    cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 8 },
    cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 8 },
    cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 8 },
    cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 8 },
    scanStatus: {
        color: '#5AC8FA',
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    successCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#34C759',
        justifyContent: 'center',
        alignItems: 'center',
    },
    successCheck: {
        color: '#FFF',
        fontSize: 40,
        fontWeight: '700',
    },

    // Device Detail Modal
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.55)',
    },
    modalCenter: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    detailCard: {
        width: '100%',
        backgroundColor: '#1C1C1E',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
        elevation: 20,
    },
    detailIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.06)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    detailName: {
        color: theme.colors.text.primary,
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    detailMeta: {
        color: theme.colors.text.secondary,
        fontSize: 13,
        marginBottom: 2,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: 'rgba(255,59,48,0.1)',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 24,
        marginTop: 20,
        width: '100%',
    },
    logoutBtnText: {
        color: theme.colors.error,
        fontSize: 15,
        fontWeight: '600',
    },
    cancelBtn: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        marginTop: 8,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
    },
    cancelBtnText: {
        color: theme.colors.text.secondary,
        fontSize: 15,
        fontWeight: '500',
    },
});

export default LinkedDevicesScreen;
