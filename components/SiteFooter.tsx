import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="w-full bg-slate-900/80 border-t border-slate-800 text-slate-400 text-sm py-6">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left side */}
        <p className="text-center md:text-left">
          © {new Date().getFullYear()} BetX Protocol. All rights reserved.
        </p>

        {/* Right side */}
        <nav className="flex flex-wrap items-center gap-4 text-slate-400">
          <Link href="/#tokenomics" className="hover:text-white">Tokenomics</Link>
          <Link href="/#roadmap" className="hover:text-white">Roadmap</Link>
          <Link href="/#sale" className="hover:text-white">Sale</Link>
          <Link href="/#whitepaper" className="hover:text-white">Whitepaper</Link>
          <Link href="/tips" className="hover:text-white">Tips</Link>
          <Link href="/tipster" className="hover:text-white">Tipster</Link>
          <Link href="/bet" className="hover:text-white">Bet</Link>
        </nav>
      </div>
    </footer>
  );
}
