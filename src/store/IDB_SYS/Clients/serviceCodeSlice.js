import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BaseUrl = process.env.REACT_APP_BASH_URL;

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('shinpay-vendor-token')}`,
  'Content-Type': 'application/json',
});

export const fetchServiceCodeByVendor = createAsyncThunk(
  'serviceCode/fetchByVendor',
  async (payload, { getState, rejectWithValue }) => {
    try {
      const { serviceCode } = getState();
      const page = payload?.page || serviceCode.pagination.page;
      const limit = payload?.limit || serviceCode.pagination.limit;
      const search = payload?.search || serviceCode.search;

      const query = `?page=${page}&limit=${limit}${search ? `&search=${search}` : ''}`;

      const res = await axios.get(`${BaseUrl}/vendor/serviceCode${query}`, { headers: getHeaders() });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchAllServiceCodes = createAsyncThunk(
  'serviceCode/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BaseUrl}/vendor/serviceCode?limit=1000`, { headers: getHeaders() });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);



export const fetchServiceCodeById = createAsyncThunk(
  'serviceCode/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BaseUrl}/vendor/serviceCode/single/${id}`, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createServiceCode = createAsyncThunk(
  'serviceCode/create',
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BaseUrl}/vendor/serviceCode`, data, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateServiceCode = createAsyncThunk(
  'serviceCode/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${BaseUrl}/vendor/serviceCode/${id}`, data, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteServiceCode = createAsyncThunk(
  'serviceCode/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${BaseUrl}/vendor/serviceCode/${id}`, {
        headers: getHeaders(),
      });
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const serviceCodeSlice = createSlice({
  name: 'serviceCode',
  initialState: {
    serviceCode: [],
    allServiceCodes: [],
    selectedServiceCode: null,
    loading: false,
    error: null,
    pagination: {
      total: 0,
      page: 1,
      pages: 0,
      limit: 10,
    },
    search: '',
  },
  reducers: {
    setServiceCode: (state, action) => {
      state.serviceCode = action.payload;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setLimit: (state, action) => {
      state.pagination.limit = action.payload;
    },
    setSearch: (state, action) => {
      state.search = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchServiceCodeByVendor.fulfilled, (state, action) => {
        state.serviceCode = action.payload.data || action.payload.serviceCodes || (Array.isArray(action.payload) ? action.payload : []);
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchAllServiceCodes.fulfilled, (state, action) => {
        state.allServiceCodes = action.payload.data || action.payload.serviceCodes || (Array.isArray(action.payload) ? action.payload : []);
      })
      .addCase(fetchServiceCodeById.fulfilled, (state, action) => {
        state.selectedServiceCode = action.payload;
      })
      .addCase(createServiceCode.fulfilled, (state, action) => {
        state.serviceCode.unshift(action.payload);
      })
      .addCase(updateServiceCode.fulfilled, (state, action) => {
        const index = state.serviceCode.findIndex((a) => a._id === action.payload._id);
        if (index !== -1) state.serviceCode[index] = action.payload;
      })
      .addCase(deleteServiceCode.fulfilled, (state, action) => {
        state.serviceCode = state.serviceCode.filter((a) => a._id !== action.payload);
      })
      .addMatcher(
        (action) => action.type.startsWith('serviceCode/') && action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('serviceCode/') && action.type.endsWith('/fulfilled'),
        (state) => {
          state.loading = false;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('serviceCode/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload || action.error.message;
        }
      );
  },
});

export const { setServiceCode, setPage, setLimit, setSearch } = serviceCodeSlice.actions;
export default serviceCodeSlice.reducer;
