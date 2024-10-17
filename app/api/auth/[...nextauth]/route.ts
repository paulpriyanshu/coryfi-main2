import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const authOptions = {
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
      async authorize(credentials: any) {
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
    async signIn({ user, account, profile }:any) {
      // Check if the user exists in the database
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      if (!existingUser) {
        // If the user does not exist, create a new user in the database
        await prisma.user.create({
          data: {
            email: user.email,
            name: user.name || profile.name, // Use name from profile if available
            // image: user.image || profile.picture, // Use profile picture if available
          },
        });
      }

      // Allow the sign-in process to continue
      return true;
    },
    async session({ session, token, user }:any) {
      // Attach the user ID to the session object
      session.user.id = token.id;
      return session;
    },
    async jwt({ token, user }:any) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
