'use client';

import { useMemo, useState } from 'react';
import SiteHeader from '@/components/SiteHeader';
import ConnectWalletButton from '@/components/ConnectWalletButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Lock, Unlock, Trophy, Percent, Search, Filter,
  Shield, Coins, RefreshCw, ArrowLeft
} from 'lucide-react';

type Tip = {
  id: string;
  league: string;
  match: string;
  hiddenMarket: string;
  hiddenOdds: number;
  cutoff: string; // ISO
  tipster: { name: string; winRate: number; roi: number; streak: number };
  priceNOVA: number;
  unlocked?: boolean;
  pickReveal: string;
};

type SortKey = 'soon' | 'winrate' | 'price';

// Demo tips
const TIPS: Tip[] = [
  {
    id: 't1',
    league: 'Tennis • ATP',
    match: 'Ruud vs De Minaur',
    hiddenMarket: 'Over 22.5 games',
    hiddenOdds: 1.78,
    cutoff: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    tipster: { name: 'AlphaEdge', winRate: 64, roi: 12.4, streak: 4 },
    priceNOVA: 25,
    pickReveal: 'Over 22.5 games @1.78 (enter live if tied late Set 1)',
  },
  {
    id: 't2',
    league: 'Football • EPL',
    match: 'Arsenal vs Newcastle',
    hiddenMarket: '1st Half Under 1.5',
    hiddenOdds: 1.52,
    cutoff: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    tipster: { name: 'xGWizard', winRate: 68, roi: 15.1, streak: 6 },
    priceNOVA: 18,
    pickReveal: '1H Under 1.5 @1.52 (hedge if early yellow cluster)',
  },
  {
    id: 't3',
    league: 'Basketball • EuroLeague',
    match: 'Real Madrid vs Fenerbahçe',
    hiddenMarket: 'Home -4.5 (AH)',
    hiddenOdds: 1.70,
    cutoff: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    tipster: { name: 'CourtIQ', winRate: 61, roi: 9.3, streak: -1 },
    priceNOVA: 16,
    pickReveal: 'Real Madrid -4.5 @1.70 (pace-up angle, bench edge)',
  },
];

export default function TipsPage() {
  const [items, setItems] = useState<Tip[]>(TIPS);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('soon');
  const [connected, setConnected] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    let out = items.filter(t =>
      t.league.toLowerCase().includes(q) ||
      t.match.toLowerCase().includes(q) ||
      t.tipster.name.toLowerCase().includes(q)
    );
    if (sort === 'soon') out = out.sort((a, b) => +new Date(a.cutoff) - +new Date(b.cutoff));
    else if (sort === 'winrate') out = out.sort((a, b) => b.tipster.winRate - a.tipster.winRate);
    else if (sort === 'price') out = out.sort((a, b) => a.priceNOVA - b.priceNOVA);
    return out;
  }, [items, query, sort]);

  function unlockTip(id: string) {
    if (!connected) {
      alert('Please connect your wallet first.');
      return;
    }
    setItems(prev => prev.map(t => (t.id === id ? { ...t, unlocked: true } : t)));
    alert('✅ Demo: Paid in NOVA (simulated). Tip unlocked!');
  }

  return (
    <div className="min-h-screen pb-safe bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <SiteHeader />

      {/* Top bar: back + connect (header-এর নিচে স্পেস) */}
      <div className="max-w-6xl mx-auto px-4 mt-16 md:mt-20 py-6 flex items-center justify-between">
        <Button variant="secondary" className="rounded-xl" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <ConnectWalletButton onChange={setConnected} />
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-10">
        {/* Benefits / Policy */}
        <div className="mb-8">
          <Card className="bg-sky-900/10 border-sky-800/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <Shield className="h-5 w-5 text-slate-300" />
                Why unlock tips with <span className="text-sky-300">NOVA</span>?
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4 text-sm text-slate-300">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2 font-semibold text-slate-100 mb-1">
                  <Trophy className="h-4 w-4 text-slate-300" /> Verified performance
                </div>
                <p>See win rate, ROI, and streaks. Tipsters are filtered and staked for quality.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2 font-semibold text-slate-100 mb-1">
                  <Coins className="h-4 w-4 text-slate-300" /> Escrow protection (V1)
                </div>
                <p>Win ⇒ tipster gets full fee. Lose ⇒ you receive credit; tipster keeps a small base fee.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2 font-semibold text-slate-100 mb-1">
                  <RefreshCw className="h-4 w-4 text-slate-300" /> Fair for both sides
                </div>
                <p>Buyers aren’t fully exposed on losses, and tipsters still earn for their work.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100">Tips</h1>
          <div className="flex gap-2">
            <div className="flex items-center bg-slate-900/60 border border-slate-800 rounded-xl px-3">
              <Search className="h-4 w-4 mr-2 opacity-70 text-slate-300" />
              <input
                className="bg-transparent py-2 outline-none text-sm text-slate-100 placeholder-slate-400"
                placeholder="Search league, match, tipster..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center bg-slate-900/60 border border-slate-800 rounded-xl px-3">
              <Filter className="h-4 w-4 mr-2 opacity-70 text-slate-300" />
              <select
                className="bg-transparent py-2 text-sm outline-none text-slate-100"
                value={sort}
                onChange={e => setSort(e.target.value as SortKey)}
              >
                <option className="bg-slate-800 text-slate-100" value="soon">Soonest</option>
                <option className="bg-slate-800 text-slate-100" value="winrate">Best win rate</option>
                <option className="bg-slate-800 text-slate-100" value="price">Lowest price</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tip cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {filtered.map(tip => {
            const timeLeftMin = Math.max(0, Math.round((+new Date(tip.cutoff) - Date.now()) / 60000));
            return (
              <Card key={tip.id} className="bg-slate-900/60 border-slate-800 overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-base text-slate-100 flex items-center justify-between">
                    <span>{tip.league}</span>
                    <Badge className="bg-slate-800 text-slate-100 border border-slate-700">{timeLeftMin}m</Badge>
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-3 text-sm text-slate-300">
                  <div className="font-semibold text-slate-100">{tip.match}</div>

                  {/* LOCKED: details hidden until unlock */}
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                    {!tip.unlocked ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Lock className="h-4 w-4" />
                          <span>Pick is locked. Unlock to view exact market and odds.</span>
                        </div>
                        <div className="text-[11px] text-slate-500">Teaser: premium pick available before kickoff.</div>
                      </div>
                    ) : (
                      <div className="text-slate-100">
                        <div className="mb-1"><span className="font-semibold">Market:</span> {tip.hiddenMarket}</div>
                        <div className="mb-1"><span className="font-semibold">Odds:</span> @{tip.hiddenOdds.toFixed(2)}</div>
                        <div className="mb-1"><span className="font-semibold">Pick:</span> {tip.pickReveal}</div>
                      </div>
                    )}
                  </div>

                  {/* Tipster metrics */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-200">
                      <Trophy className="h-4 w-4" />
                      <span>{tip.tipster.name}</span>
                    </div>
                    <div className="flex items-center gap-2 opacity-90 text-slate-200">
                      <Percent className="h-4 w-4" />
                      <span>
                        {tip.tipster.winRate}% WR • {tip.tipster.roi}% ROI • {tip.tipster.streak >= 0 ? `W${tip.tipster.streak}` : `L${Math.abs(tip.tipster.streak)}`}
                      </span>
                    </div>
                  </div>

                  {/* CTA */}
                  {!tip.unlocked ? (
                    <Button className="w-full rounded-xl text-slate-100" onClick={() => unlockTip(tip.id)}>
                      <Unlock className="h-4 w-4 mr-2" />
                      Unlock for {tip.priceNOVA} NOVA
                    </Button>
                  ) : (
                    <Button className="w-full rounded-xl" variant="secondary">Unlocked</Button>
                  )}

                  <div className="text-[11px] text-slate-400">
                    * Escrow V1 (demo): Win ⇒ full fee. Lose ⇒ buyer credit; tipster keeps a small base fee.
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
