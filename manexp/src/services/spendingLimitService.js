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

const spendingLimitService = {
  // ✅ Lấy tất cả spending limits của user hiện tại
  async getAllSpendingLimits() {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error("User not authenticated");
      }
      const response = await axiosInstance.get(`/spending-limits/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error getting all spending limits:", error);
      throw error;
    }
  },

  // ✅ Lấy spending limit theo ID
  async getSpendingLimitById(id) {
    try {
      const response = await axiosInstance.get(`/spending-limits/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error getting spending limit by ID:", error);
      throw error;
    }
  },

  // ✅ Tạo spending limit mới - ĐÚNG theo backend Create API
  async createSpendingLimit(spendingLimitData = {}) {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const payload = {
        limitAmount: spendingLimitData.limitAmount,
        periodType: spendingLimitData.periodType, 
        startDate: spendingLimitData.startDate,
        note: spendingLimitData.note,
        categoryId: spendingLimitData.categoryId,    
        moneySourceId: spendingLimitData.moneySourceId, 
        userId: spendingLimitData.userId || userId
      };

      const response = await axiosInstance.post("/spending-limits", payload);
      return response.data;
    } catch (error) {
      console.error("Error creating spending limit:", error);
      throw error;
    }
  },

  // 🔥 SỬA LỖI: Cập nhật spending limit - CHỈ GỬI CÁC FIELD BACKEND NHẬN
  async updateSpendingLimit(id, spendingLimitData = {}) {
    try {
      // ❗ Backend Update chỉ nhận: limitAmount, periodType, startDate, note, isActive
      // KHÔNG nhận categoryId, moneySourceId, userId
      const payload = {
        limitAmount: spendingLimitData.limitAmount,
        periodType: spendingLimitData.periodType, 
        startDate: spendingLimitData.startDate,
        note: spendingLimitData.note,
        isActive: spendingLimitData.isActive  // ✅ Backend dùng isActive
      };

      console.log("Update payload:", payload); // Debug log

      const response = await axiosInstance.put(`/spending-limits/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error("Error updating spending limit:", error);
      console.error("Payload sent:", {
        limitAmount: spendingLimitData.limitAmount,
        periodType: spendingLimitData.periodType,
        startDate: spendingLimitData.startDate,
        note: spendingLimitData.note,
        isActive: spendingLimitData.isActive
      });
      throw error;
    }
  },

  // ✅ Xóa spending limit
  async deleteSpendingLimit(id) {
    try {
      const response = await axiosInstance.delete(`/spending-limits/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting spending limit:", error);
      throw error;
    }
  },

  // 🔥 SỬA LỖI: Toggle trạng thái - SỬA ĐỂ DÙNG ĐÚNG TÊN THUỘC TÍNH
  async toggleSpendingLimitStatus(id) {
    try {
      const currentLimit = await this.getSpendingLimitById(id);
      
      // ❗ Chỉ gửi các field backend Update nhận
      const updatedData = {
        limitAmount: currentLimit.limitAmount,
        periodType: currentLimit.periodType,
        startDate: currentLimit.startDate,
        note: currentLimit.note,
        isActive: !currentLimit.active  // ✅ Backend response dùng 'active', Update nhận 'isActive'
      };

      return await this.updateSpendingLimit(id, updatedData);
    } catch (error) {
      console.error("Error toggling spending limit status:", error);
      throw error;
    }
  },

  // ✅ Kiểm tra spending limit có bị vượt quá không
  async checkSpendingLimitExceeded(categoryId, amount, periodType) {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const spendingLimits = await this.getAllSpendingLimits();
      
      // ✅ Backend response dùng 'categoriesId' và 'active'
      const relevantLimit = spendingLimits.find(limit => 
        limit.categoriesId === categoryId && 
        limit.periodType === periodType && 
        limit.active  // ✅ Backend response dùng 'active'
      );

      if (!relevantLimit) {
        return { 
          exceeded: false, 
          message: "No spending limit set for this category and period" 
        };
      }

      return {
        exceeded: amount > relevantLimit.limitAmount,
        limit: relevantLimit,
        message: amount > relevantLimit.limitAmount 
          ? `Spending limit exceeded! Limit: ${relevantLimit.limitAmount}, Current: ${amount}`
          : "Within spending limit"
      };
    } catch (error) {
      console.error("Error checking spending limit:", error);
      throw error;
    }
  }
};

export default spendingLimitService;