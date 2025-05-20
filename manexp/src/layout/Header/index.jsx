"use client"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../constants/AuthContext"
import "../../assets/Header.css"
import PATHS from "../../constants/path"

// Import icons directly if you're not using Font Awesome via CDN
// Uncomment the following line if you're using Font Awesome npm package
// import '@fortawesome/fontawesome-free/css/all.min.css';

const Header = ({ toggleSidebar }) => {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const handleLogout = () => {
    logout()
    navigate(PATHS.login)
  }

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-toggle" onClick={toggleSidebar}>
          {/* Fallback option if Font Awesome isn't loading properly */}
          <span className="menu-icon">☰</span>
        </button>
        <h1>Quản lý chi tiêu</h1>
      </div>
      <div className="header-right">
        <div className="user-dropdown" ref={dropdownRef}>
          <button className="user-dropdown-toggle" onClick={toggleDropdown}>
            <span className="user-name">{currentUser?.full_name || "User"}</span>
            <span className="dropdown-arrow">{dropdownOpen ? "▲" : "▼"}</span>
          </button>
          {dropdownOpen && (
            <div className="user-dropdown-menu show">
              <button 
                onClick={() => {
                  navigate(PATHS.profile);
                  setDropdownOpen(false);
                }}
                className="dropdown-item"
              >
                Thông tin tài khoản
              </button>
              <button 
                onClick={handleLogout}
                className="dropdown-item"
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header