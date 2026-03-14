import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { API_BASE_URL } from '../config/api';

import { updatePresence } from '../store/slices/chatSlice';
import { store } from '../store/store';

const SOCKET_URL = `${API_BASE_URL}/ws`;

class ChatSocketService {
    private client: Client | null = null;
    private subscriptions: Map<string, any> = new Map();

    connect(onConnect: () => void, onError: (err: any) => void) {
        if (this.client && this.client.connected) return;

        const token = store.getState().auth.token;

        this.client = new Client({
            webSocketFactory: () => new SockJS(SOCKET_URL),
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                console.log('Connected to STOMP');
                onConnect();
            },
            onStompError: (frame: any) => {
                console.error('STOMP error', frame.body);
                onError(frame.body);
            },
            onDisconnect: () => {
                console.log('Disconnected from STOMP');
            }
        });

        this.client.activate();
    }

    disconnect() {
        if (this.client) {
            this.client.deactivate();
            this.client = null;
        }
    }

    subscribe(destination: string, callback: (payload: any) => void) {
        if (!this.client || !this.client.connected) {
            console.error('Cannot subscribe, not connected');
            return;
        }

        const subscription = this.client.subscribe(destination, (message: any) => {
            if (!message || !message.body) return;

            const text = message.body.trim();

            if (!text || text.toLowerCase() === 'null') {
                return;
            }

            try {
                const parsed = JSON.parse(text);
                if (parsed) {
                    // Check if it's a presence update
                    if (destination === '/topic/presence' && parsed.userId !== undefined) {
                        store.dispatch(updatePresence({
                            userId: parsed.userId,
                            isOnline: parsed.isOnline,
                            lastSeen: parsed.lastSeen
                        }));
                        callback(parsed);
                        return;
                    }

                    // Validate message type if it's a chat message
                    const VALID_TYPES = ['TEXT', 'IMAGE', 'AUDIO', 'DOCUMENT', 'LOCATION', 'LIVE_LOCATION', 'CONTACT', 'GIF', 'LINK'];
                    if (parsed.type && !VALID_TYPES.includes(parsed.type)) {
                        console.warn('Unknown message type received:', parsed.type, '— treating as TEXT');
                        parsed.type = 'TEXT';
                    }

                    // Safety: ensure required fields exist
                    if (parsed.conversationId && parsed.senderId) {
                        callback(parsed);
                    } else if (!parsed.conversationId) {
                        // May be a non-message payload (typing, status, etc.) — pass through
                        callback(parsed);
                    }
                }
            } catch (error) {
                console.log('Invalid WS payload, skipping:', text.substring(0, 100));
            }
        });
        this.subscriptions.set(destination, subscription);
        return subscription;
    }

    unsubscribe(destination: string) {
        const subscription = this.subscriptions.get(destination);
        if (subscription) {
            subscription.unsubscribe();
            this.subscriptions.delete(destination);
        }
    }

    sendMessage(destination: string, body: any) {
        if (!this.client || !this.client.connected) {
            console.error('Cannot send message, not connected');
            return;
        }

        this.client.publish({
            destination,
            body: JSON.stringify(body)
        });
    }

    sendChatMessage(message: any) {
        this.sendMessage('/app/chat.send', message);
    }

    sendTyping(conversationId: string, userId: string, receiverId: string, typing: boolean): void {
        this.sendMessage('/app/chat.typing', { conversationId, userId, receiverId, typing });
    }
}

export const chatSocketService = new ChatSocketService();
