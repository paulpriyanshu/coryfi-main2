// app/layout.tsx
import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/ui/sections/Header";
import { Providers } from "./providers";
import MobileFooter from "@/components/ui/MobileFooter";
import { store } from "./libs/store/store";
import StoreProvider from "./StoreProvider";
import { SocketProvider } from "@/components/ui/sections/context/SocketContext";
import { ThemeProvider } from "next-themes";
import { checkPathsFlow, getTop8MostConnectedUsers } from "./api/actions/user";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { getServerSession } from 'next-auth'

// ✅ Import your onboarding flow component
import SimplePathsFlow from "@/components/simple-paths-flow";
import { fetchUserData, fetchUserInterests } from "./api/actions/media";

// Load fonts
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// App metadata
export const metadata: Metadata = {
  title: {
    default: "Coryfi Connect",
    template: "%s - Coryfi",
  },
  description: "We remove the 'Cold' from Cold Approach",
};

// ✅ Final Layout
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
let users: Boolean | any = {};
let userInterests : Boolean | any = {};

const session = await getServerSession(authOptions)
if (session) {
  users=await getTop8MostConnectedUsers(session?.user?.email)
users = {
  ...users,
  users: users?.users?.map((user) => ({
    ...user,
    requestSent: false,
  })),
};
  // console.log("top users",users)
}
if (session) {
  userInterests=await fetchUserInterests(session?.user?.email)
  console.log("top users",users)
}

// console.log("paths flow",await checkPathsFlow(session?.user?.email))
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-R4DL6ZME5M"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-R4DL6ZME5M');
          `}
        </Script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Providers>
            <StoreProvider>
              <SocketProvider>
                {/* Header */}
                {/* <Header /> */}
                {(session?.user?.email && !await checkPathsFlow(session?.user?.email)) ? null : <Header/>}

                {/* ✅ Always show onboarding flow */}
                {(session?.user?.email && !await checkPathsFlow(session?.user?.email)) ? <SimplePathsFlow users={users} userInterests={userInterests?.interestSubcategories} userId={userInterests?.id}/> : children}
                {/* Mobile Footer */}
                <div className="md:hidden">
                  {(session?.user?.email && await checkPathsFlow(session?.user?.email))?<MobileFooter session={session}/>:null}
                </div>
              </SocketProvider>
            </StoreProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}