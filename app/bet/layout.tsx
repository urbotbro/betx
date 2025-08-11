// app/bet/layout.tsx
import type { Metadata } from "next";
import "../globals.css"; // bet রুটেও গ্লোবাল স্টাইল লাগবে

export const metadata: Metadata = {
  title: "Bet | NovaBet Protocol",
};

export default function BetLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#0B1220" />
      </head>

      {/* এখানে RootLayout-এর SiteHeader/SiteFooter ইচ্ছাকৃতভাবে নেই */}
      <body
        className="antialiased bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100"
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
          paddingLeft: "env(safe-area-inset-left)",
          paddingRight: "env(safe-area-inset-right)",
        }}
      >
        {/* মিনিমাল টপ-বার: শুধু লোগো/হোমে ফিরে যাওয়ার জন্য */}
        <div className="sticky top-0 z-50 safe-pt w-full backdrop-blur supports-[backdrop-filter]:bg-slate-900/70 bg-slate-900/60 border-b border-slate-800">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center">
            <a href="/" className="flex items-center gap-2" aria-label="Back to home">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-500 grid place-items-center text-white">🔥</div>
              <span className="font-semibold tracking-tight text-slate-100">BetX</span>
            </a>
          </div>
        </div>

        {/* কনটেন্ট এরিয়ায় টপ স্পেস যেন কাট না লাগে */}
        <main className="pt-4 md:pt-6">{children}</main>
      </body>
    </html>
  );
}
