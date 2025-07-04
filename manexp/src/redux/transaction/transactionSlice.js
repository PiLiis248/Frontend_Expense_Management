import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import transactionService from "../../services/transactionService"
import categoryService from "../../services/categoryService"
import walletService from "../../services/walletService"

export const fetchTransactions = createAsyncThunk(
  "transaction/fetchTransactions",
  async ({ pageNumber, size, sort }, { rejectWithValue }) => {
    try {
      const params = { pageNumber, size, sort }
      const response = await transactionService.getTransactionsWithPagination(null, params)
      return response
    } catch (error) {
      return rejectWithValue(error.message || "Lỗi khi tải danh sách giao dịch")
    }
  },
)

export const fetchFilteredTransactions = createAsyncThunk(
  "transaction/fetchFilteredTransactions",
  async (filterParams, { rejectWithValue }) => {
    try {
      const response = await transactionService.getFilteredTransactions(filterParams)
      return response
    } catch (error) {
      return rejectWithValue(error.message || "Lỗi khi lọc giao dịch")
    }
  },
)

export const fetchCategories = createAsyncThunk(
  "transaction/fetchCategories",
  async (transactionTypeId, { rejectWithValue }) => {
    try {
      const response = await categoryService.getAllCategoriesByTransactionType(transactionTypeId)
      return response || []
    } catch (error) {
      return rejectWithValue(error.message || "Lỗi khi tải danh mục")
    }
  },
)

export const fetchMoneySources = createAsyncThunk("transaction/fetchMoneySources", async (_, { rejectWithValue }) => {
  try {
    const response = await walletService.getAllMoneySources()
    return response || []
  } catch (error) {
    return rejectWithValue(error.message || "Lỗi khi tải nguồn tiền")
  }
})

export const createTransaction = createAsyncThunk(
  "transaction/createTransaction",
  async (transactionData, { rejectWithValue }) => {
    try {
      const response = await transactionService.createTransaction(transactionData)
      return response
    } catch (error) {
      return rejectWithValue(error.message || "Lỗi khi tạo giao dịch")
    }
  },
)

export const updateTransaction = createAsyncThunk(
  "transaction/updateTransaction",
  async ({ id, updateData }, { rejectWithValue }) => {
    try {
      const response = await transactionService.updateTransaction(id, updateData)
      return { id, data: response }
    } catch (error) {
      return rejectWithValue(error.message || "Lỗi khi cập nhật giao dịch")
    }
  },
)

export const deleteTransaction = createAsyncThunk(
  "transaction/deleteTransaction",
  async (transactionId, { rejectWithValue }) => {
    try {
      await transactionService.deleteTransaction(transactionId)
      return transactionId
    } catch (error) {
      return rejectWithValue(error.message || "Lỗi khi xóa giao dịch")
    }
  },
)

export const deleteTransactions = createAsyncThunk(
  "transaction/deleteTransactions",
  async (transactionIds, { rejectWithValue }) => {
    try {
      await transactionService.deleteTransactions(transactionIds)
      return transactionIds
    } catch (error) {
      return rejectWithValue(error.message || "Lỗi khi xóa giao dịch")
    }
  },
)

const initialState = {
  transactions: [],
  categories: [],
  moneySources: [],
  selectedTransactions: [],
  loading: false,
  error: null,

  currentPage: 1,
  itemsPerPage: 5,
  totalPages: 0,
  totalElements: 0,

  sortField: "transactionDate",
  sortDirection: "desc",

  filters: {
    transactionTypesName: "all",
    categoriesName: "",
    moneySourceName: "",
    fromDate: "",
    toDate: "",
  },

  showForm: false,
  editingId: null,
  editData: {},
  formData: {
    amount: "",
    description: "No details",
    transactionTypeType: "EXPENSE",
    transactionDate: new Date().toISOString().split("T")[0],
    categoriesId: "",
    moneySourcesId: "",
  },
  formErrors: {},

  deleteModal: {
    isOpen: false,
    transactionId: null,
    transactionInfo: null,
  },

  toast: null,
}

const transactionSlice = createSlice({
  name: "transaction",
  initialState,
  reducers: {
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload
    },

    setSorting: (state, action) => {
      const { field, direction } = action.payload
      state.sortField = field
      state.sortDirection = direction
      state.currentPage = 1 
    },

    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },

    resetFilters: (state) => {
      state.filters = {
        transactionTypesName: "all",
        categoriesName: "",
        moneySourceName: "",
        fromDate: "",
        toDate: "",
      }
      state.currentPage = 1
    },

    setSelectedTransactions: (state, action) => {
      state.selectedTransactions = action.payload
    },

    toggleTransactionSelection: (state, action) => {
      const transactionId = action.payload
      const index = state.selectedTransactions.indexOf(transactionId)
      if (index > -1) {
        state.selectedTransactions.splice(index, 1)
      } else {
        state.selectedTransactions.push(transactionId)
      }
    },

    selectAllTransactions: (state) => {
      state.selectedTransactions = state.transactions.map((t) => t.id)
    },

    deselectAllTransactions: (state) => {
      state.selectedTransactions = []
    },

    setShowForm: (state, action) => {
      state.showForm = action.payload
      if (!action.payload) {
        state.formData = {
          amount: "",
          description: "",
          transactionTypeType: "EXPENSE",
          transactionDate: new Date().toISOString().split("T")[0],
          categoriesId: "",
          moneySourcesId: "",
        }
        state.formErrors = {}
      }
    },

    setFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload }
    },

    setFormErrors: (state, action) => {
      state.formErrors = action.payload
    },

    clearFieldError: (state, action) => {
      const fieldName = action.payload
      if (state.formErrors[fieldName]) {
        delete state.formErrors[fieldName]
      }
    },

    setEditingId: (state, action) => {
      state.editingId = action.payload
    },

    setEditData: (state, action) => {
      state.editData = { ...state.editData, ...action.payload }
    },

    resetEditData: (state) => {
      state.editingId = null
      state.editData = {}
    },

    setDeleteModal: (state, action) => {
      state.deleteModal = action.payload
    },

    setToast: (state, action) => {
      state.toast = action.payload
    },

    clearToast: (state) => {
      state.toast = null
    },

    clearError: (state) => {
      state.error = null
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload && action.payload.content) {
          state.transactions = action.payload.content
          state.totalPages = action.payload.totalPages
          state.totalElements = action.payload.totalElements
        } else {
          state.transactions = []
          state.totalPages = 0
          state.totalElements = 0
        }
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.transactions = []
      })

    builder
      .addCase(fetchFilteredTransactions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchFilteredTransactions.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload) {
          state.transactions = action.payload.content
          state.totalPages = action.payload.totalPages
          state.totalElements = action.payload.totalElements
        }
      })
      .addCase(fetchFilteredTransactions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.transactions = []
      })

    builder
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.error = action.payload
        state.categories = []
      })

    builder
      .addCase(fetchMoneySources.fulfilled, (state, action) => {
        state.moneySources = action.payload
      })
      .addCase(fetchMoneySources.rejected, (state, action) => {
        state.error = action.payload
        state.moneySources = []
      })

    builder
      .addCase(createTransaction.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createTransaction.fulfilled, (state) => {
        state.loading = false
        state.showForm = false
        state.formData = {
          amount: "",
          description: "",
          transactionTypeType: "EXPENSE",
          transactionDate: new Date().toISOString().split("T")[0],
          categoriesId: "",
          moneySourcesId: "",
        }
        state.formErrors = {}
        state.toast = { message: "Giao dịch đã được thêm thành công!", type: "success" }
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.toast = { message: action.payload, type: "error" }
      })

    builder
      .addCase(updateTransaction.fulfilled, (state) => {
        state.editingId = null
        state.editData = {}
        state.toast = { message: "Giao dịch đã được cập nhật!", type: "success" }
      })
      .addCase(updateTransaction.rejected, (state, action) => {
        state.error = action.payload
        state.toast = { message: action.payload, type: "error" }
      })

    builder
      .addCase(deleteTransaction.fulfilled, (state) => {
        state.deleteModal = { isOpen: false, transactionId: null, transactionInfo: null }
        state.toast = { message: "Giao dịch đã được xóa", type: "success" }
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.error = action.payload
        state.toast = { message: action.payload, type: "error" }
      })

    builder
      .addCase(deleteTransactions.fulfilled, (state, action) => {
        state.selectedTransactions = []
        state.deleteModal = { isOpen: false, transactionId: null, transactionInfo: null }
        state.toast = { message: `Đã xóa ${action.meta.arg.length} giao dịch`, type: "success" }
      })
      .addCase(deleteTransactions.rejected, (state, action) => {
        state.error = action.payload
        state.toast = { message: action.payload, type: "error" }
      })
  },
})

export const {
  setCurrentPage,
  setSorting,
  setFilters,
  resetFilters,
  setSelectedTransactions,
  toggleTransactionSelection,
  selectAllTransactions,
  deselectAllTransactions,
  setShowForm,
  setFormData,
  setFormErrors,
  clearFieldError,
  setEditingId,
  setEditData,
  resetEditData,
  setDeleteModal,
  setToast,
  clearToast,
  clearError,
} = transactionSlice.actions

export const selectTransactions = (state) => state.transaction.transactions
export const selectCategories = (state) => state.transaction.categories
export const selectMoneySources = (state) => state.transaction.moneySources
export const selectSelectedTransactions = (state) => state.transaction.selectedTransactions
export const selectLoading = (state) => state.transaction.loading
export const selectError = (state) => state.transaction.error
export const selectCurrentPage = (state) => state.transaction.currentPage
export const selectTotalPages = (state) => state.transaction.totalPages
export const selectTotalElements = (state) => state.transaction.totalElements
export const selectSortField = (state) => state.transaction.sortField
export const selectSortDirection = (state) => state.transaction.sortDirection
export const selectFilters = (state) => state.transaction.filters
export const selectShowForm = (state) => state.transaction.showForm
export const selectFormData = (state) => state.transaction.formData
export const selectFormErrors = (state) => state.transaction.formErrors
export const selectEditingId = (state) => state.transaction.editingId
export const selectEditData = (state) => state.transaction.editData
export const selectDeleteModal = (state) => state.transaction.deleteModal
export const selectToast = (state) => state.transaction.toast

export default transactionSlice.reducer
