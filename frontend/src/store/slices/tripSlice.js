import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchTrips = createAsyncThunk('trips/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/trips', { params });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch trips');
  }
});

export const fetchTrip = createAsyncThunk('trips/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/trips/${id}`);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch trip details');
  }
});

export const createTrip = createAsyncThunk('trips/create', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/trips', data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create trip');
  }
});

export const updateTripStatus = createAsyncThunk('trips/updateStatus', async ({ id, status, remarks }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/trips/${id}/status`, { status, remarks });
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update trip status');
  }
});

export const updateTripLocation = createAsyncThunk('trips/updateLocation', async ({ id, coordinates, speed }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/trips/${id}/location`, { coordinates, speed });
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update trip location');
  }
});

export const uploadPOD = createAsyncThunk('trips/uploadPOD', async ({ id, formData }, { rejectWithValue }) => {
  try {
    const res = await api.post(`/trips/${id}/pod`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to upload proof of delivery');
  }
});

const tripSlice = createSlice({
  name: 'trips',
  initialState: {
    trips: [],
    selectedTrip: null,
    total: 0,
    loading: false,
    error: null,
  },
  reducers: {
    updateLiveLocation: (state, action) => {
      const { tripId, coordinates } = action.payload;
      const trip = state.trips.find(t => t._id === tripId);
      if (trip) {
        trip.currentLocation = { coordinates, updatedAt: new Date().toISOString() };
      }
      if (state.selectedTrip && state.selectedTrip._id === tripId) {
        state.selectedTrip.currentLocation = { coordinates, updatedAt: new Date().toISOString() };
      }
    },
    clearSelectedTrip: (state) => {
      state.selectedTrip = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrips.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTrips.fulfilled, (state, action) => {
        state.loading = false;
        state.trips = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchTrips.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchTrip.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTrip.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedTrip = action.payload;
      })
      .addCase(createTrip.fulfilled, (state, action) => {
        state.trips.unshift(action.payload);
      })
      .addCase(updateTripStatus.fulfilled, (state, action) => {
        const index = state.trips.findIndex(t => t._id === action.payload._id);
        if (index !== -1) state.trips[index] = action.payload;
        if (state.selectedTrip && state.selectedTrip._id === action.payload._id) {
          state.selectedTrip = action.payload;
        }
      })
      .addCase(uploadPOD.fulfilled, (state, action) => {
        if (state.selectedTrip && state.selectedTrip._id === action.payload._id) {
          state.selectedTrip = action.payload;
        }
      });
  },
});

export const { updateLiveLocation, clearSelectedTrip } = tripSlice.actions;
export default tripSlice.reducer;
