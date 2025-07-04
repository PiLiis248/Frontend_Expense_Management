import axiosInstance from "../api/axios"
import tokenMethod from "../api/token"

// Helper function to get current user ID
const getCurrentUserId = () => {
  try {
    const token = tokenMethod.get()
    return token?.user?.id
  } catch (error) {
    console.error("Error getting user ID from token:", error)
    return null
  }
}

// Helper function to map transaction type to ID
const getTransactionTypeId = (transactionTypeType) => {
  return transactionTypeType === "INCOME" ? 2 : 1 // 1 for EXPENSE, 2 for INCOME
}

const transactionService = {
  // GET /transactions/user/{id} - Lấy tất cả transactions của user
  getAllTransactions: async (userId = null) => {
    try {
      const targetUserId = userId || getCurrentUserId()
      const response = await axiosInstance.get(`/transactions/user/${targetUserId}`)
      return response.data
    } catch (error) {
      console.error("Error getting all transactions:", error)
      throw error
    }
  },

  // GET /transactions/page/user/{id} - Lấy transactions với phân trang
  getTransactionsWithPagination: async (userId = null, params = {}) => {
    try {
      const targetUserId = userId || getCurrentUserId()
      const response = await axiosInstance.get(`/transactions/page/user/${targetUserId}`, {
        params: params, // Có thể truyền page, size, sort
      })
      return response.data
    } catch (error) {
      console.error("Error getting transactions with pagination:", error)
      throw error
    }
  },

  // GET /transactions/filter - Lọc transactions
  getFilteredTransactions: async (filter = {}) => {
    try {
      // Chuyển đổi Date objects thành string format nếu cần
      const params = { ...filter }
      if (params.fromDate && params.fromDate instanceof Date) {
        params.fromDate = params.fromDate.toISOString().split("T")[0] // YYYY-MM-DD
      }
      if (params.toDate && params.toDate instanceof Date) {
        params.toDate = params.toDate.toISOString().split("T")[0] // YYYY-MM-DD
      }
      const userId = getCurrentUserId()
      const response = await axiosInstance.get(`/transactions/filter/user/${userId}`, {
        params: params,
      })
      console.log(response.data);
      
      return response.data
    } catch (error) {
      console.error("Error getting filtered transactions:", error)
      throw error
    }
  },

  // POST /transactions - Tạo transaction mới
  createTransaction: async (transactionData) => {
    try {
      // Add userId and transactionTypeId to the transaction data
      const userId = getCurrentUserId()
      const transactionTypesId = getTransactionTypeId(transactionData.transactionTypeType)

      const completeTransactionData = {
        ...transactionData,
        userId,
        transactionTypesId,
      }

      const response = await axiosInstance.post("/transactions", completeTransactionData)
      return response.data
    } catch (error) {
      console.error("Error creating transaction:", error)
      throw error
    }
  },

  // PUT /transactions/{id} - Cập nhật transaction
  updateTransaction: async (id, updateData) => {
    try {
      // Add userId and transactionTypeId to the update data
      const userId = getCurrentUserId()
      const transactionTypesId = getTransactionTypeId(updateData.transactionTypeType)

      const completeUpdateData = {
        ...updateData,
        userId,
        transactionTypesId,
      }

      const response = await axiosInstance.put(`/transactions/${id}`, completeUpdateData)
      return response.data
    } catch (error) {
      console.error("Error updating transaction:", error)
      throw error
    }
  },

  // DELETE /transactions - Xóa nhiều transactions
  deleteTransactions: async (ids) => {
    try {
      const response = await axiosInstance.delete("/transactions", {
        data: ids,
      })
      return response.data
    } catch (error) {
      console.error("Error deleting transactions:", error)
      throw error
    }
  },

  // Xóa một transaction duy nhất (helper method)
  deleteTransaction: async (id) => {
    return transactionService.deleteTransactions([id])
  },

  // GET /transactions/total-expense/user/{userID} - Lấy tổng chi tiêu
  getTotalExpense: async (type, userId = null) => {
    try {
      const targetUserId = userId || getCurrentUserId()
      const response = await axiosInstance.get(`/transactions/total-expense/user/${targetUserId}`, {
        params: { type: type }, // DAY, MONTH, YEAR
      })
      return response.data
    } catch (error) {
      console.error("Error getting total expense:", error)
      throw error
    }
  },

  // GET /transactions/total-income/user/{userID} - Lấy tổng thu nhập
  getTotalIncome: async (type, userId = null) => {
    try {
      const targetUserId = userId || getCurrentUserId()
      const response = await axiosInstance.get(`/transactions/total-income/user/${targetUserId}`, {
        params: { type: type }, // DAY, MONTH, YEAR
      })
      return response.data
    } catch (error) {
      console.error("Error getting total income:", error)
      throw error
    }
  },

  // GET /transactions/recent-transactions/user/{userId}/limit/{limit} - Lấy giao dịch gần đây
  getRecentTransactions: async (userId = null, limit = 10) => {
    try {
      const targetUserId = userId || getCurrentUserId()
      const response = await axiosInstance.get(`/transactions/recent-transactions/user/${targetUserId}/limit/${limit}`) 
      return response.data
    } catch (error) {
      console.error("Error getting recent transactions:", error)
      throw error
    }
  },
}

export default transactionService
