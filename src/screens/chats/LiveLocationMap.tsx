import React, { useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LucideChevronLeft, LucideCrosshair } from 'lucide-react-native';
import LocationMap from './LocationMap';
import { useLiveLocation } from '../../hooks/useLiveLocation';
import { RootState } from '../../store/store';
import { theme } from '../../theme/theme';
import { liveLocationService } from '../../services/LiveLocationService';
import { resolveConversationId } from '../../utils/resolveConversationId';

const LiveLocationMap = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const params = route.params || {} as any;
    const conversationId = resolveConversationId(params);
    let latitude = params.latitude;
    let longitude = params.longitude;
    const chatName = params.chatName;

    // Safe fallback parse from content if top-level exists but coordinates are missing
    if ((!latitude || !longitude) && params.content) {
        try {
            const parsed = typeof params.content === 'string' ? JSON.parse(params.content) : params.content;
            latitude = parsed.lat || parsed.latitude;
            longitude = parsed.lng || parsed.longitude;
        } catch (e) {}
    }

    // Subscribe to updates for this conversation
    useLiveLocation(conversationId);

    // Filter participants for this conversation
    const userLocations = useSelector((state: RootState) => state.location.userLocations);
    const locationHistory = useSelector((state: Record<string, any>) => state.location.locationHistory);
    const activeLiveLocation = useSelector((state: RootState) => state.location.activeLiveLocation);
    const currentUser = useSelector((state: RootState) => state.auth.user);

    const participants = useMemo(() => {
        let list = Object.values(userLocations)
            .filter(loc => loc.conversationId === conversationId)
            .map(p => ({
                id: p.userId,
                lat: p.latitude,
                lng: p.longitude,
                title: p.userId === currentUser?.id ? 'You' : (p.name || 'Participant'),
                avatar: p.avatar,
                expiresAt: p.userId === currentUser?.id ? activeLiveLocation?.expiresAt : undefined
            }));

        // If no live participants but we have static coords from params, add a static marker
        if (list.length === 0 && latitude && longitude) {
            list.push({
                id: params.senderId || 'static',
                lat: latitude,
                lng: longitude,
                title: params.senderId === currentUser?.id ? 'You' : 'Shared Location',
                avatar: undefined,
                expiresAt: undefined
            });
        }
        return list;
    }, [userLocations, conversationId, currentUser, activeLiveLocation, latitude, longitude, params.senderId]);

    // Track history for these participants
    const filteredHistory = useMemo(() => {
        const history: Record<string, any> = {};
        participants.forEach(p => {
            if (locationHistory && locationHistory[p.id]) {
                history[p.id] = locationHistory[p.id];
            }
        });
        return history;
    }, [locationHistory, participants]);

    // Initial center point (Safe fallback to first participant)
    const initialLat = latitude || (participants.length > 0 ? participants[0].lat : null);
    const initialLng = longitude || (participants.length > 0 ? participants[0].lng : null);

    const formatTimeLeft = (expiresAt?: number) => {
        if (!expiresAt) return 'Sharing Live';
        const diff = expiresAt - Date.now();
        if (diff <= 0) return 'Ended';
        const mins = Math.floor(diff / 60000);
        return `${mins} min left`;
    };

    if (!initialLat || !initialLng) {
        return (
            <View style={[styles.container, styles.center]}>
                <Text style={{ color: '#FFF' }}>Waiting for location...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LocationMap
                latitude={initialLat}
                longitude={initialLng}
                zoom={14}
                markers={participants}
                history={filteredHistory}
                style={styles.map}
                showControls={false}
            />

            {/* Header Overlay */}
            <SafeAreaView style={styles.header}>
                <View style={styles.headerRow}>
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <LucideChevronLeft color="#FFF" size={24} />
                        <View style={styles.headerTextContainer}>
                            <Text style={styles.title}>Live Location</Text>
                            <Text style={styles.subtitle}>{chatName || 'Chat'}</Text>
                        </View>
                    </TouchableOpacity>

                    {activeLiveLocation?.conversationId === conversationId && (
                        <TouchableOpacity 
                            style={styles.stopHeaderBtn}
                            onPress={() => liveLocationService.stopLiveSharing()}
                        >
                            <Text style={styles.stopHeaderText}>STOP</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </SafeAreaView>

            {/* Participants list (WhatsApp style) */}
            <View style={styles.participantsContainer}>
                <Text style={styles.participantsHeader}>
                    {participants.length === 0 ? 'No active sharing' : 
                     participants.length === 1 ? '1 person at this location' : 
                     `${participants.length} people sharing live location`}
                </Text>
                {participants.map(p => (
                    <View key={p.id} style={styles.participantItem}>
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>{p.title[0]}</Text>
                        </View>
                        <View style={styles.participantInfo}>
                            <Text style={styles.participantName}>{p.title}</Text>
                            <Text style={styles.participantTimer}>{formatTimeLeft(p.expiresAt)}</Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* Bottom Controls */}
            <View style={[styles.controls, { bottom: 200 }]}>
                <TouchableOpacity style={styles.controlButton}>
                    <LucideCrosshair color="#FFF" size={24} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    map: {
        flex: 1,
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(28, 28, 30, 0.9)',
        zIndex: 10,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingRight: 16,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    stopHeaderBtn: {
        backgroundColor: '#FF3B30',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    stopHeaderText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    headerTextContainer: {
        marginLeft: 12,
    },
    title: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    subtitle: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 12,
    },
    controls: {
        position: 'absolute',
        right: 20,
    },
    controlButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: theme.colors.active,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    participantsContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#1c1c1e',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
        maxHeight: 250,
    },
    participantsHeader: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 12,
    },
    participantItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.active,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    participantInfo: {
        marginLeft: 12,
        flex: 1,
    },
    participantName: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '600',
    },
    participantTimer: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 13,
        marginTop: 2,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default LiveLocationMap;
