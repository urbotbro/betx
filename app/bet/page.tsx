'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Wallet, Copy, Check, TrendingUp, Trash2, Calculator,
  User, Settings, ShieldCheck, LogIn, UserPlus, X, CalendarClock,
  Trophy, ArrowDownToLine
} from 'lucide-react';

/* ===== THEME ===== */
const pageBg =
  'min-h-screen pb-safe text-slate-100 bg-[radial-gradient(90rem_70rem_at_50%_-10%,#223047_10%,#0f172a_50%,#0b1220_100%)]';
const panel = 'bg-slate-800/70 border-slate-700 backdrop-blur';
const field =
  'rounded-xl bg-slate-900/85 text-slate-100 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-600';
const chip =
  'px-2.5 py-1 rounded-full text-xs bg-sky-500/15 text-sky-200 border border-sky-500/30';

/* ===== DEMO DEPOSIT ADDRS ===== */
const DEPOSIT_ADDRESSES: Record<
  string,
  { address: string; network: string; note?: string }
> = {
  USDT: {
    address: '0xUSDT-DEMO-ADDR-1234567890ABCDEF',
    network: 'BEP-20 (BSC)',
    note: 'Send only USDT on BNB Smart Chain.',
  },
  BTC: {
    address: 'bc1q-demo-btc-address-2k4u7a3yx',
    network: 'Bitcoin (BTC)',
    note: 'Native BTC only.',
  },
  ETH: {
    address: '0xETH-DEMO-ADDR-ABCDEF1234567890',
    network: 'ERC-20 (Ethereum)',
    note: 'Send only ERC-20 ETH.',
  },
  BETX: {
    address: '0xBETX-DEMO-ADDR-00112233445566',
    network: 'BEP-20 (BSC)',
    note: 'Project token on BSC.',
  },
};

/* ===== TYPES ===== */
type Sport = 'Football' | 'Tennis' | 'Basketball' | 'Cricket';
type Match = {
  id: string;
  sport: Sport;
  league: string;
  startTs: number;
  teamA: string;
  teamB: string;
  market: '1x2' | 'moneyline';
  odds: { A: number; Draw?: number; B: number };
  trending?: boolean;
};
type Pick = { id: string; matchId: string; sport: Sport; label: string; odds: number };
type UserRec = { id: string; email: string; username: string; password: string };

/* ===== UTILS ===== */
const r2 = (n: number) => Math.round(n * 100) / 100;
const fmtLocal = (ts: number) =>
  new Date(ts).toLocaleString(undefined, {
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    day: '2-digit',
  });

/* ===== TIME BADGE (hydration-safe) ===== */
function TimeBadge({ ts, enabled }: { ts: number; enabled: boolean }) {
  const [now, setNow] = useState<number>(() =>
    typeof window !== 'undefined' ? Date.now() : 0
  );
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, [enabled]);
  if (!enabled) return <span suppressHydrationWarning>—</span>;
  const m = Math.max(0, Math.round((ts - now) / 60000));
  const text = m < 60 ? `${m}m` : `${Math.floor(m / 60)}h ${m % 60}m`;
  return <span suppressHydrationWarning>{text}</span>;
}

/* ===== SUPER SIMPLE LOCAL AUTH (demo) ===== */
function useAuth() {
  const [user, setUser] = useState<{ id: string; email: string; username: string } | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem('authUser');
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  function getDb(): Record<string, UserRec> {
    try {
      return JSON.parse(localStorage.getItem('usersDb') || '{}');
    } catch {
      return {};
    }
  }
  function putDb(db: Record<string, UserRec>) {
    localStorage.setItem('usersDb', JSON.stringify(db));
  }

  function signUp({
    email,
    username,
    password,
  }: {
    email: string;
    username: string;
    password: string;
  }) {
    const db = getDb();
    if (db[email]) throw new Error('Email already exists.');
    const rec: UserRec = { id: crypto.randomUUID(), email, username, password };
    db[email] = rec;
    putDb(db);
    localStorage.setItem(
      'authUser',
      JSON.stringify({ id: rec.id, email: rec.email, username: rec.username })
    );
    setUser({ id: rec.id, email: rec.email, username: rec.username });
  }

  function signIn(email: string, password: string) {
    const db = getDb();
    const rec = db[email];
    if (!rec || rec.password !== password) throw new Error('Invalid email or password.');
    localStorage.setItem(
      'authUser',
      JSON.stringify({ id: rec.id, email: rec.email, username: rec.username })
    );
    setUser({ id: rec.id, email: rec.email, username: rec.username });
  }

  function signUpWithGoogleDemo() {
    const email = 'demo.user@gmail.com';
    const username = 'DemoUser';
    const password = 'oauth';
    const db = getDb();
    if (!db[email]) {
      db[email] = { id: crypto.randomUUID(), email, username, password };
      putDb(db);
    }
    localStorage.setItem('authUser', JSON.stringify({ id: db[email].id, email, username }));
    setUser({ id: db[email].id, email, username });
  }

  function signOut() {
    localStorage.removeItem('authUser');
    setUser(null);
  }

  return { user, signUp, signIn, signUpWithGoogleDemo, signOut };
}

/* ===== PAGE ===== */
export default function BetPage() {
  const { user, signUp, signIn, signUpWithGoogleDemo, signOut } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const [baseNow, setBaseNow] = useState<number>(() =>
    typeof window !== 'undefined' ? Date.now() : 0
  );
  const isReady = baseNow !== 0;
  useEffect(() => {
    setBaseNow(Date.now());
  }, []);

  const MATCHES: Match[] = useMemo(() => {
    const t = isReady ? baseNow : 0;
    return [
      { id: 'm1', sport: 'Football', league: 'EPL', startTs: t + 60 * 60 * 1000, teamA: 'Arsenal', teamB: 'Newcastle', market: '1x2', odds: { A: 1.86, Draw: 3.6, B: 4.1 }, trending: true },
      { id: 'm2', sport: 'Football', league: 'La Liga', startTs: t + 2 * 60 * 60 * 1000, teamA: 'Real Madrid', teamB: 'Sevilla', market: '1x2', odds: { A: 1.92, Draw: 3.9, B: 4.8 } },
      { id: 'm3', sport: 'Tennis', league: 'ATP 500', startTs: t + 90 * 60 * 1000, teamA: 'Ruud', teamB: 'De Minaur', market: 'moneyline', odds: { A: 1.72, B: 2.1 }, trending: true },
      { id: 'm4', sport: 'Tennis', league: 'WTA 250', startTs: t + 3 * 60 * 60 * 1000, teamA: 'Gauff', teamB: 'Kalinina', market: 'moneyline', odds: { A: 1.48, B: 2.55 } },
      { id: 'm5', sport: 'Basketball', league: 'EuroLeague', startTs: t + 2.5 * 60 * 60 * 1000, teamA: 'Madrid', teamB: 'Fenerbahçe', market: 'moneyline', odds: { A: 1.7, B: 2.15 }, trending: true },
      { id: 'm6', sport: 'Basketball', league: 'NBA (Preseason)', startTs: t + 4 * 60 * 60 * 1000, teamA: 'Warriors', teamB: 'Lakers', market: 'moneyline', odds: { A: 1.9, B: 1.95 } },
      { id: 'm7', sport: 'Cricket', league: 'T20 Series', startTs: t + 5 * 60 * 60 * 1000, teamA: 'India', teamB: 'Australia', market: 'moneyline', odds: { A: 1.75, B: 2.05 }, trending: true },
      { id: 'm8', sport: 'Cricket', league: 'ODI', startTs: t + 7 * 60 * 60 * 1000, teamA: 'England', teamB: 'Pakistan', market: 'moneyline', odds: { A: 1.8, B: 2.0 } },
    ];
  }, [baseNow, isReady]);

  const userKey = user?.email ?? 'guest';
  const [balances, setBalances] = useState<Record<string, number>>({
    USDT: 0,
    BTC: 0,
    ETH: 0,
    BETX: 0,
  });
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(`balances:${userKey}`) || '{}');
      setBalances({ USDT: 0, BTC: 0, ETH: 0, BETX: 0, ...saved });
    } catch {}
  }, [userKey]);
  const saveBalances = (next: Record<string, number>) => {
    setBalances(next);
    try {
      localStorage.setItem(`balances:${userKey}`, JSON.stringify(next));
    } catch {}
  };

  const [currency, setCurrency] = useState<'USDT' | 'BTC' | 'ETH' | 'BETX'>('USDT');
  const dep = DEPOSIT_ADDRESSES[currency];

  const [betCurrency, setBetCurrency] = useState<'USDT' | 'BTC' | 'ETH' | 'BETX'>('USDT');
  const [sport, setSport] = useState<Sport>('Football');
  const [slip, setSlip] = useState<Pick[]>([]);
  const [mode, setMode] = useState<'single' | 'parlay'>('parlay');
  const [stake, setStake] = useState<number>(50);

  const trending = useMemo(() => MATCHES.filter((m) => m.trending), [MATCHES]);
  const list = useMemo(() => MATCHES.filter((m) => m.sport === sport), [MATCHES, sport]);

  const addPick = (m: Match, sel: 'A' | 'Draw' | 'B') => {
    const key = `${m.id}-${sel}`;
    if (slip.find((p) => p.id === key)) return;
    const label = sel === 'A' ? m.teamA : sel === 'B' ? m.teamB : 'Draw';
    const odds = sel === 'A' ? m.odds.A : sel === 'B' ? m.odds.B : m.odds.Draw || 0;
    setSlip((prev) => [...prev, { id: key, matchId: m.id, sport: m.sport, label, odds }]);
  };
  const removePick = (id: string) => setSlip((prev) => prev.filter((p) => p.id !== id));
  const clearSlip = () => setSlip([]);

  const payout = useMemo(() => {
    if (!slip.length) return { potential: 0, details: '' };
    if (mode === 'parlay') {
      const combo = slip.reduce((acc, p) => acc * p.odds, 1);
      return { potential: r2(stake * combo), details: `Parlay x${slip.length} • Combined ${r2(combo)}` };
    } else {
      const each = stake / slip.length;
      const total = slip.reduce((s, p) => s + each * p.odds, 0);
      return { potential: r2(total), details: `Singles x${slip.length} • Each ${r2(each)}` };
    }
  }, [slip, stake, mode]);

  const demoCredit = (amount: number) => {
    if (!user) {
      alert('Please sign up / log in first.');
      return;
    }
    if (amount <= 0) {
      alert('Enter a positive amount.');
      return;
    }
    const next = { ...balances, [currency]: r2(balances[currency] + amount) };
    saveBalances(next);
    alert(`✅ Credited ${amount} ${currency} (demo).`);
  };

  // demo withdraw
  const demoWithdraw = (amount: number, coin: 'USDT' | 'BTC' | 'ETH' | 'BETX') => {
    if (!user) {
      alert('Please sign up / log in first.');
      return;
    }
    if (amount <= 0) {
      alert('Enter a positive amount.');
      return;
    }
    if ((balances[coin] ?? 0) < amount) {
      alert(`Insufficient balance. You have ${balances[coin]} ${coin}.`);
      return;
    }
    const next = { ...balances, [coin]: r2(balances[coin] - amount) };
    saveBalances(next);
    alert(`✅ Withdrawal request submitted (demo): ${amount} ${coin}`);
  };

  /* placeBet */
  const placeBet = () => {
    if (!user) {
      alert('Please sign up / log in first.');
      return;
    }
    if (!slip.length) {
      alert('Add selections first.');
      return;
    }
    if (stake <= 0) {
      alert('Enter stake.');
      return;
    }
    const avail = balances[betCurrency] ?? 0;
    if (avail < stake) {
      alert(`Insufficient ${betCurrency}. Need ${stake}, have ${avail}.`);
      return;
    }
    const next = { ...balances, [betCurrency]: r2(avail - stake) };
    saveBalances(next);
    const ticket = Math.random().toString(36).slice(2, 8).toUpperCase();
    alert(
      `🎟️ Bet placed (demo)\nTicket: ${ticket}\nMode: ${mode.toUpperCase()} • ` +
        `Stake: ${stake} ${betCurrency}\nPotential: ${payout.potential} ${betCurrency}`
    );
    clearSlip();
  };

  /* emoji icons for tabs */
  const SPORT_ICONS: Record<Sport, string> = {
    Football: '⚽',
    Tennis: '🎾',
    Basketball: '🏀',
    Cricket: '🏏',
  };

  /* Trending click → scroll to card */
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [highlightId, setHighlightId] = useState<string | null>(null);
  function focusMatch(m: Match) {
    setSport(m.sport);
    setTimeout(() => {
      const el = cardRefs.current[m.id];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setHighlightId(m.id);
        setTimeout(() => setHighlightId(null), 1500);
      }
    }, 30);
  }

  return (
    <div className={pageBg}>
      {/* TOP BAR — brand + auth only */}
      <header className="sticky top-0 z-50 w-full backdrop-blur supports-[backdrop-filter]:bg-slate-900/70 bg-slate-900/60 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" aria-label="BetX home">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-500 grid place-items-center text-white">
              🔥
            </div>
            <span className="font-bold tracking-tight text-slate-100">BetX</span>
            <Badge variant="secondary" className="ml-2">
              SOL
            </Badge>
          </Link>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Badge variant="secondary" className="hidden sm:inline-flex">
                  {user.username}
                </Badge>
                <Link href="#" className="text-sm text-sky-300 hover:underline flex items-center gap-1">
                  <User className="h-4 w-4" /> Profile
                </Link>
                <Link href="#" className="text-sm text-sky-300 hover:underline flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4" /> KYC / Age
                </Link>
                <Link href="#" className="text-sm text-sky-300 hover:underline flex items-center gap-1">
                  <Settings className="h-4 w-4" /> Settings
                </Link>
                <Button size="sm" variant="secondary" className="rounded-xl" onClick={signOut}>
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" className="rounded-xl" onClick={() => setShowSignup(true)}>
                  <UserPlus className="h-4 w-4 mr-2" /> Sign up
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="rounded-xl"
                  onClick={() => setShowLogin(true)}
                >
                  <LogIn className="h-4 w-4 mr-2" /> Log in
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Balances — ইনলাইন চিপস */}
      <div className="max-w-6xl mx-auto px-4 mt-6 md:mt-8 py-2">
        <div className="flex items-center gap-2 text-xs overflow-x-auto no-scrollbar">
          <span className="text-slate-300 mr-1 shrink-0">Balances:</span>
          {(['USDT', 'BTC', 'ETH', 'BETX'] as const).map((c) => (
            <Badge
              key={c}
              variant="outline"
              className="font-mono text-slate-100 border-slate-600 shrink-0"
              title={c}
            >
              {c}: {balances[c] ?? 0}
            </Badge>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto px-4 pb-16 grid lg:grid-cols-3 gap-8">
        {/* Left: Wallet (Deposit/Withdraw) + Trending */}
        <div className="lg:col-span-1 space-y-6">
          <WalletCard
            userPresent={!!user}
            currency={currency}
            setCurrency={setCurrency}
            dep={dep}
            onCredit={demoCredit}
            balances={balances}
            onWithdraw={demoWithdraw}
          />

          {/* Trending */}
          <Card className={panel}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-slate-100">
                  <TrendingUp className="h-5 w-5" /> Trending matches
                </CardTitle>
                <span className={chip}>
                  <Trophy className="h-3.5 w-3.5 inline mr-1" /> Hot
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {trending.map((m) => (
                <button
                  key={m.id}
                  onClick={() => focusMatch(m)}
                  className="w-full text-left rounded-lg bg-slate-900/85 border border-slate-700 p-3 text-sm text-slate-200 hover:bg-slate-800/70"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-slate-100 truncate">
                      {m.teamA} vs {m.teamB}
                    </div>
                    <Badge variant="secondary" title="Starts in">
                      <TimeBadge ts={m.startTs} enabled={isReady} />
                    </Badge>
                  </div>
                  <div className="text-slate-300">
                    {m.league} • {m.sport} • {fmtLocal(m.startTs)}
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right: Matches + Slip */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sport tabs */}
          <div className="flex flex-wrap gap-2">
            {(['Football', 'Tennis', 'Basketball', 'Cricket'] as Sport[]).map((s) => (
              <Button
                key={s}
                variant="secondary"
                className={`rounded-full px-4 ${
                  s === sport ? 'bg-sky-600 text-white hover:bg-sky-600' : ''
                } flex items-center gap-2`}
                onClick={() => setSport(s)}
              >
                <span aria-hidden>{SPORT_ICONS[s]}</span>
                {s}
              </Button>
            ))}
          </div>

          {/* Match grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {list.map((m) => (
              <Card
                key={m.id}
                className={`${panel} transition-all ${
                  highlightId === m.id ? 'ring-2 ring-sky-500' : ''
                }`}
                ref={(el) => (cardRefs.current[m.id] = el)}
              >
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between text-slate-100">
                    <span className="flex items-center gap-2">
                      <CalendarClock className="h-4 w-4" /> {m.league}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-300 hidden sm:inline">
                        {fmtLocal(m.startTs)}
                      </span>
                      <Badge variant="secondary" title="Starts in">
                        <TimeBadge ts={m.startTs} enabled={isReady} />
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-200">
                  <div className="font-semibold text-slate-100">
                    {m.teamA} vs {m.teamB}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <OddsBtn label={m.teamA} odds={m.odds.A} onClick={() => addPick(m, 'A')} />
                    {m.market === '1x2' ? (
                      <OddsBtn
                        label="Draw"
                        odds={m.odds.Draw || 0}
                        onClick={() => addPick(m, 'Draw')}
                      />
                    ) : (
                      <div />
                    )}
                    <OddsBtn label={m.teamB} odds={m.odds.B} onClick={() => addPick(m, 'B')} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bet slip */}
          <div className="lg:sticky lg:top-20">
            <Card className={panel}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-slate-100">
                    <Calculator className="h-5 w-5" /> Bet slip
                  </CardTitle>
                  {slip.length > 0 && <span className={chip}>{slip.length} pick(s)</span>}
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-200">
                {!slip.length ? (
                  <div className="text-slate-300">No selections yet. Tap odds to add picks.</div>
                ) : (
                  <>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-slate-200">
                        <input
                          type="radio"
                          checked={mode === 'parlay'}
                          onChange={() => setMode('parlay')}
                        />{' '}
                        Parlay
                      </label>
                      <label className="flex items-center gap-2 text-slate-200">
                        <input
                          type="radio"
                          checked={mode === 'single'}
                          onChange={() => setMode('single')}
                        />{' '}
                        Singles (equal split)
                      </label>
                    </div>

                    <div className="space-y-2">
                      {slip.map((p) => (
                        <div
                          key={p.id}
                          className="rounded-lg bg-slate-900/85 border border-slate-700 p-3 flex items-center gap-3"
                        >
                          <Badge>{p.sport}</Badge>
                          <div className="flex-1 min-w-0">
                            <div className="text-slate-100 truncate">{p.label}</div>
                            <div className="text-slate-300 text-xs">Odds @{p.odds.toFixed(2)}</div>
                          </div>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="rounded-lg"
                            onClick={() => removePick(p.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className="grid md:grid-cols-3 gap-3 items-end">
                      <div className="md:col-span-2">
                        <label className="block text-slate-200 mb-1">
                          {mode === 'parlay'
                            ? `Stake (${betCurrency})`
                            : `Total stake (${betCurrency})`}
                        </label>
                        <input
                          type="number"
                          min={1}
                          className={`w-full ${field}`}
                          value={stake}
                          onChange={(e) => setStake(Number(e.target.value))}
                        />
                        <div className="mt-2 flex flex-wrap gap-2">
                          {[10, 25, 50].map((v) => (
                            <Button
                              key={v}
                              size="sm"
                              variant="secondary"
                              className="rounded-lg"
                              onClick={() => setStake(v)}
                            >
                              +{v}
                            </Button>
                          ))}
                          <Button
                            size="sm"
                            variant="secondary"
                            className="rounded-lg"
                            onClick={() => setStake(Math.floor(balances[betCurrency] || 0))}
                          >
                            MAX
                          </Button>
                          <select
                            className="ml-auto bg-slate-900/85 text-slate-100 border border-slate-700 rounded-lg px-2 py-1 text-xs"
                            value={betCurrency}
                            onChange={(e) => setBetCurrency(e.target.value as any)}
                          >
                            <option value="USDT">Bet in USDT</option>
                            <option value="BTC">Bet in BTC</option>
                            <option value="ETH">Bet in ETH</option>
                            <option value="BETX">Bet in BETX</option>
                          </select>
                        </div>
                      </div>
                      <div className="rounded-xl bg-slate-900/85 border border-slate-700 p-3">
                        <div className="text-slate-300 text-xs">Potential return</div>
                        <div className="text-slate-100 font-semibold text-lg">
                          {payout.potential} {betCurrency}
                        </div>
                        <div className="text-slate-300 text-[11px]">{payout.details}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Button variant="secondary" className="rounded-xl" onClick={clearSlip}>
                        Clear
                      </Button>
                      <Button className="rounded-xl" onClick={placeBet} disabled={!user}>
                        Place bet (demo)
                      </Button>
                    </div>

                    {!user && (
                      <div className="text-[11px] text-amber-300">
                        Sign up or log in to place bets.
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* AUTH MODALS */}
      {showLogin && (
        <AuthModal title="Log in" onClose={() => setShowLogin(false)}>
          <LoginForm
            onSubmit={(email, pass) => {
              try {
                signIn(email, pass);
                setShowLogin(false);
              } catch (e: any) {
                alert(e.message || 'Login failed');
              }
            }}
            onForgot={() => alert('Demo: a password reset link would be emailed.')}
          />
        </AuthModal>
      )}

      {showSignup && (
        <AuthModal title="Create account" onClose={() => setShowSignup(false)}>
          <SignupForm
            onSubmit={(payload) => {
              try {
                if (!payload.agree) {
                  alert('Please agree to Terms & Privacy');
                  return;
                }
                signUp({
                  email: payload.email,
                  username: payload.username,
                  password: payload.password,
                });
                setShowSignup(false);
              } catch (e: any) {
                alert(e.message || 'Sign up failed');
              }
            }}
            onGoogle={() => {
              signUpWithGoogleDemo();
              setShowSignup(false);
            }}
            onSignInLink={() => {
              setShowSignup(false);
              setShowLogin(true);
            }}
          />
        </AuthModal>
      )}
    </div>
  );
}

/* ===== SMALL COMPONENTS ===== */
function OddsBtn({
  label,
  odds,
  onClick,
}: {
  label: string;
  odds: number;
  onClick: () => void;
}) {
  return (
    <Button
      className="h-12 rounded-lg bg-slate-900/95 hover:bg-slate-900 text-slate-100 border border-slate-700 flex items-center justify-between gap-2 px-3 whitespace-nowrap overflow-hidden"
      variant="secondary"
      onClick={onClick}
      title={label}
    >
      <span className="min-w-0 truncate pr-2">{label}</span>
      <span className="font-mono">@{odds.toFixed(2)}</span>
    </Button>
  );
}

function AuthModal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[60] bg-black/70 grid place-items-center px-4">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-slate-100 font-semibold">{title}</h3>
          <button
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-300"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function LoginForm({
  onSubmit,
  onForgot,
}: {
  onSubmit: (email: string, pass: string) => void;
  onForgot: () => void;
}) {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(email, pass);
      }}
    >
      <div>
        <label className="block text-slate-200 text-sm mb-1">Email</label>
        <input
          className={field}
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-slate-200 text-sm mb-1">Password</label>
        <input
          className={field}
          type="password"
          placeholder="••••••••"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />
        <button
          type="button"
          className="mt-2 text-sky-300 text-sm hover:underline"
          onClick={onForgot}
        >
          Forgot password?
        </button>
      </div>
      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="submit" className="rounded-xl">
          <LogIn className="h-4 w-4 mr-2" /> Log in
        </Button>
      </div>
    </form>
  );
}

function SocialRow({ onGoogle }: { onGoogle: () => void }) {
  const base =
    'h-10 w-10 grid place-items-center rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-600';
  return (
    <div className="flex items-center justify-center gap-3 pt-2">
      <button className={base} title="Google (demo)" onClick={onGoogle}>
        G
      </button>
      <button className={base} title="LINE (demo)" onClick={onGoogle}>
        L
      </button>
      <button className={base} title="Twitch (demo)" onClick={onGoogle}>
        T
      </button>
    </div>
  );
}

function SignupForm({
  onSubmit,
  onGoogle,
  onSignInLink,
}: {
  onSubmit: (p: { username: string; email: string; password: string; agree: boolean }) => void;
  onGoogle: () => void;
  onSignInLink: () => void;
}) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [agree, setAgree] = useState(false);
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ username, email, password: pass, agree });
      }}
    >
      <div>
        <label className="block text-slate-200 text-sm mb-1">Username</label>
        <input
          className={field}
          placeholder="3–14 characters"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-slate-200 text-sm mb-1">Email</label>
        <input
          className={field}
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-slate-200 text-sm mb-1">Password</label>
        <input
          className={field}
          type="password"
          placeholder="••••••••"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />
      </div>

      <label className="flex items-center gap-2 text-slate-300 text-sm">
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
        />
        I agree to the Terms & Privacy Policy
      </label>

      <Button type="submit" className="rounded-xl w-full">
        <UserPlus className="h-4 w-4 mr-2" /> Continue
      </Button>

      <div className="relative my-2">
        <div className="h-px bg-slate-700" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="bg-slate-900 px-3 text-slate-300 text-xs">OR</span>
        </div>
      </div>

      <SocialRow onGoogle={onGoogle} />

      <div className="pt-3 text-center text-sm text-slate-300">
        Already have an account?{' '}
        <button
          type="button"
          className="text-sky-300 hover:underline"
          onClick={onSignInLink}
        >
          Sign in
        </button>
      </div>
    </form>
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

function DemoCredit({
  currency,
  onCredit,
  disabled,
}: {
  currency: 'USDT' | 'BTC' | 'ETH' | 'BETX';
  onCredit: (amt: number) => void;
  disabled?: boolean;
}) {
  const [amount, setAmount] = useState<number>(50);
  const [tx, setTx] = useState('');
  return (
    <div className="grid gap-2">
      <input
        placeholder={`Amount (${currency})`}
        type="number"
        min={1}
        className={field}
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        disabled={disabled}
      />
      <input
        placeholder="Tx hash / reference (demo)"
        className={field}
        value={tx}
        onChange={(e) => setTx(e.target.value)}
        disabled={disabled}
      />
      <Button
        className="rounded-lg"
        onClick={() => onCredit(amount)}
        disabled={disabled}
      >
        I sent deposit (credit demo)
      </Button>
    </div>
  );
}

/* Unified Wallet Card: Deposit & Withdraw tabs in one card */
function WalletCard({
  userPresent,
  currency,
  setCurrency,
  dep,
  onCredit,
  balances,
  onWithdraw,
}: {
  userPresent: boolean;
  currency: 'USDT' | 'BTC' | 'ETH' | 'BETX';
  setCurrency: (c: 'USDT' | 'BTC' | 'ETH' | 'BETX') => void;
  dep: { address: string; network: string; note?: string };
  onCredit: (amt: number) => void;
  balances: Record<string, number>;
  onWithdraw: (amount: number, coin: 'USDT' | 'BTC' | 'ETH' | 'BETX') => void;
}) {
  const [tab, setTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [wdCoin, setWdCoin] = useState<'USDT' | 'BTC' | 'ETH' | 'BETX'>('USDT');
  const [wdAmount, setWdAmount] = useState<number>(25);
  const [wdAddr, setWdAddr] = useState('');

  return (
    <Card className={panel}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-slate-100">
            <Wallet className="h-5 w-5" /> Wallet
          </CardTitle>
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant={tab === 'deposit' ? 'default' : 'secondary'}
              className="rounded-full"
              onClick={() => setTab('deposit')}
            >
              Deposit
            </Button>
            <Button
              size="sm"
              variant={tab === 'withdraw' ? 'default' : 'secondary'}
              className="rounded-full"
              onClick={() => setTab('withdraw')}
            >
              Withdraw
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 text-sm text-slate-200">
        {tab === 'deposit' ? (
          <>
            <div>
              <label className="block text-slate-200 mb-1">Select currency</label>
              <select
                className={`w-full ${field}`}
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                disabled={!userPresent}
              >
                <option value="USDT">USDT (BEP-20)</option>
                <option value="BTC">BTC</option>
                <option value="ETH">ETH (ERC-20)</option>
                <option value="BETX">BETX (BEP-20)</option>
              </select>
            </div>

            <div className="rounded-xl bg-slate-900/85 border border-slate-700 p-3 text-slate-200">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-slate-300 text-xs">Deposit address</div>
                  <div className="font-mono text-slate-100 break-all">{dep.address}</div>
                  <div className="text-xs text-slate-100 mt-1">
                    Network: <Badge variant="secondary">{dep.network}</Badge>
                  </div>
                </div>
                <CopyButton text={dep.address} />
              </div>
              {dep.note && (
                <p className="text-[11px] text-slate-300 mt-2">
                  {dep.note} Wrong-chain transfers will be lost.
                </p>
              )}
            </div>

            <div className="rounded-xl bg-slate-900/85 border border-slate-700 p-3">
              <div className="text-slate-200 text-xs mb-2">Auto-credit (demo)</div>
              <DemoCredit currency={currency} onCredit={onCredit} disabled={!userPresent} />
              {!userPresent && (
                <p className="text-[11px] text-amber-300 mt-2">
                  Sign up / log in to enable demo credit.
                </p>
              )}
              <p className="text-[11px] text-slate-400 mt-2">
                In production: backend detects deposits and credits after confirmations.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <select
                className={field}
                value={wdCoin}
                onChange={(e) => setWdCoin(e.target.value as any)}
                disabled={!userPresent}
              >
                <option value="USDT">USDT (BEP-20)</option>
                <option value="BTC">BTC</option>
                <option value="ETH">ETH</option>
                <option value="BETX">BETX</option>
              </select>
              <input
                type="number"
                min={1}
                className={field}
                value={wdAmount}
                onChange={(e) => setWdAmount(Number(e.target.value))}
                placeholder="Amount"
                disabled={!userPresent}
              />
            </div>
            <input
              className={field}
              value={wdAddr}
              onChange={(e) => setWdAddr(e.target.value)}
              placeholder="Your wallet address"
              disabled={!userPresent}
            />
            <div className="text-xs text-slate-300">
              Available{' '}
              <span className="text-slate-100">
                {balances[wdCoin] ?? 0} {wdCoin}
              </span>
            </div>
            <Button
              className="rounded-xl"
              onClick={() => onWithdraw(wdAmount, wdCoin)}
              disabled={!userPresent || !wdAddr}
            >
              <ArrowDownToLine className="h-4 w-4 mr-2" />
              Request withdrawal
            </Button>
            {userPresent && (
              <p className="text-[11px] text-slate-400">
                Demo only. Production flow would queue on-chain withdrawals with fee & confirmations.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

/* (Unused now but kept) Standalone Withdraw card from previous version */
function WithdrawCard({
  balances,
  onWithdraw,
  disabled,
}: {
  balances: Record<string, number>;
  onWithdraw: (amount: number, coin: 'USDT' | 'BTC' | 'ETH' | 'BETX') => void;
  disabled?: boolean;
}) {
  const [coin, setCoin] = useState<'USDT' | 'BTC' | 'ETH' | 'BETX'>('USDT');
  const [amount, setAmount] = useState<number>(25);
  const [address, setAddress] = useState('');
  return (
    <Card className={panel}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-100">
          <ArrowDownToLine className="h-5 w-5" /> Withdraw (demo)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-slate-200">
        <div className="grid grid-cols-2 gap-3">
          <select
            className={field}
            value={coin}
            onChange={(e) => setCoin(e.target.value as any)}
            disabled={disabled}
          >
            <option value="USDT">USDT (BEP-20)</option>
            <option value="BTC">BTC</option>
            <option value="ETH">ETH</option>
            <option value="BETX">BETX</option>
          </select>
          <input
            type="number"
            min={1}
            className={field}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="Amount"
            disabled={disabled}
          />
        </div>
        <input
          className={field}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Your wallet address"
          disabled={disabled}
        />
        <div className="text-xs text-slate-300">
          Available: <span className="text-slate-100">{balances[coin] ?? 0} {coin}</span>
        </div>
        <Button
          className="rounded-xl"
          onClick={() => onWithdraw(amount, coin)}
          disabled={disabled || !address}
        >
          Request withdrawal
        </Button>
        {!disabled && (
          <p className="text-[11px] text-slate-400">
            Demo only. Production flow would queue on-chain withdrawals with fee & confirmations.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
