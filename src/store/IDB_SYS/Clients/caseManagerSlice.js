import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BaseUrl = process.env.REACT_APP_BASH_URL;

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('shinpay-vendor-token')}`,
  'Content-Type': 'application/json',
});

export const fetchCaseManagerByVendor = createAsyncThunk(
  'caseManager/fetchAll',
  async (_payload, { getState, rejectWithValue }) => {
    try {

      const { caseManager } = getState();
      let { page, limit } = caseManager.pagination;
      const search = caseManager.search;
        if(_payload.limit) limit = _payload.limit;
      const query = `?page=${page}&limit=${limit}${search ? `&search=${search}` : ''}`;
      const res = await axios.get(`${BaseUrl}/vendor/caseManager${query}`, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchCaseManagerById = createAsyncThunk(
  'caseManager/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BaseUrl}/vendor/caseManager/single/${id}`, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createCaseManager = createAsyncThunk(
  'caseManager/create',
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BaseUrl}/vendor/caseManager`, data, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateCaseManager = createAsyncThunk(
  'caseManager/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${BaseUrl}/vendor/caseManager/${id}`, data, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteCaseManager = createAsyncThunk(
  'caseManager/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${BaseUrl}/vendor/caseManager/${id}`, {
        headers: getHeaders(),
      });
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const caseManagerSlice = createSlice({
  name: 'caseManager',
  initialState: {
    caseManager: [],
    selectedCaseManager: null,
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
    setCaseManagerByVendor: (state, action) => {
      state.caseManager = action.payload;
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
      .addCase(fetchCaseManagerByVendor.fulfilled, (state, action) => {
        state.caseManager = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchCaseManagerById.fulfilled, (state, action) => {
        state.selectedCaseManager = action.payload;
      })
      .addCase(createCaseManager.fulfilled, (state, action) => {
        state.caseManager.unshift(action.payload);
      })
      .addCase(updateCaseManager.fulfilled, (state, action) => {
        const index = state.caseManager.findIndex((a) => a._id === action.payload._id);
        if (index !== -1) state.caseManager[index] = action.payload;
      })
      .addCase(deleteCaseManager.fulfilled, (state, action) => {
        state.caseManager = state.caseManager.filter((a) => a._id !== action.payload);
      })
      .addMatcher(
        (action) => action.type.startsWith('caseManager/') && action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('caseManager/') && action.type.endsWith('/fulfilled'),
        (state) => {
          state.loading = false;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('caseManager/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload || action.error.message;
        }
      );
  },
});

export const { setCaseManagerByVendor, setPage, setLimit, setSearch } = caseManagerSlice.actions;
export default caseManagerSlice.reducer;
