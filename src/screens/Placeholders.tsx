import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme/theme';

const PlaceholderScreen = ({ name }: { name: string }) => (
    <View style={styles.container}>
        <Text style={styles.text}>{name}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: theme.colors.text.primary,
        fontSize: 24,
    },
});

export const StatusListScreen = () => <PlaceholderScreen name="Status" />;
export const CallListScreen = () => <PlaceholderScreen name="Calls" />;
export const SettingsScreen = () => <PlaceholderScreen name="Settings" />;
