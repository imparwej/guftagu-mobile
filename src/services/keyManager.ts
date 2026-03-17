import * as SecureStore from 'expo-secure-store';
import { RSA } from 'react-native-rsa-native';
import { API_BASE_URL } from '../config/api';
import axios from 'axios';

const PRIVATE_KEY_ALIAS = 'guftagu_private_key';
const PUBLIC_KEY_ALIAS = 'guftagu_public_key';

export class KeyManager {
    private static instance: KeyManager;
    private userId: string | null = null;

    private constructor() {}

    public static getInstance(): KeyManager {
        if (!KeyManager.instance) {
            KeyManager.instance = new KeyManager();
        }
        return KeyManager.instance;
    }

    public setUserId(userId: string) {
        this.userId = userId;
    }

    /**
     * Checks if keys exist locally. If not, generates them.
     * Then ensures the public key is synced with the backend.
     */
    public async checkAndInitialize(userId: string): Promise<void> {
        this.userId = userId;
        console.log(`[KeyManager] Initializing for user: ${userId}`);

        let privateKey = await SecureStore.getItemAsync(PRIVATE_KEY_ALIAS);
        let publicKey = await SecureStore.getItemAsync(PUBLIC_KEY_ALIAS);

        if (!privateKey || !publicKey) {
            console.log('[KeyManager] Keys not found locally. Generating new pair...');
            const keys = await RSA.generateKeys(2048);
            privateKey = keys.private;
            publicKey = keys.public;

            await SecureStore.setItemAsync(PRIVATE_KEY_ALIAS, privateKey);
            await SecureStore.setItemAsync(PUBLIC_KEY_ALIAS, publicKey);
            console.log('[KeyManager] New keys generated and stored in SecureStore.');
        } else {
            console.log('[KeyManager] Keys found locally.');
        }

        // Always attempt to sync with backend to ensure ROBUSTNESS (self-healing)
        await this.syncPublicKeyWithRetry(publicKey);
    }

    /**
     * Uploads public key to backend with simple retry logic.
     */
    private async syncPublicKeyWithRetry(publicKey: string, retries: number = 3): Promise<void> {
        if (!this.userId) return;

        for (let i = 1; i <= retries; i++) {
            try {
                console.log(`[KeyManager] Syncing public key to backend (Attempt ${i})...`);
                await axios.post(`${API_BASE_URL}/api/users/public-key`, {
                    userId: this.userId,
                    publicKey: publicKey
                });
                console.log('[KeyManager] Public key synced successfully.');
                return;
            } catch (err) {
                console.warn(`[KeyManager] Sync attempt ${i} failed:`, err);
                if (i === retries) {
                    throw new Error('Failed to sync public key after multiple attempts.');
                }
                // Wait before retrying (exponential backoff optional, simple delay here)
                await new Promise(resolve => setTimeout(resolve, 1000 * i));
            }
        }
    }

    public async getPrivateKey(): Promise<string | null> {
        return await SecureStore.getItemAsync(PRIVATE_KEY_ALIAS);
    }

    public async getLocalPublicKey(): Promise<string | null> {
        return await SecureStore.getItemAsync(PUBLIC_KEY_ALIAS);
    }
}

export const keyManager = KeyManager.getInstance();
