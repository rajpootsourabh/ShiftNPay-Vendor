import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BaseUrl = process.env.REACT_APP_BASH_URL;
const options = {
    Authorization: `Bearer ${localStorage.getItem("shinpay-vendor-token")}`,
    "Content-Type": "application/json",
};

export const addAssignedDocument = createAsyncThunk(
    'assignedDocument/addAssignedDocument',
    async (assignedDocumentData, { rejectWithValue, dispatch }) => {
        try {
            const response = await axios.post(`${BaseUrl}/vendor/assignedDocuments`, assignedDocumentData, { headers: options });
            dispatch(fetchAssignedDocuments());
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateAssignedDocument = createAsyncThunk(
    'assignedDocument/updateAssignedDocument',
    async ({ id, assignedDocumentData } ,{ rejectWithValue, dispatch }) => {
        try {
            const response = await axios.post(`${BaseUrl}/vendor/assignedDocuments/${id}`, assignedDocumentData, { headers: options });
            dispatch(fetchAssignedDocuments());
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchAssignedDocuments = createAsyncThunk(
    'assignedDocument/fetchAssignedDocuments',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BaseUrl}/vendor/assignedDocuments`, { headers: options });
            console.log(response.data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const addEmployeeAssignedDocument = createAsyncThunk(
    'employeeAssignedDocument/addEmployeeAssignedDocument',
    async (employeeAssignedDocumentData, { rejectWithValue, dispatch }) => {
        try {
            const response = await axios.post(`${BaseUrl}/vendor/add-employee-assignedDocument`, employeeAssignedDocumentData, { headers: options });
            dispatch(fetchAssignedDocuments());
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

export const assignDocumentToMember = createAsyncThunk(
    'employeeAssignedDocument/assignDocumentToMember',
    async ({ employeeId, selectedIds }, { rejectWithValue, dispatch }) => {
        try {
            const options = {
                Authorization: `Bearer ${localStorage.getItem("shinpay-vendor-token")}`,
                "Content-Type": "application/json",
            };
            
            const response = await axios.post(`${BaseUrl}/vendor/assign-document`, { employeeId, selectedIds }, { headers: options });
            dispatch(fetchAssignedDocuments());   
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
export const deleteAssignedDocument = createAsyncThunk(
    'employeeAssignedDocument/deleteAssignedDocument',
    async (id, { rejectWithValue, dispatch }) => {
        try {
            const response = await axios.post(`${BaseUrl}/vendor/delete-assign-assignedDocument`,{id}, { headers: options });
            dispatch(fetchAssignedDocuments());  // Fetch updated employee assignedDocuments after assigning

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

export const updateEmployeeAssignedDocument = createAsyncThunk(
    'employeeAssignedDocument/updateAssignedDocument',
    async (formData, { rejectWithValue, dispatch }) => {
        try {
            const response = await axios.post(`${BaseUrl}/vendor/update-assignedDocument-steps`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem("shinpay-vendor-token")}`,
                },
            });

            dispatch(fetchAssignedDocuments());
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'An error occurred');
        }
    }
);

const assignedDocumentSlice = createSlice({
    name: 'assignedDocument',
    initialState: {
        assignedDocuments: [],
        employeeAssignedDocuments: [],
        status: 'idle',
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAssignedDocuments.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAssignedDocuments.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.assignedDocuments = action.payload;
            })
            .addCase(fetchAssignedDocuments.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(addAssignedDocument.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(addAssignedDocument.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // state.assignedDocuments.push(action.payload);
            })
            .addCase(addAssignedDocument.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(updateAssignedDocument.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateAssignedDocument.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // state.assignedDocuments.push(action.payload);
            })
            .addCase(updateAssignedDocument.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(addEmployeeAssignedDocument.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = null;
            })
            .addCase(addEmployeeAssignedDocument.fulfilled, (state, action) => {
                state.loading = false;  // Assuming it returns the added assignedDocument
            })
            .addCase(addEmployeeAssignedDocument.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ? action.payload.message : 'Failed to add assignedDocument';
            })
            .addCase(assignDocumentToMember.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(assignDocumentToMember.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(assignDocumentToMember.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ? action.payload.message : 'Failed to assign assignedDocument';
            })
            .addCase(updateEmployeeAssignedDocument.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateEmployeeAssignedDocument.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(updateEmployeeAssignedDocument.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ? action.payload.message : 'Failed to assign assignedDocument';
            });
    },
});

export default assignedDocumentSlice.reducer;
