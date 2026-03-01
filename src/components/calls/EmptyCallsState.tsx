import { LucidePhoneOff } from 'lucide-react-native';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme/theme';

const { height } = Dimensions.get('window');

const EmptyCallsState: React.FC = () => {
    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <LucidePhoneOff size={64} color={theme.colors.text.tertiary} strokeWidth={1.5} />
            </View>
            <Text style={styles.title}>No call history</Text>
            <Text style={styles.subtitle}>
                Your recent calls will appear here. Start a call with your friends and family.
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
        marginTop: height * 0.15,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: theme.colors.secondary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    title: {
        color: theme.colors.text.primary,
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        color: theme.colors.text.secondary,
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
});

export default EmptyCallsState;
