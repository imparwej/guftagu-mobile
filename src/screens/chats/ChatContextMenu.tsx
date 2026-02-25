import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import {
    Ban,
    BookOpen,
    CheckCheck,
    Eye,
    LogOut,
    Trash2,
    X,
} from 'lucide-react-native';
import React from 'react';
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { theme } from '../../theme/theme';

interface ChatContextMenuProps {
    visible: boolean;
    isGroup: boolean;
    onClose: () => void;
    onViewContact: () => void;
    onMarkAsRead: () => void;
    onClearChat: () => void;
    onBlock: () => void;       // individual
    onExitGroup: () => void;   // group
}

const ChatContextMenu: React.FC<ChatContextMenuProps> = ({
    visible,
    isGroup,
    onClose,
    onViewContact,
    onMarkAsRead,
    onClearChat,
    onBlock,
    onExitGroup,
}) => {
    if (!visible) return null;

    const menuItems = isGroup
        ? [
            { icon: Eye, label: 'View Group', onPress: onViewContact },
            { icon: CheckCheck, label: 'Mark as Read', onPress: onMarkAsRead },
            { icon: Trash2, label: 'Clear Chat', onPress: onClearChat },
            { icon: LogOut, label: 'Exit Group', onPress: onExitGroup, destructive: true },
        ]
        : [
            { icon: BookOpen, label: 'View Contact', onPress: onViewContact },
            { icon: CheckCheck, label: 'Mark as Read', onPress: onMarkAsRead },
            { icon: Trash2, label: 'Clear Chat', onPress: onClearChat },
            { icon: Ban, label: 'Block', onPress: onBlock, destructive: true },
        ];

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
            <Pressable style={styles.backdrop} onPress={onClose}>
                <Animated.View
                    entering={FadeIn.duration(180)}
                    exiting={FadeOut.duration(120)}
                    style={styles.menuContainer}
                >
                    <BlurView intensity={80} tint="dark" style={styles.menuBlur}>
                        <View style={styles.menuInner}>
                            {/* Header */}
                            <View style={styles.menuHeader}>
                                <Text style={styles.menuTitle}>
                                    {isGroup ? 'Group Options' : 'Chat Options'}
                                </Text>
                                <Pressable onPress={onClose} hitSlop={12}>
                                    <X color="rgba(255,255,255,0.5)" size={18} />
                                </Pressable>
                            </View>

                            {/* Items */}
                            {menuItems.map((item, index) => (
                                <Pressable
                                    key={item.label}
                                    style={({ pressed }) => [
                                        styles.menuItem,
                                        pressed && styles.menuItemPressed,
                                        index === menuItems.length - 1 && styles.menuItemLast,
                                    ]}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        item.onPress();
                                        onClose();
                                    }}
                                >
                                    <item.icon
                                        size={18}
                                        color={item.destructive ? theme.colors.error : 'rgba(255,255,255,0.7)'}
                                        strokeWidth={1.8}
                                    />
                                    <Text
                                        style={[
                                            styles.menuItemText,
                                            item.destructive && { color: theme.colors.error },
                                        ]}
                                    >
                                        {item.label}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </BlurView>
                </Animated.View>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuContainer: {
        width: 260,
        borderRadius: 16,
        overflow: 'hidden',
    },
    menuBlur: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    menuInner: {
        backgroundColor: 'rgba(30,30,30,0.75)',
        paddingVertical: 6,
    },
    menuHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255,255,255,0.08)',
    },
    menuTitle: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    menuItemPressed: {
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    menuItemLast: {
        borderBottomWidth: 0,
    },
    menuItemText: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: 15,
        fontWeight: '500',
        marginLeft: 14,
    },
});

export default ChatContextMenu;
