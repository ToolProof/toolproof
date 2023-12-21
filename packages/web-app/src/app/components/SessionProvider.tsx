"use client"
import { Session } from "next-auth"
import { SessionProvider as Provider } from "next-auth/react"

type Props = {
    children: React.ReactNode
    session: Session | null
}

export function SessionProvider({ children }: Props) {
    return (
        <Provider> {/*ATTENTION: session={session}*/}
            {children}
        </Provider>
    )
}

