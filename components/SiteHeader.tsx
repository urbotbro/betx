'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Menu, X } from 'lucide-react';

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Hide the Connect button on these routes (keep or edit as you like)
  const HIDE_CONNECT_ON = ['/', '/tips', '/tipster'];
  const showConnect = !HIDE_CONNECT_ON.includes(pathname);

  const navLinks = [
    { href: '/#tokenomics', label: 'Tokenomics' },
    { href: '/#features', label: 'Features' },
    { href: '/#roadmap', label: 'Roadmap' },
    { href: '/#sale', label: 'Sale' },
    { href: '/tips', label: 'Tips' },
    { href: '/tipster', label: 'Tipster' },
    { href: '/bet', label: 'Bet' },
  ];

  return (
    <header className="sticky top-0 z-50 safe-pt w-full backdrop-blur supports-[backdrop-filter]:bg-slate-900/70 bg-slate-900/60 border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" aria-label="BetX home" className="flex items-center gap-2">
          {/* Logo image */}
          <Image
            src="/download/betx.png"  // change to "/betx.png" if you put it directly under /public
            alt="BetX logo"
            width={32}
            height={32}
            className="h-8 w-8 rounded-xl object-contain"
            priority
          />
          <span className="font-bold tracking-tight text-slate-100">BetX</span>
          <Badge variant="secondary" className="ml-2">SOL</Badge>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-white/90 text-slate-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-2">
          <Button asChild size="sm" variant="secondary">
            <Link href="/#sale">Join Sale</Link>
          </Button>
          <Button asChild size="sm" variant="default">
            <Link href="/whitepaper">Read Whitepaper</Link>
          </Button>
          {showConnect && (
            <ConnectButton chainStatus="icon" showBalance={false} accountStatus="address" />
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-slate-900/95 border-t border-slate-800">
          <nav className="flex flex-col items-start p-4 gap-4">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-white/90 text-slate-200"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile CTAs */}
            <Button asChild size="sm" variant="secondary" className="w-full">
              <Link href="/#sale" onClick={() => setMenuOpen(false)}>Join Sale</Link>
            </Button>
            <Button asChild size="sm" variant="default" className="w-full">
              <Link href="/whitepaper" onClick={() => setMenuOpen(false)}>Read Whitepaper</Link>
            </Button>

            {showConnect && (
              <div className="w-full">
                <ConnectButton chainStatus="icon" showBalance={false} accountStatus="address" />
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

