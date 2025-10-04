import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BaseUrl = process.env.REACT_APP_BASH_URL;

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('shinpay-vendor-token')}`,
  'Content-Type': 'application/json',
});

export const fetchReasonByVendor = createAsyncThunk(
  'reason/fetchByVendor',
  async (_payload, { getState, rejectWithValue }) => {
    try {
      const { reason } = getState();
      const { page, limit } = reason.pagination;
      const search = reason.search;

      const query = `?page=${page}&limit=${limit}${search ? `&search=${search}` : ''}`;

      const res = await axios.get(`${BaseUrl}/vendor/reason${query}`, { headers: getHeaders() });

      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);



export const fetchReasonById = createAsyncThunk(
  'reason/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BaseUrl}/vendor/reason/single/${id}`, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createReason = createAsyncThunk(
  'reason/create',
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BaseUrl}/vendor/reason`, data, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateReason = createAsyncThunk(
  'reason/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${BaseUrl}/vendor/reason/${id}`, data, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteReason = createAsyncThunk(
  'reason/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${BaseUrl}/vendor/reason/${id}`, {
        headers: getHeaders(),
      });
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const reasonSlice = createSlice({
  name: 'reason',
  initialState: {
    reason: [],
    selectedReason: null,
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
    setReason: (state, action) => {
      state.reason = action.payload;
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
      .addCase(fetchReasonByVendor.fulfilled, (state, action) => {
        state.reason = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchReasonById.fulfilled, (state, action) => {
        state.selectedReason = action.payload;
      })
      .addCase(createReason.fulfilled, (state, action) => {
        state.reason.unshift(action.payload);
      })
      .addCase(updateReason.fulfilled, (state, action) => {
        const index = state.reason.findIndex((a) => a._id === action.payload._id);
        if (index !== -1) state.reason[index] = action.payload;
      })
      .addCase(deleteReason.fulfilled, (state, action) => {
        state.reason = state.reason.filter((a) => a._id !== action.payload);
      })
      .addMatcher(
        (action) => action.type.startsWith('reason/') && action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('reason/') && action.type.endsWith('/fulfilled'),
        (state) => {
          state.loading = false;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('reason/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload || action.error.message;
        }
      );
  },
});

export const { setReason, setPage, setLimit , setSearch} = reasonSlice.actions;
export default reasonSlice.reducer;
