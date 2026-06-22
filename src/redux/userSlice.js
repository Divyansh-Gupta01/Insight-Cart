import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api.js';

const savedUser = JSON.parse(localStorage.getItem('ic_user') || 'null');

/**
 * Login thunk — replace endpoint with your real auth API.
 * Falls back to a mocked success so the UI is demoable without a backend.
 */
export const loginUser = createAsyncThunk('user/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    // Example real call:
    // const { data } = await api.post('/auth/login', { email, password });
    // Mocked response for demo purposes:
    await new Promise((res) => setTimeout(res, 600));
    if (!email || !password) throw new Error('Email and password are required.');
    const data = {
      token: 'demo-token-' + Date.now(),
      user: { name: email.split('@')[0], email },
    };
    localStorage.setItem('ic_token', data.token);
    localStorage.setItem('ic_user', JSON.stringify(data.user));
    return data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const registerUser = createAsyncThunk(
  'user/register',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      await new Promise((res) => setTimeout(res, 600));
      if (!name || !email || !password) throw new Error('All fields are required.');
      const data = { token: 'demo-token-' + Date.now(), user: { name, email } };
      localStorage.setItem('ic_token', data.token);
      localStorage.setItem('ic_user', JSON.stringify(data.user));
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    current: savedUser,
    status: 'idle', // idle | loading | succeeded | failed
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.current = null;
      localStorage.removeItem('ic_token');
      localStorage.removeItem('ic_user');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.current = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.current = action.payload.user;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { logout } = userSlice.actions;
export const selectCurrentUser = (state) => state.user.current;
export const selectUserStatus = (state) => state.user.status;
export const selectUserError = (state) => state.user.error;
export default userSlice.reducer;
