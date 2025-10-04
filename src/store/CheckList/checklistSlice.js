import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BaseUrl = process.env.REACT_APP_BASH_URL;
const options = {
    Authorization: `Bearer ${localStorage.getItem("shinpay-vendor-token")}`,
    "Content-Type": "application/json",
};

export const addChecklist = createAsyncThunk(
    'checklist/addChecklist',
    async (checklistData, { rejectWithValue, dispatch }) => {
        try {
            const response = await axios.post(`${BaseUrl}/vendor/checklists`, checklistData, { headers: options });
            dispatch(fetchChecklists());
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateChecklist = createAsyncThunk(
    'checklist/updateChecklist',
    async ({ id, checklistData } ,{ rejectWithValue, dispatch }) => {
        try {
            const response = await axios.post(`${BaseUrl}/vendor/checklists/${id}`, checklistData, { headers: options });
            dispatch(fetchChecklists());
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchChecklists = createAsyncThunk(
    'checklist/fetchChecklists',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BaseUrl}/vendor/checklists`, { headers: options });
            console.log(response.data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const addEmployeeChecklist = createAsyncThunk(
    'employeeChecklist/addEmployeeChecklist',
    async (employeeChecklistData, { rejectWithValue, dispatch }) => {
        try {
            const response = await axios.post(`${BaseUrl}/vendor/add-employee-checklist`, employeeChecklistData, { headers: options });
            dispatch(getAssignedChecklists());
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                return rejectWithValue(error.response.data);
            } else {
                return rejectWithValue({ message: 'Network error or server is down' });
            }
        }
    }
);

export const getAssignedChecklists = createAsyncThunk(
    'employeeChecklist/getAssignedChecklists',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BaseUrl}/vendor/employee-checklist`, { headers: options });
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                return rejectWithValue(error.response.data);
            } else {
                return rejectWithValue({ message: 'Network error or server is down' });
            }
        }
    }
);

export const assignChecklistToMember = createAsyncThunk(
    'employeeChecklist/assignChecklistToMember',
    async ({ employeeId, checklistId }, { rejectWithValue, dispatch }) => {
        try {
            const response = await axios.post(`${BaseUrl}/vendor/assign-checklist`, { employeeId, checklistId }, { headers: options });
            dispatch(getAssignedChecklists());  // Fetch updated employee checklists after assigning
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                return rejectWithValue(error.response.data);
            } else {
                return rejectWithValue({ message: 'Network error or server is down' });
            }
        }
    }
);
export const deleteAssignedChecklist = createAsyncThunk(
    'employeeChecklist/deleteAssignedChecklist',
    async (id, { rejectWithValue, dispatch }) => {
        try {
            const response = await axios.post(`${BaseUrl}/vendor/delete-assign-checklist`,{id}, { headers: options });
            dispatch(getAssignedChecklists());  // Fetch updated employee checklists after assigning

            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                return rejectWithValue(error.response.data);
            } else {
                return rejectWithValue({ message: 'Network error or server is down' });
            }
        }
    }
);

export const updateEmployeeChecklist = createAsyncThunk(
    'employeeChecklist/updateChecklist',
    async (formData, { rejectWithValue, dispatch }) => {
        try {
            const response = await axios.post(`${BaseUrl}/vendor/update-checklist-steps`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem("shinpay-vendor-token")}`,
                },
            });

            dispatch(getAssignedChecklists());
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'An error occurred');
        }
    }
);

const checklistSlice = createSlice({
    name: 'checklist',
    initialState: {
        itemsList: [],
        employeeChecklists: [],
        status: 'idle',
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchChecklists.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchChecklists.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.itemsList = action.payload;
            })
            .addCase(fetchChecklists.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(addChecklist.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(addChecklist.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // state.checklists.push(action.payload);
            })
            .addCase(addChecklist.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(updateChecklist.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateChecklist.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // state.checklists.push(action.payload);
            })
            .addCase(updateChecklist.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(addEmployeeChecklist.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = null;
            })
            .addCase(addEmployeeChecklist.fulfilled, (state, action) => {
                state.loading = false;  // Assuming it returns the added checklist
            })
            .addCase(addEmployeeChecklist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ? action.payload.message : 'Failed to add checklist';
            })
            .addCase(getAssignedChecklists.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = null;
            })
            .addCase(getAssignedChecklists.fulfilled, (state, action) => {
                state.loading = false;  // Assuming it returns the added checklist
                state.employeeChecklists = action.payload;
            })
            .addCase(getAssignedChecklists.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ? action.payload.message : 'Failed to add checklist';
            })
            .addCase(assignChecklistToMember.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(assignChecklistToMember.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(assignChecklistToMember.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ? action.payload.message : 'Failed to assign checklist';
            })
            .addCase(updateEmployeeChecklist.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateEmployeeChecklist.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(updateEmployeeChecklist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ? action.payload.message : 'Failed to assign checklist';
            });
    },
});

export default checklistSlice.reducer;
