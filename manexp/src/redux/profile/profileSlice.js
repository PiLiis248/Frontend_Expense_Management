// store/profile/profileSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { profileService } from '../../services/profileService'
// Import setUser action từ authSlice
import { setUser } from '../authen/authSlice'

// Async thunks
export const fetchUserProfile = createAsyncThunk(
  'profile/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const userData = await profileService.getUserProfile()
      return {
        full_name: userData.fullName || "",
        email: userData.email || "",
        phone_number: userData.phoneNumber || "",
      }
    } catch (error) {
      return rejectWithValue({
        message: "Không thể tải thông tin tài khoản. Vui lòng thử lại.",
        status: error.response?.status
      })
    }
  }
)

export const updateUserProfile = createAsyncThunk(
  'profile/updateUserProfile',
  async (profileData, { rejectWithValue, dispatch, getState }) => {
    try {
      await profileService.updateUserProfile({
        fullName: profileData.full_name,
        email: profileData.email,
        phoneNumber: profileData.phone_number
      })
      
      // Cập nhật user data trong auth state
      const currentUser = getState().auth.user
      if (currentUser) {
        dispatch(setUser({
          user: {
            ...currentUser,
            fullName: profileData.full_name,
            email: profileData.email,
            phoneNumber: profileData.phone_number
          },
          isAuthenticated: true
        }))
      }
      
      return profileData
    } catch (error) {
      let message = "Cập nhật thông tin thất bại. Vui lòng thử lại."
      
      if (error.response) {
        switch (error.response.status) {
          case 400:
            message = "Thông tin không hợp lệ. Vui lòng kiểm tra lại."
            break
          case 401:
            message = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
            break
          case 404:
            message = "Không tìm thấy tài khoản người dùng."
            break
        }
      } else {
        message = "Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại."
      }
      
      return rejectWithValue({
        message,
        status: error.response?.status
      })
    }
  }
)

export const changePassword = createAsyncThunk(
  'profile/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      await profileService.changePassword(passwordData)
      return true
    } catch (error) {
      let message = "Thay đổi mật khẩu thất bại. Vui lòng thử lại."
      
      if (error.response) {
        switch (error.response.status) {
          case 400:
            message = "Mật khẩu hiện tại không chính xác hoặc thông tin không hợp lệ."
            break
          case 401:
            message = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
            break
          case 404:
            message = "Không tìm thấy tài khoản người dùng."
            break
        }
      }
      
      return rejectWithValue({
        message,
        status: error.response?.status
      })
    }
  }
)

const initialState = {
  // Profile data
  originalProfileData: {
    full_name: "",
    email: "",
    phone_number: "",
  },
  currentProfileData: {
    full_name: "",
    email: "",
    phone_number: "",
  },
  
  // Password data
  passwordData: {
    old_password: "",
    new_password: "",
    confirm_password: "",
  },
  
  // Validation errors
  profileErrors: {},
  passwordErrors: {},
  
  // Loading states
  isLoadingUserData: false,
  isProfileLoading: false,
  isPasswordLoading: false,
  
  // Toast messages
  toasts: [],
  
  // Active tab
  activeTab: "profile"
}

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    // Tab management
    setActiveTab: (state, action) => {
      state.activeTab = action.payload
    },
    
    // Reset tabs when switching
    resetProfileTab: (state) => {
      state.currentProfileData = { ...state.originalProfileData }
      state.profileErrors = {}
    },
    
    resetPasswordTab: (state) => {
      state.passwordData = {
        old_password: "",
        new_password: "",
        confirm_password: "",
      }
      state.passwordErrors = {}
    },
    
    // Form data updates
    updateProfileData: (state, action) => {
      const { name, value } = action.payload
      state.currentProfileData[name] = value
    },
    
    updatePasswordData: (state, action) => {
      const { name, value } = action.payload
      state.passwordData[name] = value
    },
    
    // Validation errors
    setProfileErrors: (state, action) => {
      state.profileErrors = action.payload
    },
    
    setPasswordErrors: (state, action) => {
      state.passwordErrors = action.payload
    },
    
    clearFieldError: (state, action) => {
      const { field, formType } = action.payload
      if (formType === 'profile') {
        delete state.profileErrors[field]
      } else if (formType === 'password') {
        delete state.passwordErrors[field]
      }
    },
    
    // Toast management
    addToast: (state, action) => {
      const { message, type } = action.payload
      const id = Date.now()
      state.toasts.push({ id, message, type })
    },
    
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload)
    },
  },
  
  extraReducers: (builder) => {
    builder
      // Fetch user profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoadingUserData = true
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoadingUserData = false
        state.originalProfileData = action.payload
        state.currentProfileData = { ...action.payload }
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoadingUserData = false
        const id = Date.now()
        state.toasts.push({
          id,
          message: action.payload.message,
          type: "error"
        })
      })
      
      // Update user profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isProfileLoading = true
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isProfileLoading = false
        state.originalProfileData = action.payload
        state.currentProfileData = { ...action.payload }
        const id = Date.now()
        state.toasts.push({
          id,
          message: "Thông tin tài khoản đã được cập nhật thành công.",
          type: "success"
        })
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isProfileLoading = false
        const id = Date.now()
        state.toasts.push({
          id,
          message: action.payload.message,
          type: "error"
        })
      })
      
      // Change password
      .addCase(changePassword.pending, (state) => {
        state.isPasswordLoading = true
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isPasswordLoading = false
        state.passwordData = {
          old_password: "",
          new_password: "",
          confirm_password: "",
        }
        state.passwordErrors = {}
        const id = Date.now()
        state.toasts.push({
          id,
          message: "Mật khẩu đã được thay đổi thành công.",
          type: "success"
        })
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isPasswordLoading = false
        const id = Date.now()
        state.toasts.push({
          id,
          message: action.payload.message,
          type: "error"
        })
      })
  }
})

export const {
  setActiveTab,
  resetProfileTab,
  resetPasswordTab,
  updateProfileData,
  updatePasswordData,
  setProfileErrors,
  setPasswordErrors,
  clearFieldError,
  addToast,
  removeToast
} = profileSlice.actions

export default profileSlice.reducer