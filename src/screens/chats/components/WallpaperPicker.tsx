import { LucideCheck, LucideX } from 'lucide-react-native';
import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { theme } from '../../../theme/theme';

interface WallpaperPickerProps {
    visible: boolean;
    currentWallpaper?: string;
    onSelect: (wallpaper: string | undefined) => void;
    onClose: () => void;
}

const WALLPAPERS = [
    { id: 'none', label: 'Default', color: theme.colors.background },
    { id: 'dark_gradient', label: 'Dark', color: '#0A0A0A' },
    { id: 'midnight', label: 'Midnight', color: '#0D1B2A' },
    { id: 'deep_purple', label: 'Purple', color: '#1A0A2E' },
    { id: 'forest', label: 'Forest', color: '#0A1A0A' },
    { id: 'ocean', label: 'Ocean', color: '#0A1520' },
    { id: 'charcoal', label: 'Charcoal', color: '#1A1A2E' },
    { id: 'slate', label: 'Slate', color: '#1E1E28' },
    { id: 'warm_dark', label: 'Warm', color: '#1A1410' },
    { id: 'cool_gray', label: 'Gray', color: '#16181C' },
];

const WallpaperPicker: React.FC<WallpaperPickerProps> = ({
    visible,
    currentWallpaper,
    onSelect,
    onClose,
}) => {
    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <Pressable style={styles.backdrop} onPress={onClose}>
                <Animated.View
                    entering={FadeIn.duration(120)}
                    exiting={FadeOut.duration(80)}
                    style={styles.backdropOverlay}
                />
            </Pressable>
            <View style={styles.centeredContainer}>
                <Animated.View
                    entering={FadeIn.duration(200)}
                    style={styles.card}
                >
                    <View style={styles.header}>
                        <Text style={styles.title}>Chat Wallpaper</Text>
                        <Pressable onPress={onClose} hitSlop={8}>
                            <LucideX color={theme.colors.text.secondary} size={20} />
                        </Pressable>
                    </View>
                    <ScrollView
                        contentContainerStyle={styles.grid}
                        showsVerticalScrollIndicator={false}
                    >
                        {WALLPAPERS.map((wp) => {
                            const isActive = wp.id === 'none'
                                ? !currentWallpaper
                                : currentWallpaper === wp.color;
                            return (
                                <Pressable
                                    key={wp.id}
                                    style={({ pressed }) => [
                                        styles.swatch,
                                        pressed && { opacity: 0.7 },
                                    ]}
                                    onPress={() => {
                                        onSelect(wp.id === 'none' ? undefined : wp.color);
                                        onClose();
                                    }}
                                >
                                    <View
                                        style={[
                                            styles.swatchColor,
                                            { backgroundColor: wp.color },
                                            isActive && styles.swatchActive,
                                        ]}
                                    >
                                        {isActive && <LucideCheck color="#FFF" size={18} />}
                                    </View>
                                    <Text style={styles.swatchLabel}>{wp.label}</Text>
                                </Pressable>
                            );
                        })}
                    </ScrollView>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    backdropOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.55)',
    },
    centeredContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    card: {
        width: '100%',
        backgroundColor: '#1C1C1E',
        borderRadius: 20,
        overflow: 'hidden',
        maxHeight: 420,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
        elevation: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255,255,255,0.08)',
    },
    title: {
        color: theme.colors.text.primary,
        fontSize: 17,
        fontWeight: '600',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 16,
        gap: 12,
    },
    swatch: {
        alignItems: 'center',
        width: 72,
    },
    swatchColor: {
        width: 60,
        height: 60,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    swatchActive: {
        borderColor: '#FFFFFF',
        borderWidth: 2,
    },
    swatchLabel: {
        color: theme.colors.text.secondary,
        fontSize: 11,
        fontWeight: '500',
    },
});

export default WallpaperPicker;
