import { RSA } from 'react-native-rsa-native';
import CryptoJS from 'crypto-js';

export const generateRSAKeyPair = async () => {
  try {
    const keys = await RSA.generateKeys(2048);
    return keys; // { public: string, private: string }
  } catch (error) {
    console.error('RSA Key generation error:', error);
    throw error;
  }
};

export const encryptWithRSA = async (publicKey: string, message: string) => {
  try {
    const encrypted = await RSA.encrypt(message, publicKey);
    return encrypted;
  } catch (error) {
    console.error('RSA Encryption error:', error);
    throw error;
  }
};

export const decryptWithRSA = async (privateKey: string, encryptedMessage: string) => {
  try {
    const decrypted = await RSA.decrypt(encryptedMessage, privateKey);
    return decrypted;
  } catch (error) {
    console.error('RSA Decryption error:', error);
    throw error;
  }
};

export const generateAESKey = () => {
  return CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Base64);
};

export const encryptWithAES = (message: string, aesKey: string) => {
  try {
    return CryptoJS.AES.encrypt(message, aesKey).toString();
  } catch (error) {
    console.error('AES Encryption error:', error);
    throw error;
  }
};

export const decryptWithAES = (encryptedMessage: string, aesKey: string) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, aesKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('AES Decryption error:', error);
    throw error;
  }
};
