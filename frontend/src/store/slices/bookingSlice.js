import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchBookings = createAsyncThunk('bookings/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/bookings', { params });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch bookings');
  }
});

export const fetchBooking = createAsyncThunk('bookings/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/bookings/${id}`);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch booking');
  }
});

export const createBooking = createAsyncThunk('bookings/create', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/bookings', data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create booking');
  }
});

export const updateBooking = createAsyncThunk('bookings/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/bookings/${id}`, data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update booking');
  }
});

export const cancelBooking = createAsyncThunk('bookings/cancel', async ({ id, reason }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/bookings/${id}/cancel`, { cancellationReason: reason });
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to cancel booking');
  }
});

export const calculateRate = createAsyncThunk('bookings/calculateRate', async (payload, { rejectWithValue }) => {
  try {
    const res = await api.post('/bookings/calculate-rate', payload);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to calculate rate');
  }
});

const bookingSlice = createSlice({
  name: 'bookings',
  initialState: {
    bookings: [],
    selectedBooking: null,
    rateEstimate: null,
    total: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearRateEstimate: (state) => {
      state.rateEstimate = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchBooking.fulfilled, (state, action) => {
        state.selectedBooking = action.payload;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.bookings.unshift(action.payload);
      })
      .addCase(updateBooking.fulfilled, (state, action) => {
        const index = state.bookings.findIndex(b => b._id === action.payload._id);
        if (index !== -1) state.bookings[index] = action.payload;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        const index = state.bookings.findIndex(b => b._id === action.payload._id);
        if (index !== -1) state.bookings[index] = action.payload;
      })
      .addCase(calculateRate.fulfilled, (state, action) => {
        state.rateEstimate = action.payload;
      });
  },
});

export const { clearRateEstimate } = bookingSlice.actions;
export default bookingSlice.reducer;
