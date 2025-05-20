"use client"

import { useState } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "../Sidebar"
import Header from "../Header"
import "../../assets/MainLayout.css"
import { AuthProvider } from "../../constants/AuthContext"

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <AuthProvider>
      <div className="layout">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <div className={`main-content ${sidebarOpen ? "sidebar-shifted" : ""}`}>
          <Header toggleSidebar={toggleSidebar} />
          <main className="content">
            <div className="container">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </AuthProvider>
  )
}

export default MainLayout