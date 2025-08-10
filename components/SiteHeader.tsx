'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-slate-900/70 bg-slate-900/60 border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo / Brand */}
        <Link href="/" aria-label="BetX home" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-cyan-400 to-emerald-500 grid place-items-center text-white">
            🔥
          </div>
          <span className="font-bold tracking-tight text-slate-100">BetX</span>
          <Badge variant="secondary" className="ml-2">SOL</Badge>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/#tokenomics" className="hover:text-white/90 text-slate-200">Tokenomics</Link>
          <Link href="/#roadmap" className="hover:text-white/90 text-slate-200">Roadmap</Link>
          <Link href="/tips" className="hover:text-white/90 text-slate-200">Tips</Link>
          <Link href="/tipster" className="hover:text-white/90 text-slate-200">Tipster</Link>
          <Link href="/bet" className="hover:text-white/90 text-slate-200">Bet</Link>
        </nav>

        {/* CTAs */}
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="secondary">
            <Link href="/#sale">Sale</Link>
          </Button>
          <ConnectButton chainStatus="icon" showBalance={false} accountStatus="address" />
        </div>
      </div>
    </header>
  );
}
