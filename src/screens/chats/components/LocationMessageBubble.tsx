import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { liveLocationService } from '../../../services/LiveLocationService';
import { RootState } from '../../../store/store';
import { Message } from '../../../types';
import { resolveConversationId } from '../../../utils/resolveConversationId';
import LocationMap from '../LocationMap';

interface Props {
    message: Message;
    isMine: boolean;
}

const LocationMessageBubble: React.FC<Props> = ({ message, isMine }) => {
    const navigation = useNavigation<any>();
    const userLocations = useSelector((state: RootState) => state.location.userLocations);
    const activeLiveLocation = useSelector((state: RootState) => state.location.activeLiveLocation);

    const isLive = message.type === 'LIVE_LOCATION';
    const [timeLeft, setTimeLeft] = useState<string>('');

    // For live location, we want to show the LATEST location from Redux if available
    const liveUpdate = userLocations[message.senderId];

    let latitude = message.latitude;
    let longitude = message.longitude;

    // Safe extraction logic
    if ((!latitude || !longitude) && message.content) {
        try {
            const parsed = JSON.parse(message.content);
            latitude = parsed.lat || parsed.latitude;
            longitude = parsed.lng || parsed.longitude;
        } catch (e) { }
    }

    // Overwrite with live updates if active
    if (isLive && liveUpdate?.conversationId === message.conversationId) {
        latitude = liveUpdate.latitude;
        longitude = liveUpdate.longitude;
    }

    useEffect(() => {
        if (!isLive || !message.expiresAt) return;

        const timer = setInterval(() => {
            const now = Date.now();
            const diff = message.expiresAt! - now;
            if (diff <= 0) {
                setTimeLeft('Ended');
                clearInterval(timer);
            } else {
                const mins = Math.floor(diff / 60000);
                const secs = Math.floor((diff % 60000) / 1000);
                setTimeLeft(`${mins}:${secs.toString().padStart(2, '0')} left`);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [isLive, message.expiresAt]);

    const handleLiveLocationPress = () => {
        const conversationId = resolveConversationId(message);
        if (!conversationId) {
            Alert.alert("Error", "conversation id not found");
            return;
        }

        navigation.navigate('LiveLocationMap', {
            conversationId,
            latitude,
            longitude,
            senderId: message.senderId
        });
    };

    const handleOpenGoogleMaps = () => {
        const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
        Linking.openURL(url).catch(err => {
            console.error("Failed to open Google Maps:", err);
            Alert.alert("Error", "Could not open Google Maps.");
        });
    };

    const isStopVisible = isMine && isLive && activeLiveLocation?.conversationId === message.conversationId;

    const handleStopSharing = () => {
        Alert.alert(
            "Stop Sharing",
            "Are you sure you want to stop sharing your live location?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Stop",
                    style: "destructive",
                    onPress: () => liveLocationService.stopLiveSharing()
                }
            ]
        );
    };

    if (!latitude || !longitude) {
        return (
            <View style={[styles.container, styles.unavailable]}>
                <Text style={styles.unavailableText}>📍 Location information unavailable</Text>
            </View>
        );
    }

    // For static location, tapping the bubble opens Google Maps
    const handleBubblePress = isLive ? handleLiveLocationPress : handleOpenGoogleMaps;

    return (
        <View style={styles.container}>
            <Pressable style={styles.mapContainer} onPress={handleBubblePress}>
                <LocationMap
                    latitude={latitude}
                    longitude={longitude}
                    zoom={15}
                    showControls={false}
                    style={styles.map}
                />
            </Pressable>

            <View style={styles.content}>
                <Text style={styles.label}>
                    {isLive ? '📍 Live Location' : '📍 Current Location'}
                </Text>

                {isLive && message.expiresAt && (
                    <Text style={styles.liveSubtext}>
                        {Date.now() > message.expiresAt ? 'Ended' : timeLeft}
                    </Text>
                )}

                <View style={styles.actionRow}>
                    {isLive ? (
                        <>
                            {isStopVisible && (
                                <Pressable
                                    style={[styles.btn, styles.stopBtn]}
                                    onPress={handleStopSharing}
                                >
                                    <Text style={styles.stopBtnText}>Stop Sharing</Text>
                                </Pressable>
                            )}
                            <Pressable
                                style={[styles.btn, styles.showMapBtn]}
                                onPress={handleLiveLocationPress}
                            >
                                <Text style={styles.showMapBtnText}>Show on Map</Text>
                            </Pressable>
                        </>
                    ) : (
                        <Pressable
                            style={styles.googleMapsBtn}
                            onPress={handleOpenGoogleMaps}
                        >
                            <MaterialIcons name="navigation" size={18} color="#FFF" />
                            <Text style={styles.googleMapsBtnText}>Open in Google Maps</Text>
                        </Pressable>
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 260,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
        marginBottom: 8,
    },
    unavailable: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    unavailableText: {
        color: '#8e8e93',
        fontSize: 14,
    },
    mapContainer: {
        width: '100%',
        height: 160,
        borderRadius: 14,
        overflow: 'hidden',
        marginBottom: 6,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    content: {
        paddingHorizontal: 8,
        paddingBottom: 6,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1c1c1e',
        marginBottom: 8,
    },
    liveSubtext: {
        fontSize: 13,
        color: '#34c759',
        fontWeight: '500',
        marginBottom: 8,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 2,
    },
    btn: {
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    showMapBtn: {
        backgroundColor: '#e9f5fe',
        flex: 1,
    },
    showMapBtnText: {
        color: '#007aff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    stopBtn: {
        backgroundColor: '#fff1f1',
    },
    stopBtnText: {
        color: '#ff3b30',
        fontSize: 12,
        fontWeight: 'bold',
    },
    googleMapsBtn: {
        backgroundColor: '#121312ff', // WhatsApp Green
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 24,
        gap: 6,
        width: '100%',
    },
    googleMapsBtnText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    }
});

export default LocationMessageBubble;
