import axios from 'axios';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { theme } from '../../../theme/theme';

const EMOJI_ROWS = [
    ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂'],
    ['🥰', '😍', '🤩', '😘', '😗', '😚', '😋', '😛'],
    ['🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😣'],
    ['😢', '😭', '😤', '😠', '😡', '🤬', '😈', '👿'],
    ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤙', '👋'],
    ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍'],
    ['🎉', '🎊', '🎈', '🔥', '⭐', '💫', '✨', '💯'],
    ['🙏', '💪', '🤝', '👏', '🎵', '☕', '🍕', '🌙'],
];

const GIPHY_API_KEY = 'GlVGYHkr3WSBnllca54iNt0yFbjz7L65'; // Giphy SDK key

interface EmojiPickerProps {
    visible: boolean;
    onSelect: (emoji: string) => void;
    onSelectGif: (url: string) => void;
    onClose: () => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ visible, onSelect, onSelectGif, onClose }) => {
    const [tab, setTab] = useState<'emoji' | 'gif'>('emoji');
    const [gifSearch, setGifSearch] = useState('');
    const [gifs, setGifs] = useState<any[]>([]);
    const [loadingGifs, setLoadingGifs] = useState(false);

    const gifSearchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (tab === 'gif' && gifs.length === 0) {
            fetchGifs();
        }
    }, [tab]);

    const fetchGifs = useCallback(async (query = '') => {
        setLoadingGifs(true);
        try {
            const endpoint = query
                ? `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=25`
                : `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=25`;

            const response = await axios.get(endpoint);
            setGifs(response.data?.data || []);
        } catch (error: any) {
            console.error('Giphy Fetch error:', error?.message || error);
            setGifs([]);
        } finally {
            setLoadingGifs(false);
        }
    }, []);

    const handleGifSearch = useCallback((text: string) => {
        setGifSearch(text);
        // Clear any pending debounce timer
        if (gifSearchTimerRef.current) {
            clearTimeout(gifSearchTimerRef.current);
        }
        gifSearchTimerRef.current = setTimeout(() => {
            fetchGifs(text);
        }, 500);
    }, [fetchGifs]);

    if (!visible) return null;

    return (
        <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
            style={styles.container}
        >
            <View style={styles.header}>
                <View style={styles.tabs}>
                    <Pressable
                        onPress={() => setTab('emoji')}
                        style={[styles.tab, tab === 'emoji' && styles.activeTab]}
                    >
                        <Text style={[styles.tabText, tab === 'emoji' && styles.activeTabText]}>Emojis</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => setTab('gif')}
                        style={[styles.tab, tab === 'gif' && styles.activeTab]}
                    >
                        <Text style={[styles.tabText, tab === 'gif' && styles.activeTabText]}>GIFs</Text>
                    </Pressable>
                </View>
                <Pressable onPress={onClose} hitSlop={8}>
                    <Text style={styles.closeBtn}>✕</Text>
                </Pressable>
            </View>

            {tab === 'emoji' ? (
                <ScrollView
                    style={styles.scroll}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {EMOJI_ROWS.map((row, rowIndex) => (
                        <View key={rowIndex} style={styles.row}>
                            {row.map((emoji, emojiIndex) => (
                                <Pressable
                                    key={`${rowIndex}-${emojiIndex}`}
                                    style={({ pressed }) => [
                                        styles.emojiBtn,
                                        pressed && styles.emojiBtnPressed,
                                    ]}
                                    onPress={() => onSelect(emoji)}
                                >
                                    <Text style={styles.emoji}>{emoji}</Text>
                                </Pressable>
                            ))}
                        </View>
                    ))}
                </ScrollView>
            ) : (
                <View style={styles.gifContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search GIPHY"
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        value={gifSearch}
                        onChangeText={handleGifSearch}
                    />
                    {loadingGifs ? (
                        <View style={styles.center}>
                            <ActivityIndicator color={theme.colors.active} />
                        </View>
                    ) : (
                        <FlatList
                            data={gifs}
                            numColumns={2}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <Pressable
                                    onPress={() => onSelectGif(item.images.original.url)}
                                    style={styles.gifItem}
                                >
                                    <Image
                                        source={{ uri: item.images.fixed_height.url }}
                                        style={styles.gifImage}
                                    />
                                </Pressable>
                            )}
                            contentContainerStyle={styles.gifList}
                            showsVerticalScrollIndicator={false}
                        />
                    )}
                </View>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1C1C1E',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: 350,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.06)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255,255,255,0.08)',
    },
    tabs: {
        flexDirection: 'row',
        gap: 20,
    },
    tab: {
        paddingVertical: 4,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: theme.colors.active,
    },
    tabText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 14,
        fontWeight: '600',
    },
    activeTabText: {
        color: '#FFF',
    },
    closeBtn: {
        color: theme.colors.text.secondary,
        fontSize: 16,
    },
    scroll: {
        paddingHorizontal: 8,
        paddingVertical: 8,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 4,
    },
    emojiBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    emojiBtnPressed: {
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    emoji: {
        fontSize: 26,
    },
    gifContainer: {
        flex: 1,
        padding: 10,
    },
    searchInput: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        color: '#FFF',
        marginBottom: 10,
    },
    gifList: {
        paddingBottom: 20,
    },
    gifItem: {
        flex: 1,
        margin: 2,
        height: 120,
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 8,
        overflow: 'hidden',
    },
    gifImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default EmojiPicker;
