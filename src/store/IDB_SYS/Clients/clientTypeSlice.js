import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BaseUrl = process.env.REACT_APP_BASH_URL;

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('shinpay-vendor-token')}`,
  'Content-Type': 'application/json',
});

export const fetchClientTypesByVendor = createAsyncThunk(
  'clientTypes/fetchByVendor',
  async (_payload, { getState, rejectWithValue }) => {
    try {
      const { clientType } = getState();
      let { page, limit } = clientType.pagination;
      const search = clientType.search;
        if(_payload.limit) limit = _payload.limit;
      const query = `?page=${page}&limit=${limit}${search ? `&search=${search}` : ''}`;

      const res = await axios.get(`${BaseUrl}/vendor/clientTypes${query}`, { headers: getHeaders() });

      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);



export const fetchClientTypesById = createAsyncThunk(
  'clientTypes/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BaseUrl}/vendor/clientTypes/single/${id}`, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createClientTypes = createAsyncThunk(
  'clientTypes/create',
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BaseUrl}/vendor/clientTypes`, data, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateClientTypes = createAsyncThunk(
  'clientTypes/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${BaseUrl}/vendor/clientTypes/${id}`, data, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteClientTypes = createAsyncThunk(
  'clientTypes/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${BaseUrl}/vendor/clientTypes/${id}`, {
        headers: getHeaders(),
      });
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const clientTypesSlice = createSlice({
  name: 'clientType',
  initialState: {
    clientType: [],
    selectedClientTypes: null,
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
    setClientTypes: (state, action) => {
      state.clientType = action.payload;
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
      .addCase(fetchClientTypesByVendor.fulfilled, (state, action) => {
        state.clientType = action.payload.clientTypes;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchClientTypesById.fulfilled, (state, action) => {
        state.selectedClientTypes = action.payload;
      })
      .addCase(createClientTypes.fulfilled, (state, action) => {
        state.clientType.unshift(action.payload);
      })
      .addCase(updateClientTypes.fulfilled, (state, action) => {
        const index = state.clientType.findIndex((a) => a._id === action.payload._id);
        if (index !== -1) state.clientType[index] = action.payload;
      })
      .addCase(deleteClientTypes.fulfilled, (state, action) => {
        state.clientType = state.clientType.filter((a) => a._id !== action.payload);
      })
      .addMatcher(
        (action) => action.type.startsWith('clientTypes/') && action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('clientTypes/') && action.type.endsWith('/fulfilled'),
        (state) => {
          state.loading = false;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('clientTypes/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload || action.error.message;
        }
      );
  },
});

export const { setClientTypes, setPage, setLimit , setSearch} = clientTypesSlice.actions;
export default clientTypesSlice.reducer;
