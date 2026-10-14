import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchDashboardStats = createAsyncThunk('reports/fetchDashboard', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/reports/dashboard');
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch dashboard stats');
  }
});

export const fetchAnalytics = createAsyncThunk('reports/fetchAnalytics', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/reports/analytics', { params });
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch analytics');
  }
});

const reportSlice = createSlice({
  name: 'reports',
  initialState: {
    dashboard: null,
    analytics: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.analytics = action.payload;
      });
  },
});

export default reportSlice.reducer;
