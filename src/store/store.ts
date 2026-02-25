import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import callReducer from './slices/callSlice';
import chatReducer from './slices/chatSlice';
import statusReducer from './slices/statusSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        chat: chatReducer,
        status: statusReducer,
        call: callReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
