'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function ConnectWalletButton({
  onChange,
}: { onChange?: (connected: boolean) => void }) {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  function toggle() {
    if (!connected) {
      const fake = '0xA1b2...9F3c'; // demo address
      setAddress(fake);
      setConnected(true);
      onChange?.(true);
    } else {
      setConnected(false);
      setAddress(null);
      onChange?.(false);
    }
  }

  return (
    <Button size="sm" onClick={toggle} className="rounded-xl">
      {connected ? `Connected: ${address}` : 'Connect Wallet'}
    </Button>
  );
}
