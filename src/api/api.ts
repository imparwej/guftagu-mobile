import axios from 'axios';
import { API_BASE_URL } from '../config/api';

import { store } from '../store/store';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json"
    }
});

console.log("API URL:", API_BASE_URL);

// Add a request interceptor
apiClient.interceptors.request.use(
    (config) => {
        const state = store.getState();
        const token = state.auth.token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const sendOtp = async (phoneNumber: string) => {
    try {
        const response = await apiClient.post('/auth/send-otp', { phoneNumber });
        console.log("OTP RESPONSE:", response);
        return response.data;
    } catch (error: any) {
        throw error.response?.data || error.message;
    }
};

export const verifyOtp = async (phoneNumber: string, otp: string) => {
    try {
        const response = await apiClient.post('/auth/verify-otp', { phoneNumber, otp });
        console.log("OTP RESPONSE:", response);
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
