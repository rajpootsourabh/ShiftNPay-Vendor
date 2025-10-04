import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
const BaseUrl = process.env.REACT_APP_BASH_URL;

// Async Thunks
export const fetchUnassignedJobs = createAsyncThunk(
  'job/fetchUnassigned',
  async (vendorId, { rejectWithValue }) => {
    try {
       const token = localStorage.getItem("shinpay-vendor-token");

            const options = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            };

        const response = await axios.get(`${BaseUrl}/job/unassigned?vendorId=${vendorId}`, options);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const startAutoScheduleJob = createAsyncThunk(
  'job/startAutoSchedule',
  async (jobId, { rejectWithValue }) => {
    try {
       const token = localStorage.getItem("shinpay-vendor-token");

            const options = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            };

        const response = await axios.post(`${BaseUrl}/job/${jobId}/auto-schedule`,{}, options);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const getJobQueueStatus = createAsyncThunk(
  'job/getQueueStatus',
  async (vendorId, { rejectWithValue }) => {
    try {
       const token = localStorage.getItem("shinpay-vendor-token");

            const options = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            };

        const response = await axios.get(`${BaseUrl}/job/job-queues?vendorId=${vendorId}`, options);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const respondToJobRequest = createAsyncThunk(
  'job/respondToRequest',
  async ({ queueId, employeeId, status }, { rejectWithValue }) => {
    try {
       const token = localStorage.getItem("shinpay-vendor-token");

            const options = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            };

        const response = await axios.post(`${BaseUrl}/job/job-requests/${queueId}/respond`, {
        employeeId,
        status
      }, options);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const fetchJobDetails = createAsyncThunk(
  'job/fetchDetails',
  async (jobId, { rejectWithValue }) => {
    try {
       const token = localStorage.getItem("shinpay-vendor-token");

            const options = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            };

        const response = await axios.get(`${BaseUrl}/job/${jobId}`, options);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// Slice
const jobSlice = createSlice({
  name: 'job',
  initialState: {
    unassignedJobs: [],
    jobQueues: [],
    currentJob: null,
    loading: false,
    error: null,
    success: false
  },
  reducers: {
    resetJobState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    clearCurrentJob: (state) => {
      state.currentJob = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Unassigned Jobs
      .addCase(fetchUnassignedJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUnassignedJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.unassignedJobs = action.payload;
      })
      .addCase(fetchUnassignedJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch unassigned jobs';
      })

      // Start Auto Schedule
      .addCase(startAutoScheduleJob.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startAutoScheduleJob.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Remove the job from unassigned list
        state.unassignedJobs = state.unassignedJobs.filter(
          job => job._id !== action.payload.jobId
        );
      })
      .addCase(startAutoScheduleJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to start auto-scheduling';
      })

      // Get Job Queue Status
      .addCase(getJobQueueStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getJobQueueStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.jobQueues = action.payload;
      })
      .addCase(getJobQueueStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to get queue status';
      })

      // Respond to Job Request
      .addCase(respondToJobRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(respondToJobRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Update the specific queue
        const index = state.jobQueues.findIndex(
          q => q._id === action.payload._id
        );
        if (index !== -1) {
          state.jobQueues[index] = action.payload;
        }
      })
      .addCase(respondToJobRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to process response';
      })

      // Fetch Job Details
      .addCase(fetchJobDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentJob = action.payload;
      })
      .addCase(fetchJobDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch job details';
      });
  }
});

// Export actions and reducer
export const { resetJobState, clearCurrentJob } = jobSlice.actions;
export default jobSlice.reducer;