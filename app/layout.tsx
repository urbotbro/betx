// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NovaBet Protocol",
  description: "Crypto-powered tips & betting hub",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/* Safe-area + proper scaling for iOS/Android */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#0B1220" />
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-dvh bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100`}
        // Safe-area padding so header/footer না কাটা যায়
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
          paddingLeft: "env(safe-area-inset-left)",
          paddingRight: "env(safe-area-inset-right)",
        }}
      >
        <Providers>
          {/* isolate so header dropshadow/blur ঠিকমতো কাজ করে */}
          <div className="isolate min-h-dvh flex flex-col">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
