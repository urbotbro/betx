'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft } from "lucide-react";

export default function WhitepaperPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="inline-flex items-center gap-2 text-slate-300 hover:text-white">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
            <h1 className="text-xl font-bold">BetX Whitepaper</h1>
          </div>
          <Button asChild variant="secondary">
            <a
              href="/whitepaper/BetX_Whitepaper_v2.pdf"
              target="_blank"
              rel="noopener"
              download
            >
              <Download className="h-4 w-4 mr-2" /> Download PDF
            </a>
          </Button>
        </div>

        <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
          <iframe
            src="/whitepaper/BetX_Whitepaper_v2.pdf"
            className="w-full h-[82vh]"
          />
        </div>

        <p className="text-sm text-slate-400">
          Having trouble viewing?{" "}
          <a
            className="underline hover:text-slate-200"
            href="/whitepaper/BetX_Whitepaper_v2.pdf"
            target="_blank"
            rel="noopener"
          >
            Open the PDF in a new tab
          </a>.
        </p>
      </div>
    </div>
  );
}
