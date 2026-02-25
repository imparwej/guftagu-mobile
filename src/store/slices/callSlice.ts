import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Call } from '../../types';

interface CallState {
    calls: Call[];
    activeCall: Call | null;
}

const dummyCalls: Call[] = [
    {
        id: 'c1',
        type: 'voice',
        status: 'missed',
        participants: ['1', '2'],
        timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
        id: 'c2',
        type: 'video',
        status: 'ended',
        participants: ['1', '3'],
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        duration: 300, // 5 minutes
    },
    {
        id: 'c3',
        type: 'voice',
        status: 'ended',
        participants: ['1', '4'],
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        duration: 120, // 2 minutes
    }
];

const initialState: CallState = {
    calls: dummyCalls,
    activeCall: null,
};

const callSlice = createSlice({
    name: 'calls',
    initialState,
    reducers: {
        setCalls: (state, action: PayloadAction<Call[]>) => {
            state.calls = action.payload;
        },
        setActiveCall: (state, action: PayloadAction<Call | null>) => {
            state.activeCall = action.payload;
        },
        addCall: (state, action: PayloadAction<Call>) => {
            state.calls.unshift(action.payload);
        },
        updateCallStatus: (state, action: PayloadAction<{ callId: string, status: Call['status'] }>) => {
            const call = state.calls.find(c => c.id === action.payload.callId);
            if (call) {
                call.status = action.payload.status;
            }
            if (state.activeCall && state.activeCall.id === action.payload.callId) {
                state.activeCall.status = action.payload.status;
            }
        },
    },
});

export const { setCalls, setActiveCall, addCall, updateCallStatus } = callSlice.actions;
export default callSlice.reducer;
