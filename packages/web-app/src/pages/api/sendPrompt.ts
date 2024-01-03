import admin from "firebase-admin";
import dbAdmin from "shared/firebaseAdmin";
import { MessageWrite } from "shared/typings";
import query from "../../lib/query";
import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { gql } from "graphql-tag";
import { MutationResolvers } from "../../setup/generated/typesServer";
import fs from "fs";
import path from "path";

const updateTurnState = async (conversationId: string, code: number) => {
  try {
    const conversationRef = dbAdmin.collection("conversations").doc(conversationId);
    await conversationRef.update({ //ATTENTION_
      turnState: code
    });
  } catch (error) {
    console.error("Failed to update turnState:", error);
    throw new Error("An error occurred while updating turnState");
  }
};

async function sendMessage(content: string, conversationId: string) {
  const message: MessageWrite = {
    timestamp: admin.firestore.Timestamp.now(),
    userId: "ChatGPT",
    content: content || "ChatGPT was unable to respond!",
  };

  await dbAdmin.collection("conversations").doc(conversationId).collection("messages").add(message); //ATTENTION_
}

const sendPromptResolver: MutationResolvers["sendPrompt"] = async (_, { conversationId, prompt, user, isAlfa }) => {
  if (!prompt) {
    throw new Error("Prompt is required");
  }
  if (!conversationId) {
    throw new Error("ID is required");
  }

  try {
    await updateTurnState(conversationId, -1);
    const response = await query(prompt, user, conversationId, isAlfa);
    let content = "";
    let action = "";
    if (isAlfa) {
      if (response) {
        content = response.modelResponse;
        action = response.action;
        await updateTurnState(conversationId, 1);
      }
    } else {
      if (response) {
        /* content = response.moderatorSummaryAndPrompt;
        action = response.nextSpeaker;
        action === "René" ? await updateTurnState(conversationId, 1) : await updateTurnState(conversationId, 2); */
      }
    }

    await sendMessage(content, conversationId);

    return {
      action: action,
    };

  } catch (error) {
    console.error("Error:", error);
    throw new Error("An error occurred");
  }
};

const resolvers: MutationResolvers = {
  Mutation: {
    sendPrompt: sendPromptResolver,
  },
  // Add other resolvers for Query, Subscription, etc., if necessary
};


const schemaPath = path.join(process.cwd(), "src/setup/definitions/schema.graphql"); //ATTENTION: hardcoded path
const typeDefs = gql(fs.readFileSync(schemaPath, "utf8"));


const server = new ApolloServer({
  resolvers,
  typeDefs,
});

export default startServerAndCreateNextHandler(server);





