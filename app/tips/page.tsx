'use client';

import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Lock, Unlock, Trophy, Percent, Search, Filter,
  Shield, Coins, RefreshCw, Copy, Check
} from 'lucide-react';

/* ===== Types ===== */
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
type PayCoin = 'BETX' | 'USDT' | 'SOL';

type EscrowStatus = 'awaiting_payment' | 'confirming' | 'released' | 'refunded_partial';
type Purchase = {
  id: string;         // purchase id
  tipId: string;
  coin: PayCoin;
  price: number;
  tx?: string;
  status: EscrowStatus;
  createdAt: number;
  refundedAmount?: number;
};

/* ===== Demo deposit addresses for tips checkout ===== */
const TIP_ADDRESSES: Record<PayCoin, { address: string; network: string; label: string }> = {
  BETX: { address: '0xBETX-TIPS-ADDR-8899AABBCCDDEE', network: 'BEP-20 (BSC)', label: 'BETX' },
  USDT: { address: '0xUSDT-TIPS-ADDR-11223344556677', network: 'BEP-20 (BSC)', label: 'USDT' },
  SOL:  { address: 'So1TipsDemo1111111111111111111111111111', network: 'Solana', label: 'SOL' },
};

/* ===== Demo Tips ===== */
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

/* ===== Helpers ===== */
const fmtMinsLeft = (iso: string) =>
  Math.max(0, Math.round((+new Date(iso) - Date.now()) / 60000));

const loadJSON = <T,>(k: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};
const saveJSON = (k: string, v: any) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {}
};

/* ===== Page ===== */
export default function TipsPage() {
  // purchases by tipId (per device demo)
  const [purchases, setPurchases] = useState<Record<string, Purchase>>(() =>
    loadJSON<Record<string, Purchase>>('tips:purchases', {})
  );

  // sales counter per tip
  const [sales, setSales] = useState<Record<string, number>>(() =>
    loadJSON<Record<string, number>>('tips:sales', {})
  );

  // tips list with unlocked state derived from purchases
  const [items, setItems] = useState<Tip[]>(() => {
    const unlockedIds = Object.values(loadJSON<Record<string, Purchase>>('tips:purchases', {}))
      .filter((p) => p.status === 'released')
      .map((p) => p.tipId);
    return TIPS.map((t) => (unlockedIds.includes(t.id) ? { ...t, unlocked: true } : t));
  });

  useEffect(() => saveJSON('tips:purchases', purchases), [purchases]);
  useEffect(() => saveJSON('tips:sales', sales), [sales]);

  // search / sort
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('soon');

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    let out = items.filter(
      (t) =>
        t.league.toLowerCase().includes(q) ||
        t.match.toLowerCase().includes(q) ||
        t.tipster.name.toLowerCase().includes(q)
    );
    if (sort === 'soon') out = out.sort((a, b) => +new Date(a.cutoff) - +new Date(b.cutoff));
    else if (sort === 'winrate') out = out.sort((a, b) => b.tipster.winRate - a.tipster.winRate);
    else if (sort === 'price') out = out.sort((a, b) => a.priceNOVA - b.priceNOVA);
    return out;
  }, [items, query, sort]);

  // payment modal
  const [payFor, setPayFor] = useState<Tip | null>(null);

  // refund modal
  const [refundFor, setRefundFor] = useState<Tip | null>(null);

  /* Start escrow → auto-unlock (demo) */
  function startPayment(tip: Tip, coin: PayCoin, tx: string) {
    const purchase: Purchase = {
      id: Math.random().toString(36).slice(2, 10).toUpperCase(),
      tipId: tip.id,
      coin,
      price: tip.priceNOVA,
      tx,
      status: 'confirming',
      createdAt: Date.now(),
    };
    setPurchases((prev) => ({ ...prev, [tip.id]: purchase }));
    setPayFor(null);

    // simulate confirmations then release escrow & unlock
    setTimeout(() => {
      setPurchases((prev) => {
        const cur = prev[tip.id];
        if (!cur || cur.status !== 'confirming') return prev;
        const released = { ...cur, status: 'released' as EscrowStatus };
        return { ...prev, [tip.id]: released };
      });
      setItems((prev) => prev.map((t) => (t.id === tip.id ? { ...t, unlocked: true } : t)));
      // increment sales count
      setSales((prev) => ({ ...prev, [tip.id]: (prev[tip.id] || 0) + 1 }));
    }, 2000);
  }

  /* Partial refund (demo) */
  function doPartialRefund(tip: Tip, percent: number) {
    const p = purchases[tip.id];
    if (!p || p.status !== 'released') return;
    const refundAmt = Math.round(p.price * (percent / 100) * 100) / 100;
    setPurchases((prev) => ({
      ...prev,
      [tip.id]: { ...p, status: 'refunded_partial', refundedAmount: refundAmt },
    }));
    alert(
      `✅ Partial refund processed (demo): ${refundAmt} ${p.coin} back to buyer.\nTipster keeps the remainder.`
    );
    setRefundFor(null);
  }

  return (
    <div className="min-h-screen pb-safe bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 pt-16 md:pt-20">
      {/* Top bar — no back button, no wallet connect */}
      <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Tips Marketplace</h1>
        <Badge variant="secondary" className="bg-slate-800 text-slate-100 border border-slate-700">
          Escrow V1 • Demo
        </Badge>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-10">
        {/* Benefits / Policy */}
        <div className="mb-8">
          <Card className="bg-sky-900/10 border-sky-800/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <Shield className="h-5 w-5 text-slate-300" />
                How it works (escrow)
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
                <p>Pay to escrow → auto-unlock after confirm. Partial refunds possible on mistakes.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2 font-semibold text-slate-100 mb-1">
                  <RefreshCw className="h-4 w-4 text-slate-300" /> Fair for both sides
                </div>
                <p>Buyers aren’t fully exposed on losses, and tipsters still earn a base fee.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between mb-6">
          <div />
          <div className="flex gap-2">
            <div className="flex items-center bg-slate-900/60 border border-slate-800 rounded-xl px-3">
              <Search className="h-4 w-4 mr-2 opacity-70 text-slate-300" />
              <input
                className="bg-transparent py-2 outline-none text-sm text-slate-100 placeholder-slate-400"
                placeholder="Search league, match, tipster..."
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
                <option className="bg-slate-800 text-slate-100" value="soon">
                  Soonest
                </option>
                <option className="bg-slate-800 text-slate-100" value="winrate">
                  Best win rate
                </option>
                <option className="bg-slate-800 text-slate-100" value="price">
                  Lowest price
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Tip cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {filtered.map((tip) => {
            const mins = fmtMinsLeft(tip.cutoff);
            const p = purchases[tip.id];
            const sold = sales[tip.id] || 0;
            return (
              <Card key={tip.id} className="bg-slate-900/60 border-slate-800 overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-base text-slate-100 flex items-center justify-between">
                    <span>{tip.league}</span>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-slate-800 text-slate-100 border border-slate-700">
                        {mins}m
                      </Badge>
                      <Badge variant="outline" className="border-slate-700 text-slate-200">
                        Sold {sold}
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-3 text-sm text-slate-300">
                  <div className="font-semibold text-slate-100">{tip.match}</div>

                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                    {!tip.unlocked ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Lock className="h-4 w-4" />
                          <span>Pick is locked. Unlock to view exact market and odds.</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Teaser: premium pick available before kickoff.
                        </div>
                      </div>
                    ) : (
                      <div className="text-slate-100">
                        <div className="mb-1">
                          <span className="font-semibold">Market:</span> {tip.hiddenMarket}
                        </div>
                        <div className="mb-1">
                          <span className="font-semibold">Odds:</span> @{tip.hiddenOdds.toFixed(2)}
                        </div>
                        <div className="mb-1">
                          <span className="font-semibold">Pick:</span> {tip.pickReveal}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-200">
                      <Trophy className="h-4 w-4" />
                      <span>{tip.tipster.name}</span>
                    </div>
                    <div className="flex items-center gap-2 opacity-90 text-slate-200">
                      <Percent className="h-4 w-4" />
                      <span>
                        {tip.tipster.winRate}% WR • {tip.tipster.roi}% ROI •{' '}
                        {tip.tipster.streak >= 0 ? `W${tip.tipster.streak}` : `L${Math.abs(tip.tipster.streak)}`}
                      </span>
                    </div>
                  </div>

                  {/* Escrow status row */}
                  {p && (
                    <div className="text-[11px] text-slate-400">
                      Escrow: <strong className="text-slate-200">{p.status}</strong>
                      {p.status === 'confirming' && ' • Auto-unlocking…'}
                      {p.status === 'refunded_partial' && p.refundedAmount
                        ? ` • Refunded ${p.refundedAmount} ${p.coin}`
                        : null}
                    </div>
                  )}

                  {!tip.unlocked ? (
                    <Button className="w-full rounded-xl text-slate-100" onClick={() => setPayFor(tip)}>
                      <Unlock className="h-4 w-4 mr-2" />
                      Unlock (choose BETX/USDT/SOL)
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button className="w-full rounded-xl" variant="secondary">
                        Unlocked
                      </Button>
                      <Button
                        className="rounded-xl"
                        variant="secondary"
                        onClick={() => setRefundFor(tip)}
                        title="Demo: partially refund if mistake"
                      >
                        Partial refund
                      </Button>
                    </div>
                  )}

                  <div className="text-[11px] text-slate-400">
                    * Escrow V1 (demo): pay → confirm → auto-unlock. Mistakes can be partially refunded.
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Payment Modal */}
      {payFor && (
        <PayModal
          tip={payFor}
          onClose={() => setPayFor(null)}
          onConfirm={(coin, tx) => startPayment(payFor, coin, tx)}
        />
      )}

      {/* Refund Modal */}
      {refundFor && (
        <RefundModal
          tip={refundFor}
          onClose={() => setRefundFor(null)}
          onConfirm={(percent) => doPartialRefund(refundFor, percent)}
        />
      )}
    </div>
  );
}

/* ===== Modals & small components ===== */

function PayModal({
  tip,
  onClose,
  onConfirm,
}: {
  tip: Tip;
  onClose: () => void;
  onConfirm: (coin: PayCoin, tx: string) => void;
}) {
  const [coin, setCoin] = useState<PayCoin>('BETX');
  const [tx, setTx] = useState('');
  const dep = TIP_ADDRESSES[coin];

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 grid place-items-center px-4">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-slate-100 font-semibold">Unlock tip • {tip.match}</h3>
          <button className="p-2 rounded-lg hover:bg-slate-800 text-slate-300" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="p-6 space-y-4 text-sm text-slate-200">
          <div>
            <label className="block text-slate-200 mb-1">Pay with</label>
            <select
              className="w-full rounded-xl bg-slate-900/85 text-slate-100 border border-slate-700 px-3 py-2 outline-none"
              value={coin}
              onChange={(e) => setCoin(e.target.value as PayCoin)}
            >
              <option value="BETX">BETX (BEP-20)</option>
              <option value="USDT">USDT (BEP-20)</option>
              <option value="SOL">SOL (Solana)</option>
            </select>
          </div>

          <div className="rounded-xl bg-slate-900/85 border border-slate-700 p-3">
            <div className="text-slate-300 text-xs mb-1">Deposit address</div>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-mono text-slate-100 break-all">{dep.address}</div>
                <div className="text-xs text-slate-100 mt-1">
                  Network: <Badge variant="secondary">{dep.network}</Badge>
                </div>
              </div>
              <CopyButton text={dep.address} />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Send exactly <span className="text-slate-200 font-semibold">{tip.priceNOVA}</span> {dep.label}.
              Auto-unlock after confirmations (demo ~2s).
            </p>
          </div>

          <div className="grid gap-2">
            <input
              placeholder="Tx hash / reference"
              className="rounded-xl bg-slate-900/85 text-slate-100 border border-slate-700 px-3 py-2 outline-none"
              value={tx}
              onChange={(e) => setTx(e.target.value)}
            />
            <Button
              className="rounded-xl"
              onClick={() => onConfirm(coin, tx)}
              disabled={!tx}
              title="Confirm you sent payment"
            >
              I sent payment
            </Button>
          </div>

          <div className="text-[11px] text-slate-400">
            * Demo only. In production, a backend listener credits escrow after on-chain confirmations.
          </div>
        </div>
      </div>
    </div>
  );
}

function RefundModal({
  tip,
  onClose,
  onConfirm,
}: {
  tip: Tip;
  onClose: () => void;
  onConfirm: (percent: number) => void;
}) {
  const [percent, setPercent] = useState<number>(30);
  return (
    <div className="fixed inset-0 z-[60] bg-black/70 grid place-items-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-slate-100 font-semibold">Partial refund • {tip.match}</h3>
          <button className="p-2 rounded-lg hover:bg-slate-800 text-slate-300" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="p-6 space-y-4 text-sm text-slate-200">
          <p className="text-slate-300">
            Choose a refund percentage to return to the buyer (demo). Tipster keeps the remainder.
          </p>
          <div>
            <label className="block text-slate-200 mb-2">Refund percent: {percent}%</label>
            <input
              type="range"
              min={10}
              max={90}
              step={5}
              value={percent}
              onChange={(e) => setPercent(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" className="rounded-xl" onClick={onClose}>
              Cancel
            </Button>
            <Button className="rounded-xl" onClick={() => onConfirm(percent)}>
              Confirm refund
            </Button>
          </div>
          <div className="text-[11px] text-slate-400">
            * Demo only. In production, escrow would release split transfers on-chain.
          </div>
        </div>
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  }
  return (
    <Button size="sm" variant="secondary" onClick={copy} className="rounded-lg">
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    </Button>
  );
}
