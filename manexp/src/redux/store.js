// store/index.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authen/authSlice";
import profileReducer from "./profile/profileSlice";
import walletReducer from "./wallet/walletSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    wallet: walletReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
  devTools: import.meta.env.NODE_ENV !== "production",
});

export default store;