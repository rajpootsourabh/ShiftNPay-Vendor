import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import axios from 'axios';
const BaseUrl = process.env.REACT_APP_BASH_URL;

const options = {
    Authorization: `Bearer ${localStorage.getItem("shinpay-vendor-token")}`,
    "Content-Type": "application/json",
  };

export const weeklyOverTimeList = createAsyncThunk(
    'overTime/weeklyOverTimeList',
    async (empId, { dispatch,getState, rejectWithValue }) => {
        try {
            const response = await axios.get(`${BaseUrl}/vendor/overTimeCalculations`, { headers: options });
            return response.data;
        } catch (error) {
            console.log(error.message)
            return rejectWithValue(error.message);
        }
    }
);



const overTimeSlice = createSlice({
    name: 'overTime',
    initialState: {
        list: [],
        status: 'idle',
        error: null,
    },
    reducers: {
    },
    extraReducers: (builder) => {
        builder
            .addCase(weeklyOverTimeList.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(weeklyOverTimeList.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.list = action.payload;
            })
            .addCase(weeklyOverTimeList.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });


    },
});
export default overTimeSlice.reducer;
