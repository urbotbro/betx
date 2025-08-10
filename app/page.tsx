'use client';

import React from "react";
import Link from "next/link";
import TokenomicsChart from "@/components/TokenomicsChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Rocket,
  Shield,
  Users,
  Wallet,
  TrendingUp,
  ExternalLink,
  Twitter,
  MessageCircle,
  Flame,
  BarChart3,
  Layers3,
} from "lucide-react";

/* ---------------- Tokenomics (sample numbers, change later) ---------------- */
const TOKENOMICS = [
  { name: "Liquidity", value: 35 },
  { name: "Sale", value: 30 },
  { name: "Ecosystem/Rewards", value: 15 },
  { name: "Team (6m lock)", value: 10 },
  { name: "Marketing", value: 7 },
  { name: "Reserve", value: 3 },
];

const COLORS = ["#60a5fa", "#34d399", "#fbbf24", "#f472b6", "#f87171", "#a78bfa"];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-slate-900/70 bg-slate-900/60 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-cyan-400 to-emerald-500 grid place-items-center shadow-lg shadow-cyan-500/20">
              <Flame className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-100">BetX</span>
            <Badge className="ml-2" variant="secondary">SOL</Badge>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#tokenomics" className="hover:text-white/90 text-slate-200">Tokenomics</a>
            <a href="#features" className="hover:text-white/90 text-slate-200">Features</a>
            <a href="#roadmap" className="hover:text-white/90 text-slate-200">Roadmap</a>
            <a href="#sale" className="hover:text-white/90 text-slate-200">Sale</a>
            <Link href="/tips" className="hover:text-white/90 text-slate-200">Tips</Link>
            <Link href="/tipster" className="hover:text-white/90 text-slate-200">Tipster</Link>
            <Link href="/bet" className="hover:text-white/90 text-slate-200">Bet</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button asChild size="sm" variant="secondary">
              <a href="#sale">Join Sale</a>
            </Button>
            <Button asChild size="sm" variant="default">
              <Link href="/whitepaper">Read Whitepaper</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* pointer blocking fix */}
        <div className="absolute inset-0 -z-10 pointer-events-none opacity-30 bg-[radial-gradient(45rem_35rem_at_50%_0%,#2563eb_10%,transparent_60%)]" />
        <div className="max-w-6xl mx-auto px-4 pt-20 pb-24 text-center">
          <Badge variant="outline" className="mb-4 border-emerald-400/40 text-emerald-300">
            Solana-powered tipster & betting hub
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-slate-100">
            Bet smarter. <span className="text-emerald-400">Earn together.</span>
          </h1>
          <p className="mt-4 text-slate-300 max-w-2xl mx-auto">
            BetX brings verified tipsters, tokenized rewards, and a phased betting rollout on Solana.
            Start with Tips & Tipsters and a curated set of matches. Expand to full markets as we progress.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" className="rounded-2xl px-6" asChild>
              <a href="#sale"><Rocket className="mr-2 h-5 w-5" />Get in on the Sale</a>
            </Button>

            {/* Read via Next.js route */}
            <Button size="lg" variant="secondary" className="rounded-2xl px-6" asChild>
              <Link href="/whitepaper">
                <ExternalLink className="mr-2 h-5 w-5" />
                Read Whitepaper
              </Link>
            </Button>

            {/* Download real file from /public */}
            <Button size="lg" variant="secondary" className="rounded-2xl px-6" asChild>
              <a
                href="/whitepaper/BetX_Whitepaper_v2.pdf"
                target="_blank"
                rel="noopener"
                download
              >
                Download PDF
              </a>
            </Button>
          </div>

          <div className="mt-6 text-xs text-slate-400">
            * Launch Phase: Tipster & Tips live, plus selective matches. Full betting comes in the final phase.
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-y border-slate-800 bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="flex items-center justify-center gap-2 text-slate-200"><Shield className="h-4 w-4" /> Smart contract audited</div>
          <div className="flex items-center justify-center gap-2 text-slate-200"><Wallet className="h-4 w-4" /> Liquidity lock at TGE</div>
          <div className="flex items-center justify-center gap-2 text-slate-200"><Users className="h-4 w-4" /> Community-first launch</div>
          <div className="flex items-center justify-center gap-2 text-slate-200"><TrendingUp className="h-4 w-4" /> Transparent token flows</div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100"><BarChart3 className="h-5 w-5" /> Verified Tips Access</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 text-sm leading-relaxed">
              Stake or hold BETX to unlock curated, data-backed tips. See each tipster’s win-rate, ROI, and streak before you follow.
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100"><Users className="h-5 w-5" /> Tipster Leaderboard</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 text-sm leading-relaxed">
              Top performers earn seasonal rewards from the ecosystem fund. Reputation is on-chain and portable.
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100"><Layers3 className="h-5 w-5" /> Utility: BETX Token</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 text-sm leading-relaxed">
              Use BETX for tip unlocks, fee discounts, staking rewards, and governance. More utilities unlock as phases roll out.
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100"><Shield className="h-5 w-5" /> Selective Matches at Launch</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 text-sm leading-relaxed">
              We start with a curated set of football, tennis, basketball and cricket matches to ensure quality and liquidity.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Tokenomics */}
      <section id="tokenomics" className="max-w-6xl mx-auto px-4 pb-4">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100">Tokenomics</h2>
        <p className="mt-2 text-slate-300 text-sm max-w-3xl">
          Supply: <span className="font-semibold text-slate-100">100,000,000 BETX</span> (fixed). Taxes: 0% on buys/sells (subject to governance).
          Team tokens locked 6 months, then linear unlock 12 months. Liquidity locked for 12 months at launch.
        </p>

        <div className="mt-6 grid md:grid-cols-2 gap-6 items-center">
          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader><CardTitle className="text-slate-100">Distribution</CardTitle></CardHeader>
            <CardContent><TokenomicsChart data={TOKENOMICS} colors={COLORS} /></CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader><CardTitle className="text-slate-100">Key Parameters</CardTitle></CardHeader>
            <CardContent className="text-sm text-slate-300 space-y-3">
              <div className="flex items-start gap-2"><Check className="h-4 w-4 text-emerald-400 mt-1" /><div><span className="font-semibold text-slate-100">Chain:</span> Solana</div></div>
              <div className="flex items-start gap-2"><Check className="h-4 w-4 text-emerald-400 mt-1" /><div><span className="font-semibold text-slate-100">Ticker:</span> BETX</div></div>
              <div className="flex items-start gap-2"><Check className="h-4 w-4 text-emerald-400 mt-1" /><div><span className="font-semibold text-slate-100">Sale:</span> Public/Community Round (TBA)</div></div>
              <div className="flex items-start gap-2"><Check className="h-4 w-4 text-emerald-400 mt-1" /><div><span className="font-semibold text-slate-100">Initial Liquidity:</span> 60–70% of raise, locked</div></div>
              <div className="flex items-start gap-2"><Check className="h-4 w-4 text-emerald-400 mt-1" /><div><span className="font-semibold text-slate-100">Utilities at launch:</span> Tips access, tipster payouts, early fee discounts</div></div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Sale */}
      <section id="sale" className="max-w-6xl mx-auto px-4 py-16">
        <Card className="bg-slate-900/60 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-100">
              <Rocket className="h-5 w-5" /> Token Sale
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300 text-sm">
            <ul className="list-disc pl-5 space-y-2">
              <li>Accepted: <span className="text-slate-100">SOL / USDC</span> • Vesting: none for public sale</li>
              <li>Liquidity lock: <span className="text-slate-100">12 months</span> • Planned listing: <span className="text-slate-100">Raydium (TBA)</span></li>
              <li>Compliance: KYC where required, Smart contract audited</li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button asChild><a href="#" aria-disabled>Sale Link (TBA)</a></Button>
              {/* Whitepaper buttons intentionally removed here */}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Roadmap */}
      <section id="roadmap" className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100">Roadmap</h2>
        <div className="mt-6 grid md:grid-cols-4 gap-6">
          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader><CardTitle className="text-slate-100">Phase 1 • MVP</CardTitle></CardHeader>
            <CardContent className="text-sm text-slate-300 space-y-2">
              <p>Branding, site, token contract, audit, core community.</p>
              <p>Launch <strong className="text-slate-100">Tipster</strong> & <strong className="text-slate-100">Tips</strong> with selective matches.</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader><CardTitle className="text-slate-100">Phase 2 • Sports+ & Growth</CardTitle></CardHeader>
            <CardContent className="text-sm text-slate-300 space-y-2">
              <p>More matches & markets across football, tennis, basketball, cricket.</p>
              <p><strong className="text-slate-100">Heavy marketing</strong> (KOLs, affiliates, quests, regional campaigns).</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader><CardTitle className="text-slate-100">Phase 3 • Utilities</CardTitle></CardHeader>
            <CardContent className="text-sm text-slate-300 space-y-2">
              <p>BETX staking, fee discounts, governance voting.</p>
              <p>Treasury dashboard & rewards automation.</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader><CardTitle className="text-slate-100">Phase 4 • Full Betting & Listings</CardTitle></CardHeader>
            <CardContent className="text-sm text-slate-300 space-y-2">
              <p>Full market rollout with deep liquidity.</p>
              <p><strong className="text-slate-100">Exchange listings</strong>: CEX listings; ongoing marketing scale-up.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Whitepaper anchor */}
      <section id="whitepaper" className="max-w-6xl mx-auto px-4 pb-8">
        <Card className="bg-slate-900/60 border-slate-800">
          <CardHeader><CardTitle className="text-slate-100">Whitepaper</CardTitle></CardHeader>
          <CardContent className="text-slate-300 text-sm space-y-3">
            <p>The whitepaper covers the protocol design, tokenomics, utilities, reward loops, and compliance posture.</p>
            <div className="flex flex-wrap gap-3">
              <Button asChild><Link href="/whitepaper">Read in browser</Link></Button>
              <Button variant="secondary" asChild>
                <a href="/whitepaper/BetX_Whitepaper_v2.pdf" target="_blank" rel="noopener" download>
                  Download PDF
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Community */}
      <section id="community" className="max-w-6xl mx-auto px-4 pb-24">
        <Card className="bg-slate-900/60 border-slate-800">
          <CardHeader><CardTitle className="text-slate-100">Join the community</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild variant="secondary"><a href="#"><Twitter className="h-4 w-4 mr-2" />Twitter</a></Button>
            <Button asChild variant="secondary"><a href="#"><MessageCircle className="h-4 w-4 mr-2" />Telegram</a></Button>
          </CardContent>
        </Card>
        <p className="mt-6 text-xs text-slate-500">
          Disclaimer: Availability of betting features may be restricted by local laws. This site is for informational purposes, not financial or betting advice.
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <div>© {new Date().getFullYear()} BetX Protocol. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <a href="#tokenomics" className="hover:text-slate-200">Tokenomics</a>
            <a href="#roadmap" className="hover:text-slate-200">Roadmap</a>
            <a href="#sale" className="hover:text-slate-200">Sale</a>
            <a href="#whitepaper" className="hover:text-slate-200">Whitepaper</a>
            <Link href="/tips" className="hover:text-slate-200">Tips</Link>
            <Link href="/tipster" className="hover:text-slate-200">Tipster</Link>
            <Link href="/bet" className="hover:text-slate-200">Bet</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
