import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

export const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
        uri: "https://www.toolproof.com/api/sendPrompt", //ATTENTION: hardcoded path
    }),
});