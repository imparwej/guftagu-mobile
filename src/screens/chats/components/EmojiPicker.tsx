import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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

interface EmojiPickerProps {
    visible: boolean;
    onSelect: (emoji: string) => void;
    onClose: () => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ visible, onSelect, onClose }) => {
    if (!visible) return null;

    return (
        <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
            style={styles.container}
        >
            <View style={styles.header}>
                <Text style={styles.title}>Emoji</Text>
                <Pressable onPress={onClose} hitSlop={8}>
                    <Text style={styles.closeBtn}>✕</Text>
                </Pressable>
            </View>
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
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1C1C1E',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: 280,
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
    title: {
        color: theme.colors.text.secondary,
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
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
});

export default EmojiPicker;
