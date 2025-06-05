import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { walletService } from '../../services/walletService';

// Async thunks
export const fetchMoneySources = createAsyncThunk(
  'wallet/fetchMoneySources',
  async (_, { rejectWithValue }) => {
    try {
      const data = await walletService.getAllMoneySources();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải danh sách nguồn tiền');
    }
  }
);

export const createMoneySource = createAsyncThunk(
  'wallet/createMoneySource',
  async (moneySourceData, { rejectWithValue }) => {
    try {
      const data = await walletService.createMoneySource(moneySourceData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể thêm nguồn tiền');
    }
  }
);

export const updateMoneySource = createAsyncThunk(
  'wallet/updateMoneySource',
  async ({ id, moneySourceData }, { rejectWithValue }) => {
    try {
      const data = await walletService.updateMoneySource(id, moneySourceData);
      return { id, data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể cập nhật nguồn tiền');
    }
  }
);

export const deleteMoneySource = createAsyncThunk(
  'wallet/deleteMoneySource',
  async (id, { rejectWithValue }) => {
    try {
      await walletService.deleteMoneySource(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể xóa nguồn tiền');
    }
  }
);

export const toggleMoneySourceStatus = createAsyncThunk(
  'wallet/toggleMoneySourceStatus',
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const data = await walletService.toggleMoneySourceStatus(id, isActive);
      return { id, isActive, data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể thay đổi trạng thái nguồn tiền');
    }
  }
);

export const updateMoneySourceBalance = createAsyncThunk(
  'wallet/updateMoneySourceBalance',
  async ({ id, newBalance }, { rejectWithValue }) => {
    try {
      const data = await walletService.updateBalance(id, newBalance);
      return { id, newBalance, data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể cập nhật số dư');
    }
  }
);

// Initial state
const initialState = {
  moneySources: [],
  loading: false,
  error: null,
  operationLoading: {
    create: false,
    update: false,
    delete: false,
    toggle: false,
    updateBalance: false
  },
  toast: null
};

// Wallet slice
const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    showToast: (state, action) => {
      state.toast = {
        message: action.payload.message,
        type: action.payload.type
      };
    },
    hideToast: (state) => {
      state.toast = null;
    },
    resetOperationLoading: (state) => {
      state.operationLoading = {
        create: false,
        update: false,
        delete: false,
        toggle: false,
        updateBalance: false
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch money sources
      .addCase(fetchMoneySources.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMoneySources.fulfilled, (state, action) => {
        state.loading = false;
        state.moneySources = action.payload;
        state.error = null;
      })
      .addCase(fetchMoneySources.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.toast = {
          message: action.payload,
          type: 'error'
        };
      })

      // Create money source
      .addCase(createMoneySource.pending, (state) => {
        state.operationLoading.create = true;
        state.error = null;
      })
      .addCase(createMoneySource.fulfilled, (state, action) => {
        state.operationLoading.create = false;
        state.moneySources.push(action.payload);
        state.toast = {
          message: 'Thêm nguồn tiền thành công!',
          type: 'success'
        };
      })
      .addCase(createMoneySource.rejected, (state, action) => {
        state.operationLoading.create = false;
        state.error = action.payload;
        state.toast = {
          message: action.payload,
          type: 'error'
        };
      })

      // Update money source
      .addCase(updateMoneySource.pending, (state) => {
        state.operationLoading.update = true;
        state.error = null;
      })
      .addCase(updateMoneySource.fulfilled, (state, action) => {
        state.operationLoading.update = false;
        const index = state.moneySources.findIndex(source => source.id === action.payload.id);
        if (index !== -1) {
          state.moneySources[index] = action.payload.data;
        }
        state.toast = {
          message: 'Cập nhật nguồn tiền thành công!',
          type: 'success'
        };
      })
      .addCase(updateMoneySource.rejected, (state, action) => {
        state.operationLoading.update = false;
        state.error = action.payload;
        state.toast = {
          message: action.payload,
          type: 'error'
        };
      })

      // Delete money source
      .addCase(deleteMoneySource.pending, (state) => {
        state.operationLoading.delete = true;
        state.error = null;
      })
      .addCase(deleteMoneySource.fulfilled, (state, action) => {
        state.operationLoading.delete = false;
        state.moneySources = state.moneySources.filter(source => source.id !== action.payload);
        state.toast = {
          message: 'Xóa nguồn tiền thành công!',
          type: 'success'
        };
      })
      .addCase(deleteMoneySource.rejected, (state, action) => {
        state.operationLoading.delete = false;
        state.error = action.payload;
        state.toast = {
          message: action.payload,
          type: 'error'
        };
      })

      // Toggle money source status
      .addCase(toggleMoneySourceStatus.pending, (state) => {
        state.operationLoading.toggle = true;
        state.error = null;
      })
      .addCase(toggleMoneySourceStatus.fulfilled, (state, action) => {
        state.operationLoading.toggle = false;
        const index = state.moneySources.findIndex(source => source.id === action.payload.id);
        if (index !== -1) {
          state.moneySources[index].isActive = action.payload.isActive;
        }
        state.toast = {
          message: `${action.payload.isActive ? 'Kích hoạt' : 'Vô hiệu hóa'} nguồn tiền thành công!`,
          type: 'success'
        };
      })
      .addCase(toggleMoneySourceStatus.rejected, (state, action) => {
        state.operationLoading.toggle = false;
        state.error = action.payload;
        state.toast = {
          message: action.payload,
          type: 'error'
        };
      })

      // Update balance
      .addCase(updateMoneySourceBalance.pending, (state) => {
        state.operationLoading.updateBalance = true;
        state.error = null;
      })
      .addCase(updateMoneySourceBalance.fulfilled, (state, action) => {
        state.operationLoading.updateBalance = false;
        const index = state.moneySources.findIndex(source => source.id === action.payload.id);
        if (index !== -1) {
          state.moneySources[index].currentBalance = action.payload.newBalance;
        }
        state.toast = {
          message: 'Cập nhật số dư thành công!',
          type: 'success'
        };
      })
      .addCase(updateMoneySourceBalance.rejected, (state, action) => {
        state.operationLoading.updateBalance = false;
        state.error = action.payload;
        state.toast = {
          message: action.payload,
          type: 'error'
        };
      });
  }
});

// Export actions
export const { clearError, showToast, hideToast, resetOperationLoading } = walletSlice.actions;

// Selectors
export const selectMoneySources = (state) => state.wallet.moneySources;
export const selectWalletLoading = (state) => state.wallet.loading;
export const selectWalletError = (state) => state.wallet.error;
export const selectOperationLoading = (state) => state.wallet.operationLoading;
export const selectToast = (state) => state.wallet.toast;
export const selectActiveMoneySources = (state) => 
  state.wallet.moneySources.filter(source => source.isActive);
export const selectTotalBalance = (state) => 
  state.wallet.moneySources
    .filter(source => source.isActive)
    .reduce((total, source) => total + source.currentBalance, 0);

// Export reducer
export default walletSlice.reducer;