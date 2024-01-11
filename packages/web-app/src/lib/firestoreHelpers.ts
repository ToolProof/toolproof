import dbAdmin from "shared/firebaseAdmin";
import { createMessageWrite } from "./factory";

export const updateTurnState = async (conversationId: string, code: number): Promise<void> => {
  try {
    const conversationRef = dbAdmin.collection("conversations").doc(conversationId);
    await conversationRef.update({ turnState: code });
  } catch (error) {
    console.error("Failed to update turnState:", error);
    throw new Error("An error occurred while updating turnState");
  }
};

export const sendMessageToFirestore = async (content: string, conversationId: string): Promise<void> => {
  const message = createMessageWrite({ userId: "ChatGPT", content });
  await dbAdmin.collection("conversations").doc(conversationId).collection("messages").add(message);
};
