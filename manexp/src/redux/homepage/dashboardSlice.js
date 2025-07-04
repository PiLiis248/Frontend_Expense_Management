import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import transactionService from '../../services/transactionService'
import spendingLimitService from '../../services/spendingLimitService'
import categoryService from '../../services/categoryService'
import walletService from '../../services/walletService'
import UserAPI from '../../services/userService'

export const fetchUser = createAsyncThunk(
  'dashboard/fetchUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await UserAPI.getUserById()
      if (response.status === 200) {
        return response.data
      }
      throw new Error('Failed to fetch user data')
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateUserNotice = createAsyncThunk(
  'dashboard/updateUserNotice',
  async ({ userId, notice }, { rejectWithValue }) => {
    try {
      await UserAPI.updateNotice(userId, notice)
      return { notice }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchDashboardData',
  async (_, { rejectWithValue }) => {
    try {
      const [
        totalIncomeResponse,
        totalExpenseResponse,
        recentTransactionsResponse,
        spendingLimitsResponse,
        categoriesResponse,
        currentBalanceResponse,
      ] = await Promise.all([
        transactionService.getTotalIncome("MONTH"),
        transactionService.getTotalExpense("MONTH"),
        transactionService.getRecentTransactions(null, 10),
        spendingLimitService.getAllSpendingLimits(),
        categoryService.getAllCategories(),
        walletService.getCurrentBalance(null)
      ])

      const totalIncome = totalIncomeResponse || 0
      const totalExpense = totalExpenseResponse || 0
      const balance = currentBalanceResponse || 0

      const recentTransactions = recentTransactionsResponse?.map(transaction => ({
        id: transaction.id,
        amount: transaction.amount,
        description: transaction.description,
        action: transaction.transactionTypeType === "INCOME" ? "income" : "expense",
        transaction_date: transaction.transactionDate,
        category: transaction.categoriesName,
      })) || []

      const spendingLimits = spendingLimitsResponse?.map(limit => {
        return {
          id: limit.id,
          category: limit.categoriesName,
          limit_amount: limit.limitAmount,
          actual_spent: limit.actualSpent,
          period_type: limit.periodType,
        }
      }).filter(limit => limit.category) || []

      const categories = categoriesResponse?.map(category => {
        return {
          id: category.id,
          name: category.name,
          transaction_count: category.transactions.length || 0,
        }
      }) || []

      return {
        totalIncome,
        totalExpense,
        balance,
        recentTransactions,
        spendingLimits,
        categories,
      }
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      return rejectWithValue('Không thể tải dữ liệu tổng quan. Vui lòng thử lại sau.')
    }
  }
)

const initialState = {
  user: null,
  summary: {
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    recentTransactions: [],
    spendingLimits: [],
    categories: [],
  },
  loading: false,
  error: null,
  userLoading: false,
  userError: null,
}

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearUserError: (state) => {
      state.userError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.userLoading = true
        state.userError = null
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.userLoading = false
        state.user = action.payload
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.userLoading = false
        state.userError = action.payload
      })
      
      .addCase(updateUserNotice.pending, (state) => {
        state.userLoading = true
      })
      .addCase(updateUserNotice.fulfilled, (state, action) => {
        state.userLoading = false
        if (state.user) {
          state.user.notice = action.payload.notice
        }
      })
      .addCase(updateUserNotice.rejected, (state, action) => {
        state.userLoading = false
        state.userError = action.payload
      })
      
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false
        state.summary = action.payload
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError, clearUserError } = dashboardSlice.actions
export default dashboardSlice.reducer