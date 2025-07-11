"use client"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../constants/AuthContext"
import "../../assets/Header.css"
import PATHS from "../../constants/path"

const Header = ({ toggleSidebar }) => {
  const { user, logout } = useAuth() 
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Logout failed:", error)
      navigate(PATHS.login)
    }
  }

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen)
  }

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
          <span className="menu-icon">☰</span>
        </button>
        <h1>Quản lý chi tiêu</h1>
      </div>
      <div className="header-right">
        <div className="user-dropdown" ref={dropdownRef}>
          <button className="user-dropdown-toggle" onClick={toggleDropdown}>
            <span className="user-name">
              {user?.fullName || "User"}
            </span>
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