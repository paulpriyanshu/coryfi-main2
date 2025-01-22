import NextAuth, { NextAuthOptions, User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import db from "@/db";
import axios from "axios";

interface CustomUser extends User {
  id: string;
}

export const authOptions: NextAuthOptions = {
  debug: true,
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
        if (!credentials || !credentials.email || !credentials.username) {
          throw new Error("Missing credentials");
        }

        // Attempt to find user in the database
        try {
          const user = {
            id: "1", // Replace with actual user ID from DB lookup
            name: credentials.username,
            email: credentials.email,
          };
          return user;
        } catch (error) {
          console.error("Error during user authorization:", error);
          throw new Error("User authorization failed");
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET, // Ensure this is unique for each server
  pages: {
    signIn: "/signup", // Define your custom signup page
  },
  callbacks: {
    async signIn({ user, profile }) {
      try {
        if (!user?.email) {
          throw new Error("No email provided during sign-in");
        }

        // Check if the user exists in the database
        const existingUser = await db.user.findUnique({
          where: { email: user.email },
        });
        await axios.post("https://chat.coryfi.com/api/v1/users/register", {
          email: user.email,
          username: user.name,
          userdp: user?.image,
        });
        await axios.post("https://neo.coryfi.com/api/v1/create/User", {
          email: user.email,
          name: user.name,
        });

        if (!existingUser) {
          // If the user does not exist, create a new user
          await db.user.create({
            data: {
              email: user.email,
              name: user.name || (profile as { name?: string })?.name || "",
            },
          });
          await db.user.update({
            where: { email: user.email },
            data: {
              userdp: user.image,
            },
          });
        } else {
          // Update user profile picture (if exists) only if it's missing in DB
          if (user.image && existingUser.userdp !== user.image) {
            await db.user.update({
              where: { email: user.email },
              data: {
                userdp: user.image,
              },
            });
          }
        }

        return true; // Automatically sign in the user

      } catch (error) {
        console.error("Error during sign-in:", error);
        return false; // Reject sign-in if an error occurs
      }
    },

    async session({ session, token }) {
      try {
        if (session?.user) {
          // Ensure the user has an ID attached to the session
          (session.user as CustomUser).id = token.id as string;
        }
        return session;
      } catch (error) {
        console.error("Error during session callback:", error);
        throw new Error("Failed to set session data");
      }
    },

    async jwt({ token, user }) {
      try {
        if (user) {
          // Ensure user ID is available in the token for session usage
          token.id = (user as CustomUser).id;
        }
        return token;
      } catch (error) {
        console.error("Error during JWT callback:", error);
        throw new Error("Failed to set JWT token data");
      }
    },

    // Redirect user to home page after successful sign-in
    async redirect({ url, baseUrl }) {
      // Here we are ensuring the user is redirected to the home page
      return baseUrl; // Redirects to the home page, you can change this to any URL
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };