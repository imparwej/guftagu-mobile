import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json"
    }
});

export const sendOtp = async (phoneNumber: string) => {
    try {
        const response = await apiClient.post('/auth/send-otp', { phoneNumber });
        return response.data;
    } catch (error: any) {
        throw error.response?.data || error.message;
    }
};

export const verifyOtp = async (phoneNumber: string, otp: string) => {
    try {
        const response = await apiClient.post('/auth/verify-otp', { phoneNumber, otp });
        return response.data;
    } catch (error: any) {
        throw error.response?.data || error.message;
    }
};

export const createProfile = async (data: {
    phoneNumber: string;
    name: string;
    bio: string;
    profileImage: string;
}) => {
    try {
        const response = await apiClient.post('/auth/create-profile', data);
        return response.data;
    } catch (error: any) {
        throw error.response?.data || error.message;
    }
};

export default apiClient;
