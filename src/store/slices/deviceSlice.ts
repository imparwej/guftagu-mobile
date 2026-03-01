import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface LinkedDevice {
    id: string;
    deviceName: string;
    platform: 'windows' | 'macos' | 'linux' | 'android' | 'ios' | 'web';
    lastActive: string;
    linkedAt: string;
}

interface DeviceState {
    linkedDevices: LinkedDevice[];
}

const initialState: DeviceState = {
    linkedDevices: [
        {
            id: 'dev-1',
            deviceName: 'Chrome on Windows',
            platform: 'windows',
            lastActive: new Date(Date.now() - 300000).toISOString(),
            linkedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        },
        {
            id: 'dev-2',
            deviceName: 'Safari on MacBook Pro',
            platform: 'macos',
            lastActive: new Date(Date.now() - 7200000).toISOString(),
            linkedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        },
    ],
};

const deviceSlice = createSlice({
    name: 'devices',
    initialState,
    reducers: {
        addDevice: (state, action: PayloadAction<LinkedDevice>) => {
            // Prevent duplicates
            if (!state.linkedDevices.find(d => d.id === action.payload.id)) {
                state.linkedDevices.push(action.payload);
            }
        },
        removeDevice: (state, action: PayloadAction<string>) => {
            state.linkedDevices = state.linkedDevices.filter(d => d.id !== action.payload);
        },
        clearAllDevices: (state) => {
            state.linkedDevices = [];
        },
    },
});

export const { addDevice, removeDevice, clearAllDevices } = deviceSlice.actions;
export default deviceSlice.reducer;
