import { LucideIcon } from 'lucide-react-native';
import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { theme } from '../theme/theme';
import PressableScale from './PressableScale';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    style?: StyleProp<ViewStyle>;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction,
    style
}) => {
    return (
        <Animated.View
            entering={FadeInDown.duration(600).springify()}
            style={[styles.container, style]}
        >
            <View style={styles.iconContainer}>
                <Icon size={52} color={theme.colors.text.tertiary} strokeWidth={1.5} />
            </View>
            <Text style={styles.title}>{title}</Text>
            {description && <Text style={styles.description}>{description}</Text>}

            {actionLabel && onAction && (
                <PressableScale style={styles.actionBtn} onPress={onAction}>
                    <Text style={styles.actionText}>{actionLabel}</Text>
                </PressableScale>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.xl,
    },
    iconContainer: {
        marginBottom: theme.spacing.lg,
        opacity: 0.6,
    },
    title: {
        color: theme.colors.text.primary,
        fontSize: theme.typography.sizes.lg,
        fontWeight: theme.typography.weights.semibold as any,
        textAlign: 'center',
        marginBottom: theme.spacing.xs,
    },
    description: {
        color: theme.colors.text.secondary,
        fontSize: theme.typography.sizes.md,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: theme.spacing.lg,
    },
    actionBtn: {
        backgroundColor: theme.colors.accent,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: theme.radius.full,
    },
    actionText: {
        color: theme.colors.background,
        fontSize: 15,
        fontWeight: '700',
    },
});

export default EmptyState;
