import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import categoryService from "../../services/categoryService";

export const fetchCategories = createAsyncThunk(
  "category/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const data = await categoryService.getAllCategories();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Lỗi khi tải danh mục!");
    }
  }
);

export const createCategory = createAsyncThunk(
  "category/createCategory",
  async (categoryData, { rejectWithValue }) => {
    try {
      const data = await categoryService.createCategory(categoryData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Lỗi khi thêm danh mục!");
    }
  }
);

export const updateCategory = createAsyncThunk(
  "category/updateCategory",
  async ({ id, categoryData }, { rejectWithValue }) => {
    try {
      const data = await categoryService.updateCategory(id, categoryData);
      return { id, data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Lỗi khi cập nhật danh mục!");
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "category/deleteCategory",
  async (id, { rejectWithValue }) => {
    try {
      await categoryService.deleteCategory(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Lỗi khi xóa danh mục!");
    }
  }
);

// Initial state
const initialState = {
  categories: [],
  loading: false,
  error: null,
  // UI state
  showForm: false,
  editingId: null,
  searchTerm: "",
  expandedCategories: new Set(),
  // Form state
  formData: {
    name: "",
    parentId: null,
    icon: "",
    transactionTypesId: 1,
  },
  formErrors: {
    name: "",
    icon: "",
  },
  // Modal state
  showIconPicker: false,
  toast: null,
  deleteConfirm: null,
};

// Helper functions
const iconMapping = {
  // Categories
  dining: "utensils",
  transport: "car",
  shopping: "shopping-cart",
  utilities: "home",
  entertainment: "gamepad",
  money: "wallet",
  health: "heartbeat",
  work: "briefcase",
  sports: "football-ball",
  travel: "suitcase",
  technology: "laptop",
  
  // Dining & Food
  breakfast: "coffee",
  lunch: "hamburger",
  dinner: "pizza-slice",
  coffee: "mug-hot",
  grocery: "shopping-basket",
  restaurant: "utensils",
  fastfood: "hamburger",
  snack: "cookie-bite",
  drink: "glass-whiskey",
  alcohol: "wine-glass",
  dessert: "ice-cream",
  
  // Transport
  parking: "parking",
  fuel: "gas-pump",
  carwash: "car-crash", 
  repair: "tools",
  taxi: "taxi",
  bus: "bus",
  train: "train",
  flight: "plane",
  bike: "bicycle",
  walk: "walking",
  
  // Shopping
  clothing: "tshirt",
  shoes: "shoe-prints",
  accessories: "glasses",
  household: "couch",
  electronics: "tv",
  books: "book",
  gifts: "gift",
  pharmacy: "pills",
  
  // Utilities
  electricity: "bolt",
  water: "tint",
  internet: "wifi",
  phone: "phone",
  gas: "fire",
  rent: "home",
  insurance: "shield-alt",
  
  // Health & Beauty
  hospital: "hospital-alt",
  doctor: "user-md",
  medicine: "pills",
  fitness: "dumbbell",
  beauty: "spa", 
  dental: "tooth",
  vision: "eye",
  
  // Work & Education
  salary: "wallet",
  education: "graduation-cap",
  training: "chalkboard-teacher",
  office: "building",
  meeting: "users",
  project: "project-diagram",
  
  // Income Types
  income: "coins",
  base_salary: "money-bill",
  bonus: "gift",
  overtime: "clock",
  commission: "percentage",
  allowance: "hand-holding-usd",
  interest: "chart-line",
  rental: "key",
  investment: "chart-pie",
  freelance: "laptop-code",
  
  // Entertainment
  movie: "film",
  music: "music",
  gaming: "gamepad",
  sport: "football-ball",
  hobby: "palette",
  
  // Technology
  software: "laptop-code",
  hardware: "microchip",
  subscription: "credit-card",
  
  // General
  other: "ellipsis-h",
  misc_income: "plus-circle",
  misc_expense: "minus-circle",
  emergency: "exclamation-triangle",
  savings: "piggy-bank",
  debt: "credit-card",
  loan: "hand-holding-usd",
  tax: "receipt",
  fee: "tags",
  tip: "hand-holding-heart", 
  charity: "hand-holding-heart",
  
  // Time-based
  daily: "calendar-day",
  weekly: "calendar-week",
  monthly: "calendar-alt",
  yearly: "calendar",
  
  // Status
  completed: "check-circle",
  pending: "clock",
  cancelled: "times-circle",
  important: "star",
  
  // Financial
  bank: "university", 
  cash: "money-bill",
  card: "credit-card",
  transfer: "exchange-alt",
  budget: "calculator",
  report: "chart-bar"
};

const getIconClass = (iconName) => {
  if (!iconName) return "tag";
  return iconMapping[iconName] || iconName || "tag";
};

const isDefaultCategory = (category) => {
  return category.user === null || category.user === undefined;
};

const canDeleteCategory = (category) => {
  return !isDefaultCategory(category);
};

const validateForm = (formData, categories, editingId) => {
  const errors = {
    name: "",
    icon: "",
  };

  if (!formData.name || formData.name.trim() === "") {
    errors.name = "Vui lòng nhập tên danh mục";
  } else if (formData.name.trim().length < 2) {
    errors.name = "Tên danh mục phải có ít nhất 2 ký tự";
  } else if (formData.name.trim().length > 50) {
    errors.name = "Tên danh mục không được vượt quá 50 ký tự";
  }

  if (!formData.icon || formData.icon.trim() === "") {
    errors.icon = "Vui lòng chọn hoặc nhập icon cho danh mục";
  }

  const isDuplicateName = categories.some(
    (cat) => cat.name.toLowerCase().trim() === formData.name.toLowerCase().trim() && cat.id !== editingId,
  );

  if (isDuplicateName) {
    errors.name = "Tên danh mục đã tồn tại, vui lòng chọn tên khác";
  }

  return errors;
};

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    setShowForm: (state, action) => {
      state.showForm = action.payload;
    },
    setEditingId: (state, action) => {
      state.editingId = action.payload;
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    toggleCategoryExpansion: (state, action) => {
      const categoryId = action.payload;
      const newSet = new Set(state.expandedCategories);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      state.expandedCategories = newSet;
    },
    expandAllCategories: (state) => {
      const parentCategories = state.categories.filter(cat => !cat.parentId);
      state.expandedCategories = new Set(parentCategories.map(cat => cat.id));
    },
    collapseAllCategories: (state) => {
      state.expandedCategories = new Set();
    },
    
    setFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    setFormErrors: (state, action) => {
      state.formErrors = { ...state.formErrors, ...action.payload };
    },
    resetForm: (state) => {
      state.formData = {
        name: "",
        parentId: null,
        icon: "",
        transactionTypesId: 1,
      };
      state.formErrors = {
        name: "",
        icon: "",
      };
      state.showForm = false;
      state.editingId = null;
    },
    validateFormData: (state) => {
      const errors = validateForm(state.formData, state.categories, state.editingId);
      state.formErrors = errors;
      return !errors.name && !errors.icon;
    },
    
    setShowIconPicker: (state, action) => {
      state.showIconPicker = action.payload;
    },
    setToast: (state, action) => {
      state.toast = action.payload;
    },
    setDeleteConfirm: (state, action) => {
      state.deleteConfirm = action.payload;
    },
    
    setEditCategory: (state, action) => {
      const category = action.payload;
      state.formData = {
        name: category.name,
        parentId: category.parentId || null,
        icon: category.icon || "",
        transactionTypesId: category.transactionTypesId || 1,
      };
      state.editingId = category.id;
      state.showForm = true;
      state.formErrors = {
        name: "",
        icon: "",
      };
    },
    
    setDeleteConfirmation: (state, action) => {
      const { category, categories } = action.payload;
      
      if (!canDeleteCategory(category)) {
        state.toast = {
          message: "Không thể xóa danh mục mặc định của hệ thống!",
          type: "error"
        };
        return;
      }

      const childCategories = categories.filter(cat => cat.parentId === category.id);
      const hasChildren = childCategories.length > 0;
      
      let confirmMessage = `Hiện tại danh mục "${category.name}" đang có`;
      const warnings = [];

      if (hasChildren) {
        warnings.push(`Lưu ý: Tất cả ${childCategories.length} danh mục con cũng sẽ bị xóa.`);
      }

      const transactionCount = category.transaction_count || 0;
      if (transactionCount > 0) {
        warnings.push(`Lưu ý: Tất cả ${transactionCount} giao dịch liên quan sẽ bị ảnh hưởng.`);
      }

      if (hasChildren || transactionCount > 0) {
        const items = [];
        if (hasChildren) items.push(`${childCategories.length} danh mục con`);
        if (transactionCount > 0) items.push(`${transactionCount} giao dịch`);
        confirmMessage += ` ${items.join(" và ")}, bạn có chắc muốn xóa danh mục?`;
      } else {
        confirmMessage = `Bạn có chắc muốn xóa danh mục "${category.name}"?`;
      }

      state.deleteConfirm = {
        categoryId: category.id,
        categoryName: category.name,
        message: confirmMessage,
        hasChildren,
        transactionCount,
        warnings,
      };
    },
    
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
        state.error = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.toast = {
          message: action.payload,
          type: "error"
        };
      })
      
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories.push(action.payload);
        state.toast = {
          message: "Thêm danh mục thành công!",
          type: "success"
        };
        state.formData = {
          name: "",
          parentId: null,
          icon: "",
          transactionTypesId: 1,
        };
        state.formErrors = {
          name: "",
          icon: "",
        };
        state.showForm = false;
        state.editingId = null;
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.toast = {
          message: action.payload,
          type: "error"
        };
      })
      
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
        const { id, data } = action.payload;
        const index = state.categories.findIndex(cat => cat.id === id);
        if (index !== -1) {
          state.categories[index] = { ...state.categories[index], ...data };
        }
        state.toast = {
          message: "Cập nhật danh mục thành công!",
          type: "success"
        };
        state.formData = {
          name: "",
          parentId: null,
          icon: "",
          transactionTypesId: 1,
        };
        state.formErrors = {
          name: "",
          icon: "",
        };
        state.showForm = false;
        state.editingId = null;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.toast = {
          message: action.payload,
          type: "error"
        };
      })
      
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload;
        state.categories = state.categories.filter(cat => cat.id !== deletedId);
        state.toast = {
          message: "Xóa danh mục thành công!",
          type: "success"
        };
        state.deleteConfirm = null;
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.toast = {
          message: action.payload,
          type: "error"
        };
      });
  },
});

export const {
  setShowForm,
  setEditingId,
  setSearchTerm,
  toggleCategoryExpansion,
  expandAllCategories,
  collapseAllCategories,
  setFormData,
  setFormErrors,
  resetForm,
  validateFormData,
  setShowIconPicker,
  setToast,
  setDeleteConfirm,
  setEditCategory,
  setDeleteConfirmation,
  clearError,
} = categorySlice.actions;

export const selectCategories = (state) => state.category.categories;
export const selectLoading = (state) => state.category.loading;
export const selectError = (state) => state.category.error;
export const selectShowForm = (state) => state.category.showForm;
export const selectEditingId = (state) => state.category.editingId;
export const selectSearchTerm = (state) => state.category.searchTerm;
export const selectExpandedCategories = (state) => state.category.expandedCategories;
export const selectFormData = (state) => state.category.formData;
export const selectFormErrors = (state) => state.category.formErrors;
export const selectShowIconPicker = (state) => state.category.showIconPicker;
export const selectToast = (state) => state.category.toast;
export const selectDeleteConfirm = (state) => state.category.deleteConfirm;

export const selectParentCategories = (state) => 
  state.category.categories.filter(category => !category.parentId);

export const selectChildCategories = (parentId) => (state) =>
  state.category.categories.filter(category => category.parentId === parentId);

export const selectFilteredCategories = (state) => {
  const { categories, searchTerm } = state.category;
  return searchTerm
    ? categories.filter(category => 
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];
};

export const selectCategoryById = (id) => (state) =>
  state.category.categories.find(category => category.id === id);

export const selectGetTotalTransactions = (parentId) => (state) => {
  const categories = state.category.categories;
  const parentCategory = categories.find(cat => cat.id === parentId);
  
  let totalTransactions = parentCategory?.transactions ? parentCategory.transactions.length : 0;
  
  const childCategories = categories.filter(cat => cat.parentId === parentId);
  childCategories.forEach(child => {
    totalTransactions += child.transactions ? child.transactions.length : 0;
  });
  
  return totalTransactions;
};

export const selectGetIconClass = (iconName) => () => getIconClass(iconName);
export const selectIsDefaultCategory = (category) => () => isDefaultCategory(category);
export const selectCanDeleteCategory = (category) => () => canDeleteCategory(category);

export default categorySlice.reducer;