import {
    LucideArrowLeft,
    LucideFile,
    LucideImage as LucideImageIcon,
    LucideLink,
    LucidePlay,
    LucideMic,
    LucideMapPin,
    LucideX,
    LucideVolume2
} from 'lucide-react-native';
import React, { useEffect, useState, useMemo } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    Linking,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getMediaMessages } from '../../api/chatApi';
import { API_BASE_URL } from '../../config/api';
import { theme } from '../../theme/theme';

const TABS = ['Media', 'Docs', 'Links'] as const;
type TabType = typeof TABS[number];

const { width } = Dimensions.get('window');
const GRID_SIZE = (width - 8) / 3;

const containsURL = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    return urlRegex.test(text);
};

// --- VIDEO MODAL COMPONENT ---
const VideoPlayerModal = ({ uri, visible, onClose }: { uri: string | null; visible: boolean; onClose: () => void }) => {
    // TASK 7 — STOP VIDEO: Unload video on modal close
    const player = useVideoPlayer(uri || '', (player) => {
        if (uri) {
            player.loop = false;
            player.play();
        }
    });

    if (!uri || !visible) return null;

    return (
        <Modal visible={visible} animationType="fade" onRequestClose={onClose} transparent={false}>
            <View style={styles.modalContainer}>
                {/* TASK 6 — VIDEO PLAY: Open/Close Fullscreen */}
                <TouchableOpacity style={styles.closeButton} onPress={() => {
                    player.pause();
                    onClose();
                }}>
                    <LucideX color="#FFF" size={28} />
                </TouchableOpacity>
                <VideoView
                    player={player}
                    style={styles.fullVideo}
                    nativeControls={true}
                    contentFit="contain"
                />
            </View>
        </Modal>
    );
};

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
                // Fetch all messages to filter them locally as per user requirements
                const result = await getMediaMessages(conversationId, 'all');
                setData(result || []);
            } catch (err) {
                console.error('Failed to load media:', err);
                setData([]);
            }
            setLoading(false);
        };
        fetchData();
    }, [conversationId]); // Only refetch when conversationId changes

    const filteredData = useMemo(() => {
        switch (activeTab) {
            case 'Media':
                return data.filter(msg =>
                    msg.type === "IMAGE" ||
                    msg.type === "VIDEO" ||
                    msg.type === "VOICE" ||
                    msg.type === "AUDIO"
                );
            case 'Docs':
                return data.filter(msg =>
                    msg.type === "DOCUMENT" ||
                    msg.type === "FILE"
                );
            case 'Links':
                return data.filter(msg => {
                    if (msg.type === "TEXT" && containsURL(msg.content || '')) return true;
                    if (msg.type === "LINK") return true;
                    if (msg.type === "LOCATION") return true;
                    return false;
                });
            default:
                return [];
        }
    }, [data, activeTab]);

    const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

    const renderMediaItem = ({ item }: { item: any }) => {
        // TASK 9 — REMOVE DIRECT MEDIA RENDERING
        if (!item.mediaUrl && !item.mediaUri && item.type !== 'VOICE' && item.type !== 'AUDIO') return null;

        // TASK 10 — FALLBACK
        let mediaUrl = item.mediaUrl;
        let thumbUrl = item.thumbnailUrl;

        const getFullUrl = (url: string) => {
            if (url && !url.startsWith('http')) {
                return `${API_BASE_URL}${url}`;
            }
            return url;
        };

        const finalMediaUrl = getFullUrl(mediaUrl || item.mediaUri);
        const finalThumbUrl = getFullUrl(thumbUrl) || finalMediaUrl;

        if (item.type === 'VOICE' || item.type === 'AUDIO') {
            return (
                <TouchableOpacity 
                    key={item.id} 
                    style={styles.audioPreview}
                    onPress={() => {
                        // TASK 8 — AUDIO: Show icon only, Tap -> open player
                        if (finalMediaUrl) navigation.navigate('MediaPreview', { uri: finalMediaUrl, type: 'AUDIO' });
                    }}
                >
                    <LucideVolume2 color={theme.colors.accent} size={28} />
                    <Text style={styles.audioLabel}>Audio</Text>
                </TouchableOpacity>
            );
        }

        if (item.type === 'VIDEO') {
            return (
                <TouchableOpacity 
                    key={item.id} 
                    style={styles.videoPreviewContainer} 
                    onPress={() => setSelectedVideo(finalMediaUrl)}
                >
                    {/* TASK 5 — MEDIA TAB FIX: Use thumbnail */}
                    <Image source={{ uri: finalThumbUrl }} style={styles.videoThumbnailStyle} resizeMode="cover" />
                    <View style={styles.playIconOverlay}>
                        <LucidePlay color="#FFF" size={32} fill="#FFF" />
                    </View>
                </TouchableOpacity>
            );
        }

        // IMAGE
        return (
            <TouchableOpacity 
                key={item.id} 
                onPress={() => navigation.navigate('MediaPreview', { uri: finalMediaUrl, type: 'IMAGE' })}
            >
                {/* TASK 5 — MEDIA TAB FIX: Use thumbnail */}
                <Image
                    source={{ uri: finalThumbUrl }}
                    style={styles.imagePreviewStyle}
                    resizeMode="cover"
                />
            </TouchableOpacity>
        );
    };

    const renderDocItem = ({ item }: { item: any }) => (
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

    const renderLinkItem = ({ item }: { item: any }) => {
        if (item.type === 'LOCATION') {
            const data = typeof item.content === 'string' ? (item.content.startsWith('{') ? JSON.parse(item.content) : null) : item.content;
            const lat = data?.lat || item.latitude;
            const lng = data?.lng || item.longitude;
            const googleMapsUrl = `https://maps.google.com/?q=${lat},${lng}`;

            return (
                <Pressable style={styles.linkItem} onPress={() => Linking.openURL(googleMapsUrl)}>
                    <View style={styles.locationIconBox}>
                        <LucideMapPin color={theme.colors.accent} size={24} />
                    </View>
                    <View style={styles.linkInfo}>
                        <Text style={styles.linkTitle}>Shared Location</Text>
                        <Text style={styles.linkDesc}>{item.locationLabel || 'Tap to open in Google Maps'}</Text>
                        <Text style={styles.linkUrl}>Open in Maps</Text>
                    </View>
                </Pressable>
            );
        }

        const meta = item.metadata || {};
        const linkUrl = meta.url || item.url || item.content || '';
        const linkTitle = meta.title || item.linkTitle || '';
        const linkDesc = meta.description || item.linkDescription || '';
        const linkImg = meta.image || item.linkImage || '';

        // Extract URL if it's just a text message with a link
        let finalUrl = linkUrl;
        if (item.type === 'TEXT' && !linkUrl) {
            const match = (item.content || '').match(/(https?:\/\/[^\s]+)/gi);
            if (match) finalUrl = match[0];
        }

        if (!finalUrl) return null;

        return (
            <Pressable style={styles.linkItem} onPress={() => Linking.openURL(finalUrl)}>
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
                    <Text style={styles.linkUrl} numberOfLines={1}>{finalUrl}</Text>
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

        if (filteredData.length === 0) {
            return (
                <View style={styles.center}>
                    <Text style={styles.emptyText}>No {activeTab.toLowerCase()} shared yet</Text>
                </View>
            );
        }

        switch (activeTab) {
            case 'Media':
                return (
                    <View style={styles.mediaGridWrapper}>
                        {filteredData.map((item, i) => (
                            <React.Fragment key={item.id || String(i)}>
                                {renderMediaItem({ item })}
                            </React.Fragment>
                        ))}
                    </View>
                );
            case 'Docs':
                return (
                    <FlatList
                        key="docs-list"
                        data={filteredData}
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
                        data={filteredData}
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

            {/* TASK 3 & 4 — VIDEO MODAL */}
            <VideoPlayerModal 
                uri={selectedVideo} 
                visible={!!selectedVideo} 
                onClose={() => setSelectedVideo(null)} 
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
    mediaGridWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 8,
        gap: 8, // TASK 9 — GRID UI
    },
    imagePreviewStyle: {
        width: 110,
        height: 110,
        borderRadius: 8,
    },
    videoPreviewContainer: {
        width: 110,
        height: 110,
        borderRadius: 8,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#000',
    },
    videoThumbnailStyle: {
        width: '100%',
        height: '100%',
        opacity: 0.8,
    },
    playIconOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    audioPreview: {
        width: 110,
        height: 110,
        backgroundColor: 'rgba(90, 200, 250, 0.1)',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    audioLabel: {
        fontSize: 10,
        color: theme.colors.accent,
        fontWeight: '600',
        textAlign: 'center',
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 10,
        padding: 8,
    },
    fullVideo: {
        width: '100%',
        height: '80%',
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
    locationIconBox: {
        width: 56,
        height: 56,
        borderRadius: 8,
        backgroundColor: 'rgba(52, 199, 89, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default MediaLinksDocsScreen;
