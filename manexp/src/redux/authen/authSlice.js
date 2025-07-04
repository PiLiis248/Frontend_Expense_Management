import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "../../services/authService";

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ phone, password, rememberMe, silent = false }, { rejectWithValue }) => {
    try {
      const response = await authService.login(phone, password, rememberMe);

      if (!response || !response.token || !response.user) {
        throw new Error("Invalid response from server!");
      }
      
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
    user: null,
    isAuthenticated: false,
    
    formData: {
      phone: "",
      password: "",
      rememberMe: false,
    },
    
    loginLoading: false,
    loginError: null,
    
    resetEmail: "",
    resetLoading: false,
    resetError: null,
    resetCountdown: 0,
    
    showForgotModal: false,
    
    toast: {
      visible: false,
      message: "",
      type: "",
    },
    
    formErrors: {
      phone: "",
      password: "",
      email: "",
    },
  },
  reducers: {
    updateFormData: (state, action) => {
      const { name, value } = action.payload;
      state.formData[name] = value;
      
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
    
    setShowForgotModal: (state, action) => {
      state.showForgotModal = action.payload;
      if (!action.payload) {
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
      
      state.formData = {
        phone: "",
        password: "",
        rememberMe: false,
      };
      
      state.formErrors = {
        phone: "",
        password: "",
        email: "",
      };
      
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
      state.formData = {
        phone: "",
        password: "",
        rememberMe: false,
      };
      
      state.formErrors = {
        phone: "",
        password: "",
        email: "",
      };
      
      state.resetEmail = "";
      state.resetError = null;
      state.resetStatus = "";
      state.resetCountdown = 0;
      
      state.toast = {
        visible: false,
        message: "",
        type: "",
      };
      
      state.showForgotModal = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loginLoading = true;
        state.loginError = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loginLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.isLoading = false;
        
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