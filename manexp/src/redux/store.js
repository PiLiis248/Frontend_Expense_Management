// src/store/index.js
import { configureStore } from "@reduxjs/toolkit";
// import profileReducer from './profile/profileSlice';

const store = configureStore({
  reducer: {
    // profile: profileReducer
  },
  devTools: import.meta.env.NODE_ENV !== "production",
});

export default store;