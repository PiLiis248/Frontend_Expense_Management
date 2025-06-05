import axiosInstance from "../api/axios";
import tokenMethod from "../api/token";

// Helper function to get current user ID
const getCurrentUserId = () => {
  try {
    const token = tokenMethod.get();
    return token?.user?.id;
  } catch (error) {
    console.error("Error getting user ID from token:", error);
    return null;
  }
};

const walletService = {
  // Get all money sources for current user
  getAllMoneySources: async () => {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error("User not authenticated");
      }
      const response = await axiosInstance.get(`/money-sources/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching money sources:", error);
      throw error;
    }
  },

  // Get all money sources for a specific user (admin function)
  getAllMoneySourcesByUserId: async (userId) => {
    try {
      const response = await axiosInstance.get(`/money-sources/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching money sources:", error);
      throw error;
    }
  },

  // Get all money sources (admin function)
  getAllMoneySourcesAdmin: async () => {
    try {
      const response = await axiosInstance.get("/money-sources");
      return response.data;
    } catch (error) {
      console.error("Error fetching all money sources:", error);
      throw error;
    }
  },

  // Get money source by ID
  getMoneySourceById: async (id) => {
    try {
      const response = await axiosInstance.get(`/money-sources/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching money source ${id}:`, error);
      throw error;
    }
  },

  // Create new money source
  createMoneySource: async (moneySourceData) => {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const payload = {
        name: moneySourceData.name,
        currentBalance: moneySourceData.currentBalance || 0,
        bankName: moneySourceData.bankName || "",
        walletProvider: moneySourceData.walletProvider || "",
        type: moneySourceData.type, // CASH, BANK, EWALLET
        isActive: moneySourceData.isActive !== undefined ? moneySourceData.isActive : true,
        userId: moneySourceData.userId || userId // Use provided userId or current user's ID
      };

      const response = await axiosInstance.post("/money-sources", payload);
      return response.data;
    } catch (error) {
      console.error("Error creating money source:", error);
      throw error;
    }
  },

  // Update money source
  updateMoneySource: async (id, moneySourceData) => {
    try {
      const payload = {
        name: moneySourceData.name,
        currentBalance: moneySourceData.currentBalance,
        bankName: moneySourceData.bankName || "",
        walletProvider: moneySourceData.walletProvider || "",
        type: moneySourceData.type,
        isActive: moneySourceData.isActive !== undefined ? moneySourceData.isActive : true
      };

      const response = await axiosInstance.put(`/money-sources/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error(`Error updating money source ${id}:`, error);
      throw error;
    }
  },

  // Delete money source
  deleteMoneySource: async (id) => {
    try {
      const response = await axiosInstance.delete(`/money-sources/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting money source ${id}:`, error);
      throw error;
    }
  },

  // Toggle money source active status
  toggleMoneySourceStatus: async (id, isActive) => {
    try {
      const response = await axiosInstance.patch(`/money-sources/${id}/status`, {
        isActive
      });
      return response.data;
    } catch (error) {
      console.error(`Error toggling money source ${id} status:`, error);
      throw error;
    }
  },

  // Update money source balance
  updateBalance: async (id, newBalance) => {
    try {
      const response = await axiosInstance.patch(`/money-sources/${id}/balance`, {
        currentBalance: newBalance
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating balance for money source ${id}:`, error);
      throw error;
    }
  }
};

export { walletService };