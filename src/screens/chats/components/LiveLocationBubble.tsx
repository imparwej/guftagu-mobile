import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import LocationMap from '../LocationMap';
import { Message } from '../../../types';
import { useLiveLocation } from '../../../hooks/useLiveLocation';
import { RootState } from '../../../store/store';
import { theme } from '../../../theme/theme';

interface Props {
    message: Message;
    isMine: boolean;
}

const LiveLocationBubble: React.FC<Props> = ({ message, isMine }) => {
    const navigation = useNavigation<any>();
    
    // Subscribe to live updates for this conversation
    useLiveLocation(message.conversationId);

    const buddyLocations = useSelector((state: RootState) => state.location.buddyLocations);
    const activeSharing = useSelector((state: RootState) => state.location.activeSharing);

    // Find the specific location for the sender of this message
    const locationData = buddyLocations[message.senderId];
    
    // If it's "Mine", we might be sharing
    const isActuallySharing = isMine 
        ? (activeSharing?.conversationId === message.conversationId && Date.now() < (activeSharing?.expiresAt || 0))
        : (locationData && Date.now() < (message.expiresAt || 0));

    const currentLat = locationData?.latitude || message.latitude || 0;
    const currentLng = locationData?.longitude || message.longitude || 0;
    const isExpired = message.expiresAt ? Date.now() > message.expiresAt : false;

    if (currentLat === 0 && currentLng === 0) {
        return (
            <View style={[styles.container, { backgroundColor: isMine ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.04)' }]}>
                <Text style={{color: isMine ? '#000' : '#FFF'}}>Loading Location...</Text>
            </View>
        );
    }

    const openFullScreenMap = () => {
        const conversationId = message.conversationId || (message as any).chatId;
        navigation.navigate('LiveLocationMap', { 
            conversationId: conversationId,
            latitude: currentLat,
            longitude: currentLng,
            userId: message.senderId,
            chatName: isMine ? 'Your Live Location' : 'Live Location'
        });
    };

    return (
        <View style={styles.wrapper}>
            <Pressable style={styles.mapContainer} onPress={openFullScreenMap}>
                <LocationMap
                    latitude={currentLat}
                    longitude={currentLng}
                    zoom={16}
                    showControls={false}
                    style={styles.map}
                />
                
                {isExpired && (
                    <View style={styles.expiredOverlay}>
                        <Text style={styles.expiredText}>Live Location Ended</Text>
                    </View>
                )}
            </Pressable>
            <Text style={[styles.label, { color: isMine ? 'rgba(0,0,0,0.7)' : theme.colors.text.secondary }]}>
                {isExpired ? '📍 Live Location Ended' : '📍 Sharing Live Location'}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 4,
    },
    container: {
        width: 200,
        height: 120,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    mapContainer: {
        width: 220,
        height: 140,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 4,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    expiredOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    expiredText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 12,
    },
    label: {
        fontSize: 12,
        fontWeight: '500',
    }
});

export default LiveLocationBubble;
