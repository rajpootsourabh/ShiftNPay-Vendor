import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BaseUrl = process.env.REACT_APP_BASH_URL;

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('shinpay-vendor-token')}`,
  'Content-Type': 'application/json',
});

export const fetchAgenciesByVendor = createAsyncThunk(
  'agency/fetchByVendor',
  async (_payload, { getState, rejectWithValue }) => {
    try {
      const { agency } = getState();
      const { page, limit } = agency.pagination;
      const search = agency.search;

      const query = `?page=${page}&limit=${limit}${search ? `&search=${search}` : ''}`;

      const res = await axios.get(`${BaseUrl}/vendor/agency${query}`, { headers: getHeaders() });

      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);



export const fetchAgencyById = createAsyncThunk(
  'agency/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BaseUrl}/vendor/agency/single/${id}`, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createAgency = createAsyncThunk(
  'agency/create',
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BaseUrl}/vendor/agency`, data, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateAgency = createAsyncThunk(
  'agency/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${BaseUrl}/vendor/agency/${id}`, data, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteAgency = createAsyncThunk(
  'agency/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${BaseUrl}/vendor/agency/${id}`, {
        headers: getHeaders(),
      });
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const agencySlice = createSlice({
  name: 'agency',
  initialState: {
    agencies: [],
    selectedAgency: null,
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
    setAgencies: (state, action) => {
      state.agencies = action.payload;
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
      .addCase(fetchAgenciesByVendor.fulfilled, (state, action) => {
        state.agencies = action.payload.agencies;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAgencyById.fulfilled, (state, action) => {
        state.selectedAgency = action.payload;
      })
      .addCase(createAgency.fulfilled, (state, action) => {
        state.agencies.unshift(action.payload);
      })
      .addCase(updateAgency.fulfilled, (state, action) => {
        const index = state.agencies.findIndex((a) => a._id === action.payload._id);
        if (index !== -1) state.agencies[index] = action.payload;
      })
      .addCase(deleteAgency.fulfilled, (state, action) => {
        state.agencies = state.agencies.filter((a) => a._id !== action.payload);
      })
      .addMatcher(
        (action) => action.type.startsWith('agency/') && action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('agency/') && action.type.endsWith('/fulfilled'),
        (state) => {
          state.loading = false;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('agency/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload || action.error.message;
        }
      );
  },
});

export const { setAgencies, setPage, setLimit , setSearch} = agencySlice.actions;
export default agencySlice.reducer;
