import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BaseUrl = process.env.REACT_APP_BASH_URL;

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('shinpay-vendor-token')}`,
  'Content-Type': 'application/json',
});

export const fetchOtherNoteTypeByVendor = createAsyncThunk(
  'otherNoteType/fetchByVendor',
  async (_payload, { getState, rejectWithValue }) => {
    try {
      const { otherNoteType } = getState();
      const { page, limit } = otherNoteType.pagination;
      const search = otherNoteType.search;

      const query = `?page=${page}&limit=${limit}${search ? `&search=${search}` : ''}`;

      const res = await axios.get(`${BaseUrl}/vendor/otherNoteType${query}`, { headers: getHeaders() });

      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);



export const fetchOtherNoteTypeById = createAsyncThunk(
  'otherNoteType/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BaseUrl}/vendor/otherNoteType/single/${id}`, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createOtherNoteType = createAsyncThunk(
  'otherNoteType/create',
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BaseUrl}/vendor/otherNoteType`, data, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateOtherNoteType = createAsyncThunk(
  'otherNoteType/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${BaseUrl}/vendor/otherNoteType/${id}`, data, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteOtherNoteType = createAsyncThunk(
  'otherNoteType/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${BaseUrl}/vendor/otherNoteType/${id}`, {
        headers: getHeaders(),
      });
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const otherNoteTypeSlice = createSlice({
  name: 'otherNoteType',
  initialState: {
    otherNoteType: [],
    selectedNoteType: null,
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
    setNoteType: (state, action) => {
      state.otherNoteType = action.payload;
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
      .addCase(fetchOtherNoteTypeByVendor.fulfilled, (state, action) => {
        state.otherNoteType = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchOtherNoteTypeById.fulfilled, (state, action) => {
        state.selectedNoteType = action.payload;
      })
      .addCase(createOtherNoteType.fulfilled, (state, action) => {
        state.otherNoteType.unshift(action.payload);
      })
      .addCase(updateOtherNoteType.fulfilled, (state, action) => {
        const index = state.otherNoteType.findIndex((a) => a._id === action.payload._id);
        if (index !== -1) state.otherNoteType[index] = action.payload;
      })
      .addCase(deleteOtherNoteType.fulfilled, (state, action) => {
        state.otherNoteType = state.otherNoteType.filter((a) => a._id !== action.payload);
      })
      .addMatcher(
        (action) => action.type.startsWith('otherNoteType/') && action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('otherNoteType/') && action.type.endsWith('/fulfilled'),
        (state) => {
          state.loading = false;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('otherNoteType/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload || action.error.message;
        }
      );
  },
});

export const { setNoteType, setPage, setLimit , setSearch} = otherNoteTypeSlice.actions;
export default otherNoteTypeSlice.reducer;
