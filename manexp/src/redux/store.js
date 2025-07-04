import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./authen/authSlice"
import profileReducer from "./profile/profileSlice"
import walletReducer from "./wallet/walletSlice"
import transactionReducer from "./transaction/transactionSlice"
import spendingLimitReducer from "./spendingLimit/spendingLimitSlice"
import homepageReducer from "./homepage/dashboardSlice"

const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    wallet: walletReducer,
    transaction: transactionReducer,
    spendingLimit: spendingLimitReducer,
    dashboard: homepageReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
  devTools: import.meta.env.NODE_ENV !== "production",
});

export default store
