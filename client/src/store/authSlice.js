import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';
import Swal from 'sweetalert2';

// Login
export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
    try {
        const { data } = await api.post('/auth/login', credentials);
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        return data.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

// Register
export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
    try {
        const { data } = await api.post('/auth/register', userData);
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        return data.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

// QR Login
export const qrLogin = createAsyncThunk('auth/qrLogin', async (qrData, { rejectWithValue }) => {
    try {
        const { data } = await api.post('/auth/qr-login', qrData);
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        return data.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: JSON.parse(localStorage.getItem('user')) || null,
        token: localStorage.getItem('token') || null,
        isLoading: false,
        error: null,
    },
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload?.message || 'Login failed';
            })
            // Register
            .addCase(register.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(register.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload?.message || 'Registration failed';
            })
            // QR Login
            .addCase(qrLogin.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(qrLogin.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(qrLogin.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload?.message || 'ID Validation Failed';
            });
    },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
