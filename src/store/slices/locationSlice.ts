import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserLocation {
    userId: string;
    latitude: number;
    longitude: number;
    timestamp: number;
    conversationId: string;
    name?: string;
    avatar?: string;
}

interface LocationState {
    activeLiveLocation: {
        conversationId: string;
        expiresAt: number;
    } | null;
    userLocations: Record<string, UserLocation>; // userId -> data
    locationHistory: Record<string, Array<{ latitude: number; longitude: number }>>; // userId -> points
}

const initialState: LocationState = {
    activeLiveLocation: null,
    userLocations: {},
    locationHistory: {},
};

const locationSlice = createSlice({
    name: 'location',
    initialState,
    reducers: {
        startSharing: (state, action: PayloadAction<{ conversationId: string; expiresAt: number }>) => {
            state.activeLiveLocation = action.payload;
        },
        stopSharing: (state) => {
            state.activeLiveLocation = null;
        },
        updateUserLocation: (state, action: PayloadAction<UserLocation>) => {
            const { userId, latitude, longitude } = action.payload;
            state.userLocations[userId] = action.payload;
            
            // Update history
            if (!state.locationHistory[userId]) {
                state.locationHistory[userId] = [];
            }
            state.locationHistory[userId].push({ latitude, longitude });
            
            // Limit history size to 50 points for performance
            if (state.locationHistory[userId].length > 50) {
                state.locationHistory[userId].shift();
            }
        },
        clearUserLocations: (state, action: PayloadAction<string>) => {
            const conversationId = action.payload;
            Object.keys(state.userLocations).forEach(userId => {
                if (state.userLocations[userId].conversationId === conversationId) {
                    delete state.userLocations[userId];
                    delete state.locationHistory[userId];
                }
            });
        }
    },
});

export const { 
    startSharing, 
    stopSharing, 
    updateUserLocation, 
    clearUserLocations 
} = locationSlice.actions;

export default locationSlice.reducer;
