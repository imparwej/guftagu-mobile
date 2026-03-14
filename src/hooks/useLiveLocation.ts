import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { chatSocketService } from '../socket/chatSocket';
import { updateBuddyLocation, clearBuddyLocations } from '../store/slices/locationSlice';

export const useLiveLocation = (conversationId: string | null) => {
    const dispatch = useDispatch();

    useEffect(() => {
        if (!conversationId) return;

        const destination = `/topic/location/${conversationId}`;
        
        const subscription = chatSocketService.subscribe(destination, (payload: any) => {
            if (payload.type === 'LIVE_LOCATION' && payload.latitude && payload.longitude) {
                dispatch(updateBuddyLocation({
                    userId: payload.userId || payload.senderId,
                    latitude: payload.latitude,
                    longitude: payload.longitude,
                    timestamp: Date.now(),
                    conversationId: payload.conversationId,
                    // If backend provides name/avatar in broadcast, we can add them here
                    name: payload.senderName,
                    avatar: payload.senderAvatar
                }));
            }
        });

        return () => {
            chatSocketService.unsubscribe(destination);
            // Optional: clear on unmount? 
            // Better to keep in Redux for the duration of the app session or use a separate cleanup
        };
    }, [conversationId, dispatch]);

    const clearLocations = () => {
        if (conversationId) {
            dispatch(clearBuddyLocations(conversationId));
        }
    };

    return { clearLocations };
};
