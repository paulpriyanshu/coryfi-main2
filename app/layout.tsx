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
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import SignupComponent from "./signup/SignupComponent";

// Import local fonts
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

// Define metadata for the application
export const metadata: Metadata = {
  title: {
    default:"Coryfi Connect",
    template:"%s - Coryfi"
  },
  description: "We remove the 'Cold' from Cold Approach",
};

// Root layout component
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
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
        <Providers>
          <StoreProvider>
            <SocketProvider>
              {/* Show SignupComponent if user is not logged in */}
              {!session ? (
                <SignupComponent />
              ) : (
                <>
                  {/* Desktop Header */}
                  <Header />

                  {/* Page-specific content */}
                  {children}

                  {/* Mobile Footer - Visible only on small screens */}
                  <div className="md:hidden">
                    <MobileFooter />
                  </div>
                </>
              )}
            </SocketProvider>
          </StoreProvider>
        </Providers>
      </body>
    </html>
  );
}