"use client"
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { addDoc, collection, serverTimestamp,} from "firebase/firestore";
import { db } from "shared/firebaseClient";
//import { ConversationRead } from "shared/typings";
//import { DocumentData } from "firebase/firestore";
//import { QueryDocumentSnapshot } from "firebase/firestore";

export const conversationsApi = createApi({
  reducerPath: "conversationsApi",
  baseQuery: fakeBaseQuery(),
  //tagTypes: ["Conversation"],
  endpoints: (builder) => ({
    addConversation: builder.mutation({
      async queryFn(conversation) {
        try {
          await addDoc(collection(db, "conversations"), {
            ...conversation,
            timestamp: serverTimestamp(),
          });
          return { data: "ok" };
        } catch (err) {
          return { error: err };
        }
      },
      //invalidatesTags: ["Conversation"],
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
} = conversationsApi;
