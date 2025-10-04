import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
const BaseUrl = process.env.REACT_APP_BASH_URL;
const options = {
    Authorization: `Bearer ${localStorage.getItem("shinpay-vendor-token")}`,
    "Content-Type": "application/json",
};


export const dashboardData = createAsyncThunk(
    'dashboard/list',
    async (_, thunkAPI) => {
        const state = thunkAPI.getState();
        let token = state.user.token || localStorage.getItem("shinpay-vendor-token");

        if (!token) {
            return thunkAPI.rejectWithValue("No token available");
        }

        const reqHeader = {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            }
        };


        try {
            const response = await axios.get(`${BaseUrl}/vendor/dashboard`, reqHeader);
            return response.data;
        } catch (error) {
            console.log(error.message);
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const shiftScheduleOfWeek = createAsyncThunk(
    'dashboard/shiftSchedule',
    async (user, thunkAPI) => {
        try {
            const options = {
                Authorization: `Bearer ${localStorage.getItem("shinpay-vendor-token")}`,
                "Content-Type": "application/json",
            };
            const response = await axios.get(`${BaseUrl}/vendor/shift-Schedule`, { headers: options });
            console.log('response :  ' , response.data)
            return response.data;
        } catch (error) {
            console.log(error.message);
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);
export const shiftScheduleOfMonth = createAsyncThunk(
    'dashboard/shiftScheduleOfMonth',
    async (user, thunkAPI) => {
        try {
            const options = {
                Authorization: `Bearer ${localStorage.getItem("shinpay-vendor-token")}`,
                "Content-Type": "application/json",
            };
            const response = await axios.get(`${BaseUrl}/vendor/shift-Schedule/monthly`, { headers: options });
            return response.data;
        } catch (error) {
            console.log(error.message);
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);



const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState: {
        data: [],
        shift:[],
        monthlyShift:[],
        status: 'idle',
        error: null,
    },
    reducers: {
    },
    extraReducers: (builder) => {
        builder
            .addCase(dashboardData.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(dashboardData.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.data = action.payload.result;
            })
            .addCase(dashboardData.rejected, (state, action) => {
                state.status = 'failed';
                console.log('failed')
                state.error = action.payload;
            })
            .addCase(shiftScheduleOfWeek.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(shiftScheduleOfWeek.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.shift = action.payload.employees;
            })
            .addCase(shiftScheduleOfWeek.rejected, (state, action) => {
                state.status = 'failed';
                console.log('failed')
                state.error = action.payload;
            })
            .addCase(shiftScheduleOfMonth.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(shiftScheduleOfMonth.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.monthlyShift = action.payload.data;
            })
            .addCase(shiftScheduleOfMonth.rejected, (state, action) => {
                state.status = 'failed';
                console.log('failed')
                state.error = action.payload;
            });


    },
});
export default dashboardSlice.reducer;
