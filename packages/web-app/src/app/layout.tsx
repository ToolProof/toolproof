import * as Constants from "shared/src/flow_0/constants"
import "@/flow_1/setup/globals.css"
import type { Metadata } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/flow_1/setup/authOptions";
import { SessionProvider } from "@/flow_1/components/SessionProvider"
//import ClientProvider from "./components/ClientProvider"
import StoreProvider from "@/flow_1/components/StoreProvider"
import SideBar from "@/flow_1/components/SideBar"

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
              <div className="w-80 py-4 bg-black"><SideBar/></div>
              <div className="flex-1 flex flex-col overflow-hidden bg-[#ecf6a5]">
                <div className="flex-1 p-0 bg-[#6c8a3a]">{children}</div>
              </div>
            </div>
          </StoreProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
