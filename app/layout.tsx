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

// ✅ FIXED ROOT LAYOUT
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        {/* ✅ ThemeProvider should wrap the WHOLE app content inside body */}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Providers>
            <StoreProvider>
              <SocketProvider>
                {/* Header */}
                <Header />

                {/* Page Content */}
                {children}

                {/* Mobile Footer */}
                <div className="md:hidden">
                  <MobileFooter />
                </div>
              </SocketProvider>
            </StoreProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}