import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BaseUrl = process.env.REACT_APP_BASH_URL;

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('shinpay-vendor-token')}`,
  'Content-Type': 'application/json',
});

export const fetchMedicationByVendor = createAsyncThunk(
  'medication/fetchByVendor',
  async (_payload, { getState, rejectWithValue }) => {
    try {
      const { medication } = getState();
      const { page, limit } = medication.pagination;
      const search = medication.search;

      const query = `?page=${page}&limit=${limit}${search ? `&search=${search}` : ''}`;

      const res = await axios.get(`${BaseUrl}/vendor/medication${query}`, { headers: getHeaders() });

      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);



export const fetchMedicationById = createAsyncThunk(
  'medication/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BaseUrl}/vendor/medication/single/${id}`, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createMedication = createAsyncThunk(
  'medication/create',
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BaseUrl}/vendor/medication`, data, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateMedication = createAsyncThunk(
  'medication/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${BaseUrl}/vendor/medication/${id}`, data, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteMedication = createAsyncThunk(
  'medication/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${BaseUrl}/vendor/medication/${id}`, {
        headers: getHeaders(),
      });
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const medicationSlice = createSlice({
  name: 'medication',
  initialState: {
    medication: [],
    selectedMedication: null,
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
    setMedication: (state, action) => {
      state.medication = action.payload;
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
      .addCase(fetchMedicationByVendor.fulfilled, (state, action) => {
        state.medication = action.payload.medication;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchMedicationById.fulfilled, (state, action) => {
        state.selectedMedication = action.payload;
      })
      .addCase(createMedication.fulfilled, (state, action) => {
        state.medication.unshift(action.payload);
      })
      .addCase(updateMedication.fulfilled, (state, action) => {
        const index = state.medication.findIndex((a) => a._id === action.payload._id);
        if (index !== -1) state.medication[index] = action.payload;
      })
      .addCase(deleteMedication.fulfilled, (state, action) => {
        state.medication = state.medication.filter((a) => a._id !== action.payload);
      })
      .addMatcher(
        (action) => action.type.startsWith('medication/') && action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('medication/') && action.type.endsWith('/fulfilled'),
        (state) => {
          state.loading = false;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('medication/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload || action.error.message;
        }
      );
  },
});

export const { setMedication, setPage, setLimit , setSearch} = medicationSlice.actions;
export default medicationSlice.reducer;
