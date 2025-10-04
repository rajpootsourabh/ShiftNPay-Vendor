import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BaseUrl = process.env.REACT_APP_BASH_URL;

const options = () => ({
  Authorization: `Bearer ${localStorage.getItem("shinpay-vendor-token")}`,
  "Content-Type": "application/json",
});

// Fetch available modules
export const fetchModules = createAsyncThunk(
  "modules/fetchModules",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BaseUrl}/vendor/subscription-plans`, {
        headers: options(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Create Stripe checkout session for selected modules
export const createStripeCheckoutSession = createAsyncThunk(
  "modules/createStripeCheckoutSession",
  async (selectedModuleCats, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${BaseUrl}/vendor/checkout-session`,
        selectedModuleCats,
        { headers: options() }
      );
      return res.data; // should include the Stripe checkout URL
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createTrialCheckoutSession = createAsyncThunk(
  "membership/createTrialCheckoutSession",
  async ({ moduleCats }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BaseUrl}/vendor/create-trial-checkout`, 
        {
        moduleCats,
      },
        { headers: options() }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.message || "Error creating trial session");
    }
  }
);


export const saveTransaction = createAsyncThunk(
  "modules/saveTransaction",
  async (sessionDetails, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${BaseUrl}/vendor/module/transaction`,
        { session: sessionDetails },
        { headers: options() }
      );
      return res.data; // should include the Stripe checkout URL
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchSession = createAsyncThunk(
  "modules/fetchSession",
  async (sessionId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BaseUrl}/vendor/session/${sessionId}`, {
        headers: options(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchPurchasedModules = createAsyncThunk(
  "modules/fetchPurchasedModules",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BaseUrl}/vendor/my-modules`, {
        headers: options(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const memberShipSlice = createSlice({
  name: "subscriptions",
  initialState: {
    modules: [],
    sessionDetails: null,
    loading: false,
    error: null,
    checkoutUrl: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchModules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchModules.fulfilled, (state, action) => {
        state.loading = false;
        state.modules = action.payload;
      })
      .addCase(fetchModules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createStripeCheckoutSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createStripeCheckoutSession.fulfilled, (state, action) => {
        state.loading = false;
        state.checkoutUrl = action.payload.checkoutUrl;
      })
      .addCase(createStripeCheckoutSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSession.fulfilled, (state, action) => {
        state.sessionDetails = action.payload;
        state.loading = false;
      })
      .addCase(fetchSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchPurchasedModules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPurchasedModules.fulfilled, (state, action) => {
        state.purchasedModules = action.payload.modules;
        state.loading = false;
      })
      .addCase(fetchPurchasedModules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default memberShipSlice.reducer;
