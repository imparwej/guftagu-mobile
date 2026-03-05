import {
    LucideCheck,
    LucideChevronLeft,
    LucideRefreshCw
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import PressableScale from '../../components/PressableScale';
import { updateProfile } from '../../store/slices/authSlice';
import { RootState } from '../../store/store';
import { theme } from '../../theme/theme';

const AVATAR_STYLES = [
    { id: '1', name: 'Adventurer', url: 'https://api.dicebear.com/7.x/adventurer/png' },
    { id: '2', name: 'Avataaars', url: 'https://api.dicebear.com/7.x/avataaars/png' },
    { id: '3', name: 'Big Ears', url: 'https://api.dicebear.com/7.x/big-ears/png' },
    { id: '4', name: 'Bottts', url: 'https://api.dicebear.com/7.x/bottts/png' },
    { id: '5', name: 'Lorelei', url: 'https://api.dicebear.com/7.x/lorelei/png' },
    { id: '6', name: 'Notionists', url: 'https://api.dicebear.com/7.x/notionists/png' },
    { id: '7', name: 'Open Peeps', url: 'https://api.dicebear.com/7.x/open-peeps/png' },
    { id: '8', name: 'Personas', url: 'https://api.dicebear.com/7.x/personas/png' },
];

const COLORS = [
    '#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#007AFF', '#5856D6', '#AF52DE', '#FF2D55',
    '#8E8E93', '#636366', '#48484A', '#3A3A3C', '#2C2C2E', '#1C1C1E'
];

const AvatarCreatorScreen = ({ navigation }: any) => {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.auth.user);

    const [selectedStyle, setSelectedStyle] = useState(AVATAR_STYLES[0]);
    const [selectedColor, setSelectedColor] = useState(COLORS[4]);
    const [seed, setSeed] = useState(Math.random().toString(36).substring(7));

    const currentAvatarUrl = `${selectedStyle.url}?seed=${seed}&backgroundColor=${selectedColor.replace('#', '')}`;

    const handleSaveAvatar = () => {
        dispatch(updateProfile({ avatar: currentAvatarUrl }));
        navigation.goBack();
    };

    const handleRandomize = () => {
        setSeed(Math.random().toString(36).substring(7));
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <PressableScale onPress={() => navigation.goBack()} style={styles.backButton}>
                    <LucideChevronLeft color={theme.colors.text.primary} size={28} />
                </PressableScale>
                <Text style={styles.headerTitle}>Avatar Creator</Text>
                <PressableScale onPress={handleSaveAvatar} style={styles.saveButton}>
                    <LucideCheck color={theme.colors.success} size={28} />
                </PressableScale>
            </View>

            <View style={styles.previewContainer}>
                <View style={[styles.avatarBackdrop, { backgroundColor: selectedColor + '20' }]}>
                    <Image
                        source={{ uri: currentAvatarUrl }}
                        style={styles.avatarPreview}
                    />
                </View>
                <PressableScale style={styles.randomizeButton} onPress={handleRandomize} scaleTo={0.95}>
                    <LucideRefreshCw color={theme.colors.text.primary} size={20} />
                    <Text style={styles.randomizeText}>Randomize</Text>
                </PressableScale>
            </View>

            <View style={styles.optionsContainer}>
                <Text style={styles.sectionTitle}>Choose Style</Text>
                <FlatList
                    data={AVATAR_STYLES}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listPadding}
                    renderItem={({ item }) => (
                        <PressableScale
                            style={[
                                styles.styleCard,
                                selectedStyle.id === item.id && styles.selectedCard
                            ]}
                            scaleTo={0.96}
                            onPress={() => setSelectedStyle(item)}
                        >
                            <Image source={{ uri: `${item.url}?seed=preview` }} style={styles.styleImage} />
                            <Text style={[styles.styleName, selectedStyle.id === item.id && { color: '#000' }]}>
                                {item.name}
                            </Text>
                        </PressableScale>
                    )}
                />

                <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Background Color</Text>
                <FlatList
                    data={COLORS}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item}
                    contentContainerStyle={styles.listPadding}
                    renderItem={({ item }) => (
                        <PressableScale
                            style={[
                                styles.colorCircle,
                                { backgroundColor: item },
                                selectedColor === item && styles.selectedColorCircle
                            ]}
                            scaleTo={1.15}
                            onPress={() => setSelectedColor(item)}
                        >
                            {selectedColor === item && (
                                <LucideCheck color={item === '#FFFFFF' ? '#000' : '#fff'} size={16} />
                            )}
                        </PressableScale>
                    )}
                />
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    This avatar will be updated as your profile photo.
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
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    backButton: {
        padding: 4,
    },
    saveButton: {
        padding: 4,
    },
    headerTitle: {
        color: theme.colors.text.primary,
        fontSize: theme.typography.sizes.xl,
        fontWeight: 'bold',
    },
    previewContainer: {
        alignItems: 'center',
        paddingVertical: 30,
        backgroundColor: '#1C1C1E',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    avatarBackdrop: {
        width: 160,
        height: 160,
        borderRadius: 80,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    avatarPreview: {
        width: 140,
        height: 140,
    },
    randomizeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.06)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    randomizeText: {
        color: '#FFFFFF',
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '600',
    },
    optionsContainer: {
        flex: 1,
        paddingTop: 30,
    },
    sectionTitle: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginLeft: 24,
        marginBottom: 16,
    },
    listPadding: {
        paddingHorizontal: 20,
    },
    styleCard: {
        width: 110,
        height: 130,
        backgroundColor: '#1C1C1E',
        borderRadius: 20,
        marginHorizontal: 6,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    selectedCard: {
        borderColor: '#FFFFFF',
        backgroundColor: '#FFFFFF',
        shadowColor: '#FFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    styleImage: {
        width: 70,
        height: 70,
        marginBottom: 8,
    },
    styleName: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        fontWeight: '600',
    },
    colorCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginHorizontal: 6,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    selectedColorCircle: {
        borderColor: '#fff',
        transform: [{ scale: 1.1 }],
    },
    footer: {
        padding: 30,
        alignItems: 'center',
    },
    footerText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 18,
    }
});

export default AvatarCreatorScreen;
