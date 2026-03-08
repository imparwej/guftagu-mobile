import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User } from '../../types';

const initialState: AuthState = {
    user: null,
    token: null,
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
        loginSuccess: (state, action: PayloadAction<{ user: User, token: string }>) => {
            state.isLoading = false;
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.token = action.payload.token;
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
        updateProfile: (state, action: PayloadAction<Partial<User>>) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
            }
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
    setProfileCompleted,
    updateProfile
} = authSlice.actions;
export default authSlice.reducer;
