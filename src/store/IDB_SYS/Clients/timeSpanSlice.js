import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BaseUrl = process.env.REACT_APP_BASH_URL;

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('shinpay-vendor-token')}`,
  'Content-Type': 'application/json',
});

export const fetchTimeSpanByVendor = createAsyncThunk(
  'timeSpan/fetchByVendor',
  async (_payload, { getState, rejectWithValue }) => {
    try {
      const { timeSpan } = getState();
      const { page, limit } = timeSpan.pagination;
      const search = timeSpan.search;

      const query = `?page=${page}&limit=${limit}${search ? `&search=${search}` : ''}`;

      const res = await axios.get(`${BaseUrl}/vendor/timeSpan${query}`, { headers: getHeaders() });

      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);



export const fetchTimeSpanById = createAsyncThunk(
  'timeSpan/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BaseUrl}/vendor/timeSpan/single/${id}`, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createTimeSpan = createAsyncThunk(
  'timeSpan/create',
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BaseUrl}/vendor/timeSpan`, data, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateTimeSpan = createAsyncThunk(
  'timeSpan/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${BaseUrl}/vendor/timeSpan/${id}`, data, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteTimeSpan = createAsyncThunk(
  'timeSpan/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${BaseUrl}/vendor/timeSpan/${id}`, {
        headers: getHeaders(),
      });
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const timeSpanSlice = createSlice({
  name: 'timeSpan',
  initialState: {
    timeSpan: [],
    selectedTimeSpan: null,
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
    setTimeSpan: (state, action) => {
      state.timeSpan = action.payload;
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
      .addCase(fetchTimeSpanByVendor.fulfilled, (state, action) => {
        state.timeSpan = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTimeSpanById.fulfilled, (state, action) => {
        state.selectedTimeSpan = action.payload;
      })
      .addCase(createTimeSpan.fulfilled, (state, action) => {
        state.timeSpan.unshift(action.payload);
      })
      .addCase(updateTimeSpan.fulfilled, (state, action) => {
        const index = state.timeSpan.findIndex((a) => a._id === action.payload._id);
        if (index !== -1) state.timeSpan[index] = action.payload;
      })
      .addCase(deleteTimeSpan.fulfilled, (state, action) => {
        state.timeSpan = state.timeSpan.filter((a) => a._id !== action.payload);
      })
      .addMatcher(
        (action) => action.type.startsWith('timeSpan/') && action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('timeSpan/') && action.type.endsWith('/fulfilled'),
        (state) => {
          state.loading = false;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('timeSpan/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload || action.error.message;
        }
      );
  },
});

export const { setTimeSpan, setPage, setLimit , setSearch} = timeSpanSlice.actions;
export default timeSpanSlice.reducer;
