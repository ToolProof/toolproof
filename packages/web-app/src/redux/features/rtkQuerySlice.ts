import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { addDoc, collection, serverTimestamp,} from "firebase/firestore";
import { db } from "shared/firebaseClient";

export const rtkQuerySlice = createApi({
  reducerPath: "rtkQuerySlice",
  baseQuery: fakeBaseQuery(),
  //tagTypes: ["Conversation"],
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
      async queryFn({conversationId, message}) {
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
      //invalidatesTags: ["Conversation"],
    }),


  }),
});

export const {
  useAddConversationMutation,
  useAddMessageMutation,
} = rtkQuerySlice;
