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

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    const initializeAuth = async () => {
      dispatch(setLoading(true));
      
      const storedUser = tokenMethod.get();
      
      if (storedUser && storedUser.token && storedUser.user) {
        dispatch(setUser({
          user: storedUser.user,
          isAuthenticated: true
        }));
        
        if (window.location.pathname === PATHS.login) {
          navigate(PATHS.homepage);
        }
      } else {
        try {
          const result = await dispatch(loadRememberedCredentials()).unwrap();
          if (result && result.phone && result.password) {
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

  const login = async (phoneNumber, password, rememberMe, silent = false) => {
    try {
      const result = await dispatch(loginUser({
        phone: phoneNumber,
        password,
        rememberMe,
        silent
      })).unwrap();

      navigate(PATHS.homepage);
      
      return result;
    } catch (error) {
      if (silent) {
        localStorage.removeItem("rememberedLogin");
      }
      throw error;
    }
  };

  const logout = () => {
    tokenMethod.remove();
    localStorage.removeItem("rememberedLogin");
    sessionStorage.removeItem(`hasConfirmedNotice-${user.id}`);
    dispatch(logoutAction());
    navigate(PATHS.login);
  };

  const register = async (payload) => {
    // eslint-disable-next-line no-useless-catch
    try {
      const result = await dispatch(registerUser(payload)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const updateUser = (updatedUserData) => {
    try {
      const currentTokenData = tokenMethod.get();
      
      if (currentTokenData && currentTokenData.user) {
        const updatedUser = {
          ...currentTokenData.user,
          ...updatedUserData
        };

        const newTokenData = {
          ...currentTokenData,
          user: updatedUser
        };

        const hasLocalToken = localStorage.getItem("authData");
        tokenMethod.set(newTokenData, !!hasLocalToken);

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
    updateUser, 
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;