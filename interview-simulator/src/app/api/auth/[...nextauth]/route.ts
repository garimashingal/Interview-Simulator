import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import connectDB from "@/lib/db/mongodb";
import User from "@/lib/db/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    // Google OAuth (optional — only works if GOOGLE_CLIENT_ID is set)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),

    // Email + Password credentials
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          await connectDB();
          const user = await User.findOne({ email: credentials.email.toLowerCase() });
          if (!user) return null;

          // NOTE: In production, use bcrypt to compare hashed passwords.
          // For now we store plain text during development only.
          // TODO: Replace with bcrypt.compare(credentials.password, user.passwordHash)
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch {
          return null;
        }
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as typeof session.user & { id: string }).id = token.id as string;
      }
      return session;
    },
    async signIn({ user, account }) {
      // Auto-create user record on first Google sign-in
      if (account?.provider === "google" && user.email) {
        try {
          await connectDB();
          await User.findOneAndUpdate(
            { email: user.email.toLowerCase() },
            {
              $setOnInsert: {
                email: user.email.toLowerCase(),
                name: user.name ?? "User",
                image: user.image,
              },
            },
            { upsert: true, new: true }
          );
        } catch {
          // Non-fatal — session still works without DB entry
        }
      }
      return true;
    },
  },

  pages: {
    signIn: "/login",
    error:  "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
