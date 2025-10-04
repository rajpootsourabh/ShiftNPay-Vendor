import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BaseUrl = process.env.REACT_APP_BASH_URL;

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('shinpay-vendor-token')}`,
  'Content-Type': 'application/json',
});

export const fetchLocationsByVendor = createAsyncThunk(
  'location/fetchByVendor',
  async (_payload, { getState, rejectWithValue }) => {
    try {
      const { location } = getState();
      let { page, limit } = location.pagination;
      const search = location.search;
      if(_payload.limit) limit = _payload.limit;
      const query = `?page=${page}&limit=${limit}${search ? `&search=${search}` : ''}`;
      const res = await axios.get(`${BaseUrl}/vendor/locations${query}`, { headers: getHeaders() });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchLocationById = createAsyncThunk(
  'location/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BaseUrl}/vendor/locations/single/${id}`, { headers: getHeaders() });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createLocation = createAsyncThunk(
  'location/create',
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BaseUrl}/vendor/locations`, data, { headers: getHeaders() });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateLocation = createAsyncThunk(
  'location/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${BaseUrl}/vendor/locations/${id}`, data, { headers: getHeaders() });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteLocation = createAsyncThunk(
  'location/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${BaseUrl}/vendor/locations/${id}`, { headers: getHeaders() });
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const locationSlice = createSlice({
  name: 'location',
  initialState: {
    location: [],
    selectedLocation: null,
    loading: false,
    error: null,
    pagination: { total: 0, page: 1, pages: 0, limit: 10 },
    search: '',
  },
  reducers: {
    setLocation: (state, action) => {
      state.location = action.payload;
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
      .addCase(fetchLocationsByVendor.fulfilled, (state, action) => {
        state.location = action.payload.location;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchLocationById.fulfilled, (state, action) => {
        state.selectedLocation = action.payload;
      })
      .addCase(createLocation.fulfilled, (state, action) => {
        state.location.unshift(action.payload);
      })
      .addCase(updateLocation.fulfilled, (state, action) => {
        const index = state.location.findIndex((a) => a._id === action.payload._id);
        if (index !== -1) state.location[index] = action.payload;
      })
      .addCase(deleteLocation.fulfilled, (state, action) => {
        state.location = state.location.filter((a) => a._id !== action.payload);
      })
      .addMatcher(
        (action) => action.type.startsWith('location/') && action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('location/') && action.type.endsWith('/fulfilled'),
        (state) => {
          state.loading = false;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('location/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload || action.error.message;
        }
      );
  },
});

export const { setLocation, setPage, setLimit, setSearch } = locationSlice.actions;
export default locationSlice.reducer;
