import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchVehicles = createAsyncThunk('vehicles/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/vehicles', { params });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch vehicles');
  }
});

export const fetchAvailableVehicles = createAsyncThunk('vehicles/fetchAvailable', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/vehicles/available');
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch available vehicles');
  }
});

export const createVehicle = createAsyncThunk('vehicles/create', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/vehicles', data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create vehicle');
  }
});

export const updateVehicle = createAsyncThunk('vehicles/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/vehicles/${id}`, data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update vehicle');
  }
});

export const deleteVehicle = createAsyncThunk('vehicles/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/vehicles/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete vehicle');
  }
});

const vehicleSlice = createSlice({
  name: 'vehicles',
  initialState: {
    vehicles: [],
    availableVehicles: [],
    total: 0,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVehicles.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicles = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAvailableVehicles.fulfilled, (state, action) => {
        state.availableVehicles = action.payload;
      })
      .addCase(createVehicle.fulfilled, (state, action) => {
        state.vehicles.unshift(action.payload);
      })
      .addCase(updateVehicle.fulfilled, (state, action) => {
        const index = state.vehicles.findIndex(v => v._id === action.payload._id);
        if (index !== -1) state.vehicles[index] = action.payload;
      })
      .addCase(deleteVehicle.fulfilled, (state, action) => {
        state.vehicles = state.vehicles.filter(v => v._id !== action.payload);
      });
  },
});

export default vehicleSlice.reducer;
