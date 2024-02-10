import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const navigationSlice = createSlice({
    name: "navigation",
    initialState: {
        conversationActive: "",
    },
    reducers: {
        setConversationActive: (state, action: PayloadAction<string>) => {
            state.conversationActive = action.payload;
        }
    },
});

export const { setConversationActive } = navigationSlice.actions;
export default navigationSlice.reducer;
