import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const navigationSlice = createSlice({
    name: "navigation",
    initialState: {
        genesisConversationId: "",
    },
    reducers: {
        setGenesisConversationId: (state, action: PayloadAction<string>) => {
            state.genesisConversationId = action.payload;
        }
    },
});

export const { setGenesisConversationId } = navigationSlice.actions;
export default navigationSlice.reducer;
