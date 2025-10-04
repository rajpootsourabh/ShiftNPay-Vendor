import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BaseUrl = process.env.REACT_APP_BASH_URL;

export const fetchProductCategories = createAsyncThunk(
    'categories/ProductCategories',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("shinpay-vendor-token");
            const options = {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            };
            const response = await axios.get(`${BaseUrl}/vendor/product/categories`, { headers: options });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const categoriesSlice = createSlice({
    name: 'categories',
    initialState: {
        productCategories: [],
        loading: false,
        error: null,
    },
    extraReducers: (builder) => {
        builder
            
             .addCase(fetchProductCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProductCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.productCategories = action.payload;
            })
            .addCase(fetchProductCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});
export default categoriesSlice.reducer;
