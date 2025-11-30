import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import authService, {
  LoginCredentials,
  LoginResponse,
} from "../../services/authService";

interface User {
  id: string;
  email: string;
  firstName: string;
  phone?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: !!localStorage.getItem("token"),
  loading: false,
  error: null,
};

// Dummy credentials
const DUMMY_USER = {
  email: "admin@example.com",
  password: "password",
  userData: {
    id: "1",
    email: "test@demo.com",
    name: "Demo User",
    phone: "+1234567890",
  },
};

export const login = createAsyncThunk<
  LoginResponse, // return type on success
  LoginCredentials, // argument type
  { rejectValue: string } // rejection payload
>("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const result = await authService.login(credentials);
    return result;
  } catch (error: any) {
    const message =
      error?.response?.data?.message || error?.message || "Login failed";

    return rejectWithValue(message);
  }
});

export const googleLogin = createAsyncThunk<
  LoginResponse, // expect same return shape as login: { user, token }
  { idToken: string }, // argument: idToken from Google
  { rejectValue: string }
>("auth/googleLogin", async ({ idToken }, { rejectWithValue }) => {
  try {
    // Call your auth service for google login. Adjust if your service exposes a different function.
    const result = await authService.googleLogin(idToken);
    return result;
  } catch (error: any) {
    const message =
      error?.response?.data?.message || error?.message || "Google login failed";
    return rejectWithValue(message);
  }
});

export const register = createAsyncThunk(
  "auth/register",
  async (
    data: { email: string; password: string; name: string; phone?: string },
    { rejectWithValue }
  ) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      const token = "dummy-jwt-token-" + Date.now();
      const user = {
        id: Date.now().toString(),
        email: data.email,
        firstName: data.name,
        phone: data.phone,
      };
      return { user, token };
    } catch (error) {
      return rejectWithValue("Registration failed");
    }
  }
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (data: Partial<User>, { getState }) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    const state = getState() as { auth: AuthState };
    return { ...state.auth.user, ...data } as User;
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    setUser: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    },
    initializeAuth: (state) => {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      if (token && userStr) {
        state.token = token;
        state.user = JSON.parse(userStr);
        state.isAuthenticated = true;
      }
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
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Google Login (mirror the credential login flow)
      .addCase(googleLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        localStorage.setItem("user", JSON.stringify(action.payload));
      })
      .addCase(updateProfile.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { logout, setUser, initializeAuth } = authSlice.actions;
export default authSlice.reducer;
