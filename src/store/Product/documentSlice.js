import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BaseUrl = process.env.REACT_APP_BASH_URL;

// Async actions
export const fetchDocuments = createAsyncThunk('documents/fetchDocuments', async (params, { rejectWithValue }) => {
  try {
    const { search, date } = params;
    const options = {
      Authorization: `Bearer ${localStorage.getItem("shinpay-vendor-token")}`,
      "Content-Type": "application/json",
    };
    const response = await axios.get(`${BaseUrl}/vendor/documents?search=${search ?? ''}&date=${date ?? ''}`, { headers: options });

    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const uploadDocument = createAsyncThunk('documents/uploadDocument', async (formData, { rejectWithValue, dispatch }) => {
  try {
    
    const response = await axios.post(`${BaseUrl}/vendor/documents/upload`, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("shinpay-vendor-token")}`,
        'Content-Type': 'multipart/form-data',
      }
    });
    dispatch(fetchDocuments({}))
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const deleteDocument = createAsyncThunk('documents/deleteDocument', async (id, { rejectWithValue }) => {
  try {
    await axios.delete(`${BaseUrl}/vendor/documents/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("shinpay-vendor-token")}`,
        'Content-Type': 'multipart/form-data',
      }
    });
    return id;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Slice
const documentSlice = createSlice({
  name: 'documents',
  initialState: {
    documents: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // Fetch documents
    builder.addCase(fetchDocuments.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchDocuments.fulfilled, (state, action) => {
      state.loading = false;
      state.documents = action.payload;
    });
    builder.addCase(fetchDocuments.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
    // Upload document
    builder.addCase(uploadDocument.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(uploadDocument.fulfilled, (state, action) => {
      state.documents.push(action.payload);
      state.loading = false;

    });
    builder.addCase(uploadDocument.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
    
    builder.addCase(deleteDocument.pending, (state) => {
      state.loading = true;
    });
    // Delete document
    builder.addCase(deleteDocument.fulfilled, (state, action) => {
      state.loading = false;
      state.documents = state.documents.filter(file => file._id !== action.payload);
    });

    builder.addCase(deleteDocument.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export default documentSlice.reducer;
