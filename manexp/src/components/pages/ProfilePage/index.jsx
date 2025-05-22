"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../../constants/AuthContext"
import InputField from "../../common/InputField"
import Button from "../../common/Button"
import Toast from "../../common/Toast"
// import { profileService } from "../services/profileService"
import "../../../assets/ProfilePage.css"

const ProfilePage = () => {
  const { currentUser, updateProfile } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")

  // Mock data - sử dụng tạm thời cho đến khi có API backend
  const mockUserData = {
    full_name: "Nguyễn Văn An",
    email: "nguyenvanan@example.com",
    phone_number: "0123456789",
  }

  const [profileData, setProfileData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
  })

  const [isLoadingUserData, setIsLoadingUserData] = useState(true)

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  })

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
        
        // TODO: Uncomment when backend API is ready
        // const userData = await profileService.getUserProfile()
        // setProfileData({
        //   full_name: userData.full_name || "",
        //   email: userData.email || "",
        //   phone_number: userData.phone_number || "",
        // })

        // Temporary: Use mock data
        setTimeout(() => {
          setProfileData({
            full_name: mockUserData.full_name,
            email: mockUserData.email,
            phone_number: mockUserData.phone_number,
          })
          setIsLoadingUserData(false)
        }, 1000) // Simulate API loading time
        
      } catch (error) {
        console.error("Failed to fetch user profile:", error)
        addToast("Không thể tải thông tin tài khoản. Vui lòng thử lại.", "error")
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

  // Handle profile form input changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle password form input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle profile form submission
  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setIsProfileLoading(true)

    try {
      // TODO: Uncomment when backend API is ready
      // const updatedUser = await profileService.updateUserProfile({
      //   full_name: profileData.full_name,
      //   email: profileData.email,
      //   phone_number: profileData.phone_number,
      // })
      // 
      // // Update user profile in context
      // updateProfile(updatedUser)

      // Temporary: Simulate API call
      setTimeout(() => {
        // Update user profile in context with current form data
        updateProfile({
          ...currentUser,
          full_name: profileData.full_name,
          email: profileData.email,
          phone_number: profileData.phone_number,
        })

        setIsProfileLoading(false)
        addToast("Thông tin tài khoản đã được cập nhật thành công.", "success")
      }, 1000)
      
    } catch (error) {
      console.error("Failed to update profile:", error)
      setIsProfileLoading(false)
      addToast("Cập nhật thông tin thất bại. Vui lòng thử lại.", "error")
    }
  }

  // Handle password form submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setIsPasswordLoading(true)

    // Validate password match
    if (passwordData.new_password !== passwordData.confirm_password) {
      setIsPasswordLoading(false)
      return addToast("Mật khẩu mới không khớp.", "error")
    }

    // Validate password length
    if (passwordData.new_password.length < 6) {
      setIsPasswordLoading(false)
      return addToast("Mật khẩu mới phải có ít nhất 6 ký tự.", "error")
    }

    try {
      // TODO: Uncomment when backend API is ready
      // await profileService.changePassword({
      //   current_password: passwordData.current_password,
      //   new_password: passwordData.new_password,
      // })

      // Temporary: Simulate API call
      setTimeout(() => {
        // Reset form
        setPasswordData({
          current_password: "",
          new_password: "",
          confirm_password: "",
        })

        setIsPasswordLoading(false)
        addToast("Mật khẩu đã được thay đổi thành công.", "success")
      }, 1000)
      
    } catch (error) {
      console.error("Failed to change password:", error)
      setIsPasswordLoading(false)
      addToast("Thay đổi mật khẩu thất bại. Vui lòng thử lại.", "error")
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
                  />

                  <InputField
                    label="Email"
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    placeholder="Nhập địa chỉ email"
                    className="form-control"
                  />

                  <InputField
                    label="Số điện thoại"
                    type="tel"
                    name="phone_number"
                    value={profileData.phone_number}
                    onChange={handleProfileChange}
                    placeholder="Nhập số điện thoại"
                    className="form-control"
                  />

                  <Button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isProfileLoading}
                  >
                    {isProfileLoading ? "Đang cập nhật..." : "Cập nhật thông tin"}
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
                  name="current_password"
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  placeholder="Nhập mật khẩu hiện tại"
                  className="form-control"
                />

                <InputField
                  label="Mật khẩu mới"
                  type="password"
                  name="new_password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                  className="form-control"
                />

                <InputField
                  label="Xác nhận mật khẩu mới"
                  type="password"
                  name="confirm_password"
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
                  placeholder="Nhập lại mật khẩu mới"
                  className="form-control"
                />

                <Button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isPasswordLoading}
                >
                  {isPasswordLoading ? "Đang thay đổi..." : "Thay đổi mật khẩu"}
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