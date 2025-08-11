'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Shield, Coins, Trophy, ArrowLeft, CheckCircle2, Info, Copy, Check
} from 'lucide-react';

type StakeStatus = 'not_started' | 'pending' | 'verified' | 'rejected';

type Application = {
  // Wallet fields are removed; we track stake manually
  address?: string | null; // optional note field if you want them to type their public key
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
  // Manual stake verification (no wallet connect)
  stakeChain: 'Solana (SPL BETX)';
  stakeAddress: string;
  stakeReference: string; // unique memo / reference code they include or share
  stakeTxHash?: string;
  stakeStatus: StakeStatus;
};

const STAKE_INFO = {
  chain: 'Solana (SPL BETX)' as const,
  // demo address — replace with your escrow/program vault:
  address: 'BETX2EcRow1111111111111111111111111111111',
  note: 'Send only BETX (SPL) on Solana. Include the reference code below in memo if your wallet supports it.',
};

function makeRefCode() {
  return 'APP-' + Math.random().toString(36).slice(2, 8).toUpperCase();
}

function CopyButton({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <Button
      size="sm"
      variant="secondary"
      className="rounded-lg"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setOk(true);
          setTimeout(() => setOk(false), 1200);
        } catch {}
      }}
      title="Copy"
    >
      {ok ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    </Button>
  );
}

export default function ApplyAsTipster() {
  const [app, setApp] = useState<Application>({
    address: '',
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
    stakeChain: STAKE_INFO.chain,
    stakeAddress: STAKE_INFO.address,
    stakeReference: makeRefCode(),
    stakeStatus: 'not_started',
  });

  const [showStakeBox, setShowStakeBox] = useState(false);

  // hydrate a fresh reference code for a new session if missing
  useEffect(() => {
    if (!app.stakeReference) {
      setApp((p) => ({ ...p, stakeReference: makeRefCode() }));
    }
  }, [app.stakeReference]);

  function saveLocal(a: Application) {
    try {
      const key = 'tipsterApplications';
      const current = JSON.parse(localStorage.getItem(key) || '[]') as Application[];
      localStorage.setItem(key, JSON.stringify([a, ...current]));
    } catch {}
  }

  function submit() {
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
      status: 'pending', // review starts after application submit
      createdAt: new Date().toISOString(),
    };
    setApp(payload);
    saveLocal(payload);
    setShowStakeBox(true); // immediately show manual stake instructions
    alert('✅ Application submitted. Next: complete your BETX stake and submit the tx hash.');
  }

  function submitStakeProof() {
    if (!app.stakeTxHash || app.stakeTxHash.trim().length < 10) {
      alert('Please paste a valid transaction hash.');
      return;
    }
    const next: Application = {
      ...app,
      stakeStatus: 'pending',
    };
    setApp(next);
    saveLocal(next);
    alert('✅ Stake proof submitted. We will verify your transaction and update the status.');
  }

  // DEMO ONLY — admin/manual toggles (remove in production)
  function markVerifiedDemo() {
    const next = { ...app, stakeStatus: 'verified' as StakeStatus, status: 'approved' as const };
    setApp(next);
    saveLocal(next);
  }
  function markRejectedDemo() {
    const next = { ...app, stakeStatus: 'rejected' as StakeStatus, status: 'pending' as const };
    setApp(next);
    saveLocal(next);
  }

  const canSubmit = useMemo(() => {
    return (
      app.name &&
      app.bio &&
      app.sports &&
      app.strategy &&
      app.contacts &&
      app.agree
    );
  }, [app]);

  const priceExample = app.baseFee + app.bonusFee;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Top bar (no wallet connect) */}
      <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
        <Button variant="secondary" className="rounded-xl" onClick={() => history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div className="text-sm text-slate-300">
          Tipster Application
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-16 grid lg:grid-cols-3 gap-8">
        {/* Left: Explainer */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-sky-900/20 border-sky-800/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <Shield className="h-5 w-5" />
                How it works (Escrow V1)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-200/90 space-y-2">
              <p>
                <strong>Tip price</strong> = <em>Base fee</em> + <em>Outcome bonus</em>. Your example price is{' '}
                <span className="font-semibold">{priceExample} BETX</span> ({app.baseFee} base + {app.bonusFee} bonus).
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Win:</strong> Tipster receives Base + Bonus.</li>
                <li><strong>Lose:</strong> Buyer receives credit equal to Bonus; tipster keeps Base only.</li>
                <li><strong>Protocol fee:</strong> optionally 0–5% from Base on settlement.</li>
              </ul>
              <p className="text-xs text-slate-300">
                Payments and settlements are in <strong>BETX</strong> through an escrow account. A results oracle
                (or admin review in this demo) confirms outcomes before funds move.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-sky-900/20 border-sky-800/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <Coins className="h-5 w-5" />
                Tipster staking (no wallet connect)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-200/90 space-y-3">
              <p>
                To list, stake at least <strong>{app.minStake} BETX</strong> to our escrow address and paste the
                transaction hash here. We verify off-chain and mark your stake as <em>verified</em>.
              </p>
              <Button onClick={() => setShowStakeBox(true)} className="rounded-xl w-full">
                View Stake Instructions
              </Button>
              <p className="text-xs text-slate-300">
                In production, this is verified by a backend that watches the chain and matches your tx by reference code.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-sky-900/20 border-sky-800/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <Trophy className="h-5 w-5" />
                Ranking & metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-200/90 space-y-2">
              <ul className="list-disc pl-5 space-y-1">
                <li>Win rate (last 50), ROI, streak, tips count</li>
                <li>Recent performance weighted higher</li>
                <li>Transparent tip history with immutable cutoffs</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Right: Form + (optional) Stake box */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-sky-900/20 border-sky-800/40">
            <CardHeader>
              <CardTitle className="text-slate-100">Apply as a Tipster</CardTitle>
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
                  <p className="text-[11px] text-slate-400 mt-1">You keep this even if the pick loses.</p>
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
                <div className="flex items-center gap-2">
                  <span>Stake status:</span>
                  <Badge variant="outline" className="capitalize">{app.stakeStatus}</Badge>
                </div>
                <p className="text-slate-300 mt-1">
                  After submit, complete the BETX stake and paste your tx hash in the Stake box.
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

          {/* Manual stake box */}
          {showStakeBox && (
            <Card className="bg-sky-900/25 border-sky-800/40">
              <CardHeader>
                <CardTitle className="text-slate-100">Stake BETX (manual verification)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-200/90">
                <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3">
                  <div className="text-slate-300 text-xs mb-1">Chain</div>
                  <div className="text-slate-100 font-medium">{app.stakeChain}</div>
                </div>

                <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-slate-300 text-xs">Stake address</div>
                      <div className="font-mono text-slate-100 break-all">{app.stakeAddress}</div>
                    </div>
                    <CopyButton text={app.stakeAddress} />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    {STAKE_INFO.note}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-slate-300 text-xs">Reference code</div>
                      <div className="font-mono text-slate-100 break-all">{app.stakeReference}</div>
                    </div>
                    <CopyButton text={app.stakeReference} />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Include this code in the transfer memo (if supported) or provide it to support so we can match your tx.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3">
                    <div className="text-slate-300 text-xs mb-1">Required stake</div>
                    <div className="text-slate-100 font-semibold">{app.minStake} BETX</div>
                  </div>
                  <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3">
                    <div className="text-slate-300 text-xs mb-1">Your contact</div>
                    <div className="text-slate-100">{app.contacts || '—'}</div>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-200 mb-1">Transaction hash</label>
                  <input
                    className="w-full rounded-xl bg-slate-800/60 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-600"
                    placeholder="Paste your stake tx hash (e.g., Solscan signature)"
                    value={app.stakeTxHash || ''}
                    onChange={(e)=>setApp(p=>({...p, stakeTxHash: e.target.value}))}
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <Button className="rounded-xl" onClick={submitStakeProof}>
                      Submit stake proof
                    </Button>
                    {/* DEMO admin helpers */}
                    <Button variant="secondary" className="rounded-xl" onClick={markVerifiedDemo}>
                      Mark verified (demo)
                    </Button>
                    <Button variant="secondary" className="rounded-xl" onClick={markRejectedDemo}>
                      Mark rejected (demo)
                    </Button>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400">
                  After you submit the tx hash, our backend (or moderator) checks that:
                  1) amount ≥ required stake, 2) token = BETX SPL, 3) sent to the escrow address,
                  4) reference code matches. Then your stake becomes <em>verified</em>.
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
