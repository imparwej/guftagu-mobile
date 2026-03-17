import { keyManager } from './keyManager';
import apiClient from '../api/api';
import { encryptWithRSA, decryptWithRSA, generateAESKey, encryptWithAES, decryptWithAES } from '../utils/crypto';

class EncryptionService {
  private publicKeyCache: Record<string, string> = {};

  /**
   * Initialize E2EE for the current user.
   * Delegates to KeyManager for robust check/sync.
   */
  async initialize(userId: string) {
    try {
      await keyManager.checkAndInitialize(userId);
      const publicKey = await keyManager.getLocalPublicKey();
      console.log('[EncryptionService] Initialization complete.');
      return publicKey;
    } catch (error) {
      console.error('[EncryptionService] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Get public key of another user.
   * Returns empty string if the user exists but hasn't generated a key yet.
   */
  async getOtherUserPublicKey(userId: string): Promise<string | null> {
    if (this.publicKeyCache[userId]) {
      return this.publicKeyCache[userId];
    }

    try {
      console.log(`[EncryptionService] Fetching public key for user: ${userId}`);
      const response = await apiClient.get(`/users/${userId}/public-key`);
      
      const publicKey = response.data.publicKey;
      
      // If publicKey is an empty string, it means the user hasn't generated one yet.
      // We still cache it to avoid repeated 404/requests if the backend logic changes.
      this.publicKeyCache[userId] = publicKey || "";
      
      return this.publicKeyCache[userId];
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        console.warn(`[EncryptionService] User ${userId} not found in backend.`);
      } else {
        console.error(`[EncryptionService] Failed to fetch public key for user ${userId}:`, error);
      }
      return null;
    }
  }

  /**
   * Encrypt a message for a receiver.
   */
  async encryptMessage(messageContent: string, receiverId: string) {
    const receiverPublicKey = await this.getOtherUserPublicKey(receiverId);
    
    if (receiverPublicKey === null) {
      throw new Error('RECIPIENT_NOT_FOUND');
    }
    
    if (receiverPublicKey === "") {
      throw new Error('RECIPIENT_KEY_MISSING');
    }

    const aesKey = generateAESKey();
    const encryptedMessage = encryptWithAES(messageContent, aesKey);
    const encryptedAESKey = await encryptWithRSA(receiverPublicKey, aesKey);

    return {
      encryptedMessage,
      encryptedAESKey,
    };
  }

  /**
   * Decrypt an incoming message.
   */
  async decryptMessage(encryptedMessage: string, encryptedAESKey: string) {
    const privateKey = await keyManager.getPrivateKey();
    if (!privateKey) {
      throw new Error('Private key not found on device');
    }

    const aesKey = await decryptWithRSA(privateKey, encryptedAESKey);
    const decryptedContent = decryptWithAES(encryptedMessage, aesKey);

    return decryptedContent;
  }
}

export const encryptionService = new EncryptionService();
