import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BaseUrl = process.env.REACT_APP_BASH_URL;

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('shinpay-vendor-token')}`,
  'Content-Type': 'application/json',
});

// Async thunks
export const fetchReferralSourcesByVendor = createAsyncThunk(
  "referralSource/fetchByVendor",
  async (_payload, { getState, rejectWithValue }) => {
    try {
      const { referralSource } = getState();
      const { page, limit } = referralSource.pagination;
      const search = referralSource.search;

      const query = `?page=${page}&limit=${limit}${search ? `&search=${search}` : ''}`;

      const res = await axios.get(`${BaseUrl}/vendor/referral-sources${query}`, { 
        headers: getHeaders() 
      });

      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchReferralSourceById = createAsyncThunk(
  "referralSource/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BaseUrl}/vendor/referral-sources/${id}`, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createReferralSource = createAsyncThunk(
  "referralSource/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BaseUrl}/vendor/referral-sources`, data, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateReferralSource = createAsyncThunk(
  "referralSource/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${BaseUrl}/vendor/referral-sources/${id}`, data, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteReferralSource = createAsyncThunk(
  "referralSource/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${BaseUrl}/vendor/referral-sources/${id}`, {
        headers: getHeaders(),
      });
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const referralSourceSlice = createSlice({
  name: "referralSource",
  initialState: {
    referralSources: [],
    selectedReferralSource: null,
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
    setReferralSource: (state, action) => {
      state.referralSources = action.payload;
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
      .addCase(fetchReferralSourcesByVendor.fulfilled, (state, action) => {
        state.referralSources = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchReferralSourceById.fulfilled, (state, action) => {
        state.selectedReferralSource = action.payload;
      })
      .addCase(createReferralSource.fulfilled, (state, action) => {
        state.referralSources.unshift(action.payload);
      })
      .addCase(updateReferralSource.fulfilled, (state, action) => {
        const index = state.referralSources.findIndex((a) => a._id === action.payload._id);
        if (index !== -1) state.referralSources[index] = action.payload;
      })
      .addCase(deleteReferralSource.fulfilled, (state, action) => {
        state.referralSources = state.referralSources.filter((a) => a._id !== action.payload);
      })
      .addMatcher(
        (action) => action.type.startsWith('referralSource/') && action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('referralSource/') && action.type.endsWith('/fulfilled'),
        (state) => {
          state.loading = false;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('referralSource/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload || action.error.message;
        }
      );
  },
});

export const { setReferralSource, setPage, setLimit, setSearch } = referralSourceSlice.actions;
export default referralSourceSlice.reducer;