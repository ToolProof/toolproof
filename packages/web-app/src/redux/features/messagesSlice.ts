import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BaseMessage } from '@langchain/core/messages';

export interface MessagesState {
    messages: BaseMessage[];
}

const initialState: MessagesState = {
    messages: [],
};

const messagesSlice = createSlice({
    name: 'messages',
    initialState,
    reducers: {
        setMessages: (state, action: PayloadAction<BaseMessage[]>) => {
            state.messages = action.payload;
        }
    },
});

export const { setMessages } = messagesSlice.actions;
export default messagesSlice.reducer;