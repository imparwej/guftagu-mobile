import * as Location from 'expo-location';
import { chatSocketService } from '../socket/chatSocket';

class LiveLocationService {
  private subscription: Location.LocationSubscription | null = null;
  public isSharing = false;
  private durationTimeout: NodeJS.Timeout | null = null;
  public activeChatId: string | null = null;

  async startSharing(chatId: string, senderId: string, durationMinutes: number) {
    if (this.isSharing) {
      await this.stopSharing();
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return false;

    this.isSharing = true;
    this.activeChatId = chatId;
    const expiresAt = Date.now() + durationMinutes * 60 * 1000;

    // Send initial immediately
    try {
      const loc = await Location.getCurrentPositionAsync({});
      this.sendUpdate(loc, chatId, senderId, expiresAt);
    } catch (e) {
      console.warn("Could not get initial location", e);
    }

    this.subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
        distanceInterval: 10,
      },
      (location) => {
        if (Date.now() > expiresAt) {
          this.stopSharing();
          return;
        }
        this.sendUpdate(location, chatId, senderId, expiresAt);
      }
    );

    this.durationTimeout = setTimeout(() => {
      this.stopSharing();
    }, durationMinutes * 60 * 1000);

    return true;
  }

  private sendUpdate(location: Location.LocationObject, chatId: string, senderId: string, expiresAt: number) {
    chatSocketService.sendMessage(`/app/chat.liveLocation`, {
      type: 'LIVE_LOCATION',
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      conversationId: chatId, // Map to what Message model normally expects
      senderId,
      expiresAt
    });
  }

  async stopSharing() {
    this.isSharing = false;
    this.activeChatId = null;
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
