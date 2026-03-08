import { LucideArrowDown, LucideArrowUp, LucideX } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { theme } from '../../../theme/theme';
import { Message } from '../../../types';

interface ChatSearchBarProps {
    visible: boolean;
    messages: Message[];
    onClose: () => void;
    onScrollToIndex: (index: number) => void;
    onHighlightedIds: (ids: string[]) => void;
    onQueryChange?: (query: string) => void;
}

const ChatSearchBar: React.FC<ChatSearchBarProps> = ({
    visible,
    messages,
    onClose,
    onScrollToIndex,
    onHighlightedIds,
    onQueryChange,
}) => {
    const [query, setQuery] = useState('');
    const [matchIndices, setMatchIndices] = useState<number[]>([]);
    const [currentMatchPos, setCurrentMatchPos] = useState(0);
    const inputRef = useRef<TextInput>(null);

    useEffect(() => {
        if (visible) {
            setTimeout(() => inputRef.current?.focus(), 200);
        } else {
            setQuery('');
            setMatchIndices([]);
            setCurrentMatchPos(0);
            onHighlightedIds([]);
        }
    }, [visible]);

    const handleSearch = useCallback((text: string) => {
        setQuery(text);
        onQueryChange?.(text);
        if (!text.trim()) {
            setMatchIndices([]);
            setCurrentMatchPos(0);
            onHighlightedIds([]);
            return;
        }
        const lower = text.toLowerCase();
        const indices: number[] = [];
        const ids: string[] = [];
        messages.forEach((msg, idx) => {
            if (msg.content && msg.content.toLowerCase().includes(lower)) {
                indices.push(idx);
                ids.push(msg.id);
            }
        });
        setMatchIndices(indices);
        onHighlightedIds(ids);
        if (indices.length > 0) {
            setCurrentMatchPos(0);
            onScrollToIndex(indices[0]);
        }
    }, [messages, onHighlightedIds, onScrollToIndex, onQueryChange]);

    const navigateMatch = useCallback((direction: 'up' | 'down') => {
        if (matchIndices.length === 0) return;
        let next = currentMatchPos;
        if (direction === 'down') {
            next = (currentMatchPos + 1) % matchIndices.length;
        } else {
            next = (currentMatchPos - 1 + matchIndices.length) % matchIndices.length;
        }
        setCurrentMatchPos(next);
        onScrollToIndex(matchIndices[next]);
    }, [matchIndices, currentMatchPos, onScrollToIndex]);

    const handleClose = useCallback(() => {
        setQuery('');
        setMatchIndices([]);
        setCurrentMatchPos(0);
        onHighlightedIds([]);
        onClose();
    }, [onClose, onHighlightedIds]);

    if (!visible) return null;

    return (
        <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
            style={styles.container}
        >
            <TextInput
                ref={inputRef}
                style={styles.input}
                value={query}
                onChangeText={handleSearch}
                placeholder="Search messages..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                returnKeyType="search"
                autoCorrect={false}
            />
            {matchIndices.length > 0 && (
                <Text style={styles.count}>
                    {currentMatchPos + 1} of {matchIndices.length}
                </Text>
            )}
            <Pressable
                style={({ pressed }) => [styles.navBtn, pressed && styles.pressed]}
                onPress={() => navigateMatch('up')}
                hitSlop={4}
            >
                <LucideArrowUp color={theme.colors.text.secondary} size={18} />
            </Pressable>
            <Pressable
                style={({ pressed }) => [styles.navBtn, pressed && styles.pressed]}
                onPress={() => navigateMatch('down')}
                hitSlop={4}
            >
                <LucideArrowDown color={theme.colors.text.secondary} size={18} />
            </Pressable>
            <Pressable
                style={({ pressed }) => [styles.navBtn, pressed && styles.pressed]}
                onPress={handleClose}
                hitSlop={4}
            >
                <LucideX color={theme.colors.text.secondary} size={18} />
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1C1C1E',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255,255,255,0.08)',
        gap: 6,
    },
    input: {
        flex: 1,
        height: 36,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 10,
        paddingHorizontal: 12,
        color: theme.colors.text.primary,
        fontSize: 15,
    },
    count: {
        color: theme.colors.text.secondary,
        fontSize: 12,
        fontWeight: '500',
        fontVariant: ['tabular-nums'],
        minWidth: 30,
        textAlign: 'center',
    },
    navBtn: {
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 15,
    },
    pressed: {
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
});

export default ChatSearchBar;
