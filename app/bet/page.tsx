'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

export default function BetPage() {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [showBalanceMenu, setShowBalanceMenu] = useState(false);
  const balances = [
    { symbol: 'USDT', amount: 0 },
    { symbol: 'BTC', amount: 0 },
    { symbol: 'ETH', amount: 0 },
    { symbol: 'NOVA', amount: 0 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-6">
      {/* Minimal BetX Topbar */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">BetX</h1>

        {/* Balance dropdown */}
        <div className="relative">
          <Button
            variant="secondary"
            className="flex items-center gap-2 rounded-xl"
            onClick={() => setShowBalanceMenu(!showBalanceMenu)}
          >
            Balances <ChevronDown className="h-4 w-4" />
          </Button>
          {showBalanceMenu && (
            <div className="absolute right-0 mt-2 w-40 rounded-xl bg-slate-900 border border-slate-800 shadow-lg p-2">
              {balances.map((b) => (
                <div
                  key={b.symbol}
                  className="flex justify-between px-2 py-1 hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  <span>{b.symbol}</span>
                  <span>{b.amount}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Deposit & Withdraw Tabs */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'deposit' ? 'default' : 'secondary'}
              className="rounded-xl"
              onClick={() => setActiveTab('deposit')}
            >
              Deposit
            </Button>
            <Button
              variant={activeTab === 'withdraw' ? 'default' : 'secondary'}
              className="rounded-xl"
              onClick={() => setActiveTab('withdraw')}
            >
              Withdraw
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {activeTab === 'deposit' ? (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Deposit</h2>
              <select className="w-full bg-slate-800 rounded-lg p-2 outline-none">
                <option>USDT (BEP-20)</option>
                <option>BTC</option>
                <option>ETH</option>
              </select>
              <div className="bg-slate-800 p-3 rounded-lg">
                <p className="text-sm">Deposit address:</p>
                <p className="text-xs break-all">
                  0xUSDT-DEMO-ADDR-1234567890ABCDEF
                </p>
              </div>
              <input
                className="w-full p-2 rounded-lg bg-slate-800 outline-none"
                placeholder="Tx hash / reference"
              />
              <Button className="w-full rounded-xl">I sent deposit</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Withdraw</h2>
              <select className="w-full bg-slate-800 rounded-lg p-2 outline-none">
                <option>USDT (BEP-20)</option>
                <option>BTC</option>
                <option>ETH</option>
              </select>
              <input
                className="w-full p-2 rounded-lg bg-slate-800 outline-none"
                placeholder="Withdraw address"
              />
              <input
                className="w-full p-2 rounded-lg bg-slate-800 outline-none"
                placeholder="Amount"
              />
              <Button className="w-full rounded-xl">Withdraw</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
