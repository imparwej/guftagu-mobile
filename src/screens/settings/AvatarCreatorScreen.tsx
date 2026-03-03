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
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
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
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <LucideChevronLeft color={theme.colors.text.primary} size={28} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Avatar Creator</Text>
                <TouchableOpacity onPress={handleSaveAvatar} style={styles.saveButton}>
                    <LucideCheck color={theme.colors.success} size={28} />
                </TouchableOpacity>
            </View>

            <View style={styles.previewContainer}>
                <View style={[styles.avatarBackdrop, { backgroundColor: selectedColor + '20' }]}>
                    <Image
                        source={{ uri: currentAvatarUrl }}
                        style={styles.avatarPreview}
                    />
                </View>
                <TouchableOpacity style={styles.randomizeButton} onPress={handleRandomize}>
                    <LucideRefreshCw color={theme.colors.text.primary} size={20} />
                    <Text style={styles.randomizeText}>Randomize</Text>
                </TouchableOpacity>
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
                        <TouchableOpacity
                            style={[
                                styles.styleCard,
                                selectedStyle.id === item.id && styles.selectedCard
                            ]}
                            onPress={() => setSelectedStyle(item)}
                        >
                            <Image source={{ uri: `${item.url}?seed=preview` }} style={styles.styleImage} />
                            <Text style={styles.styleName}>{item.name}</Text>
                        </TouchableOpacity>
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
                        <TouchableOpacity
                            style={[
                                styles.colorCircle,
                                { backgroundColor: item },
                                selectedColor === item && styles.selectedColorCircle
                            ]}
                            onPress={() => setSelectedColor(item)}
                        >
                            {selectedColor === item && (
                                <LucideCheck color="#fff" size={16} />
                            )}
                        </TouchableOpacity>
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
        paddingVertical: 40,
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    avatarBackdrop: {
        width: 180,
        height: 180,
        borderRadius: 90,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatarPreview: {
        width: 160,
        height: 160,
    },
    randomizeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.card,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    randomizeText: {
        color: theme.colors.text.primary,
        marginLeft: 8,
        fontSize: theme.typography.sizes.sm,
        fontWeight: '500',
    },
    optionsContainer: {
        flex: 1,
        paddingTop: 24,
    },
    sectionTitle: {
        color: theme.colors.text.secondary,
        fontSize: theme.typography.sizes.sm,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginLeft: 20,
        marginBottom: 16,
    },
    listPadding: {
        paddingHorizontal: 16,
    },
    styleCard: {
        width: 100,
        height: 120,
        backgroundColor: theme.colors.card,
        borderRadius: 16,
        marginHorizontal: 4,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedCard: {
        borderColor: theme.colors.active,
        backgroundColor: 'rgba(0, 122, 255, 0.1)',
    },
    styleImage: {
        width: 70,
        height: 70,
        marginBottom: 8,
    },
    styleName: {
        color: theme.colors.text.primary,
        fontSize: 12,
        fontWeight: '500',
    },
    colorCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginHorizontal: 6,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedColorCircle: {
        borderColor: '#fff',
    },
    footer: {
        padding: 20,
        alignItems: 'center',
    },
    footerText: {
        color: theme.colors.text.tertiary,
        fontSize: 12,
        textAlign: 'center',
    }
});

export default AvatarCreatorScreen;
