"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../../constants/AuthContext"
import InputField from "../../common/InputField"
import Button from "../../common/Button"
import Toast from "../../common/Toast"
import { profileService } from "../../../services/profileService"
import * as yup from "yup"
import "../../../assets/ProfilePage.css"
import tokenMethod from "../../../api/token"

// Validation schemas
const profileSchema = yup.object().shape({
  full_name: yup
    .string()
    .required("Họ và tên là bắt buộc")
    .min(6, "Họ và tên phải có ít nhất 6 ký tự")
    .max(50, "Họ và tên không được vượt quá 50 ký tự"),
  email: yup
    .string()
    .required("Email là bắt buộc")
    .email("Email không hợp lệ"),
  phone_number: yup
    .string()
    .required("Số điện thoại là bắt buộc")
    .matches(/^[0-9]{10,11}$/, "Số điện thoại phải có 10 chữ số")
})

const passwordSchema = yup.object().shape({
  old_password: yup
    .string()
    .required("Mật khẩu hiện tại là bắt buộc"),
  new_password: yup
    .string()
    .required("Mật khẩu mới là bắt buộc")
    .min(8, "Mật khẩu mới phải có ít nhất 8 ký tự")
    .max(80, "Mật khẩu mới không được vượt quá 80 ký tự"),
  confirm_password: yup
    .string()
    .required("Xác nhận mật khẩu là bắt buộc")
    .oneOf([yup.ref("new_password")], "Mật khẩu xác nhận không khớp")
})

console.log(tokenMethod.get());

const ProfilePage = () => {
  const { currentUser, updateProfile } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")

  const [profileData, setProfileData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
  })

  const [isLoadingUserData, setIsLoadingUserData] = useState(true)

  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  })

  // Validation errors
  const [profileErrors, setProfileErrors] = useState({})
  const [passwordErrors, setPasswordErrors] = useState({})

  // Toast states
  const [toasts, setToasts] = useState([])

  // Loading states
  const [isProfileLoading, setIsProfileLoading] = useState(false)
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)

  // Fetch user profile data when component mounts
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoadingUserData(true)
        
        const userData = await profileService.getUserProfile()
        setProfileData({
          full_name: userData.fullName || "",
          email: userData.email || "",
          phone_number: userData.phoneNumber || "",
        })
        
      } catch (error) {
        console.error("Failed to fetch user profile:", error)
        addToast("Không thể tải thông tin tài khoản. Vui lòng thử lại.", "error")
      } finally {
        setIsLoadingUserData(false)
      }
    }

    fetchUserProfile()
  }, [])

  // Function to add toast
  const addToast = (message, type) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
  }

  // Function to remove toast
  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  // Validate profile data
  const validateProfileData = async (data) => {
    try {
      await profileSchema.validate(data, { abortEarly: false })
      setProfileErrors({})
      return true
    } catch (error) {
      const errors = {}
      error.inner.forEach(err => {
        errors[err.path] = err.message
      })
      setProfileErrors(errors)
      return false
    }
  }

  // Validate password data
  const validatePasswordData = async (data) => {
    try {
      await passwordSchema.validate(data, { abortEarly: false })
      setPasswordErrors({})
      return true
    } catch (error) {
      const errors = {}
      error.inner.forEach(err => {
        errors[err.path] = err.message
      })
      setPasswordErrors(errors)
      return false
    }
  }

  // Handle profile form input changes
  const handleProfileChange = async (e) => {
    const { name, value } = e.target
    const newProfileData = {
      ...profileData,
      [name]: value,
    }
    setProfileData(newProfileData)

    // Clear specific field error when user starts typing
    if (profileErrors[name]) {
      setProfileErrors(prev => ({
        ...prev,
        [name]: ""
      }))
    }

    // Real-time validation for current field
    try {
      await yup.reach(profileSchema, name).validate(value)
    } catch (error) {
      setProfileErrors(prev => ({
        ...prev,
        [name]: error.message
      }))
    }
  }

  // Handle password form input changes
  const handlePasswordChange = async (e) => {
    const { name, value } = e.target
    const newPasswordData = {
      ...passwordData,
      [name]: value,
    }
    setPasswordData(newPasswordData)

    // Clear specific field error when user starts typing
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ""
      }))
    }

    // Real-time validation for current field
    try {
      if (name === 'confirm_password') {
        // Validate confirm_password with new_password
        if (value !== newPasswordData.new_password) {
          throw new Error("Mật khẩu xác nhận không khớp")
        }
      } else if (name === 'new_password') {
        // Validate new_password normally
        await yup.reach(passwordSchema, name).validate(value)
        
        // Also check if confirm_password needs to be re-validated
        if (passwordData.confirm_password && passwordData.confirm_password !== value) {
          setPasswordErrors(prev => ({
            ...prev,
            confirm_password: "Mật khẩu xác nhận không khớp"
          }))
        } else if (passwordData.confirm_password && passwordData.confirm_password === value) {
          setPasswordErrors(prev => ({
            ...prev,
            confirm_password: ""
          }))
        }
      } else {
        // Validate other fields normally
        await yup.reach(passwordSchema, name).validate(value)
      }
    } catch (error) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: error.message
      }))
    }
  }

  // Handle profile form submission
  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form data
    const isValid = await validateProfileData(profileData)
    if (!isValid) {
      addToast("Vui lòng kiểm tra lại thông tin đã nhập.", "error")
      return
    }

    setIsProfileLoading(true)

    try {
      // eslint-disable-next-line no-unused-vars
      const updatedUser = await profileService.updateUserProfile({
        fullName: profileData.full_name,
        email: profileData.email,
        phoneNumber: profileData.phone_number,
      })
      
      // Update user profile in context
      updateProfile({
        ...currentUser,
        fullName: profileData.full_name,
        email: profileData.email,
        phoneNumber: profileData.phone_number,
      })

      addToast("Thông tin tài khoản đã được cập nhật thành công.", "success")
      
    } catch (error) {
      console.error("Failed to update profile:", error)
      
      // Handle specific error messages from backend
      if (error.response && error.response.status === 400) {
        addToast("Thông tin không hợp lệ. Vui lòng kiểm tra lại.", "error")
      } else if (error.response && error.response.status === 401) {
        addToast("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", "error")
      } else if (error.response && error.response.status === 404) {
        addToast("Không tìm thấy tài khoản người dùng.", "error")
      } else {
        addToast("Cập nhật thông tin thất bại. Vui lòng thử lại.", "error")
      }
    } finally {
      setIsProfileLoading(false)
    }
  }

  // Handle password form submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form data
    const isValid = await validatePasswordData(passwordData)
    if (!isValid) {
      addToast("Vui lòng kiểm tra lại thông tin mật khẩu.", "error")
      return
    }

    setIsPasswordLoading(true)

    try {
      // Call profileService to change password
      await profileService.changePassword({
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
        confirm_password: passwordData.confirm_password,
      })

      // Reset form on success
      setPasswordData({
        old_password: "",
        new_password: "",
        confirm_password: "",
      })

      addToast("Mật khẩu đã được thay đổi thành công.", "success")
      
    } catch (error) {
      console.error("Failed to change password:", error)
      
      // Handle specific error messages from backend
      if (error.response && error.response.status === 400) {
        addToast("Mật khẩu hiện tại không chính xác hoặc thông tin không hợp lệ.", "error")
      } else if (error.response && error.response.status === 404) {
        addToast("Không tìm thấy tài khoản người dùng.", "error")
      } else if (error.response && error.response.status === 401) {
        addToast("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", "error")
      } else {
        addToast("Thay đổi mật khẩu thất bại. Vui lòng thử lại.", "error")
      }
    } finally {
      setIsPasswordLoading(false)
    }
  }

  return (
    <div className="profile-page">
      <h1 className="page-title">Thông tin tài khoản</h1>

      <div className="profile-container">
        <div className="profile-tabs">
          <button
            className={`profile-tab ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <i className="fas fa-user"></i>
            Thông tin cá nhân
          </button>
          <button
            className={`profile-tab ${activeTab === "password" ? "active" : ""}`}
            onClick={() => setActiveTab("password")}
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
                    value={profileData.full_name}
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
                    value={profileData.email}
                    onChange={handleProfileChange}
                    placeholder="Nhập địa chỉ email"
                    className="form-control"
                    error={profileErrors.email}
                    required
                  />

                  <InputField
                    label="Số điện thoại"
                    type="tel"
                    name="phone_number"
                    value={profileData.phone_number}
                    onChange={handleProfileChange}
                    placeholder="Nhập số điện thoại (10-11 số)"
                    className="form-control"
                    error={profileErrors.phone_number}
                    required
                  />

                  <Button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isProfileLoading || Object.keys(profileErrors).some(key => profileErrors[key])}
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
                  placeholder="Nhập mật khẩu mới (6-20 ký tự)"
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
                  disabled={isPasswordLoading || Object.keys(passwordErrors).some(key => passwordErrors[key])}
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
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  )
}

export default ProfilePage