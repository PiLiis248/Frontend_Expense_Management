import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import tokenMethod from "../api/token";
import PATHS from "../constants/path";

// Create context with default values
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = tokenMethod.get();
      if (storedUser) {
        setUser(storedUser);
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (phone, password, rememberMe) => {
    try {
      const userData = await authService.login(phone, password, rememberMe);
      
      if (!userData || !userData.user) {
        throw new Error("Your account has not been registered!");
      }
  
    //   if (userData.user.status !== "ACTIVE") {
    //     throw new Error("Your account is not activated. Please check your email.");
    //   }
  
      setUser(userData);
      setIsAuthenticated(true);
      navigate(PATHS.homepage);
      return userData;
    } catch (error) {
      throw new Error(error.message || "Invalid username or password. Register or try again!"); 
    }
  };

  const logout = () => {
    tokenMethod.remove(); // Xóa token khỏi Storage
    setUser(null);
    setIsAuthenticated(false);
    navigate(PATHS.login); // Điều hướng về trang login
  };

  const register = async (payload) => {
    try {
      const response = await authService.register(payload);
      return response;
    } catch (error) {
      if (error.message.includes("Account has been registered")) {
        throw error; 
      }
      throw new Error(error.response?.data?.message || "Something went wrong during registration.");
    }
  };
  
  // Provide the context value
  const contextValue = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;