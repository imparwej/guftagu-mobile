import { LucideArrowLeft, LucideFile, LucideImage as LucideImageIcon, LucideLink } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    Linking,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getMediaMessages } from '../../api/chatApi';
import { API_BASE_URL } from '../../config/api';
import { theme } from '../../theme/theme';

const TABS = ['Media', 'Docs', 'Links'] as const;
type TabType = typeof TABS[number];

const { width } = Dimensions.get('window');
const GRID_SIZE = (width - 8) / 3;

const MediaLinksDocsScreen = ({ route, navigation }: any) => {
    const { conversationId } = route.params || {};
    const [activeTab, setActiveTab] = useState<TabType>('Media');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!conversationId) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                const category = activeTab === 'Media' ? 'media' : activeTab === 'Docs' ? 'docs' : 'links';
                const result = await getMediaMessages(conversationId, category);
                setData(result || []);
            } catch (err) {
                console.error('Failed to load media:', err);
                setData([]);
            }
            setLoading(false);
        };
        fetchData();
    }, [conversationId, activeTab]);

    const renderMediaItem = ({ item }: any) => {
        const uri = item.mediaUrl ? `${API_BASE_URL}${item.mediaUrl}` : item.mediaUri;
        return (
            <Pressable style={styles.mediaItem}>
                {uri ? (
                    <Image source={{ uri }} style={styles.mediaImage} resizeMode="cover" />
                ) : (
                    <View style={styles.mediaPlaceholder}>
                        <LucideImageIcon color={theme.colors.text.secondary} size={24} />
                    </View>
                )}
            </Pressable>
        );
    };

    const renderDocItem = ({ item }: any) => (
        <Pressable style={styles.docItem} onPress={() => {
            if (item.mediaUrl) {
                Linking.openURL(`${API_BASE_URL}${item.mediaUrl}`);
            }
        }}>
            <View style={styles.docIcon}>
                <LucideFile color={theme.colors.accent} size={24} />
            </View>
            <View style={styles.docInfo}>
                <Text style={styles.docName} numberOfLines={1}>{item.fileName || item.content || 'Document'}</Text>
                <Text style={styles.docSize}>{item.fileSize || 'Tap to open'}</Text>
            </View>
        </Pressable>
    );

    const renderLinkItem = ({ item }: any) => {
        const meta = item.metadata || {};
        const linkUrl = meta.url || item.url || item.content || '';
        const linkTitle = meta.title || item.linkTitle || '';
        const linkDesc = meta.description || item.linkDescription || '';
        const linkImg = meta.image || item.linkImage || '';

        return (
            <Pressable style={styles.linkItem} onPress={() => {
                if (linkUrl) Linking.openURL(linkUrl);
            }}>
                {linkImg ? (
                    <Image source={{ uri: linkImg }} style={styles.linkImage} resizeMode="cover" />
                ) : (
                    <View style={styles.linkIconBox}>
                        <LucideLink color={theme.colors.accent} size={20} />
                    </View>
                )}
                <View style={styles.linkInfo}>
                    {linkTitle ? <Text style={styles.linkTitle} numberOfLines={1}>{linkTitle}</Text> : null}
                    {linkDesc ? <Text style={styles.linkDesc} numberOfLines={2}>{linkDesc}</Text> : null}
                    <Text style={styles.linkUrl} numberOfLines={1}>{linkUrl}</Text>
                </View>
            </Pressable>
        );
    };

    const renderContent = () => {
        if (loading) {
            return (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.colors.accent} />
                </View>
            );
        }

        if (data.length === 0) {
            return (
                <View style={styles.center}>
                    <Text style={styles.emptyText}>No {activeTab.toLowerCase()} shared yet</Text>
                </View>
            );
        }

        switch (activeTab) {
            case 'Media':
                return (
                    <FlatList
                        key="media-list"
                        data={data}
                        keyExtractor={(item, i) => item.id || String(i)}
                        renderItem={renderMediaItem}
                        numColumns={3}
                        contentContainerStyle={styles.mediaGrid}
                    />
                );
            case 'Docs':
                return (
                    <FlatList
                        key="docs-list"
                        data={data}
                        keyExtractor={(item, i) => item.id || String(i)}
                        renderItem={renderDocItem}
                        numColumns={1}
                        contentContainerStyle={styles.listContent}
                    />
                );
            case 'Links':
                return (
                    <FlatList
                        key="links-list"
                        data={data}
                        keyExtractor={(item, i) => item.id || String(i)}
                        renderItem={renderLinkItem}
                        numColumns={1}
                        contentContainerStyle={styles.listContent}
                    />
                );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <LucideArrowLeft color={theme.colors.text.primary} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Media, Links, and Docs</Text>
            </View>

            {/* Tabs */}
            <View style={styles.tabBar}>
                {TABS.map(tab => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab && styles.tabActive]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Content */}
            <View style={styles.content}>
                {renderContent()}
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.colors.border,
    },
    backBtn: {
        padding: 4,
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.text.primary,
    },
    tabBar: {
        flexDirection: 'row',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.colors.border,
    },
    tab: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: {
        borderBottomColor: theme.colors.accent,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.text.secondary,
    },
    tabTextActive: {
        color: theme.colors.accent,
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: theme.colors.text.secondary,
        fontSize: 14,
    },
    // Media grid
    mediaGrid: {
        padding: 2,
    },
    mediaItem: {
        width: GRID_SIZE,
        height: GRID_SIZE,
        padding: 1,
    },
    mediaImage: {
        width: '100%',
        height: '100%',
        borderRadius: 2,
    },
    mediaPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: theme.colors.secondary,
        borderRadius: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Docs list
    listContent: {
        padding: 16,
    },
    docItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.colors.border,
        gap: 12,
    },
    docIcon: {
        width: 44,
        height: 44,
        borderRadius: 8,
        backgroundColor: theme.colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    docInfo: {
        flex: 1,
    },
    docName: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.text.primary,
    },
    docSize: {
        fontSize: 12,
        color: theme.colors.text.secondary,
        marginTop: 2,
    },
    // Links list
    linkItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.colors.border,
        gap: 12,
    },
    linkImage: {
        width: 56,
        height: 56,
        borderRadius: 8,
    },
    linkIconBox: {
        width: 56,
        height: 56,
        borderRadius: 8,
        backgroundColor: theme.colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    linkInfo: {
        flex: 1,
    },
    linkTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.text.primary,
    },
    linkDesc: {
        fontSize: 12,
        color: theme.colors.text.secondary,
        marginTop: 2,
    },
    linkUrl: {
        fontSize: 11,
        color: '#5AC8FA',
        marginTop: 2,
    },
});

export default MediaLinksDocsScreen;
