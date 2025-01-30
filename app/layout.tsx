
import type { Metadata } from "next";
import localFont from "next/font/local";

import "./globals.css";
import Header from "@/components/ui/sections/Header";
import { Providers } from "./providers";
import MobileFooter from "@/components/ui/MobileFooter";
import MobileHeader from "@/components/ui/MobileHeader";
import { Provider } from "react-redux";
import { store } from "./libs/store/store";
import StoreProvider from "./StoreProvider";
import { SocketProvider } from "@/components/ui/sections/context/SocketContext";

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
  title: "Coryfi Connect",
  description: "We remove the 'Cold' from Cold Approach",
};

// Root layout component
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <StoreProvider>
            <SocketProvider>
          {/* Desktop Header - Visible only on medium and larger screens */}

            <Header /> 

          
          {/* Mobile Header - Visible only on small screens */}
          {/* <div className="block md:hidden">
            <MobileHeader/>
          </div> */}

          {/* Page-specific content */}
          {children}
          </SocketProvider>


          {/* Mobile Footer - Visible only on small screens */}
          <div className="md:hidden">
            <MobileFooter/>
          </div>
          </StoreProvider>
        </Providers>
      </body>
    </html>
  );
}