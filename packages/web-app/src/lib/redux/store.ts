import { configureStore } from "@reduxjs/toolkit"
import navigationReducer from "./features/navigationSlice"
import typewriterReducer from "./features/typewriterSlice"
import devConfigReducer from "./features/devConfigSlice"

export const makeStore = () => {
    return configureStore({
        reducer: {
            navigation: navigationReducer,
            typewriter: typewriterReducer,
            devConfig: devConfigReducer,
        },
    })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>
export type AppDispatch = AppStore["dispatch"]
