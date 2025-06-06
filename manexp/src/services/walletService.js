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
  // ✅ Lấy tất cả money sources của user hiện tại
  async getAllMoneySources() {
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

  // ✅ Lấy tất cả money sources theo userId (admin function)
  async getAllMoneySourcesByUserId(userId) {
    try {
      const response = await axiosInstance.get(`/money-sources/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching money sources:", error);
      throw error;
    }
  },

  // ✅ Lấy tổng số dư hiện tại của user
  async getCurrentBalance(userId = null) {
    try {
      const targetUserId = userId || getCurrentUserId();
      if (!targetUserId) {
        throw new Error("User not authenticated");
      }
      const response = await axiosInstance.get(`/money-sources/current-balance/user/${targetUserId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching current balance:", error);
      throw error;
    }
  },

  // ✅ Tạo money source mới
  async createMoneySource(moneySourceData = {}) {
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
        userId: moneySourceData.userId || userId
      };

      const response = await axiosInstance.post("/money-sources", payload);
      return response.data;
    } catch (error) {
      console.error("Error creating money source:", error);
      throw error;
    }
  },

  // ✅ Cập nhật money source
  async updateMoneySource(id, moneySourceData = {}) {
    try {
      const payload = {
        name: moneySourceData.name,
        currentBalance: moneySourceData.currentBalance,
        bankName: moneySourceData.bankName || "",
        walletProvider: moneySourceData.walletProvider || "",
        type: moneySourceData.type,
        isActive: moneySourceData.isActive !== undefined ? moneySourceData.isActive : true,
        userId: moneySourceData.userId
      };

      const response = await axiosInstance.put(`/money-sources/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error(`Error updating money source ${id}:`, error);
      throw error;
    }
  },

  // ✅ Xóa money source
  async deleteMoneySource(id) {
    try {
      const response = await axiosInstance.delete(`/money-sources/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting money source ${id}:`, error);
      throw error;
    }
  }
};

export default walletService;