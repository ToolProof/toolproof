import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Conversation, Message } from "shared/typings";

interface ConversationsState {
  conversations: Conversation[];
  isFetched: boolean;
}

const initialState: ConversationsState = {
  conversations: [],
  isFetched: false,
};

const mainSlice = createSlice({
  name: "conversations",
  initialState,
  reducers: {
    updateConversations: (state, action: PayloadAction<Conversation[]>) => {
      state.conversations = action.payload;
    },
    updateMessages: (state, action: PayloadAction<{ conversationId: string; messages: Message[] }>) => {
      const { conversationId, messages } = action.payload;
      const conversationIndex = state.conversations.findIndex(c => c.id === conversationId);
      if (conversationIndex !== -1) {
        state.conversations[conversationIndex].messages = messages;
      }
    },
    setIsFetched: (state, action: PayloadAction<boolean>) => {
      state.isFetched = action.payload;
    },
  },
});

export const { updateConversations, updateMessages, setIsFetched } = mainSlice.actions;
export default mainSlice.reducer;