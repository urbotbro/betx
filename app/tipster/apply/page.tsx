'use client';

import { useEffect, useMemo, useState } from 'react';
import ConnectWalletButton from '@/components/ConnectWalletButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Coins, Trophy, ArrowLeft, CheckCircle2, Info } from 'lucide-react';

type Application = {
  walletConnected: boolean;
  address?: string | null;
  name: string;
  bio: string;
  sports: string;
  strategy: string;
  baseFee: number;   // BETX
  bonusFee: number;  // BETX
  minStake: number;  // BETX to stake (tipster side)
  contacts: string;  // Telegram/Email
  agree: boolean;
  createdAt: string;
  status: 'draft' | 'submitted' | 'pending' | 'approved' | 'rejected';
};

export default function ApplyAsTipster() {
  // demo: we’ll “mirror” address text from our dummy connect component
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    // demo only — real app would read wallet/address from wagmi/rainbowkit/etc.
  }, []);

  const [app, setApp] = useState<Application>({
    walletConnected: false,
    address: null,
    name: '',
    bio: '',
    sports: '',
    strategy: '',
    baseFee: 10,
    bonusFee: 15,
    minStake: 500,
    contacts: '',
    agree: false,
    createdAt: new Date().toISOString(),
    status: 'draft',
  });

  // keep wallet state in the application object too
  useEffect(() => {
    setApp(prev => ({ ...prev, walletConnected: connected, address }));
  }, [connected, address]);

  function saveLocal(a: Application) {
    try {
      const key = 'tipsterApplications';
      const current = JSON.parse(localStorage.getItem(key) || '[]') as Application[];
      localStorage.setItem(key, JSON.stringify([a, ...current]));
    } catch {}
  }

  function submit() {
    if (!connected) {
      alert('Please connect your wallet first.');
      return;
    }
    if (!app.name || !app.bio || !app.sports || !app.strategy || !app.contacts) {
      alert('Please fill all required fields (Name, Bio, Sports, Strategy, Contacts).');
      return;
    }
    if (!app.agree) {
      alert('Please accept the terms to proceed.');
      return;
    }
    const payload: Application = {
      ...app,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setApp(payload);
    saveLocal(payload);
    alert('✅ Application submitted (demo). Status: Pending review.');
  }

  function simulateStake() {
    if (!connected) {
      alert('Connect wallet to stake.');
      return;
    }
    alert(`✅ Demo: Staked ${app.minStake} BETX (simulated).`);
  }

  const canSubmit = useMemo(() => {
    return (
      connected &&
      app.name &&
      app.bio &&
      app.sports &&
      app.strategy &&
      app.contacts &&
      app.agree
    );
  }, [connected, app]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Top bar */}
      <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
        <Button variant="secondary" className="rounded-xl" onClick={() => history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div className="flex items-center gap-3 rounded-xl px-3 py-2 border border-sky-800/40 bg-sky-900/20">
          <Badge variant={connected ? 'secondary' : 'outline'}>
            {connected ? 'Wallet connected' : 'Wallet not connected'}
          </Badge>
          <ConnectWalletButton
            onChange={(ok) => {
              setConnected(ok);
              setAddress(ok ? '0xA1b2...9F3c' : null);
            }}
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-16 grid lg:grid-cols-3 gap-8">
        {/* Left: Explainer */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-sky-900/20 border-sky-800/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                How it works (Escrow V1)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-200/90 space-y-2">
              <p>
                <strong>Fees split:</strong> Tip price = <em>Base fee</em> + <em>Outcome bonus</em>.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Win:</strong> Tipster gets Base + Bonus.</li>
                <li><strong>Lose:</strong> Buyer receives credit equal to Bonus; tipster keeps Base only.</li>
                <li><strong>Protocol fee:</strong> e.g. 0–5% (configurable).</li>
              </ul>
              <p className="text-xs text-slate-300">
                All payments are in <strong>BETX</strong> via escrow contract. Results are verified by
                oracle before settlement.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-sky-900/20 border-sky-800/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5" />
                Tipster staking
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-200/90 space-y-2">
              <p>
                You must stake <strong>BETX</strong> to list. Poor performance over time can lower rank or
                increase required stake.
              </p>
              <Button onClick={simulateStake} className="rounded-xl w-full">Simulate Stake {app.minStake} BETX</Button>
              <p className="text-xs text-slate-300">
                Demo only. On mainnet/testnet we’ll guide you through real staking with wallet.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-sky-900/20 border-sky-800/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Ranking & metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-200/90 space-y-2">
              <ul className="list-disc pl-5 space-y-1">
                <li>Win rate (last 50), ROI, streak, tips count</li>
                <li>Recent performance weighted higher</li>
                <li>Transparency: immutable tip history with cutoffs</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Right: Form */}
        <div className="lg:col-span-2">
          <Card className="bg-sky-900/20 border-sky-800/40">
            <CardHeader>
              <CardTitle>Apply as a Tipster</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-sm text-slate-200/90">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-200 mb-1">Display name *</label>
                  <input
                    className="w-full rounded-xl bg-slate-800/60 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-600"
                    value={app.name}
                    onChange={(e)=>setApp(p=>({...p, name: e.target.value}))}
                    placeholder="e.g., AlphaEdge"
                  />
                </div>
                <div>
                  <label className="block text-slate-200 mb-1">Primary sports/leagues *</label>
                  <input
                    className="w-full rounded-xl bg-slate-800/60 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-600"
                    value={app.sports}
                    onChange={(e)=>setApp(p=>({...p, sports: e.target.value}))}
                    placeholder="e.g., ATP/WTA, EPL, EuroLeague"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-200 mb-1">Bio *</label>
                <textarea
                  className="w-full min-h-[90px] rounded-xl bg-slate-800/60 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-600"
                  value={app.bio}
                  onChange={(e)=>setApp(p=>({...p, bio: e.target.value}))}
                  placeholder="Short background and edge (models, live entries, market types)..."
                />
              </div>

              <div>
                <label className="block text-slate-200 mb-1">Strategy overview *</label>
                <textarea
                  className="w-full min-h-[120px] rounded-xl bg-slate-800/60 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-600"
                  value={app.strategy}
                  onChange={(e)=>setApp(p=>({...p, strategy: e.target.value}))}
                  placeholder="Your typical markets, odds range, risk control, sample size policy..."
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-200 mb-1">Base fee (BETX) *</label>
                  <input
                    type="number"
                    className="w-full rounded-xl bg-slate-800/60 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-600"
                    value={app.baseFee}
                    onChange={(e)=>setApp(p=>({...p, baseFee: Number(e.target.value)}))}
                    min={0}
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Tipster keeps this even if the pick loses.</p>
                </div>
                <div>
                  <label className="block text-slate-200 mb-1">Outcome bonus (BETX) *</label>
                  <input
                    type="number"
                    className="w-full rounded-xl bg-slate-800/60 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-600"
                    value={app.bonusFee}
                    onChange={(e)=>setApp(p=>({...p, bonusFee: Number(e.target.value)}))}
                    min={0}
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Paid only if the pick wins (buyer credit otherwise).</p>
                </div>
                <div>
                  <label className="block text-slate-200 mb-1">Stake amount (BETX) *</label>
                  <input
                    type="number"
                    className="w-full rounded-xl bg-slate-800/60 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-600"
                    value={app.minStake}
                    onChange={(e)=>setApp(p=>({...p, minStake: Number(e.target.value)}))}
                    min={100}
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Required to list. Helps align incentives.</p>
                </div>
              </div>

              <div>
                <label className="block text-slate-200 mb-1">Contact (Telegram / Email) *</label>
                <input
                  className="w-full rounded-xl bg-slate-800/60 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-600"
                  value={app.contacts}
                  onChange={(e)=>setApp(p=>({...p, contacts: e.target.value}))}
                  placeholder="@yourhandle or you@example.com"
                />
              </div>

              <div className="flex items-start gap-2">
                <input
                  id="agree"
                  type="checkbox"
                  className="mt-1 accent-sky-500"
                  checked={app.agree}
                  onChange={(e)=>setApp(p=>({...p, agree: e.target.checked}))}
                />
                <label htmlFor="agree" className="text-slate-200 text-sm">
                  I agree to the escrow rules (Base + Bonus), transparent metrics, and staking requirements.
                </label>
              </div>

              {/* Status */}
              <div className="rounded-xl border border-sky-800/40 bg-sky-900/20 p-4 text-sm text-slate-200">
                <div className="flex items-center gap-2 mb-1">
                  <Info className="h-4 w-4" />
                  <span>Status:</span>
                  <Badge variant="secondary" className="ml-1 capitalize">{app.status}</Badge>
                </div>
                <p className="text-slate-300">
                  After submit, your profile will appear in the leaderboard once approved.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  className="rounded-xl"
                  disabled={!canSubmit}
                  onClick={submit}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Submit application
                </Button>
                <Button
                  variant="secondary"
                  className="rounded-xl"
                  onClick={() => setApp(p=>({ ...p, status: 'draft' }))}
                >
                  Save as draft
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
