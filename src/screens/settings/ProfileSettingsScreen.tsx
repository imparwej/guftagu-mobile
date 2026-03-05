import {
    LucideCamera,
    LucideCheck,
    LucideChevronLeft,
    LucideInfo,
    LucidePencil,
    LucideStickyNote,
    LucideUser
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import PressableScale from '../../components/PressableScale';
import { updateProfile } from '../../store/slices/authSlice';
import { RootState } from '../../store/store';
import { theme } from '../../theme/theme';

const ProfileSettingsScreen = ({ navigation }: any) => {
    const user = useSelector((state: RootState) => state.auth.user);
    const dispatch = useDispatch();

    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingAbout, setIsEditingAbout] = useState(false);
    const [isEditingNotes, setIsEditingNotes] = useState(false);

    const [tempName, setTempName] = useState(user?.name || '');
    const [tempAbout, setTempAbout] = useState(user?.about || 'Available');
    const [tempNotes, setTempNotes] = useState(user?.notes || '');

    const handleSaveProfile = (field: 'name' | 'about' | 'notes', value: string) => {
        dispatch(updateProfile({ [field]: value }));
        if (field === 'name') setIsEditingName(false);
        if (field === 'about') setIsEditingAbout(false);
        if (field === 'notes') setIsEditingNotes(false);
    };

    const handleImageUpdate = () => {
        Alert.alert(
            'Profile Photo',
            'Choose an option',
            [
                { text: 'Gallery', onPress: () => console.log('Gallery') },
                { text: 'Camera', onPress: () => console.log('Camera') },
                { text: 'Cancel', style: 'cancel' },
            ]
        );
    };

    const renderEditableField = (
        icon: any,
        label: string,
        value: string,
        tempValue: string,
        setTempValue: (v: string) => void,
        isEditing: boolean,
        setIsEditing: (v: boolean) => void,
        field: 'name' | 'about' | 'notes',
        multiline: boolean = false
    ) => {
        const Icon = icon;
        return (
            <View style={styles.fieldContainer}>
                <View style={styles.fieldHeader}>
                    <View style={styles.labelContainer}>
                        <Icon color={theme.colors.text.secondary} size={20} />
                        <Text style={styles.fieldLabel}>{label}</Text>
                    </View>
                    {!isEditing ? (
                        <PressableScale onPress={() => setIsEditing(true)}>
                            <LucidePencil color={theme.colors.accent} size={18} />
                        </PressableScale>
                    ) : (
                        <PressableScale onPress={() => handleSaveProfile(field, tempValue)}>
                            <LucideCheck color={theme.colors.success} size={22} />
                        </PressableScale>
                    )}
                </View>

                {isEditing ? (
                    <TextInput
                        style={[styles.fieldInput, multiline && styles.multilineInput]}
                        value={tempValue}
                        onChangeText={setTempValue}
                        autoFocus
                        multiline={multiline}
                        placeholder={`Enter your ${label.toLowerCase()}`}
                        placeholderTextColor={theme.colors.text.tertiary}
                    />
                ) : (
                    <Text style={styles.fieldValue}>{value || `Add a ${label.toLowerCase()}`}</Text>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <PressableScale onPress={() => navigation.goBack()} style={styles.backButton}>
                        <LucideChevronLeft color={theme.colors.text.primary} size={28} />
                    </PressableScale>
                    <Text style={styles.headerTitle}>Profile</Text>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.avatarWrapper}>
                        <PressableScale onPress={handleImageUpdate} scaleTo={0.97}>
                            <View style={styles.avatarBorder}>
                                <Image
                                    source={{ uri: user?.avatar || 'https://i.pravatar.cc/150?u=me' }}
                                    style={styles.avatar}
                                />
                                <View style={styles.cameraIconBadge}>
                                    <LucideCamera color="#fff" size={20} />
                                </View>
                            </View>
                        </PressableScale>
                    </View>

                    <View style={styles.infoBox}>
                        <Text style={styles.infoText}>
                            Your name and profile photo are visible to people you chat with on Guftagu.
                        </Text>
                    </View>

                    {renderEditableField(
                        LucideUser,
                        'Name',
                        user?.name || '',
                        tempName,
                        setTempName,
                        isEditingName,
                        setIsEditingName,
                        'name'
                    )}

                    <View style={styles.divider} />

                    {renderEditableField(
                        LucideInfo,
                        'About',
                        user?.about || 'Available',
                        tempAbout,
                        setTempAbout,
                        isEditingAbout,
                        setIsEditingAbout,
                        'about'
                    )}

                    <View style={styles.divider} />

                    {renderEditableField(
                        LucideStickyNote,
                        'Notes',
                        user?.notes || '',
                        tempNotes,
                        setTempNotes,
                        isEditingNotes,
                        setIsEditingNotes,
                        'notes',
                        true
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
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
        paddingBottom: 40,
    },
    avatarWrapper: {
        alignItems: 'center',
        marginVertical: 40,
    },
    avatarBorder: {
        padding: 4,
        borderRadius: 80,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    avatar: {
        width: 150,
        height: 150,
        borderRadius: 75,
    },
    cameraIconBadge: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: '#FFFFFF',
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    infoBox: {
        paddingHorizontal: 30,
        marginBottom: 30,
    },
    infoText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 20,
    },
    fieldContainer: {
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    fieldHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    fieldLabel: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginLeft: 12,
    },
    fieldValue: {
        color: '#FFFFFF',
        fontSize: 17,
        paddingLeft: 32,
        fontWeight: '500',
    },
    fieldInput: {
        color: '#FFFFFF',
        fontSize: 17,
        paddingLeft: 32,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#FFFFFF',
    },
    multilineInput: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginLeft: 56,
    },
});

export default ProfileSettingsScreen;
