import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BaseUrl = process.env.REACT_APP_BASH_URL;

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('shinpay-vendor-token')}`,
  'Content-Type': 'application/json',
});

export const fetchSalesRepByVendor = createAsyncThunk(
  'salesRep/fetchByVendor',
  async (_payload, { getState, rejectWithValue }) => {
    try {
      const { salesRep } = getState();
      const { page, limit } = salesRep.pagination;
      const search = salesRep.search;

      const query = `?page=${page}&limit=${limit}${search ? `&search=${search}` : ''}`;

      const res = await axios.get(`${BaseUrl}/vendor/salesRep${query}`, { headers: getHeaders() });

      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);



export const fetchSalesRepById = createAsyncThunk(
  'salesRep/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BaseUrl}/vendor/salesRep/single/${id}`, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createSalesRep = createAsyncThunk(
  'salesRep/create',
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BaseUrl}/vendor/salesRep`, data, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateSalesRep = createAsyncThunk(
  'salesRep/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${BaseUrl}/vendor/salesRep/${id}`, data, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteSalesRep = createAsyncThunk(
  'salesRep/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${BaseUrl}/vendor/salesRep/${id}`, {
        headers: getHeaders(),
      });
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const salesRepSlice = createSlice({
  name: 'salesRep',
  initialState: {
    salesRep: [],
    selectedSalesRep: null,
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
    setSalesRep: (state, action) => {
      state.salesRep = action.payload;
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
      .addCase(fetchSalesRepByVendor.fulfilled, (state, action) => {
        state.salesRep = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchSalesRepById.fulfilled, (state, action) => {
        state.selectedSalesRep = action.payload;
      })
      .addCase(createSalesRep.fulfilled, (state, action) => {
        state.salesRep.unshift(action.payload);
      })
      .addCase(updateSalesRep.fulfilled, (state, action) => {
        const index = state.salesRep.findIndex((a) => a._id === action.payload._id);
        if (index !== -1) state.salesRep[index] = action.payload;
      })
      .addCase(deleteSalesRep.fulfilled, (state, action) => {
        state.salesRep = state.salesRep.filter((a) => a._id !== action.payload);
      })
      .addMatcher(
        (action) => action.type.startsWith('salesRep/') && action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('salesRep/') && action.type.endsWith('/fulfilled'),
        (state) => {
          state.loading = false;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('salesRep/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload || action.error.message;
        }
      );
  },
});

export const { setSalesRep, setPage, setLimit , setSearch} = salesRepSlice.actions;
export default salesRepSlice.reducer;
