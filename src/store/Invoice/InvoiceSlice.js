import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import axios from 'axios';
const BaseUrl = process.env.REACT_APP_BASH_URL;

const options = {
    Authorization: `Bearer ${localStorage.getItem("shinpay-vendor-token")}`,
    "Content-Type": "application/json",
  };

export const invoiceList = createAsyncThunk(
    'invoice/list',
    async (empId, { dispatch,getState, rejectWithValue }) => {
        try {
            const response = await axios.get(`${BaseUrl}/vendor/invoices`, { headers: options });

            console.log(response.data,'response')
            return response.data.invoices;
        } catch (error) {
            console.log(error.message)
            return rejectWithValue(error.message);
        }
    }
);



const InvoiceSlice = createSlice({
    name: 'invoiceList',
    initialState: {
        list: [],
        status: 'idle',
        error: null,
    },
    reducers: {
    },
    extraReducers: (builder) => {
        builder
            .addCase(invoiceList.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(invoiceList.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.list = action.payload;
            })
            .addCase(invoiceList.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });


    },
});
export default InvoiceSlice.reducer;
