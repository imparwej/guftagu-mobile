import {
    LucideArrowLeft,
    LucideBell,
    LucideChevronRight,
    LucideDatabase,
    LucideHelpCircle,
    LucideKey,
    LucideLock,
    LucideMessageCircle,
    LucideSearch,
    LucideSmile,
    LucideUser,
    LucideUsers
} from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
    FlatList,
    LayoutAnimation,
    Platform,
    Share,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    UIManager,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import PressableScale from '../../components/PressableScale';
import { RootState } from '../../store/store';
import { theme } from '../../theme/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SETTINGS_ITEMS = [
    {
        id: 'profile',
        title: 'Profile',
        subtitle: 'Name, About, Notes',
        icon: LucideUser,
        screen: 'Profile'
    },
    {
        id: 'account',
        title: 'Account',
        subtitle: 'Security, Email, Change number',
        icon: LucideKey,
        screen: 'Account'
    },
    {
        id: 'privacy',
        title: 'Privacy',
        subtitle: 'Block contacts, Disappearing messages',
        icon: LucideLock,
        screen: 'Privacy'
    },
    {
        id: 'avatar',
        title: 'Avatar',
        subtitle: 'Create, Edit, Profile photo',
        icon: LucideSmile,
        screen: 'Avatar'
    },
    {
        id: 'chats',
        title: 'Chats',
        subtitle: 'Theme, Wallpapers, Chat history',
        icon: LucideMessageCircle,
        screen: 'ChatsSettings'
    },
    {
        id: 'notifications',
        title: 'Notifications',
        subtitle: 'Message, Group & Call tones',
        icon: LucideBell,
        screen: 'Notifications'
    },
    {
        id: 'storage',
        title: 'Storage and Data',
        subtitle: 'Network usage, Auto-download',
        icon: LucideDatabase,
        screen: 'Storage'
    },
    {
        id: 'help',
        title: 'Help',
        subtitle: 'Help center, Contact us, Privacy policy',
        icon: LucideHelpCircle,
        screen: 'Help'
    },
    {
        id: 'invite',
        title: 'Invite a friend',
        icon: LucideUsers,
        screen: 'invite'
    },
];

const SettingsScreen = ({ navigation }: any) => {
    const user = useSelector((state: RootState) => state.auth.user);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const toggleSearch = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsSearching(!isSearching);
        if (isSearching) setSearchQuery('');
    };

    const handleInviteFriend = async () => {
        try {
            await Share.share({
                message: 'Hey! Join me on Guftagu, a secure and premium messaging app. Download it here: https://guftagu.app/download',
                title: 'Invite to Guftagu'
            });
        } catch (error: any) {
            console.error(error.message);
        }
    };

    const filteredItems = useMemo(() => {
        if (!searchQuery) return SETTINGS_ITEMS;
        return SETTINGS_ITEMS.filter(item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    const renderSettingItem = ({ item }: { item: typeof SETTINGS_ITEMS[0] }) => {
        const Icon = item.icon;
        const isMatched = searchQuery && (
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return (
            <PressableScale
                style={[
                    styles.itemContainer,
                    isMatched && styles.matchedItem
                ]}
                scaleTo={0.97}
                onPress={() => {
                    if (item.id === 'invite') {
                        handleInviteFriend();
                    } else {
                        navigation.navigate(item.screen);
                    }
                }}
            >
                <View style={styles.iconCircle}>
                    <Icon color={theme.colors.text.secondary} size={22} />
                </View>
                <View style={styles.itemContent}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    {item.subtitle && <Text style={styles.itemSubtitle}>{item.subtitle}</Text>}
                </View>
                <LucideChevronRight color={theme.colors.text.tertiary} size={18} />
            </PressableScale>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                {!isSearching ? (
                    <View style={styles.headerContent}>
                        <Text style={styles.title}>Settings</Text>
                        <TouchableOpacity onPress={toggleSearch}>
                            <LucideSearch color={theme.colors.text.primary} size={24} />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.searchBar}>
                        <TouchableOpacity onPress={toggleSearch} style={styles.backIcon}>
                            <LucideArrowLeft color={theme.colors.text.primary} size={24} />
                        </TouchableOpacity>
                        <TextInput
                            autoFocus
                            placeholder="Search settings"
                            placeholderTextColor={theme.colors.text.tertiary}
                            style={styles.searchInput}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                )}
            </View>

            <View style={styles.profileSection}>
                <PressableScale
                    style={styles.profileCard}
                    scaleTo={0.98}
                    onPress={() => navigation.navigate('Profile')}
                >
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
                        </View>
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>{user?.name || 'User'}</Text>
                        <Text style={styles.profileAbout} numberOfLines={1}>
                            {user?.about || 'Hey there! I am using Guftagu.'}
                        </Text>
                    </View>
                    <LucideChevronRight color={theme.colors.text.tertiary} size={22} />
                </PressableScale>
            </View>

            <FlatList
                data={filteredItems}
                keyExtractor={(item) => item.id}
                renderItem={renderSettingItem}
                contentContainerStyle={styles.listContent}
                ListFooterComponent={
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>from</Text>
                        <Text style={styles.footerBrand}>GUFTAGU</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        color: theme.colors.text.primary,
        fontSize: 24,
        fontWeight: 'bold',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backIcon: {
        marginRight: 16,
    },
    searchInput: {
        flex: 1,
        color: theme.colors.text.primary,
        fontSize: 16,
        padding: 0,
    },
    profileSection: {
        padding: 16,
        paddingBottom: 8,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#1C1C1E',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    avatarContainer: {
        padding: 2,
        borderRadius: 34,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginRight: 16,
    },
    avatarPlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#000',
        fontSize: 26,
        fontWeight: '700',
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        color: theme.colors.text.primary,
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    profileAbout: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 14,
        marginTop: 4,
    },
    listContent: {
        paddingBottom: 40,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    matchedItem: {
        backgroundColor: 'rgba(0, 122, 255, 0.05)',
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.03)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    itemContent: {
        flex: 1,
    },
    itemTitle: {
        color: theme.colors.text.primary,
        fontSize: 16,
        fontWeight: '500',
    },
    itemSubtitle: {
        color: theme.colors.text.secondary,
        fontSize: 13,
        marginTop: 2,
    },
    footer: {
        marginTop: 40,
        alignItems: 'center',
        paddingBottom: 20,
    },
    footerText: {
        color: theme.colors.text.tertiary,
        fontSize: 12,
    },
    footerBrand: {
        color: theme.colors.text.primary,
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 2,
        marginTop: 4,
    }
});

export default SettingsScreen;
