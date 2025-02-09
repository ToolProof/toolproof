import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BaseMessageWithType } from 'shared/src/typings';

export interface MessagesState {
    messages: BaseMessageWithType[];
}

const initialState: MessagesState = {
    messages: [],
};

const messagesSlice = createSlice({
    name: 'messages',
    initialState,
    reducers: {
        setMessages: (state, action: PayloadAction<BaseMessageWithType[]>) => {
            state.messages = action.payload;
        },
        addMessages: (state, action: PayloadAction<BaseMessageWithType>) => {
            state.messages = [...state.messages, action.payload];
        },
    },
});

export const { setMessages, addMessages } = messagesSlice.actions;
export default messagesSlice.reducer;