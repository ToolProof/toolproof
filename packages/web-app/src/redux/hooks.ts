import { useDispatch, useSelector } from "react-redux"
import type { TypedUseSelectorHook } from "react-redux"
import type { RootState, AppDispatch } from "./store"
import { createSelector } from "@reduxjs/toolkit";

// Input selector for the conversations array
const selectConversations = (state: RootState) => state.conversations.conversations;

// Input selector for the conversationId
const selectConversationId = (_: RootState, conversationId: string) => conversationId;

// Selector to get only the conversation IDs
const selectConversationIds = createSelector(
  [selectConversations],
  (conversations) => conversations.map(conversation => conversation.id)
);

// Memoized selector to get the messages for a specific conversation
const selectMessagesForConversation = createSelector(
  [selectConversations, selectConversationId],
  (conversations, conversationId) => {
    const conversation = conversations.find(c => c.id === conversationId);
    return conversation ? conversation.messages : [];
  }
);

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export const useMessagesForConversation = (conversationId: string) => useAppSelector(state => selectMessagesForConversation(state, conversationId));
export const useConversationIds = () => useAppSelector(selectConversationIds);
export const useConversationById = (conversationId: string) => {
    return useAppSelector(state =>
        state.conversations.conversations.find(c => c.id === conversationId)
    );
};
