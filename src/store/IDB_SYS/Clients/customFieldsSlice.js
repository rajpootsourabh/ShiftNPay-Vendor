import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BaseUrl = process.env.REACT_APP_BASH_URL;

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('shinpay-vendor-token')}`,
  'Content-Type': 'application/json',
});

export const fetchCustomFieldsByVendor = createAsyncThunk(
  'customFields/fetchByVendor',
  async (_payload, { getState, rejectWithValue }) => {
    try {
      const { customFields } = getState();
      const { page, limit } = customFields.pagination;
      const search = customFields.search;

      const query = `?page=${page}&limit=${limit}${search ? `&search=${search}` : ''}`;

      const res = await axios.get(`${BaseUrl}/vendor/customFields${query}`, { headers: getHeaders() });

      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchCustomFieldsById = createAsyncThunk(
  'customFields/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BaseUrl}/vendor/customFields/single/${id}`, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createCustomFields = createAsyncThunk(
  'customFields/create',
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BaseUrl}/vendor/customFields`, data, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateCustomFields = createAsyncThunk(
  'customFields/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${BaseUrl}/vendor/customFields/${id}`, data, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteCustomFields = createAsyncThunk(
  'customFields/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${BaseUrl}/vendor/customFields/${id}`, {
        headers: getHeaders(),
      });
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const customFieldsSlice = createSlice({
  name: 'customFields',
  initialState: {
    customFields: [],
    selectedCustomField: null,
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
      .addCase(fetchCustomFieldsByVendor.fulfilled, (state, action) => {
        state.customFields = action.payload.customFields;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchCustomFieldsById.fulfilled, (state, action) => {
        state.selectedCustomField = action.payload;
      })
      .addCase(createCustomFields.fulfilled, (state, action) => {
        state.customFields.unshift(action.payload);
      })
      .addCase(updateCustomFields.fulfilled, (state, action) => {
        const index = state.customFields.findIndex((a) => a._id === action.payload._id);
        if (index !== -1) state.customFields[index] = action.payload;
      })
      .addCase(deleteCustomFields.fulfilled, (state, action) => {
        state.customFields = state.customFields.filter((a) => a._id !== action.payload);
      })
      .addMatcher(
        (action) => action.type.startsWith('customFields/') && action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('customFields/') && action.type.endsWith('/fulfilled'),
        (state) => {
          state.loading = false;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('customFields/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload || action.error.message;
        }
      );
  },
});

export const { setPage, setLimit, setSearch } = customFieldsSlice.actions;
export default customFieldsSlice.reducer;
