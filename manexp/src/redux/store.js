import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authen/authSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
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