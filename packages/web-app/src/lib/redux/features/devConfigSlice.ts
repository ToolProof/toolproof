import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
    userEmail: "",
    isApproved: false,
};

const devConfigSlice = createSlice({
    name: "devConfig",
    initialState,
    reducers: {
        setUserEmail: (state, action: PayloadAction<string>) => {
            state.userEmail = action.payload;
            state.isApproved = action.payload === "renestavnes@hotmail.com";
        },
        // You can add more reducers here as needed
    },
});

export const { setUserEmail } = devConfigSlice.actions;
export default devConfigSlice.reducer;
