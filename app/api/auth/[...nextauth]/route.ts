import NextAuth, { NextAuthOptions, User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import axios from "axios"


const prisma = new PrismaClient();

interface CustomUser extends User {
  id: string;
}

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        email: { label: "Email", type: "text", placeholder: "Email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const { email, username } = credentials;

        // Return user object if found in DB or new user if created
        return {
          id: "1", // Use a real user ID from DB after lookup
          name: username,
          email: email,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET, // Ensure this is unique for each server
  pages: {
    signIn: "/signup", // Define your custom signup page
  },
  callbacks: {
    async signIn({ user, profile }) {
      // Check if the user exists in the database
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email || "" },
      });

      if (!existingUser && user.email) {
        // If the user does not exist, create a new user in the database
        await prisma.user.create({
          data: {
            email: user.email,
            name: user.name || (profile as { name?: string })?.name || "", // Use name from profile if available
            // image: user.image || (profile as { picture?: string })?.picture || "", // Use profile picture if available
          },
        });
          await axios.post("http://localhost:3003/api/v1/create/User",{
          email:user.email,
          name:user.email
        })
      }

      // Allow the sign-in process to continue
      return true;
    },
    async session({ session, token }) {
      // Attach the user ID to the session object
      if (session.user) {
        (session.user as CustomUser).id = token.id as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as CustomUser).id;
      }
      return token;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };