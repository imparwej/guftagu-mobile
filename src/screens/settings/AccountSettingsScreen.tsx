import {
    LucideChevronLeft,
    LucideChevronRight,
    LucideFileText,
    LucideFingerprint,
    LucideMail,
    LucidePhone,
    LucideShieldCheck,
    LucideTrash2
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import PressableScale from '../../components/PressableScale';
import { logout, updateProfile } from '../../store/slices/authSlice';
import { RootState } from '../../store/store';
import { theme } from '../../theme/theme';

const AccountSettingsScreen = ({ navigation }: any) => {
    const user = useSelector((state: RootState) => state.auth.user);
    const dispatch = useDispatch();

    const [isPasskeyEnabled, setIsPasskeyEnabled] = useState(false);
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [showSimulation, setShowSimulation] = useState<{ type: string; visible: boolean }>({ type: '', visible: false });
    const [loading, setLoading] = useState(false);

    const runSimulation = (type: string, title: string, message: string, onComplete?: () => void) => {
        Alert.alert(title, message, [
            {
                text: 'Proceed',
                onPress: () => {
                    setLoading(true);
                    setTimeout(() => {
                        setLoading(false);
                        Alert.alert('Success', `${title} completed successfully.`);
                        onComplete?.();
                    }, 2000);
                }
            },
            { text: 'Cancel', style: 'cancel' }
        ]);
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'Are you absolutely sure? This action is permanent and will delete all your chats and media.',
            [
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        dispatch(logout());
                    }
                },
                { text: 'Cancel', style: 'cancel' }
            ]
        );
    };

    const renderAccountItem = (Icon: any, title: string, subtitle: string, onPress: () => void, color: string = 'rgba(255,255,255,0.7)') => (
        <PressableScale style={styles.item} onPress={onPress} scaleTo={0.98}>
            <View style={styles.iconContainer}>
                <Icon color={color} size={22} />
            </View>
            <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{title}</Text>
                <Text style={styles.itemSubtitle}>{subtitle}</Text>
            </View>
            <LucideChevronRight color={theme.colors.text.tertiary} size={18} />
        </PressableScale>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <PressableScale onPress={() => navigation.goBack()} style={styles.backButton}>
                    <LucideChevronLeft color={theme.colors.text.primary} size={28} />
                </PressableScale>
                <Text style={styles.headerTitle}>Account</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.section}>
                    {renderAccountItem(
                        LucideFingerprint,
                        'Passkey',
                        isPasskeyEnabled ? 'Enabled' : 'Security for your account',
                        () => runSimulation('Passkey', 'Setup Passkey', 'Would you like to use your fingerprint or face to sign in?', () => setIsPasskeyEnabled(true))
                    )}
                    {renderAccountItem(
                        LucideMail,
                        'Email Address',
                        user?.email || 'Add email for recovery',
                        () => {
                            Alert.prompt(
                                'Update Email',
                                'Enter your new email address',
                                [
                                    { text: 'Cancel', style: 'cancel' },
                                    { text: 'Save', onPress: (email: string | undefined) => email && dispatch(updateProfile({ email })) }
                                ],
                                'plain-text',
                                user?.email
                            );
                        }
                    )}
                    {renderAccountItem(
                        LucideShieldCheck,
                        'Two-Step Verification',
                        is2FAEnabled ? 'On' : 'Extra security for your number',
                        () => runSimulation('2FA', 'Two-Step Verification', 'Set a 6-digit PIN that will be required when registering your phone number again.', () => setIs2FAEnabled(true))
                    )}
                </View>

                <View style={styles.sectionDivider} />

                <View style={styles.section}>
                    {renderAccountItem(
                        LucidePhone,
                        'Change Phone Number',
                        'Migrate account info, groups & settings',
                        () => runSimulation('Phone', 'Change Number', 'You will be asked to verify your new phone number via OTP.')
                    )}
                    {renderAccountItem(
                        LucideFileText,
                        'Request Account Info',
                        'Get a report of your account info',
                        () => runSimulation('Report', 'Request Report', 'Your report will be ready in about 3 days. You will have a few weeks to download it after it is available.')
                    )}
                </View>

                <View style={styles.sectionDivider} />

                <View style={styles.section}>
                    {renderAccountItem(
                        LucideTrash2,
                        'Delete Account',
                        'Permanently delete your account',
                        handleDeleteAccount,
                        theme.colors.error
                    )}
                </View>
            </ScrollView>

            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={theme.colors.accent} />
                    <Text style={styles.loadingText}>Processing...</Text>
                </View>
            )}
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
    scrollContent: {
        paddingTop: theme.spacing.md,
    },
    section: {
        backgroundColor: theme.colors.background,
    },
    sectionDivider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        marginVertical: 10,
    },
    item: {
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
    itemInfo: {
        flex: 1,
    },
    itemTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    },
    itemSubtitle: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 13,
        marginTop: 4,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    loadingText: {
        color: '#FFFFFF',
        marginTop: 16,
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: 0.5,
    }
});

export default AccountSettingsScreen;
