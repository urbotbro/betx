'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-slate-900/70 bg-slate-900/60 border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-500 grid place-items-center">🔥</div>
          <span className="font-bold tracking-tight">NovaBet Protocol</span>
          <Badge variant="secondary" className="ml-2">BEP-20</Badge>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a href="/#tokenomics" className="hover:text-white/90">Tokenomics</a>
          <a href="/#roadmap" className="hover:text-white/90">Roadmap</a>
          <Link href="/tips" className="hover:text-white/90">Tips</Link>
          <Link href="/tipster" className="hover:text-white/90">Tipster</Link>
          <Link href="/bet" className="hover:text-white/90">Bet</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="secondary"><a href="/#presale">Presale</a></Button>
          <ConnectButton chainStatus="icon" showBalance={false} accountStatus="address" />
        </div>
      </div>
    </header>
  );
}
