import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import walletService from "../../services/walletService"

export const fetchMoneySources = createAsyncThunk("wallet/fetchMoneySources", async (_, { rejectWithValue }) => {
  try {
    const response = await walletService.getAllMoneySources()
    return response.data || response || []
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message || "Không thể tải danh sách nguồn tiền")
  }
})

export const createMoneySource = createAsyncThunk("wallet/createMoneySource", async (payload, { rejectWithValue }) => {
  try {
    const response = await walletService.createMoneySource(payload)
    return response.data || response
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message || "Có lỗi xảy ra khi tạo nguồn tiền")
  }
})

export const updateMoneySource = createAsyncThunk(
  "wallet/updateMoneySource",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const response = await walletService.updateMoneySource(id, payload)
      return { id, data: response.data || response }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || "Có lỗi xảy ra khi cập nhật nguồn tiền")
    }
  },
)

export const deleteMoneySource = createAsyncThunk("wallet/deleteMoneySource", async (id, { rejectWithValue }) => {
  try {
    await walletService.deleteMoneySource(id)
    return id
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message || "Có lỗi xảy ra khi xóa nguồn tiền")
  }
})

export const toggleMoneySourceStatus = createAsyncThunk(
  "wallet/toggleMoneySourceStatus",
  async (id, { getState, rejectWithValue }) => {
    try {
      const state = getState()
      const source = state.wallet.moneySources.find((s) => s.id === id)
      if (!source) {
        return rejectWithValue("Không tìm thấy nguồn tiền")
      }

      const updatedData = {
        ...source,
        isActive: !source.isActive,
      }

      const response = await walletService.updateMoneySource(id, updatedData)
      return { id, data: response.data || response }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || "Có lỗi xảy ra khi cập nhật trạng thái")
    }
  },
)

const initialState = {
  moneySources: [],
  loading: false,
  submitting: false,
  error: null,
  toast: null,
}

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setToast: (state, action) => {
      state.toast = action.payload
    },
    clearToast: (state) => {
      state.toast = null
    },
    resetSubmitting: (state) => {
      state.submitting = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMoneySources.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMoneySources.fulfilled, (state, action) => {
        state.loading = false
        state.moneySources = action.payload
        state.error = null
      })
      .addCase(fetchMoneySources.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.toast = { message: action.payload, type: "error" }
      })

      .addCase(createMoneySource.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      // eslint-disable-next-line no-unused-vars
      .addCase(createMoneySource.fulfilled, (state, action) => {
        state.submitting = false
        state.toast = { message: "Thêm nguồn tiền thành công!", type: "success" }
        state.error = null
      })
      .addCase(createMoneySource.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload
        state.toast = { message: action.payload, type: "error" }
      })

      .addCase(updateMoneySource.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      // eslint-disable-next-line no-unused-vars
      .addCase(updateMoneySource.fulfilled, (state, action) => {
        state.submitting = false
        state.toast = { message: "Cập nhật nguồn tiền thành công!", type: "success" }
        state.error = null
      })
      .addCase(updateMoneySource.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload
        state.toast = { message: action.payload, type: "error" }
      })

      .addCase(deleteMoneySource.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      // eslint-disable-next-line no-unused-vars
      .addCase(deleteMoneySource.fulfilled, (state, action) => {
        state.submitting = false
        state.toast = { message: "Xóa nguồn tiền thành công!", type: "success" }
        state.error = null
      })
      .addCase(deleteMoneySource.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload
        state.toast = { message: action.payload, type: "error" }
      })

      .addCase(toggleMoneySourceStatus.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(toggleMoneySourceStatus.fulfilled, (state, action) => {
        state.submitting = false
        const source = state.moneySources.find((s) => s.id === action.meta.arg)
        const statusText = source && !source.isActive ? "Kích hoạt" : "Vô hiệu hóa"
        state.toast = { message: `${statusText} nguồn tiền thành công!`, type: "success" }
        state.error = null
      })
      .addCase(toggleMoneySourceStatus.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload
        state.toast = { message: action.payload, type: "error" }
      })
  },
})

export const { clearError, setToast, clearToast, resetSubmitting } = walletSlice.actions
export default walletSlice.reducer
