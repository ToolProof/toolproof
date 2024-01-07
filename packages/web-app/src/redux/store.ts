import { configureStore } from "@reduxjs/toolkit"
import { conversationsApi } from "./features/conversationsApi"
import conversationsReducer from "./features/conversationsSlice"

export const makeStore = () => {
  return configureStore({
    reducer: {
      [conversationsApi.reducerPath]: conversationsApi.reducer,
      conversations: conversationsReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }).concat(conversationsApi.middleware),
  })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>
export type AppDispatch = AppStore["dispatch"]