import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "./database"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    {
      id: "stacks",
      name: "Stacks Wallet",
      type: "oauth",
      authorization: {
        url: "https://app.hiro.so/oauth",
        params: {
          scope: "store_write",
          response_type: "code",
        },
      },
      token: "https://api.hiro.so/oauth/token",
      userinfo: "https://api.hiro.so/oauth/userinfo",
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name || profile.btcAddress?.testnet || "Anonymous",
          email: profile.email,
          image: profile.picture,
          stacksAddress: profile.btcAddress?.testnet,
        }
      },
      clientId: process.env.STACKS_CLIENT_ID,
      clientSecret: process.env.STACKS_CLIENT_SECRET,
    },
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        token.stacksAddress = (user as any).stacksAddress
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).stacksAddress = token.stacksAddress
        ;(session.user as any).id = token.sub
      }
      return session
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "stacks") {
        // Store additional Stacks wallet information
        if (user && (profile as any)?.btcAddress) {
          await prisma.user.upsert({
            where: { email: user.email || "" },
            update: {
              stacksAddress: (profile as any).btcAddress.testnet,
              name: user.name,
              image: user.image,
            },
            create: {
              email: user.email || "",
              name: user.name || "Anonymous",
              image: user.image,
              stacksAddress: (profile as any).btcAddress.testnet,
            },
          })
        }
      }
      return true
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
    error: "/auth/error",
  },
}