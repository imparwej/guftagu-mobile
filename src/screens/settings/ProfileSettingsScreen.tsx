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
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
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
                        <TouchableOpacity onPress={() => setIsEditing(true)}>
                            <LucidePencil color={theme.colors.accent} size={18} />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity onPress={() => handleSaveProfile(field, tempValue)}>
                            <LucideCheck color={theme.colors.success} size={20} />
                        </TouchableOpacity>
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
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <LucideChevronLeft color={theme.colors.text.primary} size={28} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Profile</Text>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.avatarContainer}>
                        <TouchableOpacity onPress={handleImageUpdate} activeOpacity={0.8}>
                            <Image
                                source={{ uri: user?.avatar || 'https://i.pravatar.cc/150?u=me' }}
                                style={styles.avatar}
                            />
                            <View style={styles.cameraIconBadge}>
                                <LucideCamera color="#fff" size={20} />
                            </View>
                        </TouchableOpacity>
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
    avatarContainer: {
        alignItems: 'center',
        marginVertical: theme.spacing.xxl,
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
        backgroundColor: theme.colors.active,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: theme.colors.background,
    },
    infoBox: {
        paddingHorizontal: theme.spacing.xl,
        marginBottom: theme.spacing.xl,
    },
    infoText: {
        color: theme.colors.text.secondary,
        fontSize: theme.typography.sizes.sm,
        textAlign: 'center',
        lineHeight: 20,
    },
    fieldContainer: {
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.md,
    },
    fieldHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    fieldLabel: {
        color: theme.colors.text.secondary,
        fontSize: theme.typography.sizes.sm,
        marginLeft: 12,
    },
    fieldValue: {
        color: theme.colors.text.primary,
        fontSize: theme.typography.sizes.lg,
        paddingLeft: 32,
    },
    fieldInput: {
        color: theme.colors.text.primary,
        fontSize: theme.typography.sizes.lg,
        paddingLeft: 32,
        paddingVertical: 4,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.active,
    },
    multilineInput: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginLeft: 60,
    },
});

export default ProfileSettingsScreen;
