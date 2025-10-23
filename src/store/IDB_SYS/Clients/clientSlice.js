import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BaseUrl = process.env.REACT_APP_BASH_URL;

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("shinpay-vendor-token")}`,
  "Content-Type": "application/json",
});

export const fetchClientByVendor = createAsyncThunk(
  "client/fetchByVendor",
  async (_payload, { getState, rejectWithValue }) => {
    try {
      const { client } = getState();
      const { page, limit } = client.pagination;
      const {
        search,
        status,
        location,
        clientType,
        dateStart,
        dateEnd,
        dateField,
      } = client.filters;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(status && { status }),
        ...(location && { location }),
        ...(clientType && { clientType }),
        ...(dateStart && { dateStart }),
        ...(dateEnd && { dateEnd }),
        ...(dateField && { dateField }),
      }).toString();

      const res = await axios.get(`${BaseUrl}/vendor/client?${queryParams}`, {
        headers: getHeaders(),
      });

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchClientById = createAsyncThunk(
  "client/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BaseUrl}/vendor/client/single/${id}`, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createClient = createAsyncThunk(
  "client/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BaseUrl}/vendor/client`, data, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateClient = createAsyncThunk(
  "client/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${BaseUrl}/vendor/client/${id}`, data, {
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteClient = createAsyncThunk(
  "client/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${BaseUrl}/vendor/client/${id}`, {
        headers: getHeaders(),
      });
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const uploadClientAttachment = createAsyncThunk(
  "client/uploadAttachment",
  async ({ clientId, formData }, { rejectWithValue }) => {
    try {
      const headers = {
        Authorization: `Bearer ${localStorage.getItem("shinpay-vendor-token")}`,
      };

      const res = await axios.post(
        `${BaseUrl}/vendor/client/${clientId}/upload`,
        formData,
        { headers }
      );

      return { clientId, attachment: res.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteClientAttachment = createAsyncThunk(
  "client/deleteAttachment",
  async ({ clientId, attachmentId }, { rejectWithValue }) => {
    try {
      await axios.delete(
        `${BaseUrl}/vendor/client/${clientId}/attachment/${attachmentId}`,
        { headers: getHeaders() }
      );

      return { clientId, attachmentId };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const clientSlice = createSlice({
  name: "client",
  initialState: {
    clients: [],
    selectedClient: null,
    loading: false,
    error: null,
    pagination: {
      total: 0,
      page: 1,
      pages: 0,
      limit: 10,
    },
    filters: {
      search: "",
      status: "",
      location: "",
      clientType: "",
      dateStart: "",
      dateEnd: "",
      dateField: "createdAt",
    },
  },
  reducers: {
    setStatusFilter: (state, action) => {
      state.filters.status = action.payload;
      state.pagination.page = 1;
    },
    setLocationFilter: (state, action) => {
      state.filters.location = action.payload;
      state.pagination.page = 1;
    },
    setClientTypeFilter: (state, action) => {
      state.filters.clientType = action.payload;
      state.pagination.page = 1;
    },
    setDateFilter: (state, action) => {
      state.filters.dateStart = action.payload.start;
      state.filters.dateEnd = action.payload.end;
      state.pagination.page = 1;
    },
    setDateField: (state, action) => {
      state.filters.dateField = action.payload;
      state.pagination.page = 1;
    },
    clearAllFilters: (state) => {
      state.filters = {
        search: "",
        status: "",
        location: "",
        clientType: "",
        dateStart: "",
        dateEnd: "",
        dateField: "createdAt",
      };
      state.pagination.page = 1;
    },
    clearError: (state) => {
      state.error = null;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setLimit: (state, action) => {
      state.pagination.limit = action.payload;
    },
    setSearch: (state, action) => {
      state.filters.search = action.payload;
      state.pagination.page = 1;
    },
    clearSelectedClient: (state) => {
      state.selectedClient = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch clients
      .addCase(fetchClientByVendor.fulfilled, (state, action) => {
        state.clients = action.payload.clients;
        state.pagination = action.payload.pagination;
      })
      
      // File upload
      .addCase(uploadClientAttachment.pending, (state) => {
        state.loading = true;
      })
      .addCase(uploadClientAttachment.fulfilled, (state, action) => {
        state.loading = false;
        const { clientId, attachment } = action.payload;

        // Update selected client if it matches
        if (state.selectedClient && state.selectedClient._id === clientId) {
          if (!state.selectedClient.attachments) {
            state.selectedClient.attachments = [];
          }
          const existingIndex = state.selectedClient.attachments.findIndex(
            (att) =>
              att._id === attachment._id || att.fileName === attachment.fileName
          );
          if (existingIndex === -1) {
            state.selectedClient.attachments.push(attachment);
          } else {
            state.selectedClient.attachments[existingIndex] = attachment;
          }
        }

        // Update in clients list if present
        const clientIndex = state.clients.findIndex((c) => c._id === clientId);
        if (clientIndex !== -1) {
          if (!state.clients[clientIndex].attachments) {
            state.clients[clientIndex].attachments = [];
          }
          const existingIndex = state.clients[
            clientIndex
          ].attachments.findIndex(
            (att) =>
              att._id === attachment._id || att.fileName === attachment.fileName
          );
          if (existingIndex === -1) {
            state.clients[clientIndex].attachments.push(attachment);
          } else {
            state.clients[clientIndex].attachments[existingIndex] = attachment;
          }
        }
      })
      .addCase(uploadClientAttachment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete attachment
      .addCase(deleteClientAttachment.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteClientAttachment.fulfilled, (state, action) => {
        state.loading = false;
        const { clientId, attachmentId } = action.payload;

        // Remove from selected client
        if (state.selectedClient && state.selectedClient._id === clientId) {
          state.selectedClient.attachments =
            state.selectedClient.attachments.filter(
              (att) => att._id !== attachmentId
            );
        }

        // Remove from clients list
        const clientIndex = state.clients.findIndex((c) => c._id === clientId);
        if (clientIndex !== -1) {
          state.clients[clientIndex].attachments = state.clients[
            clientIndex
          ].attachments.filter((att) => att._id !== attachmentId);
        }
      })
      .addCase(deleteClientAttachment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Other CRUD operations
      .addCase(fetchClientById.fulfilled, (state, action) => {
        state.selectedClient = action.payload;
      })
      .addCase(createClient.fulfilled, (state, action) => {
        state.clients.unshift(action.payload);
        if (!state.selectedClient) {
          state.selectedClient = action.payload;
        }
      })
      .addCase(updateClient.fulfilled, (state, action) => {
        const index = state.clients.findIndex(
          (c) => c._id === action.payload._id
        );
        if (index !== -1) state.clients[index] = action.payload;

        if (
          state.selectedClient &&
          state.selectedClient._id === action.payload._id
        ) {
          state.selectedClient = action.payload;
        }
      })
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.clients = state.clients.filter((c) => c._id !== action.payload);
        if (
          state.selectedClient &&
          state.selectedClient._id === action.payload
        ) {
          state.selectedClient = null;
        }
      })
      
      // Generic error handling for all async thunks
      .addMatcher(
        (action) => action.type.startsWith("client/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload || action.error.message;
        }
      );
  },
});

export const {
  setStatusFilter,
  setLocationFilter,
  setClientTypeFilter,
  setDateFilter,
  setDateField,
  clearAllFilters,
  clearError,
  setPage,
  setLimit,
  setSearch,
  clearSelectedClient,
} = clientSlice.actions;

export default clientSlice.reducer;