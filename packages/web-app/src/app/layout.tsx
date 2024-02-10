import * as Constants from "shared/src/flow_0/constants"
import "@/flow_1/setup/globals.css"
import type { Metadata } from "next"
import Bars from "@/flow_1/components/Bars"
import { getServerSession } from "next-auth"
import { authOptions } from "@/flow_1/setup/authOptions";
import { SessionProvider } from "@/flow_1/components/SessionProvider"
//import ClientProvider from "./components/ClientProvider"
import StoreProvider from "@/flow_1/components/StoreProvider"

export const metadata: Metadata = {
  title: Constants.TITLE,
  description: Constants.DESCRIPTION,
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  
  return (
    <html lang="en">
      <body>
        <SessionProvider session={session}>
          <StoreProvider>
            <div className="flex h-screen overflow-hidden">
              <Bars />
              <div className="flex-1 flex flex-col overflow-auto bg-[#ecf6a5]">
                <div className="flex-1 p-12 bg-[#6c8a3a]">{children}</div>
              </div>
            </div>
          </StoreProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
