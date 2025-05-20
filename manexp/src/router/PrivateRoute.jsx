import { Navigate, Outlet } from "react-router-dom";
import tokenMethod from "../api/token";
// import "../assets/ManageGroup.css"; 
// import ProfileSidebar from "../components/pages/ProfileSideBar";
// import Navbar from "../components/common/Navbar";
// import { useState } from "react";

const PrivateRoute = () => {
  // const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);

  // Toggle Profile Sidebar
  // const toggleProfileSidebar = () => {
  //   setIsProfileSidebarOpen(!isProfileSidebarOpen);
  // };

  const isAuthenticated = tokenMethod.getToken();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div className="page__wrapper">
      {/* <div className={`cover ${isProfileSidebarOpen ? 'active' : ''}`}></div> */}
      {/* <Navbar onOpenProfile={toggleProfileSidebar}/> */}

      {/* Render ProfileSidebar conditionally */}
      {/* {isProfileSidebarOpen && (
        <ProfileSidebar 
          isOpen={isProfileSidebarOpen} 
          onClose={toggleProfileSidebar} 
        />
      )} */}
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default PrivateRoute;
