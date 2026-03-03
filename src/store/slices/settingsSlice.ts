import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NotificationSettings {
    conversationTones: boolean;
    messagesTone: string;
    messagesVibrate: string;
    messagesLight: string;
    messagesHighPriority: boolean;
    messagesReactions: boolean;
    groupsTone: string;
    groupsVibrate: string;
    groupsLight: string;
    groupsHighPriority: boolean;
    groupsReactions: boolean;
    callTone: string;
    callVibrate: string;
}

interface PrivacySettings {
    lastSeen: string;
    profilePhoto: string;
    about: string;
    status: string;
    readReceipts: boolean;
    disappearingMessages: string;
    groups: string;
    liveLocation: string;
    blockedContacts: number;
    appLock: boolean;
}

interface StorageSettings {
    lowDataUsage: boolean;
    autoDownload: {
        mobileData: string[];
        wifi: string[];
        roaming: string[];
    };
}

interface SettingsState {
    theme: {
        type: 'solid' | 'nature' | 'abstract';
        value: string;
        brightness: number;
    };
    backup: {
        lastBackup: string | null;
        googleAccount: string | null;
        frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Never';
        includeVideos: boolean;
    };
    notifications: NotificationSettings;
    privacy: PrivacySettings;
    storage: StorageSettings;
}

const initialState: SettingsState = {
    theme: {
        type: 'solid',
        value: '#0B141B',
        brightness: 1.0,
    },
    backup: {
        lastBackup: 'Dec 12, 2025',
        googleAccount: 'user@gmail.com',
        frequency: 'Daily',
        includeVideos: false,
    },
    notifications: {
        conversationTones: true,
        messagesTone: 'Default (Aurora)',
        messagesVibrate: 'Default',
        messagesLight: 'White',
        messagesHighPriority: true,
        messagesReactions: true,
        groupsTone: 'Default (Aurora)',
        groupsVibrate: 'Default',
        groupsLight: 'White',
        groupsHighPriority: true,
        groupsReactions: true,
        callTone: 'Default',
        callVibrate: 'Default',
    },
    privacy: {
        lastSeen: 'My contacts',
        profilePhoto: 'My contacts',
        about: 'Everyone',
        status: 'My contacts',
        readReceipts: true,
        disappearingMessages: 'Off',
        groups: 'Everyone',
        liveLocation: 'None',
        blockedContacts: 12,
        appLock: false,
    },
    storage: {
        lowDataUsage: false,
        autoDownload: {
            mobileData: ['Photos'],
            wifi: ['Photos', 'Audio', 'Videos', 'Documents'],
            roaming: [],
        },
    },
};

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        updateTheme: (state, action: PayloadAction<Partial<SettingsState['theme']>>) => {
            state.theme = { ...state.theme, ...action.payload };
        },
        updateBackup: (state, action: PayloadAction<Partial<SettingsState['backup']>>) => {
            state.backup = { ...state.backup, ...action.payload };
        },
        updateNotifications: (state, action: PayloadAction<Partial<NotificationSettings>>) => {
            state.notifications = { ...state.notifications, ...action.payload };
        },
        updatePrivacy: (state, action: PayloadAction<Partial<PrivacySettings>>) => {
            state.privacy = { ...state.privacy, ...action.payload };
        },
        updateStorage: (state, action: PayloadAction<Partial<StorageSettings>>) => {
            state.storage = { ...state.storage, ...action.payload };
        },
    },
});

export const { updateTheme, updateBackup, updateNotifications, updatePrivacy, updateStorage } = settingsSlice.actions;
export default settingsSlice.reducer;
