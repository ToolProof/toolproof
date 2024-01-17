import "../setup/globals.css"
import * as Constants from "../setup/constants"
import type { Metadata } from "next"
import SideBar from "./components/SideBar"
import { getServerSession } from "next-auth"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { SessionProvider } from "./components/SessionProvider"
import ClientProvider from "./components/ClientProvider"

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
            <div className="flex">
              <div className="bg-[#202123] max-w-xs h-screen overflow-y-auto md:min-w-[20rem]">
                <SideBar />
              </div>
              <ClientProvider />
              <div className="bg-[#343531] flex-1">
                {children}
              </div>
            </div>
        </SessionProvider>
      </body>
    </html>
  )
}
