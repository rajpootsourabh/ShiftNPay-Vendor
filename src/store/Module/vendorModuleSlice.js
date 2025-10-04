// store/Module/vendorModuleSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchVendorModules = createAsyncThunk(
  "vendorModules/fetchVendorModules",
  async () => {
    const res = await axios.get("/api/vendor/modules");
    return res.data;
  }
);

export const fetchAllModules = createAsyncThunk(
  "vendorModules/fetchAllModules",
  async () => {
    const res = await axios.get("/api/modules");
    return res.data;
  }
);

export const createCheckoutSession = createAsyncThunk(
  "vendorModules/createCheckoutSession",
  async (cat) => {
    const res = await axios.post("/api/vendor/create-checkout-session", { cat });
    window.location.href = res.data.url; // Redirect to Stripe Checkout
  }
);

const vendorModuleSlice = createSlice({
  name: "vendorModules",
  initialState: {
    allModules: [],
    vendorModules: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVendorModules.fulfilled, (state, action) => {
        state.vendorModules = action.payload;
      })
      .addCase(fetchAllModules.fulfilled, (state, action) => {
        state.allModules = action.payload;
      });
  },
});

export default vendorModuleSlice.reducer;
