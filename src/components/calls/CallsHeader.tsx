import { LucideMoreVertical, LucideSearch } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { theme } from '../../theme/theme';

interface CallsHeaderProps {
    onSearchChange: (text: string) => void;
    onClearLog: () => void;
    onGoToSettings: () => void;
}

const CallsHeader: React.FC<CallsHeaderProps> = ({
    onSearchChange,
    onClearLog,
    onGoToSettings
}) => {
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [menuVisible, setMenuVisible] = useState(false);
    const searchAnimation = useRef(new Animated.Value(0)).current;
    const inputRef = useRef<TextInput>(null);

    useEffect(() => {
        Animated.timing(searchAnimation, {
            toValue: isSearchActive ? 1 : 0,
            duration: 250,
            useNativeDriver: true,
        }).start();

        if (isSearchActive) {
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            setSearchText('');
            onSearchChange('');
        }
    }, [isSearchActive]);

    const handleSearchToggle = () => {
        setIsSearchActive(!isSearchActive);
    };

    const handleTextChange = (text: string) => {
        setSearchText(text);
        onSearchChange(text);
    };

    const searchTranslateY = searchAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [-20, 0],
    });

    const searchOpacity = searchAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    const titleOpacity = searchAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0],
    });

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Animated.View style={[styles.titleContainer, { opacity: titleOpacity }]}>
                    <Text style={styles.headerTitle}>Calls</Text>
                </Animated.View>

                {!isSearchActive && (
                    <View style={styles.rightActions}>
                        <TouchableOpacity onPress={handleSearchToggle} style={styles.iconButton}>
                            <LucideSearch color={theme.colors.text.primary} size={24} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.iconButton}>
                            <LucideMoreVertical color={theme.colors.text.primary} size={24} />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {isSearchActive && (
                <Animated.View style={[
                    styles.searchContainer,
                    {
                        opacity: searchOpacity,
                        transform: [{ translateY: searchTranslateY }]
                    }
                ]}>
                    <View style={styles.searchInputWrapper}>
                        <LucideSearch color={theme.colors.text.secondary} size={20} style={styles.searchIcon} />
                        <TextInput
                            ref={inputRef}
                            style={styles.searchInput}
                            placeholder="Search calls..."
                            placeholderTextColor={theme.colors.text.secondary}
                            value={searchText}
                            onChangeText={handleTextChange}
                            autoFocus
                        />
                        <TouchableOpacity onPress={handleSearchToggle} style={styles.cancelButton}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            )}

            <Modal
                transparent
                visible={menuVisible}
                onRequestClose={() => setMenuVisible(false)}
                animationType="fade"
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setMenuVisible(false)}
                >
                    <View style={styles.menuCard}>
                        <TouchableOpacity
                            style={styles.menuOption}
                            onPress={() => {
                                setMenuVisible(false);
                                onClearLog();
                            }}
                        >
                            <Text style={styles.menuText}>Clear call log</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.menuOption}
                            onPress={() => {
                                setMenuVisible(false);
                                onGoToSettings();
                            }}
                        >
                            <Text style={styles.menuText}>Settings</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.background,
        paddingTop: Platform.OS === 'ios' ? 0 : 40,
        zIndex: 10,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        height: 70,
    },
    titleContainer: {
        flex: 1,
    },
    headerTitle: {
        color: theme.colors.text.primary,
        fontSize: 32,
        fontWeight: '700',
    },
    rightActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        padding: 8,
        marginLeft: 10,
    },
    searchContainer: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 0 : 40,
        left: 0,
        right: 0,
        backgroundColor: theme.colors.background,
        height: 70,
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    searchInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.secondary,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 44,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        color: theme.colors.text.primary,
        fontSize: 16,
        paddingVertical: 8,
    },
    cancelButton: {
        marginLeft: 12,
    },
    cancelText: {
        color: theme.colors.text.primary,
        fontSize: 16,
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    menuCard: {
        position: 'absolute',
        top: 60,
        right: 20,
        backgroundColor: theme.colors.surface,
        borderRadius: 14,
        paddingVertical: 6,
        minWidth: 190,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    menuOption: {
        paddingHorizontal: 18,
        paddingVertical: 14,
    },
    menuText: {
        color: theme.colors.text.primary,
        fontSize: 16,
        fontWeight: '500',
    },
});

export default CallsHeader;
