import apiClient from './api';

export const getChats = async (userId: string, token?: string) => {
    try {
        const response = await apiClient.get(`/chats/${userId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        return response.data;
    } catch (error: any) {
        throw error.response?.data || error.message;
    }
};

export const getMessages = async (conversationId: string, userId?: string, token?: string) => {
    try {
        const response = await apiClient.get(`/messages/${conversationId}`, {
            params: userId ? { userId } : {},
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        return response.data;
    } catch (error: any) {
        throw error.response?.data || error.message;
    }
};

export const sendMessage = async (messageData: any, token?: string) => {
    try {
        const response = await apiClient.post('/messages', messageData, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        return response.data;
    } catch (error: any) {
        throw error.response?.data || error.message;
    }
};

export const markAsRead = async (conversationId: string, userId: string, token?: string) => {
    try {
        const response = await apiClient.post('/chats/messages/read', { conversationId, userId }, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        return response.data;
    } catch (error: any) {
        throw error.response?.data || error.message;
    }
};

export const uploadFile = async (
    type: string,
    fileUri: string,
    token: string,
    onUploadProgress?: (progress: number) => void
) => {
    const formData = new FormData();
    const filename = fileUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename || '');
    const ext = match ? match[1].toLowerCase() : '';

    let mimeType = 'image/jpeg';
    if (type === 'audio' || type === 'voice') mimeType = 'audio/mpeg';
    else if (type === 'video') mimeType = 'video/mp4';
    else if (type === 'document') {
        const docMimes: Record<string, string> = {
            pdf: 'application/pdf',
            doc: 'application/msword',
            docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            xls: 'application/vnd.ms-excel',
            xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        };
        mimeType = docMimes[ext] || 'application/octet-stream';
    } else if (ext === 'png') mimeType = 'image/png';
    else if (ext === 'gif') mimeType = 'image/gif';
    else if (ext === 'mp4' || ext === 'mov') mimeType = 'video/mp4';

    formData.append('file', {
        uri: fileUri,
        name: filename || `file_${Date.now()}.${ext || 'bin'}`,
        type: mimeType,
    } as any);

    try {
        const response = await apiClient.post('/api/media/upload', formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
            transformRequest: (data) => {
                return data; // Prevent Axios from stringifying FormData in React Native
            },
            onUploadProgress: (progressEvent) => {
                if (onUploadProgress && progressEvent.total) {
                    const percentCompleted = Math.min(100, Math.round((progressEvent.loaded * 100) / progressEvent.total));
                    onUploadProgress(percentCompleted);
                }
            },
        });
        return response.data;
    } catch (error: any) {
        throw error.response?.data || error.message;
    }
};

// ──────── LINK PREVIEW ────────
export const getLinkPreview = async (url: string) => {
    try {
        const response = await apiClient.get('/link/preview', { params: { url } });
        return response.data;
    } catch (error: any) {
        console.warn('Link preview fetch failed:', error);
        return null;
    }
};

// ──────── BLOCK / UNBLOCK ────────
export const blockUser = async (blockerId: string, blockedId: string) => {
    try {
        const response = await apiClient.post('/users/block', { blockerId, blockedId });
        return response.data;
    } catch (error: any) {
        console.warn('Block API failed:', error);
        return { error: true, message: error.message };
    }
};

export const unblockUser = async (blockerId: string, blockedId: string) => {
    try {
        const response = await apiClient.post('/users/unblock', { blockerId, blockedId });
        return response.data;
    } catch (error: any) {
        console.warn('Unblock API failed:', error);
        return { error: true, message: error.message };
    }
};

// ──────── MUTE ────────
export const muteConversation = async (userId: string, conversationId: string, muteDuration: string = 'indefinite') => {
    try {
        const response = await apiClient.post('/users/mute', { userId, conversationId, muteDuration });
        return response.data;
    } catch (error: any) {
        console.warn('Mute API failed:', error);
        return { error: true, message: error.message };
    }
};

// ──────── CLEAR CHAT (per user) ────────
export const clearChatForUser = async (conversationId: string, userId: string) => {
    try {
        const response = await apiClient.delete(`/chats/${conversationId}/clear/${userId}`);
        return response.data;
    } catch (error: any) {
        throw error.response?.data || error.message;
    }
};

// ──────── MEDIA / LINKS / DOCS ────────
export const getMediaMessages = async (conversationId: string, category: string = 'all') => {
    try {
        const response = await apiClient.get(`/chats/${conversationId}/media`, { params: { category } });
        return response.data;
    } catch (error: any) {
        throw error.response?.data || error.message;
    }
};

// ──────── DELETE MESSAGE ────────
export const deleteMessageApi = async (messageId: string, userId: string, forEveryone: boolean) => {
    try {
        const response = await apiClient.delete(`/messages/${messageId}`, {
            params: { userId, forEveryone }
        });
        return response.data;
    } catch (error: any) {
        throw error.response?.data || error.message;
    }
};

// ──────── STAR MESSAGES ────────
export const toggleStarMessageApi = async (messageId: string) => {
    try {
        const response = await apiClient.put(`/messages/${messageId}/star`);
        return response.data;
    } catch (error: any) {
        throw error.response?.data || error.message;
    }
};

export const getStarredMessagesApi = async (userId: string) => {
    try {
        const response = await apiClient.get(`/messages/starred/${userId}`);
        return response.data;
    } catch (error: any) {
        throw error.response?.data || error.message;
    }
};

// ──────── REACT TO MESSAGE ────────
export const reactToMessage = async (messageId: string, userId: string, reaction: string) => {
    try {
        const response = await apiClient.post('/messages/react', { messageId, userId, reaction });
        return response.data;
    } catch (error: any) {
        throw error.response?.data || error.message;
    }
};

// ──────── EDIT MESSAGE ────────
export const editMessageApi = async (messageId: string, newContent: string) => {
    try {
        const response = await apiClient.put('/messages/edit', { messageId, newContent });
        return response.data;
    } catch (error: any) {
        throw error.response?.data || error.message;
    }
};

// ──────── PIN CHAT ────────
export const pinChatApi = async (conversationId: string, userId: string) => {
    try {
        const response = await apiClient.post('/chats/pin', { conversationId, userId });
        return response.data;
    } catch (error: any) {
        throw error.response?.data || error.message;
    }
};

// ──────── DEVICE TOKEN ────────
export const updateDeviceTokenApi = async (userId: string, token: string) => {
    try {
        const response = await apiClient.post('/users/device-token', { userId, token });
        return response.data;
    } catch (error: any) {
        console.warn('Device token update failed:', error);
        return { error: true, message: error.message };
    }
};
