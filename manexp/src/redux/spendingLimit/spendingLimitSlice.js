import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import spendingLimitService from "../../services/spendingLimitService"
import categoryService from "../../services/categoryService"
import moneySourceService from "../../services/walletService"

export const fetchSpendingLimits = createAsyncThunk(
  "spendingLimit/fetchSpendingLimits",
  async (_, { rejectWithValue }) => {
    try {
      const response = await spendingLimitService.getAllSpendingLimits()
      return response || []
    } catch (error) {
      return rejectWithValue(error.message || "Lỗi khi tải danh sách mức chi tiêu")
    }
  },
)

export const fetchCategories = createAsyncThunk("spendingLimit/fetchCategories", async (_, { rejectWithValue }) => {
  try {
    const response = await categoryService.getAllCategories()
    return response || []
  } catch (error) {
    return rejectWithValue(error.message || "Lỗi khi tải danh mục")
  }
})

export const fetchMoneySources = createAsyncThunk("spendingLimit/fetchMoneySources", async (_, { rejectWithValue }) => {
  try {
    const response = await moneySourceService.getAllMoneySources()
    return response || []
  } catch (error) {
    return rejectWithValue(error.message || "Lỗi khi tải nguồn tiền")
  }
})

export const createSpendingLimit = createAsyncThunk(
  "spendingLimit/createSpendingLimit",
  async (limitData, { rejectWithValue }) => {
    try {
      const response = await spendingLimitService.createSpendingLimit(limitData)
      return response
    } catch (error) {
      return rejectWithValue(error.message || "Lỗi khi thêm mức chi tiêu")
    }
  },
)

export const updateSpendingLimit = createAsyncThunk(
  "spendingLimit/updateSpendingLimit",
  async ({ id, updateData }, { rejectWithValue }) => {
    try {
      const response = await spendingLimitService.updateSpendingLimit(id, updateData)
      return { id, data: response }
    } catch (error) {
      return rejectWithValue(error.message || "Lỗi khi cập nhật mức chi tiêu")
    }
  },
)

export const deleteSpendingLimit = createAsyncThunk(
  "spendingLimit/deleteSpendingLimit",
  async (limitId, { rejectWithValue }) => {
    try {
      await spendingLimitService.deleteSpendingLimit(limitId)
      return limitId
    } catch (error) {
      return rejectWithValue(error.message || "Lỗi khi xóa mức chi tiêu")
    }
  },
)

export const resetSpendingLimit = createAsyncThunk(
  "spendingLimit/resetSpendingLimit",
  // eslint-disable-next-line no-unused-vars
  async (limit, { dispatch, rejectWithValue }) => {
    try {
      await spendingLimitService.deleteSpendingLimit(limit.id)

      const newLimitData = {
        limitAmount: limit.limitAmount,
        periodType: limit.periodType,
        startDate: new Date().toISOString().split("T")[0],
        categoryId: limit.categoriesId,
        moneySourceId: limit.moneySourcesId,
        note: limit.note || "",
        isActive: true,
      }

      const response = await spendingLimitService.createSpendingLimit(newLimitData)
      return { oldId: limit.id, newLimit: response }
    } catch (error) {
      return rejectWithValue(error.message || "Lỗi khi reset mức chi tiêu")
    }
  },
)

export const toggleSpendingLimitStatus = createAsyncThunk(
  "spendingLimit/toggleSpendingLimitStatus",
  async (limit, { rejectWithValue }) => {
    try {
      const updatedData = {
        ...limit,
        isActive: !limit.active,
      }
      const response = await spendingLimitService.updateSpendingLimit(limit.id, updatedData)
      return { id: limit.id, data: response }
    } catch (error) {
      return rejectWithValue(error.message || "Lỗi khi thay đổi trạng thái mức chi tiêu")
    }
  },
)

const getEndDate = (startDate, periodType) => {
  const endDate = new Date(startDate)
  switch (periodType) {
    case "DAILY":
      endDate.setDate(endDate.getDate() + 1)
      break
    case "WEEKLY":
      endDate.setDate(endDate.getDate() + 7)
      break
    case "MONTHLY":
      endDate.setMonth(endDate.getMonth() + 1)
      break
    case "YEARLY":
      endDate.setFullYear(endDate.getFullYear() + 1)
      break
    default:
      endDate.setMonth(endDate.getMonth() + 1)
  }
  return endDate
}

const shouldResetLimit = (limit) => {
  if (!limit.active) return false
  const now = new Date()
  const startDate = new Date(limit.startDate)
  const endDate = getEndDate(startDate, limit.periodType)
  return now >= endDate
}

const initialState = {
  spendingLimits: [],
  categories: [],
  moneySources: [],
  loading: false,
  error: null,

  showForm: false,
  editingId: null,
  formData: {
    limitAmount: "",
    periodType: "MONTHLY",
    startDate: new Date().toISOString().split("T")[0],
    categoryId: "",
    moneySourceId: "",
    note: "",
    isActive: true,
  },

  showConfirmModal: false,
  itemToDelete: null,

  toast: null,

  warningCount: 0,
}

const spendingLimitSlice = createSlice({
  name: "spendingLimit",
  initialState,
  reducers: {
    setShowForm: (state, action) => {
      state.showForm = action.payload
      if (!action.payload) {
        state.formData = {
          limitAmount: "",
          periodType: "MONTHLY",
          startDate: new Date().toISOString().split("T")[0],
          categoryId: "",
          moneySourceId: "",
          note: "",
          isActive: true,
        }
        state.editingId = null
      }
    },

    setFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload }
    },

    setEditingId: (state, action) => {
      state.editingId = action.payload
    },

    resetForm: (state) => {
      state.formData = {
        limitAmount: "",
        periodType: "MONTHLY",
        startDate: new Date().toISOString().split("T")[0],
        categoryId: "",
        moneySourceId: "",
        note: "",
        isActive: true,
      }
      state.editingId = null
    },

    setShowConfirmModal: (state, action) => {
      state.showConfirmModal = action.payload
    },

    setItemToDelete: (state, action) => {
      state.itemToDelete = action.payload
    },

    setToast: (state, action) => {
      state.toast = action.payload
    },

    clearToast: (state) => {
      state.toast = null
    },

    calculateWarningCount: (state) => {
      state.warningCount = state.spendingLimits
        .filter((limit) => limit.active)
        .filter((limit) => {
          const actualSpent = limit.actualSpent || 0
          const limitAmount = limit.limitAmount || 0
          const percentage = limitAmount === 0 ? 0 : Math.round((actualSpent / limitAmount) * 100)
          return percentage >= 80
        }).length
    },

    processLimitsForReset: (state) => {
      state.spendingLimits = state.spendingLimits.filter((limit) => {
        if (limit.active && shouldResetLimit(limit)) {
          return false
        }
        return true
      })
    },

    clearError: (state) => {
      state.error = null
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchSpendingLimits.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSpendingLimits.fulfilled, (state, action) => {
        state.loading = false
        state.spendingLimits = action.payload
        state.warningCount = action.payload
          .filter((limit) => limit.active)
          .filter((limit) => {
            const actualSpent = limit.actualSpent || 0
            const limitAmount = limit.limitAmount || 0
            const percentage = limitAmount === 0 ? 0 : Math.round((actualSpent / limitAmount) * 100)
            return percentage >= 80
          }).length
      })
      .addCase(fetchSpendingLimits.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.spendingLimits = []
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
      .addCase(createSpendingLimit.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createSpendingLimit.fulfilled, (state) => {
        state.loading = false
        state.showForm = false
        state.formData = {
          limitAmount: "",
          periodType: "MONTHLY",
          startDate: new Date().toISOString().split("T")[0],
          categoryId: "",
          moneySourceId: "",
          note: "",
          isActive: true,
        }
        state.editingId = null
        state.toast = { message: "Thêm mức chi tiêu thành công", type: "success" }
      })
      .addCase(createSpendingLimit.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.toast = { message: action.payload, type: "error" }
      })

    builder
      .addCase(updateSpendingLimit.fulfilled, (state) => {
        state.showForm = false
        state.formData = {
          limitAmount: "",
          periodType: "MONTHLY",
          startDate: new Date().toISOString().split("T")[0],
          categoryId: "",
          moneySourceId: "",
          note: "",
          isActive: true,
        }
        state.editingId = null
        state.toast = { message: "Cập nhật mức chi tiêu thành công", type: "success" }
      })
      .addCase(updateSpendingLimit.rejected, (state, action) => {
        state.error = action.payload
        state.toast = { message: action.payload, type: "error" }
      })

    builder
      .addCase(deleteSpendingLimit.fulfilled, (state) => {
        state.showConfirmModal = false
        state.itemToDelete = null
        state.toast = { message: "Xóa mức chi tiêu thành công", type: "success" }
      })
      .addCase(deleteSpendingLimit.rejected, (state, action) => {
        state.error = action.payload
        state.toast = { message: action.payload, type: "error" }
      })

    builder
      .addCase(resetSpendingLimit.fulfilled, (state) => {
        state.toast = { message: "Reset thành công! Chu kỳ mới đã được tạo.", type: "success" }
      })
      .addCase(resetSpendingLimit.rejected, (state, action) => {
        state.error = action.payload
        state.toast = { message: action.payload, type: "error" }
      })

    builder
      .addCase(toggleSpendingLimitStatus.fulfilled, (state, action) => {
        // eslint-disable-next-line no-unused-vars
        const limit = state.spendingLimits.find((l) => l.id === action.meta.arg.id)
        const wasActive = action.meta.arg.active
        state.toast = {
          message: `${wasActive ? "Vô hiệu hóa" : "Kích hoạt"} mức chi tiêu thành công`,
          type: "success",
        }
      })
      .addCase(toggleSpendingLimitStatus.rejected, (state, action) => {
        state.error = action.payload
        state.toast = { message: action.payload, type: "error" }
      })
  },
})

export const {
  setShowForm,
  setFormData,
  setEditingId,
  resetForm,
  setShowConfirmModal,
  setItemToDelete,
  setToast,
  clearToast,
  calculateWarningCount,
  processLimitsForReset,
  clearError,
} = spendingLimitSlice.actions

export const selectSpendingLimits = (state) => state.spendingLimit.spendingLimits
export const selectCategories = (state) => state.spendingLimit.categories
export const selectMoneySources = (state) => state.spendingLimit.moneySources
export const selectLoading = (state) => state.spendingLimit.loading
export const selectError = (state) => state.spendingLimit.error
export const selectShowForm = (state) => state.spendingLimit.showForm
export const selectEditingId = (state) => state.spendingLimit.editingId
export const selectFormData = (state) => state.spendingLimit.formData
export const selectShowConfirmModal = (state) => state.spendingLimit.showConfirmModal
export const selectItemToDelete = (state) => state.spendingLimit.itemToDelete
export const selectToast = (state) => state.spendingLimit.toast
export const selectWarningCount = (state) => state.spendingLimit.warningCount

export const selectActiveSpendingLimits = (state) => state.spendingLimit.spendingLimits.filter((limit) => limit.active)

export const selectWarningLimits = (state) =>
  state.spendingLimit.spendingLimits.filter((limit) => {
    if (!limit.active) return false
    const actualSpent = limit.actualSpent || 0
    const limitAmount = limit.limitAmount || 0
    const percentage = limitAmount === 0 ? 0 : Math.round((actualSpent / limitAmount) * 100)
    return percentage >= 80
  })

export const selectOverLimits = (state) =>
  state.spendingLimit.spendingLimits.filter((limit) => {
    if (!limit.active) return false
    const actualSpent = limit.actualSpent || 0
    const limitAmount = limit.limitAmount || 0
    const percentage = limitAmount === 0 ? 0 : Math.round((actualSpent / limitAmount) * 100)
    return percentage >= 100
  })

export default spendingLimitSlice.reducer
