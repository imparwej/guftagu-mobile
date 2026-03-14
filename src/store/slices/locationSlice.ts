import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface LiveLocationData {
    userId: string;
    latitude: number;
    longitude: number;
    timestamp: number;
    avatar?: string;
    name?: string;
    conversationId: string;
}

interface LocationState {
    activeSharing: {
        conversationId: string;
        expiresAt: number;
    } | null;
    buddyLocations: Record<string, LiveLocationData>; // userId -> data
}

const initialState: LocationState = {
    activeSharing: null,
    buddyLocations: {},
};

const locationSlice = createSlice({
    name: 'location',
    initialState,
    reducers: {
        startSharing: (state, action: PayloadAction<{ conversationId: string; expiresAt: number }>) => {
            state.activeSharing = action.payload;
        },
        stopSharing: (state) => {
            state.activeSharing = null;
        },
        updateBuddyLocation: (state, action: PayloadAction<LiveLocationData>) => {
            state.buddyLocations[action.payload.userId] = action.payload;
        },
        clearBuddyLocations: (state, action: PayloadAction<string>) => {
            // Clear locations for a specific conversation
            const conversationId = action.payload;
            Object.keys(state.buddyLocations).forEach(userId => {
                if (state.buddyLocations[userId].conversationId === conversationId) {
                    delete state.buddyLocations[userId];
                }
            });
        },
        removeBuddyLocation: (state, action: PayloadAction<string>) => {
            delete state.buddyLocations[action.payload];
        }
    },
});

export const { 
    startSharing, 
    stopSharing, 
    updateBuddyLocation, 
    clearBuddyLocations, 
    removeBuddyLocation 
} = locationSlice.actions;

export default locationSlice.reducer;
