import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BaseUrl = process.env.REACT_APP_BASH_URL;

export const getEmployeeListByCategory = createAsyncThunk(
  'employeeAccess/getEmployeeListByCategory',
  async (category, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("shinpay-vendor-token");
      const options = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
      };
      const response = await axios.get(`${BaseUrl}/vendor/employees/list` , { headers: options });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Fetch employee menu access
export const getEmployeeMenuAccess = createAsyncThunk(
  'employeeAccess/getEmployeeMenuAccess',
  async (category, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("shinpay-vendor-token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      const { data } = await axios.get(`${BaseUrl}/vendor/product/category/access?category=${encodeURIComponent(category)}`, { headers });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Update employee menu access
export const updateEmployeeMenuAccess = createAsyncThunk(
  'employeeAccess/updateEmployeeMenuAccess',
  async ({ category, employeeIds }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("shinpay-vendor-token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      const { data } = await axios.post(`${BaseUrl}/vendor/product/category/update-access`, { category:encodeURIComponent(category), employeeIds }, { headers });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Slice
const employeeAccessSlice = createSlice({
  name: 'employeeAccess',
  initialState: {
    employeeList: [],
    accessList: [],
    loading: false,
    error: null,
    updateSuccess: false,
  },
  reducers: {
    clearEmployeeAccessError: (state) => {
      state.error = null;
    },
    resetAccessUpdateState: (state) => {
      state.updateSuccess = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getEmployeeListByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEmployeeListByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.employeeList = action.payload.data;
      })
      .addCase(getEmployeeListByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getEmployeeMenuAccess.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEmployeeMenuAccess.fulfilled, (state, action) => {
        state.loading = false;
        state.accessList = action.payload;
      })
      .addCase(getEmployeeMenuAccess.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateEmployeeMenuAccess.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateEmployeeMenuAccess.fulfilled, (state, action) => {
        state.loading = false;
        state.updateSuccess = true;
      })
      .addCase(updateEmployeeMenuAccess.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.updateSuccess = false;
      });
  },
});

export const { clearEmployeeAccessError, resetAccessUpdateState } = employeeAccessSlice.actions;
export default employeeAccessSlice.reducer;
