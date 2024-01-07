// conversationsSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { QuerySnapshot, DocumentData } from "firebase/firestore";

interface ConversationsState {
  conversations: QuerySnapshot<DocumentData, DocumentData> | null;
}

const initialState: ConversationsState = {
  conversations: null,
};

const conversationsSlice = createSlice({
  name: "conversations",
  initialState,
  reducers: {
    updateConversations: (state, action) => {
      state.conversations = action.payload;
    },
    // ... other reducers
  },
});

export const { updateConversations } = conversationsSlice.actions;
export default conversationsSlice.reducer;
