import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import {
    Ban,
    BookOpen,
    CheckCheck,
    Eye,
    LogOut,
    LucideIcon,
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
import PressableScale from '../../components/PressableScale';
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
            { icon: Eye as LucideIcon, label: 'View Group', onPress: onViewContact },
            { icon: CheckCheck as LucideIcon, label: 'Mark as Read', onPress: onMarkAsRead },
            { icon: Trash2 as LucideIcon, label: 'Clear Chat', onPress: onClearChat },
            { icon: LogOut as LucideIcon, label: 'Exit Group', onPress: onExitGroup, destructive: true },
        ]
        : [
            { icon: BookOpen as LucideIcon, label: 'View Contact', onPress: onViewContact },
            { icon: CheckCheck as LucideIcon, label: 'Mark as Read', onPress: onMarkAsRead },
            { icon: Trash2 as LucideIcon, label: 'Clear Chat', onPress: onClearChat },
            { icon: Ban as LucideIcon, label: 'Block', onPress: onBlock, destructive: true },
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
                                <PressableScale onPress={onClose} hitSlop={12} scaleTo={0.8}>
                                    <X color="rgba(255,255,255,0.4)" size={18} />
                                </PressableScale>
                            </View>

                            {/* Items */}
                            {menuItems.map((item, index) => (
                                <PressableScale
                                    key={item.label}
                                    style={[
                                        styles.menuItem,
                                        index === menuItems.length - 1 && styles.menuItemLast,
                                    ]}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        item.onPress();
                                        onClose();
                                    }}
                                    scaleTo={0.96}
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
                                </PressableScale>
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
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuContainer: {
        width: 260,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
    },
    menuBlur: {
        borderRadius: 20,
    },
    menuInner: {
        backgroundColor: 'rgba(25,25,25,0.85)',
        paddingVertical: 4,
    },
    menuHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255,255,255,0.08)',
    },
    menuTitle: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    menuItemLast: {
        borderBottomWidth: 0,
    },
    menuItemText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '500',
        marginLeft: 14,
    },
});

export default ChatContextMenu;
