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

    // Simplified redirect callback that avoids URL parsing
    async redirect({ url, baseUrl }) {
      // Safety check: if URL doesn't start with baseUrl or /, use baseUrl
      if (!url.startsWith(baseUrl) && !url.startsWith('/')) {
        // console.log("Invalid URL, redirecting to base URL:", baseUrl);
        return baseUrl;
      }

      // Check if there's a callbackUrl parameter
      let callbackUrl = null;
      
      // Simple string check for callbackUrl
      const callbackParam = "callbackUrl=";
      const callbackIndex = url.indexOf(callbackParam);
      
      if (callbackIndex !== -1) {
        // Extract the callbackUrl parameter value
        const startIndex = callbackIndex + callbackParam.length;
        const endIndex = url.indexOf("&", startIndex);
        
        if (endIndex !== -1) {
          callbackUrl = url.substring(startIndex, endIndex);
        } else {
          callbackUrl = url.substring(startIndex);
        }
        
        // Decode the URL-encoded callbackUrl
        try {
          callbackUrl = decodeURIComponent(callbackUrl);
          
          // Security check for the callbackUrl
          if (callbackUrl.startsWith('/')) {
            // console.log("Redirecting to callback path:", callbackUrl);
            return `${baseUrl}${callbackUrl.startsWith('/') ? callbackUrl : `/${callbackUrl}`}`;
          }
        } catch (error) {
          console.error("Error decoding callback URL:", error);
          // If there's an error, fall back to the original URL or baseUrl
        }
      }
      
      // If we reach here, use the original URL if it's safe
      if (url.startsWith(baseUrl)) {
        // console.log("Redirecting to original URL:", url);
        return url;
      }
        
      // Add baseUrl to relative paths
      if (url.startsWith('/')) {
        // console.log("Redirecting to path:", url);
        return `${baseUrl}${url}`;
      }
      
      // Default fallback
      // console.log("Redirecting to base URL:", baseUrl);
      return baseUrl;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };