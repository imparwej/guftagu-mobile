import React, { useCallback, useMemo, useState } from 'react';
import {
    Alert,
    FlatList,
    LayoutAnimation,
    Modal,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    UIManager,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { TAB_BAR_HEIGHT } from '../../navigation/tabConstants';
import { clearCallLog, deleteCall } from '../../store/slices/callSlice';
import { RootState } from '../../store/store';
import { theme } from '../../theme/theme';
import { Call } from '../../types';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

// Components
import CallHistoryItem from '../../components/calls/CallHistoryItem';
import CallsHeader from '../../components/calls/CallsHeader';
import EmptyCallsState from '../../components/calls/EmptyCallsState';

const CallListScreen = ({ navigation }: any) => {
    const dispatch = useDispatch();
    const { calls } = useSelector((state: RootState) => state.call);
    const { chats } = useSelector((state: RootState) => state.chat);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCall, setSelectedCall] = useState<Call | null>(null);
    const [contextMenuVisible, setContextMenuVisible] = useState(false);

    // Get user info from chats
    const getUserInfo = useCallback((userId: string) => {
        const chat = chats.find(c => c.participants.includes(userId));
        return {
            name: chat?.name || 'Unknown',
            avatar: chat?.avatar || `https://i.pravatar.cc/150?u=${userId}`,
            userId
        };
    }, [chats]);

    // Group calls by date and filter by search
    const groupedCalls = useMemo(() => {
        const filtered = calls.filter(call => {
            const otherUserId = call.participants.find(id => id !== '1') || '2';
            const user = getUserInfo(otherUserId);
            return user.name.toLowerCase().includes(searchQuery.toLowerCase());
        });

        const groups: { [key: string]: Call[] } = {};
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const yesterday = today - 86400000;

        filtered.forEach(call => {
            const callDate = new Date(call.timestamp);
            const callTime = new Date(callDate.getFullYear(), callDate.getMonth(), callDate.getDate()).getTime();

            let label = 'Older';
            if (callTime === today) label = 'Today';
            else if (callTime === yesterday) label = 'Yesterday';

            if (!groups[label]) groups[label] = [];
            groups[label].push(call);
        });

        // Convert to array format for FlatList
        const result: any[] = [];
        if (groups['Today']) {
            result.push({ type: 'header', title: 'Today' });
            result.push(...groups['Today'].map(c => ({ ...c, type: 'item' })));
        }
        if (groups['Yesterday']) {
            result.push({ type: 'header', title: 'Yesterday' });
            result.push(...groups['Yesterday'].map(c => ({ ...c, type: 'item' })));
        }
        if (groups['Older']) {
            result.push({ type: 'header', title: 'Older' });
            result.push(...groups['Older'].map(c => ({ ...c, type: 'item' })));
        }

        return result;
    }, [calls, searchQuery, getUserInfo]);

    const handleCallPress = useCallback((call: Call) => {
        const otherUserId = call.participants.find(id => id !== '1') || '2';
        if (call.type === 'voice') {
            navigation.navigate('VoiceCall', { userId: otherUserId });
        } else {
            navigation.navigate('VideoCall', { userId: otherUserId });
        }
    }, [navigation]);

    const handleLongPress = useCallback((call: Call) => {
        setSelectedCall(call);
        setContextMenuVisible(true);
    }, []);

    const handleDeleteCall = () => {
        if (selectedCall) {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            dispatch(deleteCall(selectedCall.id));
            setContextMenuVisible(false);
            setSelectedCall(null);
        }
    };

    const handleViewContact = () => {
        if (selectedCall) {
            const otherUserId = selectedCall.participants.find(id => id !== '1') || '2';
            setContextMenuVisible(false);
            navigation.navigate('UserInfo', { userId: otherUserId });
        }
    };

    const handleClearLog = () => {
        Alert.alert(
            "Clear call log",
            "Are you sure you want to clear your entire call log?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Clear",
                    style: "destructive",
                    onPress: () => dispatch(clearCallLog())
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: any }) => {
        if (item.type === 'header') {
            return (
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionHeaderText}>{item.title}</Text>
                </View>
            );
        }

        const otherUserId = item.participants.find((id: string) => id !== '1') || '2';
        const user = getUserInfo(otherUserId);

        return (
            <CallHistoryItem
                item={item}
                user={user}
                onPress={() => handleCallPress(item)}
                onLongPress={() => handleLongPress(item)}
                onCallPress={() => handleCallPress(item)}
            />
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="light-content" />

            <CallsHeader
                onSearchChange={setSearchQuery}
                onClearLog={handleClearLog}
                onGoToSettings={() => navigation.navigate('Settings')}
            />

            <FlatList
                data={groupedCalls}
                keyExtractor={(item, index) => (item.id || item.title) + index}
                renderItem={renderItem}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={<EmptyCallsState />}
                showsVerticalScrollIndicator={false}
            />

            {/* Context Menu Modal */}
            <Modal
                transparent
                visible={contextMenuVisible}
                onRequestClose={() => setContextMenuVisible(false)}
                animationType="fade"
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setContextMenuVisible(false)}
                >
                    <View style={styles.contextMenu}>
                        <TouchableOpacity style={styles.menuOption} onPress={handleViewContact}>
                            <Text style={styles.menuText}>View contact</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.menuOption, styles.destructiveOption]}
                            onPress={handleDeleteCall}
                        >
                            <Text style={[styles.menuText, styles.destructiveText]}>Delete call</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    listContainer: {
        paddingBottom: TAB_BAR_HEIGHT + 20,
    },
    sectionHeader: {
        backgroundColor: theme.colors.secondary,
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginTop: 5,
    },
    sectionHeaderText: {
        color: theme.colors.text.secondary,
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contextMenu: {
        backgroundColor: theme.colors.surface,
        borderRadius: 14,
        paddingVertical: 6,
        width: '80%',
        maxWidth: 300,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    menuOption: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.colors.border,
    },
    destructiveOption: {
        borderBottomWidth: 0,
    },
    menuText: {
        color: theme.colors.text.primary,
        fontSize: 17,
        fontWeight: '500',
        textAlign: 'center',
    },
    destructiveText: {
        color: theme.colors.error,
    },
});

export default CallListScreen;
