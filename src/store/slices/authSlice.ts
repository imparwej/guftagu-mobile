import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User } from '../../types';

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isOtpVerified: false,
    profileCompleted: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginStart: (state) => {
            state.isLoading = true;
        },
        loginSuccess: (state, action: PayloadAction<User>) => {
            state.isLoading = false;
            state.isAuthenticated = true;
            state.user = action.payload;
            state.profileCompleted = true;
        },
        loginFailure: (state) => {
            state.isLoading = false;
            state.isAuthenticated = false;
            state.user = null;
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.isOtpVerified = false;
            state.profileCompleted = false;
            state.phoneNumber = undefined;
        },
        setPhoneNumber: (state, action: PayloadAction<string>) => {
            state.phoneNumber = action.payload;
        },
        setOtpVerified: (state, action: PayloadAction<boolean>) => {
            state.isOtpVerified = action.payload;
        },
        setProfileCompleted: (state, action: PayloadAction<boolean>) => {
            state.profileCompleted = action.payload;
        },
    },
});

export const {
    loginStart,
    loginSuccess,
    loginFailure,
    logout,
    setPhoneNumber,
    setOtpVerified,
    setProfileCompleted
} = authSlice.actions;
export default authSlice.reducer;
