'use client';

import { useMemo, useState } from 'react';
import ConnectWalletButton from '@/components/ConnectWalletButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Trophy, Percent, TrendingUp, Search, Filter,
  Users, Shield, Info, ArrowLeft
} from 'lucide-react';

type Tipster = {
  id: string;
  name: string;
  bio: string;
  winRate: number;   // %
  roi: number;       // %
  tipsCount: number;
  streak: number;    // +3 = W3, -2 = L2
  stakedNOVA: number;
  recent: { match: string; result: 'W' | 'L' }[];
};

type SortKey = 'roi' | 'winrate' | 'tips';

const TIPSTERS: Tipster[] = [
  {
    id: 's1',
    name: 'AlphaEdge',
    bio: 'Tennis macro + live entry edges. Focus on totals and momentum swings.',
    winRate: 64,
    roi: 12.4,
    tipsCount: 382,
    streak: 4,
    stakedNOVA: 1200,
    recent: [
      { match: 'Ruud vs De Minaur', result: 'W' },
      { match: 'Hurkacz vs Fritz', result: 'W' },
      { match: 'Sinner vs Rublev', result: 'W' },
      { match: 'Tiafoe vs Paul', result: 'L' },
    ],
  },
  {
    id: 's2',
    name: 'xGWizard',
    bio: 'Football modeler. xG-based unders and early-card tempo reads.',
    winRate: 68,
    roi: 15.1,
    tipsCount: 521,
    streak: 6,
    stakedNOVA: 1500,
    recent: [
      { match: 'Arsenal vs Newcastle', result: 'W' },
      { match: 'City vs Villa', result: 'W' },
      { match: 'Liverpool vs Spurs', result: 'W' },
      { match: 'Chelsea vs Wolves', result: 'W' },
    ],
  },
  {
    id: 's3',
    name: 'CourtIQ',
    bio: 'Basketball pace & lineup edges. Asian handicaps and late steam.',
    winRate: 61,
    roi: 9.3,
    tipsCount: 244,
    streak: -1,
    stakedNOVA: 800,
    recent: [
      { match: 'Madrid vs Fenerbahçe', result: 'L' },
      { match: 'Barça vs Monaco', result: 'W' },
      { match: 'PAO vs OLY', result: 'W' },
    ],
  },
];

export default function TipsterPage() {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('roi');
  const [connected, setConnected] = useState(false);

  const list = useMemo(() => {
    const q = query.toLowerCase();
    let out = TIPSTERS.filter(
      t => t.name.toLowerCase().includes(q) || t.bio.toLowerCase().includes(q)
    );
    if (sort === 'roi') out = out.sort((a, b) => b.roi - a.roi);
    else if (sort === 'winrate') out = out.sort((a, b) => b.winRate - a.winRate);
    else if (sort === 'tips') out = out.sort((a, b) => b.tipsCount - a.tipsCount);
    return out;
  }, [query, sort]);

  return (
    <div className="min-h-screen pb-safe bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 pt-16 md:pt-20">
      {/* Top bar: back + connect */}
      <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
        <Button variant="secondary" className="rounded-xl" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <ConnectWalletButton onChange={setConnected} />
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-10">
        {/* Explainer */}
        <Card className="bg-slate-900/60 border-slate-800 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-100">
              <Users className="h-5 w-5 text-slate-300" />
              Tipsters — perform, stake, earn
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4 text-sm text-slate-300">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-2 font-semibold text-slate-100 mb-1">
                <Trophy className="h-4 w-4 text-slate-300" /> Transparent metrics
              </div>
              <p>Win rate, ROI, streak, tips count — tracked over rolling windows so rankings can’t be gamed.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-2 font-semibold text-slate-100 mb-1">
                <Shield className="h-4 w-4 text-slate-300" /> Staking & accountability
              </div>
              <p>Tipsters stake NOVA to list. Persistent poor performance can reduce rank or require higher stake.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-2 font-semibold text-slate-100 mb-1">
                <TrendingUp className="h-4 w-4 text-slate-300" /> Fair payouts (Escrow V1)
              </div>
              <p>Win ⇒ full fee. Lose ⇒ buyer gets credit; tipster keeps a small base fee.</p>
            </div>
          </CardContent>
        </Card>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100">Tipster leaderboard</h1>
          <div className="flex gap-2">
            <div className="flex items-center bg-slate-900/60 border border-slate-800 rounded-xl px-3">
              <Search className="h-4 w-4 mr-2 opacity-70 text-slate-300" />
              <input
                className="bg-transparent py-2 outline-none text-sm text-slate-100 placeholder-slate-400"
                placeholder="Search tipster or strategy..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center bg-slate-900/60 border border-slate-800 rounded-xl px-3">
              <Filter className="h-4 w-4 mr-2 opacity-70 text-slate-300" />
              <select
                className="bg-transparent py-2 text-sm outline-none text-slate-100"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
              >
                <option className="bg-slate-800 text-slate-100" value="roi">Highest ROI</option>
                <option className="bg-slate-800 text-slate-100" value="winrate">Best win rate</option>
                <option className="bg-slate-800 text-slate-100" value="tips">Most tips</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {list.map((t) => {
            const streakLabel = t.streak >= 0 ? `W${t.streak}` : `L${Math.abs(t.streak)}`;
            return (
              <Card key={t.id} className="bg-slate-900/60 border-slate-800 overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-base text-slate-100 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="h-8 w-8 rounded-full bg-slate-800 grid place-items-center text-xs text-slate-300">
                        {t.name.slice(0,2).toUpperCase()}
                      </span>
                      <span className="text-slate-100">{t.name}</span>
                    </span>
                    <Badge className="bg-slate-800 text-slate-100 border border-slate-700">{streakLabel}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-300">
                  <p className="text-slate-400">{t.bio}</p>

                  {/* Metrics row */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-3">
                      <div className="text-slate-400 text-[11px] flex items-center justify-center gap-1">
                        <Percent className="h-3 w-3" /> Win rate
                      </div>
                      <div className="text-slate-100 font-semibold text-lg">{t.winRate}%</div>
                    </div>
                    <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-3">
                      <div className="text-slate-400 text-[11px] flex items-center justify-center gap-1">
                        <TrendingUp className="h-3 w-3" /> ROI
                      </div>
                      <div className="text-slate-100 font-semibold text-lg">{t.roi}%</div>
                    </div>
                    <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-3">
                      <div className="text-slate-400 text-[11px] flex items-center justify-center gap-1">
                        <Trophy className="h-3 w-3" /> Tips
                      </div>
                      <div className="text-slate-100 font-semibold text-lg">{t.tipsCount}</div>
                    </div>
                  </div>

                  {/* Staked + recent */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="text-slate-400">
                      Staked: <span className="text-slate-200 font-medium">{t.stakedNOVA} NOVA</span>
                    </div>
                    <div className="text-slate-400 flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      Recent:
                      <span className="ml-1">
                        {t.recent.map((r, i) => (
                          <span key={i} className={r.result === 'W' ? 'text-emerald-400' : 'text-rose-400'}>
                            {r.result}{i < t.recent.length - 1 ? ' ' : ''}
                          </span>
                        ))}
                      </span>
                    </div>
                  </div>

                  {/* CTAs */}
                  <div className="flex gap-2">
                    <Button asChild className="w-1/2 rounded-xl">
                      <a href="/tips">View tips</a>
                    </Button>
                    <Button asChild variant="secondary" className="w-1/2 rounded-xl">
                      <a href="/tipster/apply">Apply as tipster</a>
                    </Button>
                  </div>

                  <div className="text-[11px] text-slate-400">
                    * Ranking weights recent performance more than old results. Poor performance can lower visibility.
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
