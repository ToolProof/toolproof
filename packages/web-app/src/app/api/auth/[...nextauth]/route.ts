import NextAuth from "next-auth";
import { authOptions } from "@/flow_1/setup/authOptions";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };