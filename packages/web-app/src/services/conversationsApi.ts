import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  //addDoc,
  collection,
  getDocs,
//   serverTimestamp,
} from "firebase/firestore";
import { db } from "shared/firebaseClient";
//import { ConversationRead } from "shared/typings";
//import { DocumentData } from "firebase/firestore";
//import { QueryDocumentSnapshot } from "firebase/firestore";

export const conversationsApi = createApi({
  reducerPath: "conversationsApi",
  baseQuery: fakeBaseQuery(),
  //tagTypes: ["Blog"],
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
    /* addBlog: builder.mutation({
      async queryFn(data) {
        try {
          await addDoc(collection(db, "blogs"), {
            ...data,
            timestamp: serverTimestamp(),
          });
          return { data: "ok" };
        } catch (err) {
          return { error: err };
        }
      }, 
      //invalidatesTags: ["Conversation"],
    }),
    */
    
  }),
});

export const {
  useFetchConversationsQuery,
//   useAddBlogMutation,
} = conversationsApi;
