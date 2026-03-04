import {
    LucideIcon,
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
    View,
} from 'react-native';
import { theme } from '../../theme/theme';
import { Call } from '../../types';
import PressableScale from '../PressableScale';

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

    let StatusIcon: LucideIcon = LucidePhoneIncoming;
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
        <PressableScale
            style={styles.container}
            onPress={() => onPress(item)}
            onLongPress={() => onLongPress(item)}
            scaleTo={0.98}
        >
            <View style={styles.avatarContainer}>
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
                {isMissed && <View style={styles.missedIndicator} />}
            </View>

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

                <PressableScale
                    onPress={() => onCallPress(item)}
                    style={styles.actionButton}
                    scaleTo={0.85}
                >
                    <View style={styles.iconCircle}>
                        {item.type === 'video' ? (
                            <LucideVideo size={20} color={theme.colors.text.primary} />
                        ) : (
                            <LucidePhone size={18} color={theme.colors.text.primary} />
                        )}
                    </View>
                </PressableScale>
            </View>
        </PressableScale>
    );
});

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 12,
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: theme.colors.surface,
    },
    missedIndicator: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: theme.colors.error,
        borderWidth: 2,
        borderColor: theme.colors.background,
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255,255,255,0.06)',
        paddingBottom: 12,
    },
    mainInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    name: {
        color: theme.colors.text.primary,
        fontSize: 16,
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
        color: theme.colors.text.tertiary,
        fontSize: 13,
    },
    actionButton: {
        marginLeft: 8,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default CallHistoryItem;
