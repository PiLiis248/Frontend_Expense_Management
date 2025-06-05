"use client"

import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useAuth } from "../../../constants/AuthContext" 
import InputField from "../../common/InputField"
import Button from "../../common/Button"
import Toast from "../../common/Toast"
import {
  fetchUserProfile,
  updateUserProfile,
  changePassword,
  setActiveTab,
  resetProfileTab,
  resetPasswordTab,
  updateProfileData,
  updatePasswordData,
  removeToast
} from "../../../redux/profile/profileSlice"
import { useValidation } from "../../../hooks/useAuthValidation"
import "../../../assets/ProfilePage.css"

const ProfilePage = () => {
  const dispatch = useDispatch()
  const { updateUser } = useAuth() // Lấy updateUser method
  
  // Redux state
  const {
    // eslint-disable-next-line no-unused-vars
    originalProfileData,
    currentProfileData,
    passwordData,
    profileErrors,
    passwordErrors,
    isLoadingUserData,
    isProfileLoading,
    isPasswordLoading,
    toasts,
    activeTab
  } = useSelector(state => state.profile)

  // Validation hook
  const {
    validateProfileForm,
    validatePasswordForm,
    validateProfileField,
    validatePasswordField,
    clearFieldError
  } = useValidation()

  // Fetch user profile data when component mounts
  useEffect(() => {
    dispatch(fetchUserProfile())
  }, [dispatch])

  // Handle tab changes with reset functionality
  const handleTabChange = (newTab) => {
    if (newTab !== activeTab) {
      // Reset the tab that we're leaving
      if (activeTab === "profile") {
        dispatch(resetProfileTab())
      } else if (activeTab === "password") {
        dispatch(resetPasswordTab())
      }
      
      dispatch(setActiveTab(newTab))
    }
  }

  // Handle profile form input changes
  const handleProfileChange = async (e) => {
    const { name, value } = e.target
    
    dispatch(updateProfileData({ name, value }))

    // Clear specific field error when user starts typing
    if (profileErrors[name]) {
      clearFieldError(name, 'profile')
    }

    // Real-time validation for current field
    const newProfileData = { ...currentProfileData, [name]: value }
    await validateProfileField(name, value, newProfileData)
  }

  // Handle password form input changes
  const handlePasswordChange = async (e) => {
    const { name, value } = e.target
    
    dispatch(updatePasswordData({ name, value }))

    // Clear specific field error when user starts typing
    if (passwordErrors[name]) {
      clearFieldError(name, 'password')
    }

    // Real-time validation for current field
    const newPasswordData = { ...passwordData, [name]: value }
    const { isValid } = await validatePasswordField(name, value, newPasswordData)
    
    // Special handling for new_password - check confirm_password too
    if (name === 'new_password' && passwordData.confirm_password && isValid) {
      await validatePasswordField('confirm_password', passwordData.confirm_password, newPasswordData)
    }
  }

  // Handle profile form submission
  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form data
    const { isValid } = await validateProfileForm(currentProfileData)
    
    if (!isValid) {
      return
    }

    try {
      // Dispatch update action
      const resultAction = await dispatch(updateUserProfile(currentProfileData))
      
      // Nếu update thành công, cập nhật AuthContext
      if (updateUserProfile.fulfilled.match(resultAction)) {
        updateUser({
          fullName: currentProfileData.full_name,
          email: currentProfileData.email,
          phoneNumber: currentProfileData.phone_number
        })
      }
    } catch (error) {
      console.error('Profile update error:', error)
    }
  }

  // Handle password form submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form data
    const { isValid } = await validatePasswordForm(passwordData)
    
    if (!isValid) {
      return
    }

    dispatch(changePassword(passwordData))
  }

  // Check if profile form has errors
  const hasProfileErrors = Object.keys(profileErrors).some(key => profileErrors[key])
  
  // Check if password form has errors
  const hasPasswordErrors = Object.keys(passwordErrors).some(key => passwordErrors[key])

  return (
    <div className="profile-page">
      <h1 className="page-title">Thông tin tài khoản</h1>

      <div className="profile-container">
        <div className="profile-tabs">
          <button
            className={`profile-tab ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => handleTabChange("profile")}
          >
            <i className="fas fa-user"></i>
            Thông tin cá nhân
          </button>
          <button
            className={`profile-tab ${activeTab === "password" ? "active" : ""}`}
            onClick={() => handleTabChange("password")}
          >
            <i className="fas fa-lock"></i>
            Thay đổi mật khẩu
          </button>
        </div>

        <div className="profile-content">
          {activeTab === "profile" && (
            <div className="profile-form-container">
              {isLoadingUserData ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Đang tải thông tin tài khoản...</p>
                </div>
              ) : (
                <form className="profile-form" onSubmit={handleProfileSubmit}>
                  <InputField
                    label="Họ và tên"
                    type="text"
                    name="full_name"
                    value={currentProfileData.full_name}
                    onChange={handleProfileChange}
                    placeholder="Nhập họ và tên"
                    className="form-control"
                    error={profileErrors.full_name}
                    required
                  />

                  <InputField
                    label="Email"
                    type="email"
                    name="email"
                    value={currentProfileData.email}
                    onChange={handleProfileChange}
                    placeholder="Nhập địa chỉ email"
                    className="form-control"
                    error={profileErrors.email}
                    required
                  />

                  {/* Phone number as display field */}
                  <div className="form-group">
                    <label htmlFor="phone_display" className="form-label">
                      Số điện thoại
                    </label>
                    <div className="phone-display">
                      <span className="phone-value">
                        {currentProfileData.phone_number || "Chưa cập nhật"}
                      </span>
                      <span className="phone-note">
                        (Không thể thay đổi)
                      </span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isProfileLoading || hasProfileErrors}
                  >
                    {isProfileLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Đang cập nhật...
                      </>
                    ) : (
                      "Cập nhật thông tin"
                    )}
                  </Button>
                </form>
              )}
            </div>
          )}

          {activeTab === "password" && (
            <div className="password-form-container">
              <form className="password-form" onSubmit={handlePasswordSubmit}>
                <InputField
                  label="Mật khẩu hiện tại"
                  type="password"
                  name="old_password"
                  value={passwordData.old_password}
                  onChange={handlePasswordChange}
                  placeholder="Nhập mật khẩu hiện tại"
                  className="form-control"
                  error={passwordErrors.old_password}
                  required
                />

                <InputField
                  label="Mật khẩu mới"
                  type="password"
                  name="new_password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  placeholder="Nhập mật khẩu mới (8-80 ký tự)"
                  className="form-control"
                  error={passwordErrors.new_password}
                  required
                />

                <InputField
                  label="Xác nhận mật khẩu mới"
                  type="password"
                  name="confirm_password"
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
                  placeholder="Nhập lại mật khẩu mới"
                  className="form-control"
                  error={passwordErrors.confirm_password}
                  required
                />

                <Button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isPasswordLoading || hasPasswordErrors}
                >
                  {isPasswordLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Đang thay đổi...
                    </>
                  ) : (
                    "Thay đổi mật khẩu"
                  )}
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Toast notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={3000}
            onClose={() => dispatch(removeToast(toast.id))}
          />
        ))}
      </div>
    </div>
  )
}

export default ProfilePage