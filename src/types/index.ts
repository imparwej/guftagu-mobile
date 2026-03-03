export interface User {
    id: string;
    name: string;
    avatar: string;
    status?: string;
    phoneNumber?: string;
    lastSeen?: string;
    about?: string;
    notes?: string;
    email?: string;
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
    isStarred?: boolean;
    // Document fields
    fileName?: string;
    fileSize?: string;
    // Location fields
    latitude?: number;
    longitude?: number;
    // Contact card fields
    contactName?: string;
    contactPhone?: string;
    // Voice message
    voiceDuration?: number;
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
    isBlocked?: boolean;
    wallpaper?: string;
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
    mediaUri?: string; // Optional for text-only
    mediaType: 'image' | 'video' | 'text';
    text?: string;
    backgroundColor?: string;
    caption?: string;
    timestamp: string;
    isViewed: boolean;
    viewers?: { userId: string, timestamp: string }[];
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    phoneNumber?: string;
    isOtpVerified: boolean;
    profileCompleted: boolean;
}
