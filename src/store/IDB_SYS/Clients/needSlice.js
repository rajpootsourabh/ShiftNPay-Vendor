import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BaseUrl = process.env.REACT_APP_BASH_URL;

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('shinpay-vendor-token')}`,
  'Content-Type': 'application/json',
});

export const fetchNeedByVendor = createAsyncThunk(
  'need/fetchByVendor',
  async (_payload, { getState, rejectWithValue }) => {
    try {
      const { need } = getState();
      const { page, limit } = need.pagination;
      const search = need.search;

      const query = `?page=${page}&limit=${limit}${search ? `&search=${search}` : ''}`;

      const res = await axios.get(`${BaseUrl}/vendor/need${query}`, { headers: getHeaders() });

      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);



export const fetchNeedById = createAsyncThunk(
  'need/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BaseUrl}/vendor/need/single/${id}`, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createNeed = createAsyncThunk(
  'need/create',
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BaseUrl}/vendor/need`, data, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateNeed = createAsyncThunk(
  'need/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${BaseUrl}/vendor/need/${id}`, data, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteNeed = createAsyncThunk(
  'need/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${BaseUrl}/vendor/need/${id}`, {
        headers: getHeaders(),
      });
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const needSlice = createSlice({
  name: 'need',
  initialState: {
    need: [],
    selectedNeed: null,
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
    setNeed: (state, action) => {
      state.need = action.payload;
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
      .addCase(fetchNeedByVendor.fulfilled, (state, action) => {
        state.need = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchNeedById.fulfilled, (state, action) => {
        state.selectedNeed = action.payload;
      })
      .addCase(createNeed.fulfilled, (state, action) => {
        state.need.unshift(action.payload);
      })
      .addCase(updateNeed.fulfilled, (state, action) => {
        const index = state.need.findIndex((a) => a._id === action.payload._id);
        if (index !== -1) state.need[index] = action.payload;
      })
      .addCase(deleteNeed.fulfilled, (state, action) => {
        state.need = state.need.filter((a) => a._id !== action.payload);
      })
      .addMatcher(
        (action) => action.type.startsWith('need/') && action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('need/') && action.type.endsWith('/fulfilled'),
        (state) => {
          state.loading = false;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('need/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload || action.error.message;
        }
      );
  },
});

export const { setNeed, setPage, setLimit , setSearch} = needSlice.actions;
export default needSlice.reducer;
