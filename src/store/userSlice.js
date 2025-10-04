import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const bashUrl = process.env.REACT_APP_BASH_URL;
const basImgUrl = process.env.REACT_APP_BASH_IMG_URL;

const initialState = {
    user: null,
    allowedCategories:[],
    token: null, // Store token in state
    companyLogo : null
};

export const fetchCompanyProfile = createAsyncThunk(
    'user/fetchProfile',
    async (vendorId, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("shinpay-vendor-token");

            const options = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            };

            const response = await axios
                .get(`${bashUrl}/vendor/get-restoraunt-profile/${vendorId}`, options);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);


export const getUserProfile = createAsyncThunk(
    'user/getUserProfile',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("shinpay-vendor-token");

            const options = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            };

            const response = await axios
                .get(`${bashUrl}/vendor/me`, options);
            return response.data.user;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);


export const fetchAllowedCategories = createAsyncThunk(
    'user/fetchCategories',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("shinpay-vendor-token");

            const options = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            };

            const response = await axios
                .get(`${bashUrl}/vendor/my-modules`, options);
            return response.data.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser(state, action) {
            state.user = action.payload.user;
            state.token = action.payload.token; // Store token
        },
        clearUser(state) {
            state.user = null;
            state.token = null; // Clear token on logout
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Unassigned Jobs
            .addCase(fetchCompanyProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCompanyProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.companyLogo = action?.payload?.result?.image ? `${basImgUrl}/restaurantImage/${action?.payload?.result?.image}` : null;
            })
            .addCase(fetchCompanyProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch unassigned jobs';
            })
             .addCase(getUserProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUserProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action?.payload;
            })
            .addCase(getUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch unassigned jobs';
            })

            .addCase(fetchAllowedCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllowedCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.allowedCategories = action?.payload?.category;
            })
            .addCase(fetchAllowedCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch unassigned jobs';
            })
    }
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
