export interface User {
    id: string;
    name: string;
    avatar: string;
    profilePicture?: string;
    bio?: string;
    status?: string;
    phone?: string;
    phoneNumber?: string;
    lastSeen?: string;
    about?: string;
    notes?: string;
    email?: string;
}

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    receiverId: string;
    type: 'TEXT' | 'IMAGE' | 'AUDIO' | 'DOCUMENT' | 'LOCATION' | 'CONTACT' | 'GIF' | 'LINK';
    content: string;
    mediaUrl?: string;
    mediaUri?: string; // UI local uri
    timestamp: number;
    delivered: boolean;
    seen: boolean;
    status?: 'SENT' | 'DELIVERED' | 'READ' | 'SENDING'; // Legacy UI status, not used for ticks
    replyTo?: string;
    starred?: boolean;
    isStarred?: boolean; // Keep for legacy state until refactored
    forwarded?: boolean;
    fileName?: string;
    fileSize?: string;
    latitude?: number;
    longitude?: number;
    contactName?: string;
    contactPhone?: string;
    voiceDuration?: number;
    reactions?: Record<string, string[]>;

    // Link preview fields
    url?: string;
    linkTitle?: string;
    linkDescription?: string;
    linkImage?: string;

    // Disappearing message fields
    expiresAt?: number;

    // Link metadata from backend
    metadata?: Record<string, string>;
}

export interface Chat {
    id: string;
    user1Id?: string;
    user2Id?: string;
    lastMessage?: string;
    lastMessageTime?: string;
    unreadCount: number;
    // Extended fields for UI
    otherUser?: User;
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
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    phoneNumber?: string;
    isOtpVerified: boolean;
    profileCompleted: boolean;
}
