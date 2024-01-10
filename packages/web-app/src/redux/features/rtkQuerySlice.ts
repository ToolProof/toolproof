import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { addDoc, deleteDoc, doc, collection, serverTimestamp, } from "firebase/firestore";
import { db } from "shared/firebaseClient";

export const rtkQuerySlice = createApi({
  reducerPath: "rtkQuerySlice",
  baseQuery: fakeBaseQuery(),
  //tagTypes: [],
  endpoints: (builder) => ({
    addConversation: builder.mutation({
      async queryFn(conversation) {
        try {
          const docRef = await addDoc(collection(db, "conversations"), {
            ...conversation,
            timestamp: serverTimestamp(),
          });
          return { data: { conversationId: docRef.id } }; // Return the conversation ID
        } catch (err) {
          return { error: err };
        }
      },
    }),
    addMessage: builder.mutation({
      async queryFn({ conversationId, message }) {
        try {
          await addDoc(collection(db, "conversations", conversationId, "messages"), {
            ...message,
            timestamp: serverTimestamp(),
          });
          return { data: "ok" };
        } catch (err) {
          return { error: err };
        }
      },
    }),
    deleteConversation: builder.mutation({
      async queryFn(conversationId) {
        try {
          await deleteDoc(doc(db, "conversations", conversationId));
          return { data: "ok" };
        } catch (err) {
          return { error: err };
        }
      },
    }),
  }),
});

export const {
  useAddConversationMutation,
  useAddMessageMutation,
  useDeleteConversationMutation,
} = rtkQuerySlice;
