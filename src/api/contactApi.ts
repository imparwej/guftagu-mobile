import { User } from '../types';
import apiClient from './api';

export interface Contact {
    name: string;
    phoneNumber: string;
}

export interface ContactSyncResponse {
    guftaguUsers: User[];
    inviteContacts: Contact[];
}

export const syncContacts = async (contacts: Contact[]): Promise<ContactSyncResponse> => {
    try {
        const response = await apiClient.post('/contacts/sync', { contacts });
        return response.data;
    } catch (error: any) {
        throw error.response?.data || error.message;
    }
};
