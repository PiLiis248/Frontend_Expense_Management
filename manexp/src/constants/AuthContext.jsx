import React, { createContext, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import tokenMethod from "../api/token";
import PATHS from "../constants/path";
import { 
  loginUser, 
  logout as logoutAction, 
  registerUser,
  setUser,
  setLoading,
  loadRememberedCredentials 
} from "../redux/authen/authSlice";

// Tạo Auth Context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get state from Redux store
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth);

  // Kiểm tra đăng nhập khi component mount
  useEffect(() => {
    const initializeAuth = async () => {
      dispatch(setLoading(true));
      
      const storedUser = tokenMethod.get();
      
      if (storedUser && storedUser.token && storedUser.user) {
        // Nếu có token hợp lệ, set user
        dispatch(setUser({
          user: storedUser.user,
          isAuthenticated: true
        }));
        
        // Nếu đang ở trang login thì chuyển đến homepage
        if (window.location.pathname === PATHS.login) {
          navigate(PATHS.homepage);
        }
      } else {
        // Nếu không có token, kiểm tra remembered credentials
        try {
          const result = await dispatch(loadRememberedCredentials()).unwrap();
          if (result && result.phone && result.password) {
            // Tự động đăng nhập với credentials đã lưu
            await dispatch(loginUser({
              phone: result.phone,
              password: result.password,
              rememberMe: true,
              silent: true
            })).unwrap();
            
            navigate(PATHS.homepage);
          }
        } catch (error) {
          console.error("Auto login failed:", error);
          localStorage.removeItem("rememberedLogin");
        }
      }
      
      dispatch(setLoading(false));
    };

    initializeAuth();
  }, [navigate, dispatch]);

  // ✅ Đăng nhập
  const login = async (phoneNumber, password, rememberMe, silent = false) => {
    try {
      const result = await dispatch(loginUser({
        phone: phoneNumber,
        password,
        rememberMe,
        silent
      })).unwrap();

      // Navigate đến homepage (cả silent và manual login)
      navigate(PATHS.homepage);
      
      return result;
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
    localStorage.removeItem("rememberedLogin");
    sessionStorage.removeItem(`hasConfirmedNotice-${user.id}`);
    dispatch(logoutAction());
    navigate(PATHS.login);
  };

  // ✅ Đăng ký
  const register = async (payload) => {
    // eslint-disable-next-line no-useless-catch
    try {
      const result = await dispatch(registerUser(payload)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  };

  // ✅ CẬP NHẬT USER INFO - Method mới
  const updateUser = (updatedUserData) => {
    try {
      // 1. Lấy token data hiện tại
      const currentTokenData = tokenMethod.get();
      
      if (currentTokenData && currentTokenData.user) {
        // 2. Merge user data mới với data cũ
        const updatedUser = {
          ...currentTokenData.user,
          ...updatedUserData
        };

        // 3. Tạo token data mới
        const newTokenData = {
          ...currentTokenData,
          user: updatedUser
        };

        // 4. Lưu vào storage (giữ nguyên remember preference)
        const hasLocalToken = localStorage.getItem("authData");
        tokenMethod.set(newTokenData, !!hasLocalToken);

        // 5. Cập nhật Redux store
        dispatch(setUser({
          user: updatedUser,
          isAuthenticated: true
        }));

        console.log("User info updated successfully:", updatedUser);
        return updatedUser;
      } else {
        throw new Error("No valid token found");
      }
    } catch (error) {
      console.error("Failed to update user info:", error);
      throw error;
    }
  };

  const contextValue = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    updateUser, // ← Method mới
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