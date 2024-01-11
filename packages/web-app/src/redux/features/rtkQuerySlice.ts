import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { addDoc, deleteDoc, doc, collection, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from "shared/firebaseClient";
import { ConversationWrite, MessageWrite } from "shared/typings";

export const rtkQuerySlice = createApi({
  reducerPath: "rtkQuerySlice",
  baseQuery: fakeBaseQuery(),
  //tagTypes: [],
  endpoints: (builder) => ({
    addConversation: builder.mutation({
      async queryFn(conversation: ConversationWrite) {
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
      async queryFn({ conversationId, message }: { conversationId: string, message: MessageWrite }) {
        try {
          const batch = writeBatch(db);

          // Message document reference
          const messageRef = doc(collection(db, "conversations", conversationId, "messages"));
          batch.set(messageRef, {
            ...message,
            timestamp: serverTimestamp(),
          });

          // Conversation document reference
          const conversationRef = doc(db, "conversations", conversationId);
          batch.update(conversationRef, { turnState: -1 });

          // Commit the batch
          await batch.commit();
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
