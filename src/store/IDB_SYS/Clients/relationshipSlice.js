import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BaseUrl = process.env.REACT_APP_BASH_URL;

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('shinpay-vendor-token')}`,
  'Content-Type': 'application/json',
});

export const fetchRelationshipByVendor = createAsyncThunk(
  'relationship/fetchByVendor',
  async (_payload, { getState, rejectWithValue }) => {
    try {
      const { relationship } = getState();
      const { page, limit } = relationship.pagination;
      const search = relationship.search;

      const query = `?page=${page}&limit=${limit}${search ? `&search=${search}` : ''}`;

      const res = await axios.get(`${BaseUrl}/vendor/relationship${query}`, { headers: getHeaders() });

      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);



export const fetchRelationshipById = createAsyncThunk(
  'relationship/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BaseUrl}/vendor/relationship/single/${id}`, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createRelationship = createAsyncThunk(
  'relationship/create',
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BaseUrl}/vendor/relationship`, data, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateRelationship = createAsyncThunk(
  'relationship/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${BaseUrl}/vendor/relationship/${id}`, data, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteRelationship = createAsyncThunk(
  'relationship/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${BaseUrl}/vendor/relationship/${id}`, {
        headers: getHeaders(),
      });
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const relationshipSlice = createSlice({
  name: 'relationship',
  initialState: {
    relationship: [],
    selectedRelationship: null,
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
    setRelationship: (state, action) => {
      state.relationship = action.payload;
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
      .addCase(fetchRelationshipByVendor.fulfilled, (state, action) => {
        state.relationship = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchRelationshipById.fulfilled, (state, action) => {
        state.selectedRelationship = action.payload;
      })
      .addCase(createRelationship.fulfilled, (state, action) => {
        state.relationship.unshift(action.payload);
      })
      .addCase(updateRelationship.fulfilled, (state, action) => {
        const index = state.relationship.findIndex((a) => a._id === action.payload._id);
        if (index !== -1) state.relationship[index] = action.payload;
      })
      .addCase(deleteRelationship.fulfilled, (state, action) => {
        state.relationship = state.relationship.filter((a) => a._id !== action.payload);
      })
      .addMatcher(
        (action) => action.type.startsWith('relationship/') && action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('relationship/') && action.type.endsWith('/fulfilled'),
        (state) => {
          state.loading = false;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('relationship/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload || action.error.message;
        }
      );
  },
});

export const { setRelationship, setPage, setLimit , setSearch} = relationshipSlice.actions;
export default relationshipSlice.reducer;
