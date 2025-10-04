import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BaseUrl = process.env.REACT_APP_BASH_URL;

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('shinpay-vendor-token')}`,
  'Content-Type': 'application/json',
});

// Fetch all payor by vendor
export const fetchPayorByVendor = createAsyncThunk(
  'payor/fetchByVendor',
  async (_payload, { getState, rejectWithValue }) => {
    try {
      const { payor } = getState();
      let { page, limit } = payor.pagination;
      const search = payor.search;
      if (_payload?.limit) limit = _payload.limit;

      const query = `?page=${page}&limit=${limit}${
        search ? `&search=${search}` : ''
      }`;

      const res = await axios.get(
        `${BaseUrl}/vendor/payor${query}`,
        { headers: getHeaders() }
      );

      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Fetch payor by ID
export const fetchPayorById = createAsyncThunk(
  'payor/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `${BaseUrl}/vendor/payor/single/${id}`,
        { headers: getHeaders() }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Create payor
export const createPayor = createAsyncThunk(
  'payor/create',
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${BaseUrl}/vendor/payor`,
        data,
        { headers: getHeaders() }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Update payor
export const updatePayor = createAsyncThunk(
  'payor/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axios.put(
        `${BaseUrl}/vendor/payor/${id}`,
        data,
        { headers: getHeaders() }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Delete payor
export const deletePayor = createAsyncThunk(
  'payor/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(
        `${BaseUrl}/vendor/payor/${id}`,
        { headers: getHeaders() }
      );
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const payorSlice = createSlice({
  name: 'payor',
  initialState: {
    payor: [],
    selectedPayor: null,
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
    setPayor: (state, action) => {
      state.payor = action.payload;
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
      .addCase(fetchPayorByVendor.fulfilled, (state, action) => {
        state.payor = action.payload.payor;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchPayorById.fulfilled, (state, action) => {
        state.selectedPayor = action.payload;
      })
      .addCase(createPayor.fulfilled, (state, action) => {
        state.payor.unshift(action.payload);
      })
      .addCase(updatePayor.fulfilled, (state, action) => {
        const index = state.payor.findIndex(
          (a) => a._id === action.payload._id
        );
        if (index !== -1) state.payor[index] = action.payload;
      })
      .addCase(deletePayor.fulfilled, (state, action) => {
        state.payor = state.payor.filter(
          (a) => a._id !== action.payload
        );
      })
      .addMatcher(
        (action) =>
          action.type.startsWith('payor/') &&
          action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith('payor/') &&
          action.type.endsWith('/fulfilled'),
        (state) => {
          state.loading = false;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith('payor/') &&
          action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload || action.error.message;
        }
      );
  },
});

export const { setPayor, setPage, setLimit, setSearch } =
  payorSlice.actions;
export default payorSlice.reducer;
