export interface User {
    id: string;
    name: string;
    avatar: string;
    status?: string;
    phoneNumber?: string;
    lastSeen?: string;
}

export interface Message {
    id: string;
    chatId: string;
    senderId: string;
    text?: string;
    mediaUri?: string;
    mediaType?: 'image' | 'video' | 'audio' | 'document' | 'voice' | 'location' | 'contact';
    timestamp: string;
    status: 'sending' | 'sent' | 'delivered' | 'read';
    replyTo?: string;
}

export interface Chat {
    id: string;
    participants: string[];
    lastMessageId?: string;
    unreadCount: number;
    type: 'individual' | 'group';
    name?: string;
    avatar?: string;
    isPinned?: boolean;
    isArchived?: boolean;
    isMuted?: boolean;
    isGroup?: boolean;
    groupMembers?: string[];
}

export interface Contact {
    id: string;
    name: string;
    avatar: string;
    phone: string;
    isGuftaguUser: boolean;
}

export interface Call {
    id: string;
    type: 'voice' | 'video';
    status: 'incoming' | 'outgoing' | 'ongoing' | 'missed' | 'ended';
    participants: string[];
    timestamp: string;
    duration?: number;
}

export interface Story {
    id: string;
    userId: string;
    mediaUri: string;
    mediaType: 'image' | 'video';
    timestamp: string;
    isViewed: boolean;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    phoneNumber?: string;
    isOtpVerified: boolean;
    profileCompleted: boolean;
}
