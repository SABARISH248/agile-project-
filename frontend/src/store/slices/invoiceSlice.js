import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchInvoices = createAsyncThunk('invoices/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/invoices', { params });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch invoices');
  }
});

export const fetchInvoice = createAsyncThunk('invoices/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/invoices/${id}`);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch invoice');
  }
});

export const updatePaymentStatus = createAsyncThunk('invoices/updatePayment', async ({ id, paymentStatus, paymentMethod, paymentReference }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/invoices/${id}/payment`, { paymentStatus, paymentMethod, paymentReference });
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update payment status');
  }
});

const invoiceSlice = createSlice({
  name: 'invoices',
  initialState: {
    invoices: [],
    selectedInvoice: null,
    total: 0,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchInvoice.fulfilled, (state, action) => {
        state.selectedInvoice = action.payload;
      })
      .addCase(updatePaymentStatus.fulfilled, (state, action) => {
        const index = state.invoices.findIndex(i => i._id === action.payload._id);
        if (index !== -1) state.invoices[index] = action.payload;
      });
  },
});

export default invoiceSlice.reducer;
