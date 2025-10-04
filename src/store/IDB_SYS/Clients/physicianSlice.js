import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BaseUrl = process.env.REACT_APP_BASH_URL;

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('shinpay-vendor-token')}`,
  'Content-Type': 'application/json',
});

// Fetch all physician by vendor
export const fetchPhysicianByVendor = createAsyncThunk(
  'physician/fetchByVendor',
  async (_payload, { getState, rejectWithValue }) => {
    try {
      const { physician } = getState();
      let { page, limit } = physician.pagination;
      const search = physician.search;
      if (_payload?.limit) limit = _payload.limit;

      const query = `?page=${page}&limit=${limit}${
        search ? `&search=${search}` : ''
      }`;

      const res = await axios.get(
        `${BaseUrl}/vendor/physician${query}`,
        { headers: getHeaders() }
      );

      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Fetch physician by ID
export const fetchPhysicianById = createAsyncThunk(
  'physician/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `${BaseUrl}/vendor/physician/single/${id}`,
        { headers: getHeaders() }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Create physician
export const createPhysician = createAsyncThunk(
  'physician/create',
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${BaseUrl}/vendor/physician`,
        data,
        { headers: getHeaders() }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Update physician
export const updatePhysician = createAsyncThunk(
  'physician/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axios.put(
        `${BaseUrl}/vendor/physician/${id}`,
        data,
        { headers: getHeaders() }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Delete physician
export const deletePhysician = createAsyncThunk(
  'physician/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(
        `${BaseUrl}/vendor/physician/${id}`,
        { headers: getHeaders() }
      );
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const physicianSlice = createSlice({
  name: 'physician',
  initialState: {
    physician: [],
    selectedPhysician: null,
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
    setPhysician: (state, action) => {
      state.physician = action.payload;
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
      .addCase(fetchPhysicianByVendor.fulfilled, (state, action) => {
        state.physician = action.payload.physician;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchPhysicianById.fulfilled, (state, action) => {
        state.selectedPhysician = action.payload;
      })
      .addCase(createPhysician.fulfilled, (state, action) => {
        state.physician.unshift(action.payload);
      })
      .addCase(updatePhysician.fulfilled, (state, action) => {
        const index = state.physician.findIndex(
          (a) => a._id === action.payload._id
        );
        if (index !== -1) state.physician[index] = action.payload;
      })
      .addCase(deletePhysician.fulfilled, (state, action) => {
        state.physician = state.physician.filter(
          (a) => a._id !== action.payload
        );
      })
      .addMatcher(
        (action) =>
          action.type.startsWith('physician/') &&
          action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith('physician/') &&
          action.type.endsWith('/fulfilled'),
        (state) => {
          state.loading = false;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith('physician/') &&
          action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload || action.error.message;
        }
      );
  },
});

export const { setPhysician, setPage, setLimit, setSearch } =
  physicianSlice.actions;
export default physicianSlice.reducer;
