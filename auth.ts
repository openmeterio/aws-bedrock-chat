import NextAuth, { NextAuthOptions, type DefaultSession } from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string
    }
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = `github:${user.id}`
        token.picture = user.image
      }

      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.image = token.picture
      return session
    }
  }
}

export default NextAuth(authOptions)
