import { configureStore } from "@reduxjs/toolkit"
import mainSliceReducer from "./features/mainSlice"
import { rtkQuerySlice } from "./features/rtkQuerySlice"

export const makeStore = () => {
  return configureStore({
    reducer: {
      conversations: mainSliceReducer,
      [rtkQuerySlice.reducerPath]: rtkQuerySlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }).concat(rtkQuerySlice.middleware),
  })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>
export type AppDispatch = AppStore["dispatch"]