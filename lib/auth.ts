import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  // We manually handle user creation in the credentials provider,
  // so we don't need the Prisma adapter for session/account management.
  // Using JWT strategy means sessions are stored in the token, not DB.
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
  },
  providers: [
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'you@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Hardcoded password for dev
        if (credentials.password !== 'dev') {
          return null
        }

        const email = credentials.email.toLowerCase().trim()

        // Find or create user by email
        let user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name: email.split('@')[0],
            },
          })
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // On initial sign-in, persist user.id into the JWT
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      // Make user.id available in the session
      if (session.user && token.id) {
        session.user.id = token.id as string
      }
      return session
    },
  },
}
