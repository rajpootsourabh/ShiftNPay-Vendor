import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BaseUrl = process.env.REACT_APP_BASH_URL;

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('shinpay-vendor-token')}`,
  'Content-Type': 'application/json',
});

export const fetchDisciplineByVendor = createAsyncThunk(
  'discipline/fetchByVendor',
  async (_payload, { getState, rejectWithValue }) => {
    try {
      const { discipline } = getState();
      const { page, limit } = discipline.pagination;
      const search = discipline.search;

      const query = `?page=${page}&limit=${limit}${search ? `&search=${search}` : ''}`;
      const res = await axios.get(`${BaseUrl}/vendor/disciplines${query}`, { headers: getHeaders() });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchDisciplineById = createAsyncThunk(
  'discipline/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BaseUrl}/vendor/disciplines/single/${id}`, { headers: getHeaders() });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createDiscipline = createAsyncThunk(
  'discipline/create',
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BaseUrl}/vendor/disciplines`, data, { headers: getHeaders() });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateDiscipline = createAsyncThunk(
  'discipline/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${BaseUrl}/vendor/disciplines/${id}`, data, { headers: getHeaders() });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteDiscipline = createAsyncThunk(
  'discipline/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${BaseUrl}/vendor/disciplines/${id}`, { headers: getHeaders() });
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const disciplineSlice = createSlice({
  name: 'discipline',
  initialState: {
    discipline: [],
    selectedDiscipline: null,
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
      .addCase(fetchDisciplineByVendor.fulfilled, (state, action) => {
        state.discipline = action.payload.discipline;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchDisciplineById.fulfilled, (state, action) => {
        state.selectedDiscipline = action.payload;
      })
      .addCase(createDiscipline.fulfilled, (state, action) => {
        state.discipline.unshift(action.payload);
      })
      .addCase(updateDiscipline.fulfilled, (state, action) => {
        const index = state.discipline.findIndex((a) => a._id === action.payload._id);
        if (index !== -1) state.discipline[index] = action.payload;
      })
      .addCase(deleteDiscipline.fulfilled, (state, action) => {
        state.discipline = state.discipline.filter((a) => a._id !== action.payload);
      })
      .addMatcher(
        (action) => action.type.startsWith('discipline/') && action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('discipline/') && action.type.endsWith('/fulfilled'),
        (state) => {
          state.loading = false;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('discipline/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload || action.error.message;
        }
      );
  },
});

export const { setPage, setLimit, setSearch } = disciplineSlice.actions;
export default disciplineSlice.reducer;
