import { LucideChevronLeft } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { setPrivacy } from '../../store/slices/statusSlice';
import { RootState } from '../../store/store';
import { theme } from '../../theme/theme';

const StatusPrivacyScreen = ({ navigation }: any) => {
    const dispatch = useDispatch();
    const { privacy } = useSelector((state: RootState) => state.status);

    const options = [
        { id: 'contacts', title: 'My contacts', description: 'Share status with your contacts' },
        { id: 'contacts_except', title: 'My contacts except...', description: 'Share with contacts excluding selected ones' },
        { id: 'only_share', title: 'Only share with...', description: 'Share only with selected contacts' },
    ];

    const handleSelect = (id: any) => {
        dispatch(setPrivacy(id));
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <LucideChevronLeft color={theme.colors.text.primary} size={28} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Status privacy</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Who can see my status updates</Text>
                <View style={styles.optionsCard}>
                    {options.map((option, index) => (
                        <React.Fragment key={option.id}>
                            <TouchableOpacity
                                style={styles.option}
                                onPress={() => handleSelect(option.id)}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.radio, privacy !== option.id && styles.radioUnselected]}>
                                    {privacy === option.id && <View style={styles.radioInner} />}
                                </View>
                                <View style={styles.optionInfo}>
                                    <Text style={styles.optionTitle}>{option.title}</Text>
                                    <Text style={styles.optionDesc}>{option.description}</Text>
                                </View>
                            </TouchableOpacity>
                            {index < options.length - 1 && <View style={styles.optionSeparator} />}
                        </React.Fragment>
                    ))}
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    Changes to your privacy settings won't affect status updates that you've sent already.
                </Text>
            </View>
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
        paddingHorizontal: 20,
        paddingTop: 40,
        paddingBottom: 20,
    },
    headerTitle: {
        color: theme.colors.text.primary,
        fontSize: 22,
        fontWeight: '700',
        marginLeft: 16,
    },
    section: {
        paddingHorizontal: 20,
        marginTop: 10,
    },
    sectionTitle: {
        color: theme.colors.accent,
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 20,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    optionsCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        padding: 4,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: 'hidden',
    },
    option: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
    },
    optionSeparator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: theme.colors.border,
        marginLeft: 52,
    },
    radio: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: theme.colors.accent,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioUnselected: {
        borderColor: theme.colors.border,
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: theme.colors.accent,
    },
    optionInfo: {
        marginLeft: 16,
        flex: 1,
    },
    optionTitle: {
        color: theme.colors.text.primary,
        fontSize: 16,
        fontWeight: '600',
    },
    optionDesc: {
        color: theme.colors.text.secondary,
        fontSize: 13,
        marginTop: 2,
        lineHeight: 18,
    },
    footerAction: {
        marginTop: 20,
        padding: 16,
    },
    footerActionText: {
        color: theme.colors.accent,
        fontSize: 15,
        fontWeight: '600',
    },
    footer: {
        padding: 30,
        marginTop: 'auto',
    },
    footerText: {
        color: theme.colors.text.secondary,
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 18,
        opacity: 0.7,
    }
});

export default StatusPrivacyScreen;
