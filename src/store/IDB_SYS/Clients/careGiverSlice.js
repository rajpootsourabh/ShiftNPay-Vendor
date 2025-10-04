import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BaseUrl = process.env.REACT_APP_BASH_URL;

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('shinpay-vendor-token')}`,
  'Content-Type': 'application/json',
});

export const fetchCareGiverByVendor = createAsyncThunk(
  'careGiver/fetchAll',
  async (_payload, { getState, rejectWithValue }) => {
    try {
      const { careGiver } = getState();
      const { page, limit } = careGiver.pagination;
      const search = careGiver.search;

      const query = `?page=${page}&limit=${limit}${search ? `&search=${search}` : ''}`;
      const res = await axios.get(`${BaseUrl}/vendor/careGiver${query}`, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchCareGiverById = createAsyncThunk(
  'careGiver/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BaseUrl}/vendor/careGiver/single/${id}`, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createCareGiver = createAsyncThunk(
  'careGiver/create',
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BaseUrl}/vendor/careGiver`, data, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updateCareGiver = createAsyncThunk(
  'careGiver/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${BaseUrl}/vendor/careGiver/${id}`, data, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteCareGiver = createAsyncThunk(
  'careGiver/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${BaseUrl}/vendor/careGiver/${id}`, {
        headers: getHeaders(),
      });
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const careGiverSlice = createSlice({
  name: 'careGiver',
  initialState: {
    careGiver: [],
    selectedCareGiver: null,
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
    setCareGiverByVendor: (state, action) => {
      state.careGiver = action.payload;
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
      .addCase(fetchCareGiverByVendor.fulfilled, (state, action) => {
        state.careGiver = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchCareGiverById.fulfilled, (state, action) => {
        state.selectedCareGiver = action.payload;
      })
      .addCase(createCareGiver.fulfilled, (state, action) => {
        state.careGiver.unshift(action.payload);
      })
      .addCase(updateCareGiver.fulfilled, (state, action) => {
        const index = state.careGiver.findIndex((a) => a._id === action.payload._id);
        if (index !== -1) state.careGiver[index] = action.payload;
      })
      .addCase(deleteCareGiver.fulfilled, (state, action) => {
        state.careGiver = state.careGiver.filter((a) => a._id !== action.payload);
      })
      .addMatcher(
        (action) => action.type.startsWith('careGiver/') && action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('careGiver/') && action.type.endsWith('/fulfilled'),
        (state) => {
          state.loading = false;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('careGiver/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload || action.error.message;
        }
      );
  },
});

export const { setCareGiverByVendor, setPage, setLimit, setSearch } = careGiverSlice.actions;
export default careGiverSlice.reducer;
