// src/redux/userNotificationsSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import dayjs from 'dayjs'; // For formatting dates
import relativeTime from 'dayjs/plugin/relativeTime'; // For relative time
import axios from 'axios';
const BaseUrl = process.env.REACT_APP_BASH_URL;

dayjs.extend(relativeTime);

export const notificationList = createAsyncThunk(
    'notification/notificationList',
    async (vendorId, thunkAPI) => {
        try {
            const response = await axios.post(`${BaseUrl}/vendor/notifications/list`, {
                id: vendorId
            });
            if (!response.data.success) {
                throw new Error('Network response was not ok');
            }
            return response.data.result;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const markAllAsRead = createAsyncThunk(
    'notification/markAllAsRead',
    async (vendorId, thunkAPI) => {
        try {
            const response = await axios.post(`${BaseUrl}/vendor/notifications/markAllAsRead`, {
                id: vendorId
            });
            if (!response.data.success) {
                throw new Error('Network response was not ok');
            }
            return response.data.result;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const getUnreadCount = createAsyncThunk(
    'notification/getUnreadCount',
    async (vendorId, thunkAPI) => {
        try {
            const response = await axios.post(`${BaseUrl}/vendor/notifications/unreadCount`, {
                id: vendorId
            });
            if (!response.data.success) {
                throw new Error('Network response was not ok');
            }
            return response.data.unReadNotifications;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

const initialState = {
    notifications: [],
    unreadCount: 0,
    status: 'idle',
    error: null,
};

const userNotificationsSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(notificationList.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(notificationList.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.notifications = action.payload;
            })
            .addCase(notificationList.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(markAllAsRead.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(markAllAsRead.fulfilled, (state) => {
                state.status = 'succeeded';
            })
            .addCase(markAllAsRead.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(getUnreadCount.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(getUnreadCount.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.unreadCount = action.payload;
            })
            .addCase(getUnreadCount.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export default userNotificationsSlice.reducer;
