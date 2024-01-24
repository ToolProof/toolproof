import { createSlice } from "@reduxjs/toolkit";

const typewriterSlice = createSlice({
    name: "typewriter",
    initialState: {
        isTyping: false
    },
    reducers: {
        setTrue: (state) => {
            state.isTyping = true;
        },
        setFalse: (state) => {
            state.isTyping = false;
        }
    }
});

export default typewriterSlice.reducer;