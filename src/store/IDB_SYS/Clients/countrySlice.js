import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BaseUrl = process.env.REACT_APP_BASH_URL;

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('shinpay-vendor-token')}`,
  'Content-Type': 'application/json',
});

export const fetchCountryByVendor = createAsyncThunk(
  'country/fetchByVendor',
  async (_payload, { getState, rejectWithValue }) => {
    try {
      const { country } = getState();
      const { page, limit } = country.pagination;
      const search = country.search;

      const query = `?page=${page}&limit=${limit}${search ? `&search=${search}` : ''}`;

      const res = await axios.get(`${BaseUrl}/vendor/country${query}`, { headers: getHeaders() });

      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);



export const fetchCountryById = createAsyncThunk(
  'country/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BaseUrl}/vendor/country/single/${id}`, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createCountry = createAsyncThunk(
  'country/create',
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BaseUrl}/vendor/country`, data, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateCountry = createAsyncThunk(
  'country/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${BaseUrl}/vendor/country/${id}`, data, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteCountry = createAsyncThunk(
  'country/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${BaseUrl}/vendor/country/${id}`, {
        headers: getHeaders(),
      });
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const countrySlice = createSlice({
  name: 'country',
  initialState: {
    country: [],
    selectedCountry: null,
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
    setCountry: (state, action) => {
      state.country = action.payload;
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
      .addCase(fetchCountryByVendor.fulfilled, (state, action) => {
        state.country = action.payload.country;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchCountryById.fulfilled, (state, action) => {
        state.selectedCountry = action.payload;
      })
      .addCase(createCountry.fulfilled, (state, action) => {
        state.country.unshift(action.payload);
      })
      .addCase(updateCountry.fulfilled, (state, action) => {
        const index = state.country.findIndex((a) => a._id === action.payload._id);
        if (index !== -1) state.country[index] = action.payload;
      })
      .addCase(deleteCountry.fulfilled, (state, action) => {
        state.country = state.country.filter((a) => a._id !== action.payload);
      })
      .addMatcher(
        (action) => action.type.startsWith('country/') && action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('country/') && action.type.endsWith('/fulfilled'),
        (state) => {
          state.loading = false;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('country/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload || action.error.message;
        }
      );
  },
});

export const { setCountry, setPage, setLimit , setSearch} = countrySlice.actions;
export default countrySlice.reducer;
