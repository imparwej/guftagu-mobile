import {
    LucideCopy,
    LucideCornerUpRight,
    LucideInfo,
    LucideReply,
    LucideStar,
    LucideTrash2,
} from 'lucide-react-native';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown } from 'react-native-reanimated';
import PressableScale from '../../../components/PressableScale';
import { theme } from '../../../theme/theme';

interface MessageLongPressMenuProps {
    visible: boolean;
    onClose: () => void;
    onAction: (action: string) => void;
    isMine: boolean;
}

const ACTIONS = [
    { id: 'reply', label: 'Reply', icon: LucideReply },
    { id: 'forward', label: 'Forward', icon: LucideCornerUpRight },
    { id: 'copy', label: 'Copy', icon: LucideCopy },
    { id: 'star', label: 'Star', icon: LucideStar },
    { id: 'delete', label: 'Delete', icon: LucideTrash2, destructive: true },
    { id: 'info', label: 'Info', icon: LucideInfo },
];

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

const MessageLongPressMenu: React.FC<MessageLongPressMenuProps> = ({
    visible,
    onClose,
    onAction,
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
                    entering={FadeIn.duration(150)}
                    exiting={FadeOut.duration(100)}
                    style={styles.backdropOverlay}
                />
            </Pressable>
            <View style={styles.centeredContainer}>
                <Animated.View
                    entering={SlideInDown.duration(250).springify().damping(18).stiffness(200)}
                    style={styles.menuCard}
                >
                    {/* Reactions Bar */}
                    <View style={styles.reactionsBar}>
                        {REACTIONS.map((emoji) => (
                            <PressableScale
                                key={emoji}
                                style={styles.reactionBtn}
                                scaleTo={1.25}
                                onPress={() => {
                                    onAction(`react:${emoji}`);
                                    onClose();
                                }}
                            >
                                <Text style={styles.reactionEmoji}>{emoji}</Text>
                            </PressableScale>
                        ))}
                    </View>
                    <View style={styles.reactionsSeparator} />
                    {ACTIONS.map((action, index) => (
                        <PressableScale
                            key={action.id}
                            style={[
                                styles.menuItem,
                                index < ACTIONS.length - 1 && styles.menuItemBorder,
                            ]}
                            scaleTo={0.97}
                            onPress={() => {
                                onAction(action.id);
                                onClose();
                            }}
                        >
                            <action.icon
                                color={action.destructive ? theme.colors.error : theme.colors.text.primary}
                                size={20}
                            />
                            <Text
                                style={[
                                    styles.menuLabel,
                                    action.destructive && { color: theme.colors.error },
                                ]}
                            >
                                {action.label}
                            </Text>
                        </PressableScale>
                    ))}
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
        paddingHorizontal: 48,
    },
    menuCard: {
        width: '100%',
        backgroundColor: '#1C1C1E',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
        elevation: 20,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        gap: 14,
    },
    menuItemPressed: {
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    menuItemBorder: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255,255,255,0.08)',
    },
    menuLabel: {
        color: theme.colors.text.primary,
        fontSize: 16,
        fontWeight: '400',
        letterSpacing: 0.2,
    },
    reactionsBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 12,
    },
    reactionBtn: {
        width: 42,
        height: 42,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 21,
    },
    reactionBtnPressed: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        transform: [{ scale: 1.2 }],
    },
    reactionEmoji: {
        fontSize: 26,
    },
    reactionsSeparator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: 'rgba(255,255,255,0.08)',
        marginHorizontal: 16,
    },
});

export default MessageLongPressMenu;
