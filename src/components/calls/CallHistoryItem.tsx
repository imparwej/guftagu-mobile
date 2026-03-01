import {
    LucidePhone,
    LucidePhoneIncoming,
    LucidePhoneMissed,
    LucidePhoneOutgoing,
    LucideVideo
} from 'lucide-react-native';
import React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { theme } from '../../theme/theme';
import { Call } from '../../types';

interface CallHistoryItemProps {
    item: Call;
    user: {
        name: string;
        avatar: string;
    };
    onPress: (item: Call) => void;
    onLongPress: (item: Call) => void;
    onCallPress: (item: Call) => void;
}

const CallHistoryItem: React.FC<CallHistoryItemProps> = React.memo(({
    item,
    user,
    onPress,
    onLongPress,
    onCallPress
}) => {
    const isMissed = item.status === 'missed';

    let StatusIcon = LucidePhoneIncoming;
    let iconColor = theme.colors.text.secondary;

    if (isMissed) {
        StatusIcon = LucidePhoneMissed;
        iconColor = theme.colors.error;
    } else if (item.status === 'outgoing') {
        StatusIcon = LucidePhoneOutgoing;
    }

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => onPress(item)}
            onLongPress={() => onLongPress(item)}
            activeOpacity={0.7}
        >
            <Image source={{ uri: user.avatar }} style={styles.avatar} />

            <View style={styles.content}>
                <View style={styles.mainInfo}>
                    <Text
                        style={[styles.name, isMissed && styles.missedName]}
                        numberOfLines={1}
                    >
                        {user.name}
                    </Text>

                    <View style={styles.details}>
                        <StatusIcon size={14} color={iconColor} style={styles.statusIcon} />
                        <Text style={styles.time}>
                            {formatTime(item.timestamp)}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={() => onCallPress(item)}
                    style={styles.actionButton}
                >
                    {item.type === 'video' ? (
                        <LucideVideo size={24} color={theme.colors.accent} />
                    ) : (
                        <LucidePhone size={22} color={theme.colors.accent} />
                    )}
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 12,
        alignItems: 'center',
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: theme.colors.surface,
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.colors.border,
        paddingBottom: 12,
        height: '100%',
    },
    mainInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    name: {
        color: theme.colors.text.primary,
        fontSize: 17,
        fontWeight: '600',
        marginBottom: 4,
    },
    missedName: {
        color: theme.colors.error,
    },
    details: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusIcon: {
        marginRight: 6,
    },
    time: {
        color: theme.colors.text.secondary,
        fontSize: 14,
    },
    actionButton: {
        padding: 10,
        marginLeft: 8,
    },
});

export default CallHistoryItem;
