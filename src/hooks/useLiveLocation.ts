import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { chatSocketService } from '../socket/chatSocket';
import { updateUserLocation, clearUserLocations } from '../store/slices/locationSlice';

export const useLiveLocation = (conversationId: string | null) => {
    const dispatch = useDispatch();

    useEffect(() => {
        if (!conversationId) return;

        const destination = `/topic/location/${conversationId}`;
        
        const subscription = chatSocketService.subscribe(destination, (payload: any) => {
            console.log(`[useLiveLocation] Received update on ${destination}:`, payload);
            if (payload.type === 'LIVE_LOCATION_UPDATE' && payload.latitude && payload.longitude) {
                dispatch(updateUserLocation({
                    userId: payload.userId,
                    latitude: payload.latitude,
                    longitude: payload.longitude,
                    name: payload.name,
                    avatar: payload.avatar,
                    timestamp: payload.timestamp || Date.now(),
                    conversationId: payload.conversationId || conversationId,
                }));
            }
        });

        return () => {
            chatSocketService.unsubscribe(destination);
        };
    }, [conversationId, dispatch]);

    const clearLocations = () => {
        if (conversationId) {
            dispatch(clearUserLocations(conversationId));
        }
    };

    return { clearLocations };
};
