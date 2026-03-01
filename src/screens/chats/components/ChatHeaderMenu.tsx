import {
    LucideBan,
    LucideEye,
    LucideImage,
    LucideLogOut,
    LucideSearch,
    LucideTrash2,
    LucideVolume2,
    LucideVolumeX,
} from 'lucide-react-native';
import React, { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { theme } from '../../../theme/theme';

interface ChatHeaderMenuProps {
    visible: boolean;
    isGroup: boolean;
    isMuted?: boolean;
    isBlocked?: boolean;
    onClose: () => void;
    onAction: (action: string) => void;
}

const ChatHeaderMenu: React.FC<ChatHeaderMenuProps> = ({
    visible,
    isGroup,
    isMuted = false,
    isBlocked = false,
    onClose,
    onAction,
}) => {
    const actions = useMemo(() => {
        if (isGroup) {
            return [
                { id: 'view_group', label: 'View Group', icon: LucideEye },
                { id: 'search', label: 'Search', icon: LucideSearch },
                { id: 'mute', label: isMuted ? 'Unmute' : 'Mute', icon: isMuted ? LucideVolume2 : LucideVolumeX },
                { id: 'wallpaper', label: 'Wallpaper', icon: LucideImage },
                { id: 'clear_chat', label: 'Clear Chat', icon: LucideTrash2 },
                { id: 'exit_group', label: 'Exit Group', icon: LucideLogOut, destructive: true },
            ];
        }
        return [
            { id: 'view_contact', label: 'View Contact', icon: LucideEye },
            { id: 'search', label: 'Search', icon: LucideSearch },
            { id: 'mute', label: isMuted ? 'Unmute' : 'Mute', icon: isMuted ? LucideVolume2 : LucideVolumeX },
            { id: 'wallpaper', label: 'Wallpaper', icon: LucideImage },
            { id: 'clear_chat', label: 'Clear Chat', icon: LucideTrash2 },
            { id: 'block', label: isBlocked ? 'Unblock' : 'Block', icon: LucideBan, destructive: !isBlocked },
        ];
    }, [isGroup, isMuted, isBlocked]);

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
            <Animated.View
                entering={FadeIn.duration(180)}
                exiting={FadeOut.duration(100)}
                style={styles.menuContainer}
            >
                <View style={styles.menuCard}>
                    {actions.map((action, index) => (
                        <Pressable
                            key={action.id}
                            style={({ pressed }) => [
                                styles.menuItem,
                                pressed && styles.menuItemPressed,
                                index < actions.length - 1 && styles.menuItemBorder,
                            ]}
                            onPress={() => {
                                onAction(action.id);
                                onClose();
                            }}
                        >
                            <action.icon
                                color={
                                    action.destructive
                                        ? theme.colors.error
                                        : theme.colors.text.secondary
                                }
                                size={18}
                            />
                            <Text
                                style={[
                                    styles.menuLabel,
                                    action.destructive && { color: theme.colors.error },
                                ]}
                            >
                                {action.label}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            </Animated.View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    backdropOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.35)',
    },
    menuContainer: {
        position: 'absolute',
        top: 100,
        right: 16,
    },
    menuCard: {
        minWidth: 200,
        backgroundColor: '#1C1C1E',
        borderRadius: 14,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.45,
        shadowRadius: 20,
        elevation: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 13,
        paddingHorizontal: 18,
        gap: 14,
    },
    menuItemPressed: {
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    menuItemBorder: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255,255,255,0.06)',
    },
    menuLabel: {
        color: theme.colors.text.primary,
        fontSize: 15,
        fontWeight: '400',
        letterSpacing: 0.15,
    },
});

export default ChatHeaderMenu;
