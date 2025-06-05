// src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "../../services/authService";

// Async thunks
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ phone, password, rememberMe, silent = false }, { rejectWithValue }) => {
    try {
      const response = await authService.login(phone, password, rememberMe);

      if (!response || !response.token || !response.user) {
        throw new Error("Invalid response from server!");
      }
      
      // Save credentials if remember me is checked
      if (rememberMe) {
        localStorage.setItem("rememberedLogin", JSON.stringify({
          phone,
          password
        }));
      } else {
        localStorage.removeItem("rememberedLogin");
      }
      
      return { ...response, silent };
    } catch (error) {
      // If auto login fails, remove remembered credentials
      if (silent) {
        localStorage.removeItem("rememberedLogin");
      }
      return rejectWithValue(error.message || "Đăng nhập thất bại");
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await authService.register(payload);
      return response;
    } catch (error) {
      const errorData = error.response?.data;
      const errorMessage = errorData
        ? Object.values(errorData).join(" | ")
        : "Something went wrong during registration.";
      return rejectWithValue(errorMessage);
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (email, { rejectWithValue }) => {
    try {
      await authService.requestResetPassword(email);
      return { success: true };
    } catch (error) {
      return rejectWithValue(error.message || "Có lỗi xảy ra khi gửi email");
    }
  }
);

export const loadRememberedCredentials = createAsyncThunk(
  "auth/loadRememberedCredentials",
  async (_, { rejectWithValue }) => {
    try {
      const rememberedCredentials = localStorage.getItem("rememberedLogin");
      if (rememberedCredentials) {
        const { phone, password } = JSON.parse(rememberedCredentials);
        return { phone: phone || "", password: password || "" };
      }
      return null;
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      localStorage.removeItem("rememberedLogin");
      return rejectWithValue("Error loading remembered credentials");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    // User data
    user: null,
    isAuthenticated: false,
    isLoading: true, // Add isLoading to initial state
    
    // Login form data
    formData: {
      phone: "",
      password: "",
      rememberMe: false,
    },
    
    // Login state
    loginLoading: false,
    loginError: null,
    
    // Reset password state
    resetEmail: "",
    resetLoading: false,
    resetError: null,
    resetStatus: "", // "", "success", "error"
    resetCountdown: 0,
    
    // Modal state
    showForgotModal: false,
    
    // Toast state
    toast: {
      visible: false,
      message: "",
      type: "",
    },
    
    // Form validation errors
    formErrors: {
      phone: "",
      password: "",
      email: "",
    },
  },
  reducers: {
    // Form actions
    updateFormData: (state, action) => {
      const { name, value } = action.payload;
      state.formData[name] = value;
      
      // Clear error when user types
      if (state.formErrors[name]) {
        state.formErrors[name] = "";
      }
    },
    
    setFormErrors: (state, action) => {
      state.formErrors = { ...state.formErrors, ...action.payload };
    },
    
    clearFormErrors: (state) => {
      state.formErrors = {
        phone: "",
        password: "",
        email: "",
      };
    },
    
    // Reset password modal actions
    setShowForgotModal: (state, action) => {
      state.showForgotModal = action.payload;
      if (!action.payload) {
        // Reset modal state when closing
        state.resetEmail = "";
        state.resetError = null;
        state.resetStatus = "";
        state.resetCountdown = 0;
        state.formErrors.email = "";
      }
    },
    
    setResetEmail: (state, action) => {
      state.resetEmail = action.payload;
      state.formErrors.email = "";
    },
    
    setResetStatus: (state, action) => {
      state.resetStatus = action.payload;
    },
    
    setResetCountdown: (state, action) => {
      state.resetCountdown = action.payload;
    },
    
    decrementCountdown: (state) => {
      if (state.resetCountdown > 0) {
        state.resetCountdown -= 1;
      }
    },
    
    resetPasswordReset: (state) => {
      state.resetStatus = "";
      state.resetCountdown = 0;
      state.resetError = null;
    },
    
    // Toast actions
    showToast: (state, action) => {
      state.toast = {
        visible: true,
        message: action.payload.message,
        type: action.payload.type,
      };
    },
    
    hideToast: (state) => {
      state.toast.visible = false;
    },
    
    // Auth actions
    setUser: (state, action) => {
      state.user = action.payload.user;
      state.isAuthenticated = action.payload.isAuthenticated;
    },
    
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      
      // Reset form data when logout
      state.formData = {
        phone: "",
        password: "",
        rememberMe: false,
      };
      
      // Clear all errors
      state.formErrors = {
        phone: "",
        password: "",
        email: "",
      };
      
      // Reset all other states
      state.loginLoading = false;
      state.loginError = null;
      state.resetEmail = "";
      state.resetLoading = false;
      state.resetError = null;
      state.resetStatus = "";
      state.resetCountdown = 0;
      state.showForgotModal = false;
      state.toast = {
        visible: false,
        message: "",
        type: "",
      };
      
      localStorage.removeItem("rememberedLogin");
    },
    resetFormData: (state) => {
      // Reset form data về trạng thái ban đầu
      state.formData = {
        phone: "",
        password: "",
        rememberMe: false,
      };
      
      // Clear tất cả form errors
      state.formErrors = {
        phone: "",
        password: "",
        email: "",
      };
      
      // Reset các state liên quan đến reset password
      state.resetEmail = "";
      state.resetError = null;
      state.resetStatus = "";
      state.resetCountdown = 0;
      
      // Ẩn toast nếu đang hiển thị
      state.toast = {
        visible: false,
        message: "",
        type: "",
      };
      
      // Đảm bảo modal forgot password bị đóng
      state.showForgotModal = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loginLoading = true;
        state.loginError = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loginLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.isLoading = false;
        
        // Only show toast for non-silent logins
        if (!action.payload.silent) {
          state.toast = {
            visible: true,
            message: "Đăng nhập thành công!",
            type: "success",
          };
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loginLoading = false;
        state.loginError = action.payload;
        state.toast = {
          visible: true,
          message: action.payload,
          type: "error",
        };
      })
      
      // Reset password cases
      .addCase(resetPassword.pending, (state) => {
        state.resetLoading = true;
        state.resetError = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.resetLoading = false;
        state.resetStatus = "success";
        state.resetCountdown = 60;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.resetLoading = false;
        state.resetError = action.payload;
        state.resetStatus = "error";
      })
      
      // Register user cases
      .addCase(registerUser.pending, (state) => {
        state.loginLoading = true;
        state.loginError = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loginLoading = false;
        state.toast = {
          visible: true,
          message: "Đăng ký thành công!",
          type: "success",
        };
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loginLoading = false;
        state.loginError = action.payload;
        state.toast = {
          visible: true,
          message: action.payload,
          type: "error",
        };
      })
      
      // Load remembered credentials cases
      .addCase(loadRememberedCredentials.fulfilled, (state, action) => {
        if (action.payload) {
          state.formData = {
            ...state.formData,
            phone: action.payload.phone,
            password: action.payload.password,
            rememberMe: true,
          };
        }
      });
  },
});

export const {
  updateFormData,
  setFormErrors,
  clearFormErrors,
  resetFormData,
  setShowForgotModal,
  setResetEmail,
  setResetStatus,
  setResetCountdown,
  decrementCountdown,
  resetPasswordReset,
  showToast,
  hideToast,
  setUser,
  setLoading,
  logout,
} = authSlice.actions;

export default authSlice.reducer;