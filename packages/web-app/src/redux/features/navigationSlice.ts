import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const navigationSlice = createSlice({
    name: "navigation",
    initialState: {
        conceptActive: "",
    },
    reducers: {
        setConceptActive: (state, action: PayloadAction<string>) => {
            state.conceptActive = action.payload;
        }
    },
});

export const { setConceptActive } = navigationSlice.actions;
export default navigationSlice.reducer;
