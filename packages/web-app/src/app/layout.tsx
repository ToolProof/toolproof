import * as Constants from "shared/constants"
import "../setup/globals.css"
import type { Metadata } from "next"
import SideBar from "./components/SideBar"
import { getServerSession } from "next-auth"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { SessionProvider } from "./components/SessionProvider"
import ClientProvider from "./components/ClientProvider"
import StoreProvider from "./components/StoreProvider"

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
  //console.log("Session: ", session); // Debug line
  return (
    <html lang="en">
      <body>
        <SessionProvider session={session}> {/*ATTENTION: how come we have access to useContext on the server?*/}
          <StoreProvider>
            <div className="flex">
              <div className="bg-[#202123] max-w-xs h-screen overflow-y-auto md:min-w-[20rem]">
                <SideBar />
              </div>
              <ClientProvider />
              <div className="bg-[#343531] flex-1">
                {children}
              </div>
            </div>
          </StoreProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
