import axiosInstance from "../api/axios";
import tokenMethod from "../api/token";

const transactionService = {
  // GET /transactions - Lấy tất cả transactions
  getAllTransactions: async () => {
    try {
      const user = tokenMethod.get();
      const response = await axiosInstance.get(`/transactions/${user.user.id}`);
      return response.data;
    } catch (error) {
      console.error("Error getting all transactions:", error);
      throw error;
    }
  },

  // GET /transactions/page - Lấy transactions với phân trang
  getTransactionsWithPagination: async (params = {}) => {
    try {
      const response = await axiosInstance.get("/transactions/page", {
        params: params // Có thể truyền page, size, sort
      });
      return response.data;
    } catch (error) {
      console.error("Error getting transactions with pagination:", error);
      throw error;
    }
  },

  // GET /transactions/filter - Lọc transactions
  getFilteredTransactions: async (filter = {}) => {
    try {
      // Chuyển đổi Date objects thành string format nếu cần
      const params = { ...filter };
      if (params.fromDate && params.fromDate instanceof Date) {
        params.fromDate = params.fromDate.toISOString().split('T')[0]; // YYYY-MM-DD
      }
      if (params.toDate && params.toDate instanceof Date) {
        params.toDate = params.toDate.toISOString().split('T')[0]; // YYYY-MM-DD
      }
      
      const response = await axiosInstance.get("/transactions/filter", {
        params: params
      });
      return response.data;
    } catch (error) {
      console.error("Error getting filtered transactions:", error);
      throw error;
    }
  },

  // POST /transactions - Tạo transaction mới
  createTransaction: async (transactionData) => {
    try {
      const response = await axiosInstance.post("/transactions", transactionData);
      return response.data;
    } catch (error) {
      console.error("Error creating transaction:", error);
      throw error;
    }
  },

  // PUT /transactions/{id} - Cập nhật transaction
  updateTransaction: async (id, updateData) => {
    try {
      const response = await axiosInstance.put(`/transactions/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error("Error updating transaction:", error);
      throw error;
    }
  },

  // DELETE /transactions - Xóa nhiều transactions
  deleteTransactions: async (ids) => {
    try {
      const response = await axiosInstance.delete("/transactions", {
        data: ids
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting transactions:", error);
      throw error;
    }
  },

  // Xóa một transaction duy nhất (helper method)
  deleteTransaction: async (id) => {
    return transactionService.deleteTransactions([id]);
  }
};

export default transactionService;