import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BaseUrl = process.env.REACT_APP_BASH_URL;

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('shinpay-vendor-token')}`,
  'Content-Type': 'application/json',
});

export const fetchReminderListByVendor = createAsyncThunk(
  'reminderList/fetchByVendor',
  async (_payload, { getState, rejectWithValue }) => {
    try {
      const { reminderList } = getState();
      const { page, limit } = reminderList.pagination;
      const search = reminderList.search;

      const query = `?page=${page}&limit=${limit}${search ? `&search=${search}` : ''}`;

      const res = await axios.get(`${BaseUrl}/vendor/reminderList${query}`, { headers: getHeaders() });

      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);



export const fetchReminderListById = createAsyncThunk(
  'reminderList/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BaseUrl}/vendor/reminderList/single/${id}`, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createReminderList = createAsyncThunk(
  'reminderList/create',
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BaseUrl}/vendor/reminderList`, data, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateReminderList = createAsyncThunk(
  'reminderList/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${BaseUrl}/vendor/reminderList/${id}`, data, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteReminderList = createAsyncThunk(
  'reminderList/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${BaseUrl}/vendor/reminderList/${id}`, {
        headers: getHeaders(),
      });
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const reminderListSlice = createSlice({
  name: 'reminderList',
  initialState: {
    reminderList: [],
    selectedReminderList: null,
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
    setReminderList: (state, action) => {
      state.reminderList = action.payload;
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
      .addCase(fetchReminderListByVendor.fulfilled, (state, action) => {
        state.reminderList = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchReminderListById.fulfilled, (state, action) => {
        state.selectedReminderList = action.payload;
      })
      .addCase(createReminderList.fulfilled, (state, action) => {
        state.reminderList.unshift(action.payload);
      })
      .addCase(updateReminderList.fulfilled, (state, action) => {
        const index = state.reminderList.findIndex((a) => a._id === action.payload._id);
        if (index !== -1) state.reminderList[index] = action.payload;
      })
      .addCase(deleteReminderList.fulfilled, (state, action) => {
        state.reminderList = state.reminderList.filter((a) => a._id !== action.payload);
      })
      .addMatcher(
        (action) => action.type.startsWith('reminderList/') && action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('reminderList/') && action.type.endsWith('/fulfilled'),
        (state) => {
          state.loading = false;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('reminderList/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload || action.error.message;
        }
      );
  },
});

export const { setReminderList, setPage, setLimit , setSearch} = reminderListSlice.actions;
export default reminderListSlice.reducer;
