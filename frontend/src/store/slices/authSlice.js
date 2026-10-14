import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

let initialUser = null;
try {
  const userStorage = localStorage.getItem('tracely_user');
  if (userStorage && userStorage !== 'undefined' && userStorage !== 'null') {
    initialUser = JSON.parse(userStorage);
  }
} catch (e) {
  localStorage.removeItem('tracely_user');
}

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login', credentials);
    const authData = res.data.user
      ? { ...res.data.user, token: res.data.token }
      : (res.data.data || res.data);
    localStorage.setItem('tracely_user', JSON.stringify(authData));
    return authData;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed. Please check credentials.');
  }
});

export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/register', userData);
    const authData = res.data.user
      ? { ...res.data.user, token: res.data.token }
      : (res.data.data || res.data);
    localStorage.setItem('tracely_user', JSON.stringify(authData));
    return authData;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed.');
  }
});

export const getMe = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/auth/me');
    const existing = JSON.parse(localStorage.getItem('tracely_user') || '{}');
    const userPayload = res.data.user || res.data.data || res.data;
    const updated = { ...existing, ...userPayload };
    localStorage.setItem('tracely_user', JSON.stringify(updated));
    return updated;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch user');
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (data, { rejectWithValue }) => {
  try {
    const res = await api.put('/auth/profile', data);
    const existing = JSON.parse(localStorage.getItem('tracely_user') || '{}');
    const userPayload = res.data.user || res.data.data || res.data;
    const updated = { ...existing, ...userPayload };
    localStorage.setItem('tracely_user', JSON.stringify(updated));
    return updated;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update profile');
  }
});

export const updatePassword = createAsyncThunk('auth/updatePassword', async (passwords, { rejectWithValue }) => {
  try {
    const res = await api.put('/auth/password', passwords);
    return res.data.message;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update password');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: initialUser,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem('tracely_user');
      state.user = null;
      state.loading = false;
      state.error = null;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // GetMe
      .addCase(getMe.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      // Profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
