import {
    LucideCamera,
    LucideFile,
    LucideImage,
    LucideMapPin,
    LucideUser,
} from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
    FadeInDown,
    FadeOutDown,
    SlideInDown,
} from 'react-native-reanimated';
import { theme } from '../../../theme/theme';

interface AttachmentPanelProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (type: string) => void;
}

const ATTACHMENTS = [
    { id: 'gallery', label: 'Gallery', icon: LucideImage, color: '#AF52DE' },
    { id: 'camera', label: 'Camera', icon: LucideCamera, color: '#FF2D55' },
    { id: 'document', label: 'Document', icon: LucideFile, color: '#5856D6' },
    { id: 'location', label: 'Location', icon: LucideMapPin, color: '#34C759' },
    { id: 'contact', label: 'Contact', icon: LucideUser, color: '#007AFF' },
];

const AttachmentPanel: React.FC<AttachmentPanelProps> = ({
    visible,
    onClose,
    onSelect,
}) => {
    if (!visible) return null;

    return (
        <Animated.View
            entering={SlideInDown.duration(300).springify().damping(20)}
            exiting={FadeOutDown.duration(200)}
            style={styles.container}
        >
            <View style={styles.handle} />
            <View style={styles.grid}>
                {ATTACHMENTS.map((item, index) => (
                    <Animated.View
                        key={item.id}
                        entering={FadeInDown.delay(index * 40).duration(400).springify()}
                    >
                        <Pressable
                            style={({ pressed }) => [
                                styles.item,
                                pressed && styles.itemPressed,
                            ]}
                            onPress={() => {
                                onSelect(item.id);
                                onClose();
                            }}
                        >
                            <View style={[styles.iconCircle, { backgroundColor: item.color }]}>
                                <item.icon color="#FFF" size={22} />
                            </View>
                            <Text style={styles.label}>{item.label}</Text>
                        </Pressable>
                    </Animated.View>
                ))}
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1C1C1E',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 12,
        paddingBottom: 24,
        paddingHorizontal: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.06)',
    },
    handle: {
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignSelf: 'center',
        marginBottom: 20,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
    },
    item: {
        alignItems: 'center',
        width: 70,
        marginBottom: 16,
    },
    itemPressed: {
        opacity: 0.7,
    },
    iconCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    label: {
        color: theme.colors.text.secondary,
        fontSize: 11,
        fontWeight: '500',
        letterSpacing: 0.2,
    },
});

export default AttachmentPanel;
