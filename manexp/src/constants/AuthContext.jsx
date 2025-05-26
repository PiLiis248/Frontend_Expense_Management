import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import tokenMethod from "../api/token";
import PATHS from "../constants/path";

// Tạo Auth Context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Kiểm tra đăng nhập khi component mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = tokenMethod.get();
      
      if (storedUser && storedUser.token && storedUser.user) {
        // Nếu có token hợp lệ, set user và chuyển đến homepage
        setUser(storedUser.user);
        setIsAuthenticated(true);
        setIsLoading(false);
        
        // Nếu đang ở trang login thì chuyển đến homepage
        if (window.location.pathname === PATHS.login) {
          navigate(PATHS.homepage);
        }
      } else {
        // Nếu không có token, kiểm tra remembered credentials
        const rememberedCredentials = localStorage.getItem("rememberedLogin");
        if (rememberedCredentials) {
          try {
            const { phone, password } = JSON.parse(rememberedCredentials);
            if (phone && password) {
              // Tự động đăng nhập với credentials đã lưu
              await login(phone, password, true, true); // silent login
            }
          } catch (error) {
            console.error("Auto login failed:", error);
            localStorage.removeItem("rememberedLogin");
          }
        }
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [navigate]);

  // ✅ Đăng nhập
  const login = async (phoneNumber, password, rememberMe, silent = false) => {
    try {
      const authData = await authService.login(phoneNumber, password, rememberMe);

      if (!authData || !authData.token || !authData.user) {
        throw new Error("Invalid response from server!");
      }

      setUser(authData.user);
      setIsAuthenticated(true);
      
      // Navigate đến homepage (cả silent và manual login)
      navigate(PATHS.homepage);
      
      return authData;
    } catch (error) {
      // Nếu auto login thất bại, xóa remembered credentials
      if (silent) {
        localStorage.removeItem("rememberedLogin");
      }
      throw error;
    }
  };

  // ✅ Đăng xuất
  const logout = () => {
    tokenMethod.remove();
    localStorage.removeItem("rememberedLogin"); // Xóa remembered credentials
    setUser(null);
    setIsAuthenticated(false);
    navigate(PATHS.login);
  };

  // ✅ Đăng ký
  const register = async (payload) => {
    try {
      const response = await authService.register(payload);
      return response;
    } catch (error) {
      const errorData = error.response?.data;
      const errorMessage =
        errorData
          ? Object.values(errorData).join(" | ") // Gộp tất cả lỗi thành 1 chuỗi, cách nhau bằng " | "
          : "Something went wrong during registration.";

      throw new Error(errorMessage);
    }
  };

  const contextValue = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Custom hook để dùng Auth
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;