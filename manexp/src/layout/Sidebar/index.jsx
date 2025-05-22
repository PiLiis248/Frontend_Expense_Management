"use client"
import { NavLink } from "react-router-dom"
import "../../assets/Sidebar.css"
import PATHS from "../../constants/path"
import { IoClose } from "react-icons/io5";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const handleCloseSidebar = () => {
    toggleSidebar()
  }
  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <h2>Expense Manager</h2>
        <button className="close-sidebar" onClick={handleCloseSidebar}>
        <IoClose size={24} />
      </button>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink to={PATHS.homepage} end onClick={() => window.innerWidth < 768 && toggleSidebar()}>
              <i className="fas fa-home"></i>
              <span>Tổng quan</span>
            </NavLink>
          </li>
          <li>
            <NavLink to={PATHS.manageTransaction} onClick={() => window.innerWidth < 768 && toggleSidebar()}>
              <i className="fas fa-exchange-alt"></i>
              <span>Quản lý giao dịch</span>
            </NavLink>
          </li>
          <li>
            <NavLink to={PATHS.manageCategory} onClick={() => window.innerWidth < 768 && toggleSidebar()}>
              <i className="fas fa-tags"></i>
              <span>Quản lý danh mục</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/spending-limits" onClick={() => window.innerWidth < 768 && toggleSidebar()}>
              <i className="fas fa-chart-line"></i>
              <span>Mức chi tiêu</span>
            </NavLink>
          </li>
          <li>
            <NavLink to={PATHS.manageWallet} onClick={() => window.innerWidth < 768 && toggleSidebar()}>
              <i className="fas fa-wallet"></i>
              <span>Nguồn tiền</span>
            </NavLink>
          </li>
          <li>
            <NavLink to={PATHS.profile} onClick={() => window.innerWidth < 768 && toggleSidebar()}>
              <i className="fas fa-user"></i>
              <span>Thông tin tài khoản</span>
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar