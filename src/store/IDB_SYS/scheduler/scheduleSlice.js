import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';



const BaseUrl = process.env.REACT_APP_BASH_URL;

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('shinpay-vendor-token')}`,
  'Content-Type': 'application/json',
});

const API_URL = `${BaseUrl}/vendor/schedule`;

// Async thunks
export const createSchedule = createAsyncThunk(
  'schedule/createSchedule',
  async (scheduleData, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, scheduleData, { headers: getHeaders() });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);


export const fetchJobs = createAsyncThunk(
  'schedule/fetchJobs',
  async ({ empId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${BaseUrl}/shift/getEmployeeShifts/${empId}`,
        {
          headers: getHeaders(),
        }
      );
      return response.data.result.jobId ?? [];
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


export const fetchSchedules = createAsyncThunk(
  'schedule/fetchSchedules',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}`, {
        headers: getHeaders(),
        params, // <-- this makes axios convert the object into query string
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchScheduleById = createAsyncThunk(
  'schedule/fetchScheduleById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`, { headers: getHeaders() });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateSchedule = createAsyncThunk(
  'schedule/updateSchedule',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, formData, { headers: getHeaders() });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteSchedule = createAsyncThunk(
  'schedule/deleteSchedule',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/${id}`, { headers: getHeaders() });
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateJobStatus = createAsyncThunk(
  'schedule/updateJobStatus',
  async ({ id, statusData }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_URL}/${id}/status`, statusData, { headers: getHeaders() });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchSchedulesByDateRange = createAsyncThunk(
  'schedule/fetchSchedulesByDateRange',
  async ({ start, end }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/date-range`, {
        params: { start, end }
      }, { headers: getHeaders() });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Fetch client interruptions (blocked periods)
export const fetchClientInterruptions = createAsyncThunk(
  'schedule/fetchClientInterruptions',
  async ({ clientId, start, end }, { rejectWithValue }) => {
    try {
      const params = { clientId };
      if (start) params.start = start;
      if (end) params.end = end;
      
      const response = await axios.get(`${API_URL}/client-interruptions`, {
        headers: getHeaders(),
        params
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Check if scheduling is blocked for specific dates
export const checkSchedulingBlocked = createAsyncThunk(
  'schedule/checkSchedulingBlocked',
  async ({ clientId, start, end }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/check-blocked`, {
        headers: getHeaders(),
        params: { clientId, start, end }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const scheduleSlice = createSlice({
  name: 'schedule',
  initialState: {
    schedule: [],
    vendorJobs: [],
    currentSchedule: null,
    clientInterruptions: [],
    schedulingBlocked: null,
    loading: false,
    error: null,
    success: false
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    setCurrentSchedule: (state, action) => {
      state.currentSchedule = action.payload;
    },
    clearClientInterruptions: (state) => {
      state.clientInterruptions = [];
      state.schedulingBlocked = null;
    },

  },
  extraReducers: (builder) => {
    builder
      // Create Schedule
      .addCase(createSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.schedule.push(action.payload);
        state.success = true;
      })
      .addCase(createSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Schedules
      .addCase(fetchSchedules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSchedules.fulfilled, (state, action) => {
        state.loading = false;
        state.schedule = action.payload;
      })
      .addCase(fetchSchedules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        console.log(action.payload)
        state.vendorJobs = action.payload
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Schedule by ID
      .addCase(fetchScheduleById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchScheduleById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSchedule = action.payload;
      })
      .addCase(fetchScheduleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Schedule
      .addCase(updateSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSchedule.fulfilled, (state, action) => {
        state.loading = false;
        // const index = state.schedule.findIndex(
        //   schedule => schedule._id === action.payload._id
        // );
        // if (index !== -1) {
        //   state.schedule[index] = action.payload;
        // }
        state.success = true;
      })
      .addCase(updateSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Schedule
      .addCase(deleteSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.schedule = state.schedule.filter(
          schedule => schedule._id !== action.payload
        );
        state.success = true;
      })
      .addCase(deleteSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Job Status
      .addCase(updateJobStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateJobStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.schedule.findIndex(
          schedule => schedule._id === action.payload._id
        );
        if (index !== -1) {
          state.schedule[index] = action.payload;
        }
        if (state.currentSchedule && state.currentSchedule._id === action.payload._id) {
          state.currentSchedule = action.payload;
        }
      })
      .addCase(updateJobStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch by Date Range
      .addCase(fetchSchedulesByDateRange.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSchedulesByDateRange.fulfilled, (state, action) => {
        state.loading = false;
        state.schedule = action.payload;
      })
      .addCase(fetchSchedulesByDateRange.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Client Interruptions
      .addCase(fetchClientInterruptions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchClientInterruptions.fulfilled, (state, action) => {
        state.loading = false;
        state.clientInterruptions = action.payload.interruptions || [];
      })
      .addCase(fetchClientInterruptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Check Scheduling Blocked
      .addCase(checkSchedulingBlocked.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkSchedulingBlocked.fulfilled, (state, action) => {
        state.loading = false;
        state.schedulingBlocked = action.payload;
      })
      .addCase(checkSchedulingBlocked.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearSuccess, setCurrentSchedule, clearClientInterruptions } = scheduleSlice.actions;
export default scheduleSlice.reducer;