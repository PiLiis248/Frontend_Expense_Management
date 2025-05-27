import axiosInstance from "../api/axios";
import tokenMethod from "../api/token";

const profileService = {
  // Get user ID from token with enhanced debugging
  getUserIdFromToken: () => {
    console.log("=== Debug getUserIdFromToken ===");
    
    // Check what tokenMethod.get() returns
    const authData = tokenMethod.get();
    console.log("Raw authData from tokenMethod.get():", authData);
    
    if (!authData) {
      console.error("AuthData is null/undefined");
      throw new Error("User not authenticated - no auth data found");
    }
    
    console.log("AuthData user object:", authData.user);
    
    if (!authData.user) {
      console.error("User object is missing from authData");
      throw new Error("User not authenticated - user object not found");
    }
    
    console.log("User ID:", authData.user.id);
    
    if (!authData.user.id) {
      console.error("User ID is missing from user object");
      throw new Error("User not authenticated - user ID not found");
    }
    
    console.log("Successfully retrieved user ID:", authData.user.id);
    return authData.user.id;
  },

  // Get user profile data by user ID
  getUserProfile: async () => {
    try {
      console.log("=== getUserProfile called ===");
      const userId = profileService.getUserIdFromToken();
      console.log("Making API call to /user/profile/" + userId);
      
      const response = await axiosInstance.get(`/user/profile/${userId}`);
      console.log("Profile API response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  // Update user profile by user ID
  updateUserProfile: async (profileData) => {
    try {
      console.log("=== updateUserProfile called ===");
      console.log("Profile data to update:", profileData);
      
      const userId = profileService.getUserIdFromToken();
      console.log("Making API call to /user/edit/" + userId);
      
      const response = await axiosInstance.put(`/user/edit/${userId}`, profileData);
      console.log("Update profile API response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating user profile:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  // Change password by user ID
  changePassword: async (changePasswordData) => {
    try {
      console.log("=== changePassword called ===");
      console.log("Password change data:", {
        ...changePasswordData,
        old_password: "***",
        new_password: "***",
        confirm_password: "***"
      });
      
      const userId = profileService.getUserIdFromToken();
      console.log("Making API call to /user/change-password/" + userId);
      
      const response = await axiosInstance.put(
        `/user/change-password/${userId}`,
        {
          oldPassword: changePasswordData.old_password,
          newPassword: changePasswordData.new_password,
          confirmPassword: changePasswordData.confirm_password
        }
      );
      console.log("Change password API response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error changing password:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  }
};

export { profileService };