import React from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    Pressable,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { LucideClock, LucideX } from 'lucide-react-native';
import { theme } from '../theme/theme';

const { height } = Dimensions.get('window');

interface LocationOptionsModalProps {
    isVisible: boolean;
    onClose: () => void;
    onSelect: (minutes: number) => void;
}

const LocationOptionsModal: React.FC<LocationOptionsModalProps> = ({
    isVisible,
    onClose,
    onSelect,
}) => {
    const options = [
        { label: '15 minutes', value: 15 },
        { label: '30 minutes', value: 30 },
        { label: '45 minutes', value: 45 },
    ];

    return (
        <Modal
            visible={isVisible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Share Live Location</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <LucideX color="#FFF" size={20} />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.description}>
                        Participants in this chat will see your location in real-time. This feature helps you find each other.
                    </Text>

                    <View style={styles.optionsContainer}>
                        {options.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={styles.option}
                                onPress={() => onSelect(option.value)}
                            >
                                <LucideClock color={theme.colors.active} size={20} />
                                <Text style={styles.optionText}>{option.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    content: {
        backgroundColor: '#1c1c1e',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 24,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeBtn: {
        padding: 4,
    },
    description: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 24,
    },
    optionsContainer: {
        marginBottom: 16,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        gap: 12,
    },
    optionText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '500',
    },
    cancelBtn: {
        marginTop: 8,
        alignItems: 'center',
        paddingVertical: 12,
    },
    cancelText: {
        color: theme.colors.active,
        fontSize: 16,
        fontWeight: '600',
    },
});

export default LocationOptionsModal;
