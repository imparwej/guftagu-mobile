import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { chatSocketService } from '../socket/chatSocket';
import { store } from '../store/store';
import { startSharing, stopSharing } from '../store/slices/locationSlice';

const LOCATION_TASK_NAME = 'background-location-task';

// Define the background task
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }: any) => {
    if (error) {
        console.error('Location task error:', error);
        return;
    }
    if (data) {
        const { locations } = data;
        if (locations && locations.length > 0) {
            const location = locations[0];
            LocationService.sendLocationUpdate(location.coords.latitude, location.coords.longitude);
        }
    }
});

class LocationServiceClass {
    private isTracking = false;

    async requestPermissions() {
        const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
        if (foregroundStatus !== 'granted') return false;

        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        return backgroundStatus === 'granted';
    }

    async startSharing(conversationId: string, durationInSeconds: number) {
        if (this.isTracking) return;

        const hasPermission = await this.requestPermissions();
        if (!hasPermission) {
            console.warn('Location permissions not granted');
            // We can still try foreground if background is denied, but let's aim for both
        }

        const expiresAt = Date.now() + durationInSeconds * 1000;
        
        // Update Redux
        store.dispatch(startSharing({ conversationId, expiresAt }));
        this.isTracking = true;

        const user = store.getState().auth.user;
        if (!user) return;

        // Send initial message via WebSocket to notify others
        const message = {
            conversationId,
            userId: user.id, // Requested field
            senderId: user.id,
            receiverId: store.getState().chat.activeChatId,
            type: 'LIVE_LOCATION',
            content: JSON.stringify({ lat: 0, lng: 0 }),
            latitude: 0,
            longitude: 0,
            duration: durationInSeconds, // Requested field
            expiresAt,
            timestamp: Date.now()
        };

        // Get current location for initial message
        try {
            const initialLocation = await Location.getCurrentPositionAsync({});
            message.latitude = initialLocation.coords.latitude;
            message.longitude = initialLocation.coords.longitude;
            message.content = JSON.stringify({ lat: message.latitude, lng: message.longitude });
        } catch (e) {}

        chatSocketService.sendChatMessage(message);

        // Start background tracking
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 3000, // 3 seconds
            distanceInterval: 5, // 5 meters
            foregroundService: {
                notificationTitle: "Guftagu Live Location",
                notificationBody: "Sharing your live location in chat",
                notificationColor: "#34C759"
            }
        });

        // Set timer to stop automatically
        setTimeout(() => {
            this.stopSharing();
        }, durationInSeconds * 1000);
    }

    async stopSharing() {
        if (!this.isTracking) return;
        
        const sharing = store.getState().location.activeLiveLocation;
        if (sharing) {
            // Send final update? Or just stop
        }

        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
        store.dispatch(stopSharing());
        this.isTracking = false;
    }

    sendLocationUpdate(latitude: number, longitude: number) {
        const state = store.getState();
        const activeLiveLocation = state.location.activeLiveLocation;
        const user = state.auth.user;
        
        if (!activeLiveLocation || !user || Date.now() > activeLiveLocation.expiresAt) {
            this.stopSharing();
            return;
        }

        const payload = {
            conversationId: activeLiveLocation.conversationId,
            userId: user.id, // Requested field
            senderId: user.id,
            latitude,
            longitude,
            expiresAt: activeLiveLocation.expiresAt,
            type: 'LIVE_LOCATION'
        };

        chatSocketService.sendMessage('/app/chat.liveLocation', payload);
    }
}

export const LocationService = new LocationServiceClass();
