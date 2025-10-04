import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
const BaseUrl = process.env.REACT_APP_BASH_URL;

export const loadEmployeeTracker = createAsyncThunk(
    'tracker/loadEmployeeTracker',
    async (formData, thunkAPI) => {
        try {
            const token = localStorage.getItem("shinpay-vendor-token");

            const options = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            };

            const response = await axios.post(`${BaseUrl}/admin/employees/jobs/tracking`, formData, options);
            return response.data;
        } catch (error) {
            console.log(error.message);
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);
export const submitTimeTracker = createAsyncThunk(
    'tracker/submitTimeTracker',
    async (formData, { rejectWithValue }) => {
        try {
            console.log('{ jobId, startTime, endTime } :', formData);
            const token = localStorage.getItem("shinpay-vendor-token");

            const options = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            };
            const response = await axios.post(`${BaseUrl}/admin/employee/assignedJobs/${formData.jobId}`, {
                jobId: formData.jobId,
                startTime: formData.startTime,
                endTime: formData.endTime,
                date: formData.date
            }, options);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);


export const myJobsList = createAsyncThunk(
    'tracker/myJobsList',
    async (empId, thunkAPI) => {
        try {

            const response = await fetch(`${BaseUrl}/tracking/get-tracking-by-user-id/${empId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const JobsDropDownList = createAsyncThunk(
    'tracker/JobsDropDownList',
    async (empId, thunkAPI) => {
        try {
            const response = await fetch(`${BaseUrl}/job/get-by-emp-id/${empId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const emplyeesWeeklyWorkedSeconds = createAsyncThunk(
    'tracker/emplyeesWeeklyWorkedSeconds',
    async (empId, thunkAPI) => {
        try {
            const response = await fetch(`${BaseUrl}/tracking/get-week-hour/${empId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const fetchCurrentJobTimer = createAsyncThunk(
    'tracker/fetchCurrentJobTimer',
    async (empId, { getState, rejectWithValue }) => {
        try {
            const state = getState();
            const currentJob = state.timeTracker.currentJob;
            console.log('fetching tracking details for  : ', currentJob)
            const response = await axios.get(
                `${BaseUrl}/tracking/timer/${empId}/${currentJob._id}`
            );
            console.log(response.data)
            if (response.status != 200) {
                throw new Error('Network response was not ok');
            }

            return response.data;

        } catch (error) {
            console.log(error.message)
            return rejectWithValue(error.message);
        }
    }
);

export const startTimer = createAsyncThunk(
    'tracker/startTimer',
    async (empId, { dispatch, getState, rejectWithValue }) => {
        try {
            console.log('started............')
            const token = localStorage.getItem("shinpay-vendor-token");

            const state = getState();
            const currentJob = state.timeTracker.currentJob;
            console.log('currentJob : ', currentJob)
            const response = await axios.post(`${BaseUrl}/tracking/start-timer`, {
                userId: empId,
                jobId: currentJob._id
            });
            dispatch(fetchCurrentJobTimer(empId));
            dispatch(myJobsList(empId));
        } catch (error) {
            console.log(error.message)
            return rejectWithValue(error.message);
        }
    }
);

export const pauseTimer = createAsyncThunk(
    'tracker/pauseTimer',
    async (empId, { dispatch, getState, rejectWithValue }) => {
        try {
            console.log('pausing ............')

            const state = getState();
            const currentJob = state.timeTracker.currentJob;
            console.log('currentJob pausing : ', currentJob)
            const response = await axios.post(`${BaseUrl}/tracking/pause-timer`, {
                userId: empId,
                jobId: currentJob._id
            });
            dispatch(fetchCurrentJobTimer(empId));
            dispatch(myJobsList(empId));

        } catch (error) {
            console.log(error.message)
            return rejectWithValue(error.message);
        }
    }
);

export const fetchEmployeesByVendor = createAsyncThunk('employees/fetchByVendor', async (vendorId, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem("shinpay-vendor-token");

        const options = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };
        const response = await axios.get(`${BaseUrl}/admin/members/employees/${vendorId}`, { headers: options });
        return response.data.employees; // Assuming employees are returned in `employees` field
    } catch (error) {
        if (error.response && error.response.data) {
            return rejectWithValue(error.response.data.msg); // Error message from server
        } else {
            return rejectWithValue('An error occurred while fetching employees');
        }
    }
});
export const fetchEmployeeAssignedJobs = createAsyncThunk('employees/fetchAssignedJobsToEmployee', async ({ vendor, employee }, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem("shinpay-vendor-token");

        const options = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };
        const response = await axios.get(`${BaseUrl}/admin/members/employees/jobs/${vendor}/${employee}`, { headers: options });
        return response.data.result; // Assuming employees are returned in `employees` field
    } catch (error) {
        if (error.response && error.response.data) {
            return rejectWithValue(error.response.data.msg); // Error message from server
        } else {
            return rejectWithValue('An error occurred while fetching employees');
        }
    }
});

export const getEmployeesJobsTrackingRequests = createAsyncThunk('employees/getEmployeesJobsTrackingRequests', async (_, { dispatch, rejectWithValue }) => {
    try {
        const token = localStorage.getItem("shinpay-vendor-token");

        const options = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };
        const response = await axios.get(`${BaseUrl}/vendor/time-tracker-requests`, { headers: options });
        return response.data.result; // Assuming employees are returned in `employees` field
    } catch (error) {
        if (error.response && error.response.data) {
            return rejectWithValue(error.response.data.msg); // Error message from server
        } else {
            return rejectWithValue('An error occurred while fetching employees');
        }
    }
});

export const approveTimeTrackerRequest = createAsyncThunk(
    'tracker/approveTimeTrackerRequest',
    async (trackingId, { dispatch, rejectWithValue }) => {
        const token = localStorage.getItem("shinpay-vendor-token");

        const options = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };

        try {
            const response = await axios.post(`${BaseUrl}/vendor/time-tracker-requests/approve`, { trackingId }, { headers: options });
            dispatch(getEmployeesJobsTrackingRequests());
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);


export const checkAutoApproval = createAsyncThunk(
    'tracker/checkAutoApproval',
    async (requestData, thunkAPI) => {
        const token = localStorage.getItem("shinpay-vendor-token");

        const options = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };

        try {
            const response = await axios.post(`${BaseUrl}/vendor/tracker/check-auto-approval`, {
                trackingId: requestData.trackingData._id,
                vendorId: requestData.vendorId,
                sessionDate: requestData.trackingData.sessionDate
            }, { headers: options });

            return response.data; // Response should contain whether the request is auto-approvable
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);


const trackerSlice = createSlice({
    name: 'tracker',
    initialState: {
        Jobs: [],
        JobsTracking: [],
        TimeTrackerApprovalRequests: [],
        currentJob: {},
        currentJobTracking: {},
        weeklySeconds: '00:00:00',
        status: 'idle',
        rate: 0,
        employees: [],
        error: null,
        successMessage: null,
    },
    reducers: {
        setCurrentJob: (state, action) => {
            const selectedJobId = action.payload;
            const selectedJob = state.Jobs.find(job => job._id === selectedJobId);
            state.currentJob = selectedJob || {};
            state.currentJobTracking = state.JobsTracking.find(job => job.jobId === selectedJobId);

        },
        clearMessages: (state) => {
            state.successMessage = null;
            state.error = null;
        },
        setCurrentJobTracking: (state, action) => {
            const selectedJobId = action.payload;
            state.currentJobTracking = state.JobsTracking.find(job => job.jobId === selectedJobId);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(myJobsList.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(myJobsList.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.JobsTracking = action.payload.result;
            })
            .addCase(myJobsList.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(emplyeesWeeklyWorkedSeconds.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(emplyeesWeeklyWorkedSeconds.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.weeklySeconds = action.payload.result[0]?.totalSeconds;
            })
            .addCase(emplyeesWeeklyWorkedSeconds.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(JobsDropDownList.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(JobsDropDownList.fulfilled, (state, action) => {
                state.status = 'succeeded';
                console.log('action.payload.result ', action.payload.result)
                state.Jobs = action.payload.result.jobId.filter((job) => job.status !== 'closed');
                state.rate = action.payload.result.rate;
            })
            .addCase(JobsDropDownList.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(startTimer.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(startTimer.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentJobTracking = action.payload;
            })
            .addCase(startTimer.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(pauseTimer.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(pauseTimer.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentJobTracking = action.payload;
            })
            .addCase(pauseTimer.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(fetchCurrentJobTimer.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentJobTracking = action.payload;
            })
            .addCase(fetchCurrentJobTimer.rejected, (state, action) => {
                state.status = 'failed';
                state.currentJobTracking = {};
                state.error = action.payload;
            })
            .addCase(fetchCurrentJobTimer.pending, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(fetchEmployeeAssignedJobs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEmployeesByVendor.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEmployeesByVendor.fulfilled, (state, action) => {
                state.loading = false;
                state.employees = action.payload;
            })
            .addCase(fetchEmployeesByVendor.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.employees = [];
                state.assignedJobsToEmployee = [];
            })
            .addCase(fetchEmployeeAssignedJobs.fulfilled, (state, action) => {
                state.loading = false;
                console.log(action.payload);
                state.assignedJobsToEmployee = action.payload;
            })
            .addCase(fetchEmployeeAssignedJobs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.employees = [];
            })
            .addCase(loadEmployeeTracker.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(loadEmployeeTracker.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.JobsTracking = action.payload.result;
            })
            .addCase(loadEmployeeTracker.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(submitTimeTracker.fulfilled, (state, action) => {
                // state.JobsTracking.push(action.payload);
                state.status = 'succeeded';
            })
            .addCase(submitTimeTracker.rejected, (state, action) => {
                state.error = action.payload;
                state.status = 'failed';
            })
            .addCase(getEmployeesJobsTrackingRequests.fulfilled, (state, action) => {
                state.TimeTrackerApprovalRequests = action.payload;
                state.status = 'succeeded';
            })
            .addCase(getEmployeesJobsTrackingRequests.rejected, (state, action) => {
                state.error = action.payload;
                state.status = 'failed';
            })
            .addCase(approveTimeTrackerRequest.fulfilled, (state, action) => {
                state.loading = false;
                state.successMessage = 'Tracking request approved successfully';
                // Optional: Update the state with approved request
                const index = state.TimeTrackerApprovalRequests.findIndex(
                    (req) => req._id === action.payload.trackingRequest._id
                );
                if (index !== -1) {
                    state.TimeTrackerApprovalRequests[index].status = 'approved';
                }
            })
            .addCase(approveTimeTrackerRequest.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload.message || 'Error approving request';
            });


    },
});
export const { setCurrentJob, setCurrentJobTracking, clearMessages } = trackerSlice.actions;
export default trackerSlice.reducer;
