import * as Location from 'expo-location';
import { chatSocketService } from '../socket/chatSocket';
import { store } from '../store/store';
import { startSharing, stopSharing } from '../store/slices/locationSlice';

class LiveLocationService {
  private subscription: Location.LocationSubscription | null = null;
  private durationTimeout: NodeJS.Timeout | null = null;
  public isSharing = false;

  async startLiveSharing(conversationId: string, senderId: string, durationMinutes: number) {
    if (this.isSharing) {
      await this.stopLiveSharing();
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return false;

    // Get current position BEFORE starting to ensure no undefined coords
    let initialLocation: Location.LocationObject;
    try {
      initialLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
    } catch (e) {
      console.error("[LiveLocationService] Failed to get initial location:", e);
      return false;
    }

    this.isSharing = true;
    const expiresAt = Date.now() + durationMinutes * 60 * 1000;

    // Sync with Redux
    store.dispatch(startSharing({ conversationId, expiresAt }));

    // Send initial update immediately
    this.sendUpdate(initialLocation, conversationId, senderId);

    // Start watching
    this.subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
        distanceInterval: 10,
      },
      (location) => {
        if (Date.now() > expiresAt) {
          this.stopLiveSharing();
          return;
        }
        this.sendUpdate(location, conversationId, senderId);
      }
    );

    // Auto-stop timeout
    this.durationTimeout = setTimeout(() => {
      this.stopLiveSharing();
    }, durationMinutes * 60 * 1000);

    return true;
  }

  private sendUpdate(location: Location.LocationObject, conversationId: string, userId: string) {
    if (!location || !location.coords) {
      console.warn("[LiveLocationService] Attempted to send update with missing location data");
      return;
    }

    const user = store.getState().auth.user;
    const payload = {
      type: 'LIVE_LOCATION_UPDATE',
      conversationId,
      userId,
      name: user?.name,
      avatar: user?.avatar,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      timestamp: Date.now()
    };
    
    console.log("[LiveLocationService] Sending update:", payload);
    chatSocketService.sendMessage(`/app/chat.liveLocation`, payload);
  }

  async stopLiveSharing() {
    this.isSharing = false;
    
    // Sync with Redux
    store.dispatch(stopSharing());

    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
    if (this.durationTimeout) {
      clearTimeout(this.durationTimeout);
      this.durationTimeout = null;
    }
  }
}

export const liveLocationService = new LiveLocationService();
