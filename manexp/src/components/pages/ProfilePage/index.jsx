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
  updateNoticeSettings,
  changePassword,
  setActiveTab,
  resetProfileTab,
  resetPasswordTab,
  updateProfileData,
  updatePasswordData,
  toggleNotice,
  removeToast,
} from "../../../redux/profile/profileSlice"
import { useValidation } from "../../../hooks/useAuthValidation"
import "../../../assets/ProfilePage.css"

const ProfilePage = () => {
  const dispatch = useDispatch()
  const { updateUser, user: authUser } = useAuth() 

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
    isNoticeLoading,
    toasts,
    activeTab,
  } = useSelector((state) => state.profile)

  const { validateProfileForm, validatePasswordForm, validateProfileField, validatePasswordField, clearFieldError } =
    useValidation()

  useEffect(() => {
    dispatch(fetchUserProfile())
  }, [dispatch])

  const handleTabChange = (newTab) => {
    if (newTab !== activeTab) {
      if (activeTab === "profile") {
        dispatch(resetProfileTab())
      } else if (activeTab === "password") {
        dispatch(resetPasswordTab())
      }

      dispatch(setActiveTab(newTab))
    }
  }

  const handleProfileChange = async (e) => {
    const { name, value } = e.target

    dispatch(updateProfileData({ name, value }))
    if (profileErrors[name]) {
      clearFieldError(name, "profile")
    }
    const newProfileData = { ...currentProfileData, [name]: value }
    await validateProfileField(name, value, newProfileData)
  }

  const handlePasswordChange = async (e) => {
    const { name, value } = e.target

    dispatch(updatePasswordData({ name, value }))
    if (passwordErrors[name]) {
      clearFieldError(name, "password")
    }
    const newPasswordData = { ...passwordData, [name]: value }
    const { isValid } = await validatePasswordField(name, value, newPasswordData)

    if (name === "new_password" && passwordData.confirm_password && isValid) {
      await validatePasswordField("confirm_password", passwordData.confirm_password, newPasswordData)
    }
  }

  const handleNoticeToggle = async () => {
    if (!authUser?.id) {
      console.error("User ID not found")
      return
    }

    const newNoticeValue = !currentProfileData.notice

    dispatch(toggleNotice())

    dispatch(
      updateNoticeSettings({
        userId: authUser.id,
        notice: newNoticeValue,
      }),
    )
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()

    const { isValid } = await validateProfileForm(currentProfileData)

    if (!isValid) {
      return
    }
    try {
      const resultAction = await dispatch(updateUserProfile(currentProfileData))

      if (updateUserProfile.fulfilled.match(resultAction)) {
        updateUser({
          fullName: currentProfileData.full_name,
          email: currentProfileData.email,
          phoneNumber: currentProfileData.phone_number,
        })
      }
    } catch (error) {
      console.error("Profile update error:", error)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()

    const { isValid } = await validatePasswordForm(passwordData)

    if (!isValid) {
      return
    }
    dispatch(changePassword(passwordData))
  }

  const hasProfileErrors = Object.keys(profileErrors).some((key) => profileErrors[key])

  const hasPasswordErrors = Object.keys(passwordErrors).some((key) => passwordErrors[key])

  return (
    <div className="profile-page">
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
                  <div className="form-group">
                    <label htmlFor="phone_display" className="form-label">
                      Số điện thoại
                    </label>
                    <div className="phone-display">
                      <span className="phone-value">{currentProfileData.phone_number || "Chưa cập nhật"}</span>
                      <span className="phone-note">(Không thể thay đổi)</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Thông báo email</label>
                    <div className="notice-toggle-container">
                      <div className="notice-toggle-wrapper">
                        <button
                          type="button"
                          className={`notice-toggle ${currentProfileData.notice ? "active" : ""}`}
                          onClick={handleNoticeToggle}
                          disabled={isNoticeLoading}
                        >
                          <div className="toggle-slider">
                            <div className="toggle-knob"></div>
                          </div>
                          {isNoticeLoading && (
                            <div className="toggle-loading">
                              <i className="fas fa-spinner fa-spin"></i>
                            </div>
                          )}
                        </button>
                        <span className="notice-label">
                          {currentProfileData.notice
                            ? "Nhận báo cáo thu chi hằng ngày qua email"
                            : "Không nhận báo cáo thu chi qua email"}
                        </span>
                      </div>
                      <p className="notice-description">
                        Khi bật, bạn sẽ nhận được báo cáo tổng hợp thu chi hằng ngày qua email.
                      </p>
                    </div>
                  </div>

                  <Button type="submit" className="btn btn-primary" disabled={isProfileLoading || hasProfileErrors}>
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
                <Button type="submit" className="btn btn-primary" disabled={isPasswordLoading || hasPasswordErrors}>
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
      <div className="toast-container">
        {toasts.map((toast) => (
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
