"use client"
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { addDoc, collection, getDocs, serverTimestamp,} from "firebase/firestore";
import { db } from "shared/firebaseClient";
//import { ConversationRead } from "shared/typings";
//import { DocumentData } from "firebase/firestore";
//import { QueryDocumentSnapshot } from "firebase/firestore";

export const conversationsApi = createApi({
  reducerPath: "conversationsApi",
  baseQuery: fakeBaseQuery(),
  //tagTypes: ["Conversation"],
  endpoints: (builder) => ({
    fetchConversations: builder.query({
      async queryFn() {
        try {
          const conversationsRef = collection(db, "conversations");
          const querySnapshot = await getDocs(conversationsRef);
          /* const conversations: QueryDocumentSnapshot<DocumentData, DocumentData>[] = [];
          querySnapshot?.forEach((doc) => {
            conversations.push(doc);
          }); */
          return { data: querySnapshot };
        } catch (err) {
          return { error: err };
        }
      },
      //providesTags: ["Conversation"],
    }),
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
      async queryFn(conversationId, message) {
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
  useFetchConversationsQuery,
  useAddConversationMutation,
  useAddMessageMutation,
} = conversationsApi;
