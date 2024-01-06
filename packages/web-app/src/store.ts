"use client";
import { configureStore } from "@reduxjs/toolkit";
import { conversationsApi } from "./services/conversationsApi";
import { setupListeners } from "@reduxjs/toolkit/query";

export const store = configureStore({
  reducer: {
    [conversationsApi.reducerPath]: conversationsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(conversationsApi.middleware),
});

setupListeners(store.dispatch);
