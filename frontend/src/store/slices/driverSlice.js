import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchDrivers = createAsyncThunk('drivers/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/drivers', { params });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch drivers');
  }
});

export const fetchAvailableDrivers = createAsyncThunk('drivers/fetchAvailable', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/drivers/available');
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch available drivers');
  }
});

export const createDriver = createAsyncThunk('drivers/create', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/drivers', data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create driver');
  }
});

export const updateDriver = createAsyncThunk('drivers/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/drivers/${id}`, data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update driver');
  }
});

export const deleteDriver = createAsyncThunk('drivers/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/drivers/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete driver');
  }
});

const driverSlice = createSlice({
  name: 'drivers',
  initialState: {
    drivers: [],
    availableDrivers: [],
    total: 0,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDrivers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDrivers.fulfilled, (state, action) => {
        state.loading = false;
        state.drivers = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchDrivers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAvailableDrivers.fulfilled, (state, action) => {
        state.availableDrivers = action.payload;
      })
      .addCase(createDriver.fulfilled, (state, action) => {
        state.drivers.unshift(action.payload);
      })
      .addCase(updateDriver.fulfilled, (state, action) => {
        const index = state.drivers.findIndex(d => d._id === action.payload._id);
        if (index !== -1) state.drivers[index] = action.payload;
      })
      .addCase(deleteDriver.fulfilled, (state, action) => {
        state.drivers = state.drivers.filter(d => d._id !== action.payload);
      });
  },
});

export default driverSlice.reducer;
