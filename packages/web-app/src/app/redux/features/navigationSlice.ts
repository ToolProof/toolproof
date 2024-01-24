import { createSlice } from "@reduxjs/toolkit";

const navigationSlice = createSlice({
    name: "navigation",
    initialState: {
        genesisConversationId: "",
    },
    reducers: {
        setGenesisConversationId: (state, action) => {
            state.genesisConversationId = action.payload;
        },
    }
});

export default navigationSlice.reducer;