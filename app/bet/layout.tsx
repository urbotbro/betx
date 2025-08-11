// app/bet/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bet — BetX",
  description: "Place demo bets with simple balances and slip.",
};

/**
 * Bet section layout: keep it bare.
 * No global header/footer.
 */
export default function BetLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
