import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const navigationSlice = createSlice({
    name: "navigation",
    initialState: {
        genesisConversationId: "Uay5FXiZpAXQ2fyE3svd", //ATTENTION
    },
    reducers: {
        setGenesisConversationId: (state, action: PayloadAction<string>) => {
            state.genesisConversationId = action.payload;
        }
    },
});

export const { setGenesisConversationId } = navigationSlice.actions;
export default navigationSlice.reducer;
