import { createSlice } from '@reduxjs/toolkit';

const typewriterSlice = createSlice({
    name: 'typewriter',
    initialState: {
        isTyping: false
    },
    reducers: {
        startTyping: (state) => {
            state.isTyping = true;
        },
        stopTyping: (state) => {
            state.isTyping = false;
        }
    }
});


export const { startTyping, stopTyping } = typewriterSlice.actions;
export default typewriterSlice.reducer;