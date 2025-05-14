import * as Constants from 'shared/src/constants'
import { SessionProvider } from '@/components/providers/SessionProvider'
//import ClientProvider from '@/components/ClientProvider'
import StoreProvider from '@/components/providers/StoreProvider'
import SideBar from '@/components/layout/chat/SideBar'
import { authOptions } from '@/setup/authOptions';
import '@/setup/globals.css'
import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'

export const metadata: Metadata = {
  title: Constants.title,
  description: Constants.description,
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang='en' className='h-full w-full'>
      <body className='h-full w-full'>
        <SessionProvider session={session}>
          <StoreProvider>
            <div className='flex h-full w-full overflow-hidden'>
              {/* Sidebar: fixed width */}
              {/* <div className='hidden sm:block sm:w-[300px] h-full w-full bg-white text-white'>
                <SideBar />
              </div> */}

              {/* Graph area: fills remaining space */}
              <div className='flex-1 h-full'>
                {children}
              </div>
            </div>
          </StoreProvider>
        </SessionProvider>
      </body>
    </html>
  )

}
