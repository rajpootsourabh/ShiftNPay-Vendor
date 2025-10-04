import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BaseUrl = process.env.REACT_APP_BASH_URL;

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('shinpay-vendor-token')}`,
  'Content-Type': 'application/json',
});

export const fetchClientByVendor = createAsyncThunk(
  'client/fetchByVendor',
  async (_payload, { getState, rejectWithValue }) => {
    try {
      const { client } = getState();
      const { page, limit } = client.pagination;
      const { search, status, location, clientType, dateStart, dateEnd, dateField } = client.filters;
      console.log(client.filters,'client.filter')
      // Build query string with all filters
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(status && { status }),
        ...(location && { location }),
        ...(clientType && { clientType }),
        ...(dateStart && { dateStart }),
        ...(dateEnd && { dateEnd }),
        ...(dateField && { dateField })
      }).toString();

      const res = await axios.get(`${BaseUrl}/vendor/client?${queryParams}`, { 
        headers: getHeaders() 
      });

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchClientById = createAsyncThunk(
  'client/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BaseUrl}/vendor/client/single/${id}`, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createClient = createAsyncThunk(
  'client/create',
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BaseUrl}/vendor/client`, data, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        return rejectWithValue(err.response.data.message);
      }
      return rejectWithValue(err.message);
    }
  }
);

export const updateClient = createAsyncThunk(
  'client/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${BaseUrl}/vendor/client/${id}`, data, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        return rejectWithValue(err.response.data.message);
      }
      return rejectWithValue(err.message);
    }
  }
);

export const deleteClient = createAsyncThunk(
  'client/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${BaseUrl}/vendor/client/${id}`, {
        headers: getHeaders(),
      });
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const clientSlice = createSlice({
  name: 'client',
  initialState: {
    clients: [],
    selectedClient: null,
    loading: false,
    error: null,
    pagination: {
      total: 0,
      page: 1,
      pages: 0,
      limit: 10,
    },
  filters: {
    search: '',
    status: '',
    location: '',
    clientType: '',
    dateStart: '',
    dateEnd: '',
    dateField: 'createdAt'
  },
  },
  reducers: {
    setStatusFilter: (state, action) => {
      state.filters.status = action.payload;
      state.pagination.page = 1;
    },
    setLocationFilter: (state, action) => {
      state.filters.location = action.payload;
      state.pagination.page = 1;
    },
    setClientTypeFilter: (state, action) => {
      state.filters.clientType = action.payload;
      state.pagination.page = 1;
    },
    setDateFilter: (state, action) => {
      state.filters.dateStart = action.payload.start;
      state.filters.dateEnd = action.payload.end;
      state.pagination.page = 1;
    },
    setDateField: (state, action) => {
      state.filters.dateField = action.payload;
      state.pagination.page = 1;
    },
    clearAllFilters: (state) => {
      state.filters = {
        search: '',
        status: '',
        location: '',
        clientType: '',
        dateStart: '',
        dateEnd: '',
        dateField: 'createdAt'
      };
      state.pagination.page = 1;
    },
    clearError: (state) => {
      state.error = null;
    },
    setClient: (state, action) => {
      state.clients = action.payload;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setLimit: (state, action) => {
      state.pagination.limit = action.payload;
    },
    setSearch: (state, action) => {
      state.filters.search = action.payload;
      state.pagination.page = 1; // Reset to first page when search changes
    },
    clearSelectedClient: (state) => {
      state.selectedClient = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClientByVendor.fulfilled, (state, action) => {
        state.clients = action.payload.clients;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchClientById.fulfilled, (state, action) => {
        state.selectedClient = action.payload;
      })
      .addCase(createClient.fulfilled, (state, action) => {
        state.clients.unshift(action.payload);
      })
      .addCase(updateClient.fulfilled, (state, action) => {
        const index = state.clients.findIndex(c => c._id === action.payload._id);
        if (index !== -1) state.clients[index] = action.payload;
      })
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.clients = state.clients.filter(c => c._id !== action.payload);
      })
      .addMatcher(
        (action) => action.type.startsWith('client/') && action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('client/') && action.type.endsWith('/fulfilled'),
        (state) => {
          state.loading = false;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('client/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload || action.error.message;
        }
      );
  },
});

export const { 
  setClient, 
  setPage, 
  setLimit, 
  setSearch,
  setStatusFilter,
  setLocationFilter,
  setClientTypeFilter,
  setDateFilter,
  setDateField,
  clearAllFilters,
  clearError,
  clearSelectedClient 
} = clientSlice.actions;

export default clientSlice.reducer;