import React, { useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LucideChevronLeft, LucideCrosshair } from 'lucide-react-native';
import LocationMap from './LocationMap';
import { useLiveLocation } from '../../hooks/useLiveLocation';
import { RootState } from '../../store/store';
import { theme } from '../../theme/theme';

const LiveLocationMap = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { conversationId, latitude, longitude, userId, chatName } = route.params as { 
        conversationId?: string; 
        latitude?: number;
        longitude?: number;
        userId?: string;
        chatName?: string;
    } || {};
    
    if (!conversationId) {
        return (
            <View style={[styles.container, styles.center]}>
                <Text style={{ color: '#FFF' }}>Invalid location message</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
                    <Text style={{ color: theme.colors.active }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Subscribe to updates for this conversation
    useLiveLocation(conversationId);

    const buddyLocations = useSelector((state: RootState) => state.location.buddyLocations);
    const activeSharing = useSelector((state: RootState) => state.location.activeSharing);
    const user = useSelector((state: RootState) => state.auth.user);

    // Filter buddies for this conversation
    const participants = useMemo(() => {
        const list = Object.values(buddyLocations).filter(b => b.conversationId === conversationId);
        
        // Add self if sharing
        if (activeSharing?.conversationId === conversationId && user) {
            // We don't have our own live location in "buddyLocations" usually, 
            // but for the map we want to show it.
            // Ideally, we'd have a 'myLocation' in the slice or use the latest streamed one.
        }
        
        return list.map(p => ({
            id: p.userId,
            lat: p.latitude,
            lng: p.longitude,
            title: p.name || 'User',
            avatar: p.avatar
        }));
    }, [buddyLocations, conversationId, activeSharing, user]);

    // Initial center point (use first participant or a default)
    const initialLat = participants.length > 0 ? participants[0].lat : 28.6139;
    const initialLng = participants.length > 0 ? participants[0].lng : 77.2090;

    return (
        <View style={styles.container}>
            <LocationMap
                latitude={latitude || initialLat}
                longitude={longitude || initialLng}
                zoom={14}
                markers={participants}
                style={styles.map}
            />

            {/* Header Overlay */}
            <SafeAreaView style={styles.header}>
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
            </SafeAreaView>

            {/* Bottom Controls */}
            <View style={styles.controls}>
                <TouchableOpacity style={styles.controlButton}>
                    <LucideCrosshair color="#FFF" size={24} />
                </TouchableOpacity>
            </View>

            {/* Participants list or info could go here */}
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
        backgroundColor: 'rgba(18, 18, 18, 0.8)',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
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
        bottom: 40,
        right: 20,
    },
    controlButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: theme.colors.active,
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default LiveLocationMap;
