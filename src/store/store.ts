import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import callReducer from './slices/callSlice';
import chatReducer from './slices/chatSlice';
import deviceReducer from './slices/deviceSlice';
import settingsReducer from './slices/settingsSlice';
import statusReducer from './slices/statusSlice';
import locationReducer from './slices/locationSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        chat: chatReducer,
        status: statusReducer,
        call: callReducer,
        devices: deviceReducer,
        settings: settingsReducer,
        location: locationReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

