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

const categoryService = {
  // ✅ Lấy tất cả categories của user hiện tại
  async getAllCategories() {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error("User not authenticated");
      }
      const response = await axiosInstance.get(`/categories/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error getting all categories:", error);
      throw error;
    }
  },

  async getAllCategoriesByTransactionType(transactionTypesId) {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error("User not authenticated");
      }
      const response = await axiosInstance.get(`/categories/user/${userId}/transaction-type/${transactionTypesId}`);
      return response.data;
    } catch (error) {
      console.error("Error getting all categories:", error);
      throw error;
    }
  },

  // ✅ Lấy tất cả categories theo userId (admin function)
  async getAllCategoriesByUserId(userId) {
    try {
      const response = await axiosInstance.get(`/categories/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error getting all categories:", error);
      throw error;
    }
  },

  // ✅ Lấy categories với parent-child relationship của user hiện tại
  async getAllCategoriesWithParentChild() {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error("User not authenticated");
      }
      const response = await axiosInstance.get(`/categories/parent-child/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error getting categories with parent-child:", error);
      throw error;
    }
  },

  // ✅ Lấy categories với parent-child relationship theo userId (admin function)
  async getAllCategoriesWithParentChildByUserId(userId) {
    try {
      const response = await axiosInstance.get(`/categories/parent-child/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error getting categories with parent-child:", error);
      throw error;
    }
  },

  // ✅ Tạo category mới
  async createCategory(categoryData = {}) {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const payload = {
        name: categoryData.name,
        parentId: categoryData.parentId || null,
        icon: categoryData.icon || "",
        transactionTypesId: categoryData.transactionTypesId,
        userId: categoryData.userId || userId
      };

      const response = await axiosInstance.post("/categories", payload);
      return response.data;
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  },

  // ✅ Cập nhật category
  async updateCategory(id, categoryData = {}) {
    try {
      const payload = {
        name: categoryData.name,
        parentId: categoryData.parentId || null,
        icon: categoryData.icon || "",
        transactionTypesId: categoryData.transactionTypesId,
        userId: categoryData.userId
      };

      const response = await axiosInstance.put(`/categories/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  },

  // ✅ Xóa category
  async deleteCategory(id) {
    try {
      const response = await axiosInstance.delete(`/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  }
};

export default categoryService;