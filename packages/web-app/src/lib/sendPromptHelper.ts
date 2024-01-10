import { gql } from "@apollo/client";
import { client } from "../setup/apolloClient";
import { MutationSendPromptArgs, Mutation } from "../setup/generated/typesClient";

export default async function sendPromptHelper(conversationId: string, content: string) {
    const variables: MutationSendPromptArgs = {
        conversationId,
        prompt: content,
        user: "René", //ATTENTION: hard-coded name
    };

    // Define your GraphQL mutation
    const SEND_PROMPT_MUTATION = gql`
      mutation SendPrompt($conversationId: String!, $prompt: String!, $user: String!) {
        sendPrompt(conversationId: $conversationId, prompt: $prompt, user: $user) {
          action
        }
      }
    `;

    try {
        // Execute the mutation
        const response = await client.mutate<Mutation>({
            mutation: SEND_PROMPT_MUTATION,
            variables,
        });
        // Check if the data property exists and is not null
        if (response.data) {
            const data: Mutation = response.data;
            return data;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error:", error);
    }
}