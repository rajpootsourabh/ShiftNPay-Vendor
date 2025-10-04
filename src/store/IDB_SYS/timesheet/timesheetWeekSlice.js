// slices/timesheetWeekSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BaseUrl = process.env.REACT_APP_BASH_URL;

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('shinpay-vendor-token')}`,
  'Content-Type': 'application/json',
});

// Async thunks
export const createWeeksRange = createAsyncThunk(
  'timesheetWeek/createWeeksRange',
  async (payload, { rejectWithValue ,dispatch }) => {
    try {
      const res = await axios.post(`${BaseUrl}/vendor/timesheet-weeks`, payload, {
        headers: getHeaders(),
      });
      dispatch(getAllWeeks());
      return res.data;
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        return rejectWithValue(err.response.data.message);
      }
      return rejectWithValue(err.message);
    }
  }
);

export const getAllWeeks = createAsyncThunk(
  'timesheetWeek/getAllWeeks',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BaseUrl}/vendor/timesheet-weeks`, {
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


export const lockWeek = createAsyncThunk(
  'timesheetWeek/lockWeek',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.patch(`${BaseUrl}/vendor/timesheet-weeks/${id}/lock`, {}, {
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

export const unlockWeek = createAsyncThunk(
  'timesheetWeek/unlockWeek',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.patch(`${BaseUrl}/vendor/timesheet-weeks/${id}/unlock`, {}, {
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

export const updateWeeks = createAsyncThunk(
  'timesheetWeek/updateWeeks',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BaseUrl}/vendor/timesheet-weeks/recreate`, payload, {
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


export const fetchSchedules = createAsyncThunk(
  'timesheetWeek/fetchWeeklySchedules',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BaseUrl}/vendor/timesheet-weeks/fetch-schedules`,params, {
        headers: getHeaders(),
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
const timesheetWeekSlice = createSlice({
  name: 'timesheetWeek',
  initialState: {
    weeks: [],
    schedules:[],
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
     updateScheduleState:(state, action) => {
      state.schedules = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create weeks range
      .addCase(createWeeksRange.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createWeeksRange.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.weeks = action.payload;
      })
      .addCase(createWeeksRange.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get all weeks
      .addCase(getAllWeeks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllWeeks.fulfilled, (state, action) => {
        state.loading = false;
        state.weeks = action.payload;
      })
      .addCase(getAllWeeks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get all schedules
      .addCase(fetchSchedules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSchedules.fulfilled, (state, action) => {
        state.loading = false;
        state.schedules = action.payload.schedules;
      })
      .addCase(fetchSchedules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Lock week
      .addCase(lockWeek.fulfilled, (state, action) => {
        const updatedWeek = action.payload;
        const index = state.weeks.findIndex(week => week._id === updatedWeek._id);
        if (index !== -1) {
          state.weeks[index] = updatedWeek;
        }
      })
      // Unlock week
      .addCase(unlockWeek.fulfilled, (state, action) => {
        const updatedWeek = action.payload;
        const index = state.weeks.findIndex(week => week._id === updatedWeek._id);
        if (index !== -1) {
          state.weeks[index] = updatedWeek;
        }
      })
      // Update weeks
      .addCase(updateWeeks.fulfilled, (state, action) => {
        state.weeks = action.payload;
      });
  },
});

export const { clearError, clearSuccess, updateScheduleState } = timesheetWeekSlice.actions;
export default timesheetWeekSlice.reducer;