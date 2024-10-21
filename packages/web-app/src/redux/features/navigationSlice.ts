import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const navigationSlice = createSlice({
    name: 'navigation',
    initialState: {
        chatActive: '',
    },
    reducers: {
        setChatActive: (state, action: PayloadAction<string>) => {
            state.chatActive = action.payload;
        }
    },
});

export const { setChatActive } = navigationSlice.actions;
export default navigationSlice.reducer;
