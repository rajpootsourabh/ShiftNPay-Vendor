import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BaseUrl = process.env.REACT_APP_BASH_URL;

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('shinpay-vendor-token')}`,
  'Content-Type': 'application/json',
});

export const fetchNoteTypesByVendor = createAsyncThunk(
  'noteTypes/fetchByVendor',
  async (_payload, { getState, rejectWithValue }) => {
    try {
      const { noteTypes } = getState();
      const { page, limit } = noteTypes.pagination;
      const search = noteTypes.search;

      const query = `?page=${page}&limit=${limit}${search ? `&search=${search}` : ''}`;

      const res = await axios.get(`${BaseUrl}/vendor/noteTypes${query}`, { headers: getHeaders() });

      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);



export const fetchNoteTypesById = createAsyncThunk(
  'noteTypes/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BaseUrl}/vendor/noteTypes/single/${id}`, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createNoteTypes = createAsyncThunk(
  'noteTypes/create',
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BaseUrl}/vendor/noteTypes`, data, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateNoteTypes = createAsyncThunk(
  'noteTypes/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${BaseUrl}/vendor/noteTypes/${id}`, data, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteNoteTypes = createAsyncThunk(
  'noteTypes/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${BaseUrl}/vendor/noteTypes/${id}`, {
        headers: getHeaders(),
      });
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const noteTypesSlice = createSlice({
  name: 'noteTypes',
  initialState: {
    noteTypes: [],
    selectedNoteTypes: null,
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
    setNoteTypes: (state, action) => {
      state.noteTypes = action.payload;
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
      .addCase(fetchNoteTypesByVendor.fulfilled, (state, action) => {
        state.noteTypes = action.payload.noteTypes;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchNoteTypesById.fulfilled, (state, action) => {
        state.selectedNoteTypes = action.payload;
      })
      .addCase(createNoteTypes.fulfilled, (state, action) => {
        state.noteTypes.unshift(action.payload);
      })
      .addCase(updateNoteTypes.fulfilled, (state, action) => {
        const index = state.noteTypes.findIndex((a) => a._id === action.payload._id);
        if (index !== -1) state.noteTypes[index] = action.payload;
      })
      .addCase(deleteNoteTypes.fulfilled, (state, action) => {
        state.noteTypes = state.noteTypes.filter((a) => a._id !== action.payload);
      })
      .addMatcher(
        (action) => action.type.startsWith('noteTypes/') && action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('noteTypes/') && action.type.endsWith('/fulfilled'),
        (state) => {
          state.loading = false;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('noteTypes/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload || action.error.message;
        }
      );
  },
});

export const { setNoteTypes, setPage, setLimit , setSearch} = noteTypesSlice.actions;
export default noteTypesSlice.reducer;
