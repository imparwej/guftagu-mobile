import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { theme } from '../theme/theme';

interface EmptyStateProps {
    icon: React.ReactNode;
    title: string;
    description?: string;
    style?: StyleProp<ViewStyle>;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, style }) => {
    return (
        <Animated.View
            entering={FadeInDown.duration(600).springify()}
            style={[styles.container, style]}
        >
            <View style={styles.iconContainer}>{icon}</View>
            <Text style={styles.title}>{title}</Text>
            {description && <Text style={styles.description}>{description}</Text>}
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
        opacity: 0.5,
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
    },
});

export default EmptyState;
